# 森暮前端

包含客人菜單與管理員後台，使用原生 HTML、CSS、JavaScript，呼叫 Python Flask API 完成登入、商品與帳號權限管理。商品與照片存於後端 SQLite，購物車仍保存在瀏覽器。

從專案根目錄執行 `npm install` 安裝 workspace 依賴，並先執行 `uv sync --project backend`、`npm run dev:backend` 啟動 Python 後端。之後可在根目錄或此目錄執行：

```sh
npm run dev
npm test
npm run test:e2e
npm run build
```

開發預覽：http://localhost:5173 ，後台：http://localhost:5173/admin/ 。本機管理員 `admin@mori.demo`／`Mori2026!`，員工 `staff@mori.demo`／`Staff2026!`。

- `src/`：程式、樣式、示範菜單與瀏覽器儲存邏輯。
- `src/admin/`：管理員登入、商品管理、照片處理。
- `public/assets/`：照片與 Logo；開發及建置後皆透過 `/assets/` 存取。
- `scripts/`：前端工具，開發伺服器將 `/api/` 代理到 `BACKEND_URL`（預設 `http://127.0.0.1:5000`）。
- `tests/`：單元與瀏覽器流程測試；瀏覽器測試自動啟動 5174 前端與 5001 Python 測試後端，並於結束時關閉，需要本機 Microsoft Edge 及已安裝的後端虛擬環境。
- `dist/`：`npm run build` 自動產生、完整可部署的靜態網站。每次建置會清理此輸出目錄，請勿在此修改程式。
- `artifacts/`、`test-results/`：自動產生的截圖與測試結果，不提交 Git。

管理員可在商品管理按「匯入此瀏覽器舊菜單」，確認後將原有商品與照片匯入伺服器，舊資料保留；舊示範登入不再有效，須透過 Python 重新登入。Cookie 為 HttpOnly，前端不保存密碼或自行決定角色。

前端 `dist/` 仍可獨立託管，但須同時提供 Python 後端並設定 `/api/` 反向代理。純靜態部署無法提供登入或商品 API；點餐送單仍為示範。

完整說明見 [開發文件](../docs/DEVELOPMENT.md)。
