# 森暮 Python 後端

使用 Python 3.12+、Flask、SQLite，處理真實帳密登入、工作階段、角色權限、商品與照片保存，以及帳號管理。前端管理畫面仍在 `frontend/`。

## 安裝與啟動

在專案根目錄執行：

```sh
uv sync --project backend
npm run dev:backend
```

另一個終端執行 `npm run dev`，從 http://localhost:5173/admin/ 登入。Python API 預設在 127.0.0.1:5000；前端開發伺服器將 `/api/` 代理至此，不需要開放跨來源 Cookie。

若未使用 uv，也可建立 `backend/.venv`，安裝 `backend/pyproject.toml` 宣告的 Flask 依賴，再執行 `backend/run.py`。`MORI_PYTHON` 可指定 Python 執行檔供 npm 指令使用。

本機開發初次建立資料庫時提供：

| 角色 | 帳號 | 密碼 | 權限 |
| --- | --- | --- | --- |
| 管理員 | `admin@mori.demo` | `Mori2026!` | 全部商品操作、建立帳號、變更角色／密碼、停用帳號 |
| 員工 | `staff@mori.demo` | `Staff2026!` | 查看、新增、編輯、隱藏商品；不能刪除或管理帳號 |

登入頁的開發帳號說明只在後端 `MORI_DEVELOPMENT=1` 時顯示。登入不再信任瀏覽器中的舊示範工作階段。權限在每次 API 請求從資料庫確認，不接受客戶端自訂角色。

## 設定與資料

| 環境變數 | 預設／用途 |
| --- | --- |
| `BACKEND_PORT` | `5000` |
| `MORI_DATABASE` | `backend/data/mori.sqlite3`；SQLite 資料庫路徑 |
| `MORI_DEVELOPMENT` | `1`；設為 `0` 時不建立預設員工，初次建立需提供管理員密碼，Cookie 改用 Secure |
| `MORI_ADMIN_EMAIL` | 初次建立管理員的電子郵件，預設 `admin@mori.demo` |
| `MORI_ADMIN_PASSWORD` | 初次建立管理員的密碼，8–128 字；僅開發模式有預設值 |
| `MORI_ALLOWED_ORIGINS` | 允許修改請求的來源，逗號分隔；開發預設 localhost／127.0.0.1 的 5173、5174 |

不會自動讀入 `.env`；請由啟動環境設定環境變數。`uv.lock` 鎖定 Python 依賴。`backend/data/` 與 `.venv/` 不提交 Git。

商品與壓縮後照片集中存於 SQLite，重新啟動仍保留，不再受限於單一瀏覽器。初次使用以 `src/seed-products.json` 建立九道起始商品；空菜單不會重新植入。管理員可按「匯入此瀏覽器舊菜單」，確認後以舊商品及照片取代伺服器菜單，原瀏覽器資料不會被刪除。

密碼以 Werkzeug scrypt 雜湊保存；隨機登入 Cookie 為 HttpOnly、SameSite=Strict，伺服器只存 Cookie 的雜湊。修改請求另驗證 CSRF token 與來源。登入有效期 8 小時，登出會刪除伺服器工作階段；角色／密碼／啟用狀態變更會撤銷該帳號所有既有登入。至少保留一位啟用中的管理員。

正式對外部署需使用 HTTPS、獨立正式資料庫與實際帳密，設定 `MORI_DEVELOPMENT=0`，並使用正式 WSGI 伺服器與 `/api/` 反向代理；不要沿用本機開發資料庫或預設帳密。本次未部署。

## API

| 路徑 | 權限／行為 |
| --- | --- |
| `POST /api/auth/login` | 驗證帳密、建立 Cookie，回傳使用者、權限、到期時間、CSRF token |
| `GET /api/auth/session` | 查詢有效登入狀態 |
| `POST /api/auth/logout` | 撤銷登入 |
| `GET /api/menu` | 公開讀取顯示中的商品 |
| `GET /api/products` | 員工、管理員讀取全部商品及版本 |
| `PUT /api/products` | 員工可新增／編輯；若移除商品，只有管理員可儲存 |
| `GET /api/users` | 管理員查詢帳號 |
| `POST /api/users` | 管理員新增帳號 |
| `PATCH /api/users/:id` | 管理員修改姓名、角色、啟用狀態、選填新密碼 |

商品寫入包含完整清單與 `revision`，以 SQLite 交易檢查版本，衝突回傳 409，避免覆寫他人更新。照片、價格、標籤、分類等欄位亦由 Python 驗證。公開菜單永遠不包含隱藏商品。

## 測試

```sh
npm run test:backend
npm test
npm run test:e2e
```

後端測試使用隔離暫存 SQLite；瀏覽器測試自動啟動 5001 的測試後端與 5174 的前端，使用 `backend/data/e2e.sqlite3`，不操作本機正式開發資料庫。

使用文件：[Flask](https://flask.palletsprojects.com/en/stable/quickstart/)、[Werkzeug 密碼雜湊](https://werkzeug.palletsprojects.com/en/stable/utils/#werkzeug.security.generate_password_hash)。
