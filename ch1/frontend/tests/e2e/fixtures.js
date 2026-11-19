import { test as base, expect } from '@playwright/test';
import { menu } from '../../src/menu.js';

export const test = base.extend({
  resetCatalog: [async ({ request }, use) => {
    const login = await request.post('/api/auth/login', { headers: { 'X-Mori-Client': 'web' }, data: { email: 'admin@mori.demo', password: 'Mori2026!' } });
    expect(login.ok()).toBeTruthy();
    const { csrfToken } = await login.json();
    const catalog = await (await request.get('/api/products')).json();
    const saved = await request.put('/api/products', { headers: { 'X-CSRF-Token': csrfToken }, data: { revision: catalog.revision, items: menu.map(item => ({ ...item, visible: true })) } });
    expect(saved.ok()).toBeTruthy();
    const users = (await (await request.get('/api/users')).json()).users;
    const staff = users.find(user => user.email === 'staff@mori.demo');
    await request.patch(`/api/users/${staff.id}`, { headers: { 'X-CSRF-Token': csrfToken }, data: { name: '森暮員工', role: 'staff', active: true, password: 'Staff2026!' } });
    await use();
  }, { auto: true }]
});
export { expect };
export async function login(page, role = 'admin') {
  await page.goto('/admin/#products');
  await expect(page.locator('body')).toHaveAttribute('data-auth-ready', 'true');
  if (await page.locator('#dashboard-view').isVisible()) return;
  await page.locator('#email').fill(`${role}@mori.demo`);
  await page.locator('#password').fill(role === 'admin' ? 'Mori2026!' : 'Staff2026!');
  await page.getByRole('button', { name: '登入管理室', exact: true }).click();
  await expect(page.locator('#dashboard-view')).toBeVisible();
}
