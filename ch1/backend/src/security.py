import secrets
import time
from functools import wraps

from flask import current_app, g, jsonify, request
from .database import db, session_hash


PERMISSIONS = {
    "admin": {"productWrite": True, "productDelete": True, "usersManage": True},
    "staff": {"productWrite": True, "productDelete": False, "usersManage": False},
}


def public_user(row):
    return {"id": row["id"], "email": row["email"], "name": row["name"],
            "role": row["role"], "active": bool(row["active"]),
            "permissions": PERMISSIONS[row["role"]]}


def current_session():
    token = request.cookies.get("mori_session", "")
    if not token or len(token) > 200:
        return None
    return db().execute("""SELECT users.*,sessions.csrf,sessions.expires_at
        FROM sessions JOIN users ON users.id=sessions.user_id
        WHERE token_hash=? AND expires_at>? AND active=1""",
        (session_hash(token), int(time.time()))).fetchone()


def require(permission=None):
    def decorate(function):
        @wraps(function)
        def wrapped(*args, **kwargs):
            g.user = current_session()
            if g.user is None:
                return jsonify(error="登入狀態已失效，請重新登入。"), 401
            if request.method not in ("GET", "HEAD", "OPTIONS"):
                if not secrets.compare_digest(request.headers.get("X-CSRF-Token", "").encode(), g.user["csrf"].encode()):
                    return jsonify(error="安全驗證失敗，請重新整理後再試。"), 403
            if permission and not PERMISSIONS[g.user["role"]].get(permission):
                return jsonify(error="你的角色沒有執行此操作的權限。"), 403
            return function(*args, **kwargs)
        return wrapped
    return decorate


def session_payload(row):
    return {"user": public_user(row), "csrfToken": row["csrf"], "expiresAt": row["expires_at"] * 1000}


def set_session_cookie(response, token):
    response.set_cookie("mori_session", token, httponly=True,
                        secure=current_app.config["COOKIE_SECURE"], samesite="Strict", path="/",
                        max_age=current_app.config["SESSION_SECONDS"])
