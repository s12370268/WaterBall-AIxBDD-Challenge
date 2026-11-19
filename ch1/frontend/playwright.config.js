import { defineConfig } from '@playwright/test';
// 測試自動啟動獨立伺服器，不占用開發中的 5173 埠。
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:5174', channel: 'msedge', headless: true },
  webServer: {
    command: 'node scripts/dev.mjs',
    url: 'http://127.0.0.1:5174',
    env: { PORT: '5174' },
    reuseExistingServer: false
  },
  workers: 1,
  reporter: 'list'
});
