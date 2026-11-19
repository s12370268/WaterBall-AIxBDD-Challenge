import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const artifacts = fileURLToPath(new URL('../artifacts/', import.meta.url));
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
try {
  for (const [name, width, height] of [['desktop', 1280, 900], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto('http://127.0.0.1:5173');
    await page.locator('.dish-card').last().waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll('img')].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); }));
    });
    await page.screenshot({ path: resolve(artifacts, `${name}.png`), fullPage: true });
    await page.close();
  }
} finally { await browser.close(); }
