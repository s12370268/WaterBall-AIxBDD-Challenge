import json
import os
import re
import secrets
import sqlite3
import time
from pathlib import Path

from flask import Flask, g, jsonify, request
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash, generate_password_hash
from .database import catalog, db, initialize, session_hash
from .security import PERMISSIONS, current_session, public_user, require, session_payload, set_session_cookie
from .validation import validate_products


def create_app(config=None):
    app = Flask(__name__, static_folder=None)
    app.config.update(
        DATABASE=os.environ.get("MORI_DATABASE", str(Path(__file__).parents[1] / "data" / "mori.sqlite3")),
        DEVELOPMENT=os.environ.get("MORI_DEVELOPMENT", "1") == "1",
        COOKIE_SECURE=os.environ.get("MORI_DEVELOPMENT", "1") != "1",
        SESSION_SECONDS=8 * 60 * 60,
        MAX_CONTENT_LENGTH=32 * 1024 * 1024,
        ALLOWED_ORIGINS=os.environ.get("MORI_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174").split(","),
    )
    if config:
        app.config.update(config)
    initialize(app)

    @app.before_request
    def check_origin():
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            origin = request.headers.get("Origin")
            if origin and origin not in app.config["ALLOWED_ORIGINS"]:
                return jsonify(error="不允許此來源的操作。"), 403

    @app.after_request
    def no_cache(response):
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error="請求格式或大小不正確。" if error.code in (400, 413, 415) else "找不到資源或不支援此操作。"), error.code

    @app.get("/api/health")
    def health():
        return jsonify(status="ok", development=app.config["DEVELOPMENT"])

    @app.post("/api/auth/login")
    def login():
        if request.headers.get("X-Mori-Client") != "web":
            return jsonify(error="請透過管理室登入。"), 403
        body = request.get_json()
        if not isinstance(body, dict):
            return jsonify(error="登入資料格式錯誤。"), 400
        email, password = body.get("email"), body.get("password")
        if not isinstance(email, str) or not isinstance(password, str) or len(email) > 254 or len(password) > 128:
            return jsonify(error="帳號或密碼不正確，請確認後再試一次。"), 401
        email = email.strip().lower()
        identity = f"{request.remote_addr}:{email}"
        now = int(time.time())
        connection = db()
        connection.execute("DELETE FROM login_attempts WHERE attempted_at<?", (now - 300,))
        if connection.execute("SELECT COUNT(*) FROM login_attempts WHERE identity=?", (identity,)).fetchone()[0] >= 5:
            connection.commit()
            return jsonify(error="嘗試次數過多，請 5 分鐘後再試。"), 429
        user = connection.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if not user or not user["active"] or not check_password_hash(user["password_hash"], password):
            connection.execute("INSERT INTO login_attempts VALUES(?,?)", (identity, now))
            connection.commit()
            return jsonify(error="帳號或密碼不正確，請確認後再試一次。"), 401
        token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        connection.execute("DELETE FROM sessions WHERE token_hash=? OR expires_at<=?", (session_hash(request.cookies.get("mori_session", "")), now))
        connection.execute("INSERT INTO sessions VALUES(?,?,?,?)", (session_hash(token), user["id"], csrf, now + app.config["SESSION_SECONDS"]))
        connection.execute("DELETE FROM login_attempts WHERE identity=?", (identity,))
        connection.commit()
        response = jsonify(user=public_user(user), csrfToken=csrf, expiresAt=(now + app.config["SESSION_SECONDS"]) * 1000)
        set_session_cookie(response, token)
        return response

    @app.get("/api/auth/session")
    @require()
    def session():
        return jsonify(session_payload(g.user))

    @app.post("/api/auth/logout")
    @require()
    def logout():
        db().execute("DELETE FROM sessions WHERE token_hash=?", (session_hash(request.cookies.get("mori_session", "")),))
        db().commit()
        response = jsonify(ok=True)
        response.delete_cookie("mori_session", path="/", httponly=True, samesite="Strict", secure=app.config["COOKIE_SECURE"])
        return response

    @app.get("/api/menu")
    def public_catalog():
        data = catalog()
        return jsonify(items=[item for item in data["items"] if item["visible"]], revision=data["revision"])

    @app.get("/api/products")
    @require()
    def get_products():
        return jsonify(catalog())

    @app.put("/api/products")
    @require("productWrite")
    def save_products():
        body = request.get_json()
        if not isinstance(body, dict) or type(body.get("revision")) is not int:
            return jsonify(error="商品版本格式錯誤。"), 400
        error = validate_products(body.get("items"))
        if error:
            return jsonify(error=error), 400
        connection = db()
        connection.execute("BEGIN IMMEDIATE")
        previous = catalog()
        if not PERMISSIONS[g.user["role"]]["productDelete"] and {item["id"] for item in previous["items"]} - {item["id"] for item in body["items"]}:
            connection.rollback()
            return jsonify(error="員工不能刪除商品。"), 403
        result = connection.execute("UPDATE catalog SET data=?,revision=revision+1 WHERE id=1 AND revision=?",
                                    (json.dumps(body["items"], ensure_ascii=False), body["revision"]))
        if result.rowcount != 1:
            connection.rollback()
            return jsonify(error="商品已在其他分頁變更，請關閉表單並重新開啟後再試。"), 409
        connection.commit()
        return jsonify(catalog())

    @app.get("/api/users")
    @require("usersManage")
    def users():
        return jsonify(users=[public_user(row) for row in db().execute("SELECT * FROM users ORDER BY id")])

    @app.post("/api/users")
    @require("usersManage")
    def create_user():
        body = request.get_json()
        error = validate_user(body, creating=True)
        if error:
            return jsonify(error=error), 400
        try:
            cursor = db().execute("INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)", (
                body["email"].strip().lower(), body["name"].strip(), generate_password_hash(body["password"]), body["role"]))
            db().commit()
        except sqlite3.IntegrityError:
            return jsonify(error="此電子郵件已建立帳號。"), 409
        return jsonify(user=public_user(db().execute("SELECT * FROM users WHERE id=?", (cursor.lastrowid,)).fetchone())), 201

    @app.patch("/api/users/<int:user_id>")
    @require("usersManage")
    def update_user(user_id):
        body = request.get_json()
        error = validate_user(body, creating=False)
        if error:
            return jsonify(error=error), 400
        connection = db()
        connection.execute("BEGIN IMMEDIATE")
        target = connection.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
        if not target:
            connection.rollback()
            return jsonify(error="帳號不存在。"), 404
        if target["role"] == "admin" and target["active"] and (body["role"] != "admin" or not body["active"]):
            if connection.execute("SELECT COUNT(*) FROM users WHERE role='admin' AND active=1").fetchone()[0] <= 1:
                connection.rollback()
                return jsonify(error="至少須保留一位啟用中的管理員。"), 409
        password_hash = generate_password_hash(body["password"]) if body.get("password") else target["password_hash"]
        connection.execute("UPDATE users SET name=?,role=?,active=?,password_hash=? WHERE id=?", (
            body["name"].strip(), body["role"], body["active"], password_hash, user_id))
        if target["role"] != body["role"] or bool(target["active"]) != body["active"] or body.get("password"):
            connection.execute("DELETE FROM sessions WHERE user_id=?", (user_id,))
        connection.commit()
        return jsonify(user=public_user(connection.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()))

    return app


def validate_user(body, creating):
    if not isinstance(body, dict):
        return "帳號資料格式錯誤。"
    if not isinstance(body.get("name"), str) or not 1 <= len(body["name"].strip()) <= 60:
        return "請輸入 1–60 字的姓名。"
    if body.get("role") not in ("admin", "staff"):
        return "角色僅能為員工或管理員。"
    if creating and (not isinstance(body.get("email"), str) or len(body["email"]) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", body["email"].strip())):
        return "請輸入有效的電子郵件。"
    password = body.get("password", "")
    if not isinstance(password, str) or ((creating or password) and not 8 <= len(password) <= 128):
        return "密碼須為 8–128 字。"
    if not creating and type(body.get("active")) is not bool:
        return "請指定帳號啟用狀態。"
    return None
