import { test, expect } from '@playwright/test';

async function login(page) {
  await page.getByLabel('管理員帳號', { exact: true }).fill('admin@mori.demo');
  await page.getByLabel('密碼', { exact: true }).fill('Mori2026!');
  await page.getByRole('button', { name: '登入管理室', exact: true }).click();
}

test('後台：未登入入口、必填格式、錯誤帳密、密碼切換與登入登出', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/$/);
  await expect(page.locator('#dashboard-view')).toBeHidden();
  await page.getByRole('button', { name: '登入管理室', exact: true }).click();
  await expect(page.locator('#email-error')).toHaveText('請輸入管理員帳號。');
  await expect(page.locator('#password-error')).toHaveText('請輸入密碼。');
  await page.locator('#email').fill('admin');
  await page.locator('#password').fill('wrong');
  await page.getByRole('button', { name: '登入管理室', exact: true }).click();
  await expect(page.locator('#email-error')).toHaveText('請輸入有效的電子郵件格式。');
  await page.locator('#email').fill('admin@mori.demo');
  await page.getByRole('button', { name: '顯示密碼', exact: true }).click();
  await expect(page.locator('#password')).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: '隱藏密碼', exact: true }).click();
  await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: '登入管理室', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('帳號或密碼不正確，請確認後再試一次。');
  await expect(page.locator('#dashboard-view')).toBeHidden();
  await login(page);
  await expect(page.locator('#dashboard-view')).toBeVisible();
  await expect(page.locator('#dish-count')).toHaveText('9');
  await expect(page.locator('#category-count')).toHaveText('5');
  await expect(page.locator('#password')).toHaveValue('');
  expect(await page.evaluate(() => sessionStorage.getItem('mori-admin-demo-session'))).not.toContain('Mori2026!');
  await page.reload();
  await expect(page.locator('#dashboard-view')).toBeVisible();
  await page.getByRole('button', { name: '登出', exact: true }).click();
  await expect(page.locator('#login-view')).toBeVisible();
  await page.reload();
  await expect(page.locator('#dashboard-view')).toBeHidden();
  expect(errors).toEqual([]);
});

test('手機後台：深連結、到期、損壞資料、登出後返回與前台資料獨立', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/index.html#overview');
  await expect(page.locator('#dashboard-view')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/admin-login-mobile.png', fullPage: true });
  await login(page);
  await expect(page.locator('#dashboard-view')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/admin-home-mobile.png', fullPage: true });
  await page.evaluate(() => { const value = JSON.parse(sessionStorage.getItem('mori-admin-demo-session')); value.expiresAt = Date.now() - 1; sessionStorage.setItem('mori-admin-demo-session', JSON.stringify(value)); localStorage.setItem('mori-order', 'keep-customer-cart'); });
  await page.reload();
  await expect(page.locator('#dashboard-view')).toBeHidden();
  await expect(page.getByRole('alert')).toContainText('登入狀態已到期');
  await page.evaluate(() => sessionStorage.setItem('mori-admin-demo-session', '{broken'));
  await page.reload();
  await expect(page.locator('#login-view')).toBeVisible();
  await login(page);
  await page.getByRole('button', { name: '登出', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('mori-order'))).toBe('keep-customer-cart');
  await page.getByRole('link', { name: '回到前台菜單', exact: true }).click();
  await page.goBack();
  await expect(page.locator('#dashboard-view')).toBeHidden();
});

test('後台：當儲存空間停用時仍可登入登出；桌面視覺', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.removeItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('/admin/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'artifacts/admin-login-desktop.png', fullPage: true });
  await login(page);
  await expect(page.locator('#dashboard-view')).toBeVisible();
  await page.screenshot({ path: 'artifacts/admin-home-desktop.png', fullPage: true });
  await page.getByRole('button', { name: '登出', exact: true }).click();
  await expect(page.locator('#login-view')).toBeVisible();
});
