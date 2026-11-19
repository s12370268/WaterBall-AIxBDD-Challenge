import { test, expect } from './fixtures.js';

test('目錄整理後：HTML、模組、樣式與照片可讀取，工具及後端目錄不公開', async ({ request }) => {
  for (const path of ['/', '/admin/', '/src/app.js', '/src/catalog.js', '/src/admin/admin.js', '/src/styles.css', '/src/admin/admin.css', '/assets/hero.jpg']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  for (const path of ['/package.json', '/scripts/dev.mjs', '/tests/unit/menu.test.js', '/backend/README.md', '/public/assets/hero.jpg']) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});
