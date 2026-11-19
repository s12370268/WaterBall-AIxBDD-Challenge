import hashlib
import json
import os
import sqlite3
from pathlib import Path

from flask import current_app, g
from werkzeug.security import generate_password_hash


def db():
    if "database" not in g:
        g.database = sqlite3.connect(current_app.config["DATABASE"], timeout=10)
        g.database.row_factory = sqlite3.Row
        g.database.execute("PRAGMA foreign_keys=ON")
    return g.database


def initialize(app):
    Path(app.config["DATABASE"]).parent.mkdir(parents=True, exist_ok=True)
    with app.app_context():
        connection = db()
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL, password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('admin','staff')),
                active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
                csrf TEXT NOT NULL, expires_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS catalog (
                id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL, revision INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS login_attempts (
                identity TEXT NOT NULL, attempted_at INTEGER NOT NULL
            );
        """)
        if not connection.execute("SELECT 1 FROM users LIMIT 1").fetchone():
            password = os.environ.get("MORI_ADMIN_PASSWORD")
            if not password and not app.config["DEVELOPMENT"]:
                raise RuntimeError("首次啟動必須設定 MORI_ADMIN_PASSWORD（至少 8 字）")
            password = password or "Mori2026!"
            if len(password) < 8 or len(password) > 128:
                raise RuntimeError("管理員初始密碼須為 8–128 字")
            connection.execute("INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)", (
                os.environ.get("MORI_ADMIN_EMAIL", "admin@mori.demo").strip().lower(),
                "森暮管理員", generate_password_hash(password), "admin"))
            if app.config["DEVELOPMENT"]:
                connection.execute("INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)", (
                    "staff@mori.demo", "森暮員工", generate_password_hash("Staff2026!"), "staff"))
        seed = Path(__file__).with_name("seed-products.json").read_text(encoding="utf-8")
        connection.execute("INSERT OR IGNORE INTO catalog(id,data,revision) VALUES(1,?,1)", (seed,))
        connection.commit()
        connection.close()
        g.pop("database", None)

    @app.teardown_appcontext
    def close_database(_error):
        connection = g.pop("database", None)
        if connection is not None:
            connection.close()


def session_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()


def catalog():
    row = db().execute("SELECT data,revision FROM catalog WHERE id=1").fetchone()
    return {"items": json.loads(row["data"]), "revision": row["revision"]}
