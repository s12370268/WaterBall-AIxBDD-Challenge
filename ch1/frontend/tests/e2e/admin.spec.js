import { test, expect, login } from './fixtures.js';

test('Python 登入：必填、錯誤帳密、密碼切換、Cookie 恢復與登出', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/admin');
  await expect(page.locator('body')).toHaveAttribute('data-auth-ready', 'true');
  await expect(page).toHaveURL(/\/admin\/$/);
  await expect(page.locator('#dashboard-view')).toBeHidden();
  await page.getByRole('button', { name: '登入管理室', exact: true }).click();
  await expect(page.locator('#email-error')).toContainText('請輸入');
  await expect(page.locator('#password-error')).toContainText('請輸入');
  await page.locator('#email').fill('admin@mori.demo'); await page.locator('#password').fill('wrong');
  await page.getByRole('button', { name: '顯示密碼', exact: true }).click();
  await expect(page.locator('#password')).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: '隱藏密碼', exact: true }).click();
  await page.getByRole('button', { name: '登入管理室', exact: true }).click();
  await expect(page.locator('#login-error')).toContainText('帳號或密碼不正確');
  await page.locator('#password').fill('Mori2026!');
  await page.getByRole('button', { name: '登入管理室', exact: true }).click();
  await expect(page.locator('#dashboard-view')).toBeVisible();
  await expect(page.locator('#account-role')).toHaveText('管理員');
  expect((await page.context().cookies()).find(cookie => cookie.name === 'mori_session').httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain('mori_session');
  await page.reload(); await expect(page.locator('#dashboard-view')).toBeVisible();
  await page.locator('#logout-button').click();
  await expect(page.locator('#login-view')).toBeVisible();
  await page.reload(); await expect(page.locator('#dashboard-view')).toBeHidden();
  expect(errors).toEqual([]);
});

test('員工能新增編輯商品，沒有刪除與帳號權限，API 也拒絕繞過', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await login(page, 'staff');
  await expect(page.locator('#account-role')).toHaveText('員工');
  await expect(page.locator('#add-product')).toBeVisible();
  await expect(page.locator('[data-delete]')).toHaveCount(0);
  await expect(page.locator('#users-nav')).toBeHidden();
  await page.locator('#product-search').fill('牛排');
  await expect(page.locator('[data-delete]')).toHaveCount(0);
  await page.getByRole('button', { name: '編輯炭烤美國肋眼牛排', exact: true }).click();
  await page.locator('#product-price').fill('990'); await page.locator('#save-product').click();
  await expect(page.locator('.product-row-price')).toHaveText('NT$ 990');
  const codes = await page.evaluate(async () => {
    const session = await (await fetch('/api/auth/session')).json();
    const data = await (await fetch('/api/products')).json(); data.items.pop();
    return [(await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': session.csrfToken }, body: JSON.stringify(data) })).status, (await fetch('/api/users')).status];
  });
  expect(codes).toEqual([403, 403]);
  await page.goto('/admin/#users'); await expect(page.locator('body')).toHaveAttribute('data-auth-ready', 'true');
  await expect(page.locator('#users-content')).toBeHidden();
  await page.screenshot({ path: 'artifacts/staff-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('管理員建立員工、變更角色、停用及最後一位管理員保護', async ({ page, browser }) => {
  await login(page); await page.locator('#users-nav').click();
  await page.locator('#add-user').click();
  const email = `member-${Date.now()}@mori.demo`;
  await page.locator('#user-name').fill('測試夥伴'); await page.locator('#user-email').fill(email); await page.locator('#user-password').fill('Member2026!');
  await page.locator('#save-user').click();
  const row = page.locator('.user-row').filter({ hasText: email }); await expect(row).toBeVisible();
  const context = await browser.newContext(); const staff = await context.newPage();
  await staff.goto('http://127.0.0.1:5174/admin/'); await expect(staff.locator('body')).toHaveAttribute('data-auth-ready', 'true');
  await staff.locator('#email').fill(email); await staff.locator('#password').fill('Member2026!'); await staff.locator('#login-button').click();
  await expect(staff.locator('#dashboard-view')).toBeVisible();
  await row.getByRole('button', { name: /編輯/ }).click(); await page.locator('#user-role').selectOption('admin'); await page.locator('#save-user').click();
  await staff.reload(); await expect(staff.locator('#login-view')).toBeVisible();
  await row.getByRole('button', { name: /編輯/ }).click(); await page.locator('#user-role').selectOption('staff'); await page.locator('#user-active').uncheck(); await page.locator('#save-user').click();
  await expect(row).toContainText('停用');
  const admin = page.locator('.user-row').filter({ hasText: 'admin@mori.demo' });
  await admin.getByRole('button', { name: /編輯/ }).click(); await page.locator('#user-active').uncheck(); await page.locator('#save-user').click();
  await expect(page.locator('#user-form-error')).toContainText('至少須保留');
  await page.screenshot({ path: 'artifacts/account-permissions.png', fullPage: true });
  await context.close();
});
