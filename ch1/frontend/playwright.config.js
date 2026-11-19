import { defineConfig } from '@playwright/test';
// 測試自動啟動獨立伺服器，不占用開發中的 5173 埠。
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:5174', channel: 'msedge', headless: true },
  webServer: [{
    command: 'node ../scripts/backend.mjs',
    url: 'http://127.0.0.1:5001/api/health',
    env: { BACKEND_PORT: '5001', MORI_DATABASE: 'data/e2e.sqlite3', MORI_DEVELOPMENT: '1', MORI_QUIET: '1' },
    reuseExistingServer: false
  }, {
    command: 'node scripts/dev.mjs',
    url: 'http://127.0.0.1:5174',
    env: { PORT: '5174', BACKEND_URL: 'http://127.0.0.1:5001' },
    reuseExistingServer: false
  }],
  workers: 1,
  reporter: 'list'
});
