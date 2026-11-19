import json
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch

from src import create_app
from src.database import db


class ApiTests(unittest.TestCase):
    def setUp(self):
        temporary_root = Path(__file__).resolve().parents[1] / 'data' / 'test-temp'
        temporary_root.mkdir(parents=True, exist_ok=True)
        self.directory = tempfile.TemporaryDirectory(dir=temporary_root)
        self.config = {"TESTING": True, "DEVELOPMENT": True, "COOKIE_SECURE": False,
                       "DATABASE": str(Path(self.directory.name) / "test.sqlite3")}
        self.environment = patch.dict("os.environ", {"MORI_ADMIN_PASSWORD": "Mori2026!", "MORI_ADMIN_EMAIL": "admin@mori.demo"})
        self.environment.start()
        self.app = create_app(self.config)
        self.admin, self.staff = self.app.test_client(), self.app.test_client()
        self.admin_token = self.login(self.admin, "admin@mori.demo", "Mori2026!")
        self.staff_token = self.login(self.staff, "staff@mori.demo", "Staff2026!")

    def tearDown(self):
        self.environment.stop()
        self.directory.cleanup()

    def login(self, client, email, password):
        response = client.post("/api/auth/login", json={"email": email, "password": password}, headers={"X-Mori-Client": "web"})
        self.assertEqual(response.status_code, 200)
        return response.json["csrfToken"]

    def write(self, client, path, body, token, method="put"):
        return getattr(client, method)(path, json=body, headers={"X-CSRF-Token": token})

    def test_guest_cannot_use_backend_or_forge_role(self):
        guest = self.app.test_client()
        self.assertEqual(guest.get("/api/products").status_code, 401)
        self.assertEqual(guest.put("/api/products", json={"role": "admin", "items": []}).status_code, 401)
        self.assertEqual(guest.get("/api/users").status_code, 401)
        self.assertEqual(guest.get("/api/menu").status_code, 200)

    def test_staff_can_add_edit_hide_but_cannot_delete_or_manage_users(self):
        data = self.staff.get("/api/products").json
        item = {**data["items"][0], "id": "staff-product", "name": "員工新增", "price": 100}
        data["items"].append(item)
        response = self.write(self.staff, "/api/products", data, self.staff_token)
        self.assertEqual(response.status_code, 200)
        data = response.json
        data["items"][-1].update(price=200, visible=False)
        response = self.write(self.staff, "/api/products", data, self.staff_token)
        self.assertEqual(response.status_code, 200)
        data = response.json
        data["items"] = data["items"][:-1]
        self.assertEqual(self.write(self.staff, "/api/products", data, self.staff_token).status_code, 403)
        self.assertEqual(self.staff.get("/api/users").status_code, 403)
        for method, path in [("post", "/api/users"), ("patch", "/api/users/1")]:
            self.assertEqual(self.write(self.staff, path, {"role": "admin"}, self.staff_token, method).status_code, 403)
        self.assertEqual(len(self.admin.get("/api/products").json["items"]), 10)

    def test_admin_delete_and_persistence_across_restart(self):
        data = self.admin.get("/api/products").json
        data["items"] = data["items"][1:]
        self.assertEqual(self.write(self.admin, "/api/products", data, self.admin_token).status_code, 200)
        restarted = create_app(self.config).test_client()
        self.assertEqual(len(restarted.get("/api/menu").json["items"]), 8)

    def test_csrf_origin_cookie_hashes_and_logout(self):
        response = self.admin.post("/api/auth/login", json={"email": "admin@mori.demo", "password": "Mori2026!"}, headers={"X-Mori-Client": "web"})
        self.assertIn("HttpOnly", response.headers["Set-Cookie"])
        self.assertIn("SameSite=Strict", response.headers["Set-Cookie"])
        self.assertNotIn("password", response.json)
        self.assertEqual(self.admin.put("/api/products", json={}).status_code, 403)
        self.assertEqual(self.admin.post("/api/auth/login", json={}, headers={"Origin": "https://evil.example", "X-Mori-Client": "web"}).status_code, 403)
        with self.app.app_context():
            row = db().execute("SELECT password_hash FROM users WHERE id=1").fetchone()
            self.assertNotEqual(row[0], "Mori2026!")
            self.assertTrue(row[0].startswith("scrypt:"))
        self.assertEqual(self.write(self.admin, "/api/auth/logout", {}, response.json["csrfToken"], "post").status_code, 200)
        self.assertEqual(self.admin.get("/api/auth/session").status_code, 401)

    def test_expired_and_disabled_session_are_rejected(self):
        with self.app.app_context():
            db().execute("UPDATE sessions SET expires_at=? WHERE user_id=2", (int(time.time()) - 1,)); db().commit()
        self.assertEqual(self.staff.get("/api/auth/session").status_code, 401)
        self.login(self.staff, "staff@mori.demo", "Staff2026!")
        with self.app.app_context():
            db().execute("UPDATE users SET active=0 WHERE id=2"); db().commit()
        self.assertEqual(self.staff.get("/api/products").status_code, 401)

    def test_account_creation_role_changes_disable_and_last_admin(self):
        user = {"name": "新同事", "email": "new@mori.demo", "password": "Password123!", "role": "staff"}
        response = self.write(self.admin, "/api/users", user, self.admin_token, "post")
        self.assertEqual(response.status_code, 201)
        user_id = response.json["user"]["id"]
        self.assertEqual(self.write(self.admin, "/api/users", user, self.admin_token, "post").status_code, 409)
        new_client = self.app.test_client(); self.login(new_client, user["email"], user["password"])
        response = self.write(self.admin, f"/api/users/{user_id}", {"name": "新同事", "role": "admin", "active": True}, self.admin_token, "patch")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(new_client.get("/api/auth/session").status_code, 401)
        self.login(new_client, user["email"], user["password"])
        self.assertEqual(new_client.get("/api/users").status_code, 200)
        response = self.write(self.admin, f"/api/users/{user_id}", {"name": "新同事", "role": "staff", "active": False}, self.admin_token, "patch")
        self.assertEqual(response.status_code, 200)
        response = self.write(self.admin, "/api/users/1", {"name": "管理員", "role": "staff", "active": True}, self.admin_token, "patch")
        self.assertEqual(response.status_code, 409)

    def test_catalog_validation_conflict_and_public_visibility(self):
        old = self.admin.get("/api/products").json
        data = json.loads(json.dumps(old)); data["items"][0]["visible"] = False
        self.assertEqual(self.write(self.admin, "/api/products", data, self.admin_token).status_code, 200)
        self.assertEqual(len(self.app.test_client().get("/api/menu").json["items"]), 8)
        self.assertEqual(self.write(self.admin, "/api/products", old, self.admin_token).status_code, 409)
        data = self.admin.get("/api/products").json; data["items"][0]["price"] = -1
        self.assertEqual(self.write(self.admin, "/api/products", data, self.admin_token).status_code, 400)
        data["items"][0]["price"] = 100; data["items"][0]["image"] = "data:image/png;base64,YmFk"
        self.assertEqual(self.write(self.admin, "/api/products", data, self.admin_token).status_code, 400)

    def test_failed_login_and_rate_limit(self):
        client = self.app.test_client()
        for _ in range(5):
            self.assertEqual(client.post("/api/auth/login", json={"email": "wrong@mori.demo", "password": "wrong"}, headers={"X-Mori-Client": "web"}).status_code, 401)
        self.assertEqual(client.post("/api/auth/login", json={"email": "wrong@mori.demo", "password": "wrong"}, headers={"X-Mori-Client": "web"}).status_code, 429)
        self.assertEqual(client.post("/api/auth/login", data="{", content_type="application/json", headers={"X-Mori-Client": "web"}).status_code, 400)


if __name__ == "__main__":
    unittest.main()
