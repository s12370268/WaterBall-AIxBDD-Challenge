# 森暮前端

包含客人菜單與管理員後台，使用原生 HTML、CSS、JavaScript，資料目前保存在瀏覽器。

從專案根目錄執行 `npm install` 安裝 workspace 依賴，之後可在根目錄或此目錄執行：

```sh
npm run dev
npm test
npm run test:e2e
npm run build
```

開發預覽：http://localhost:5173 ，後台：http://localhost:5173/admin/ 。示範帳號 `admin@mori.demo`，密碼 `Mori2026!`。

- `src/`：程式、樣式、示範菜單與瀏覽器儲存邏輯。
- `src/admin/`：管理員登入、商品管理、照片處理。
- `public/assets/`：照片與 Logo；開發及建置後皆透過 `/assets/` 存取。
- `scripts/`：前端工具，並非業務後端。
- `tests/`：單元與瀏覽器流程測試；瀏覽器測試自動在 5174 啟動暫時伺服器並於結束時關閉，需要本機 Microsoft Edge。
- `dist/`：`npm run build` 自動產生、完整可部署的靜態網站。每次建置會清理此輸出目錄，請勿在此修改程式。
- `artifacts/`、`test-results/`：自動產生的截圖與測試結果，不提交 Git。

保持相同網址與 port，原先儲存在瀏覽器的商品、點單與登入工作階段可繼續使用。目錄搬移不會將這些資料改為後端儲存。

完整說明見 [開發文件](../docs/DEVELOPMENT.md)。
