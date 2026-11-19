import { categories } from '../menu.js';
import { api, setCsrfToken } from '../api.js';
import { validateLogin, login, restoreSession, logout } from './auth.js';
import { initializeProducts } from './products.js';
import { initializeUsers } from './users.js';

const $ = selector => document.querySelector(selector);
let session = null, expiryTimer, productManager, userManager;
function clearErrors() {
  for (const field of ['email', 'password']) { $(`#${field}`).removeAttribute('aria-invalid'); $(`#${field}-error`).hidden = true; }
  $('#login-error').hidden = true;
}
function showLogin(message = '', focus = false) {
  productManager?.close(); userManager?.close(); clearTimeout(expiryTimer);
  session = null; setCsrfToken();
  $('#dashboard-view').hidden = true; $('#login-view').hidden = false;
  document.title = '管理員登入｜森暮 MORI Bistro';
  $('#password').value = ''; $('#password').type = 'password';
  $('#toggle-password').setAttribute('aria-pressed', 'false'); $('#toggle-password').setAttribute('aria-label', '顯示密碼');
  $('#caps-lock').hidden = true; clearErrors();
  if (message) { $('#login-error').textContent = message; $('#login-error').hidden = false; }
  if (focus) $('#email').focus();
}
const can = permission => !!session?.user.permissions[permission];
function authorize(permission) {
  if (!session || session.expiresAt <= Date.now()) { showLogin('登入狀態已失效，請重新登入。', true); return false; }
  return !permission || can(permission);
}
async function routeWorkspace() {
  if ($('#dashboard-view').hidden || !authorize()) return;
  let section = location.hash === '#products' ? 'products' : location.hash === '#users' ? 'users' : 'overview';
  if (section === 'users' && !can('usersManage')) section = 'overview';
  const label = { overview: '管理首頁', products: '商品管理', users: '帳號權限' }[section];
  for (const name of ['overview', 'products', 'users']) $(`#${name}-content`).hidden = name !== section;
  $('#workspace-page-name').textContent = label; document.title = `${label}｜森暮 MORI Bistro`;
  document.querySelectorAll('[data-admin-nav]').forEach(link => { if (link.dataset.adminNav === section) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  if (section === 'users') await userManager.load();
}
async function showDashboard(focus = false) {
  if (!authorize()) return;
  $('#login-view').hidden = true; $('#dashboard-view').hidden = false;
  $('#account-name').textContent = session.user.name;
  $('#account-role').textContent = session.user.role === 'admin' ? '管理員' : '員工';
  $('#welcome-heading').textContent = `歡迎回來，${session.user.name}。`;
  $('#users-nav').hidden = !can('usersManage');
  $('#category-count').textContent = categories.length - 1;
  clearTimeout(expiryTimer);
  expiryTimer = setTimeout(() => showLogin('登入狀態已到期，請重新登入。', true), session.expiresAt - Date.now());
  await productManager.load(); await routeWorkspace();
  if (focus && session) { $('#overview').focus(); window.scrollTo(0, 0); }
}
$('#login-form').addEventListener('submit', async event => {
  event.preventDefault(); clearErrors();
  const email = $('#email').value, password = $('#password').value, errors = validateLogin(email, password);
  for (const [field, message] of Object.entries(errors)) { $(`#${field}`).setAttribute('aria-invalid', 'true'); $(`#${field}-error`).textContent = message; $(`#${field}-error`).hidden = false; }
  if (Object.keys(errors).length) { $(`#${Object.keys(errors)[0]}`).focus(); return; }
  $('#login-button').disabled = true; $('#login-button').textContent = '登入中…';
  try { session = await login(email, password); $('#password').value = ''; await showDashboard(true); }
  catch (error) { $('#login-error').textContent = error.message; $('#login-error').hidden = false; $('#password').focus(); }
  finally { $('#login-button').disabled = false; $('#login-button').textContent = '登入管理室'; }
});
$('#toggle-password').addEventListener('click', () => {
  const visible = $('#password').type === 'password'; $('#password').type = visible ? 'text' : 'password';
  $('#toggle-password').setAttribute('aria-label', visible ? '隱藏密碼' : '顯示密碼'); $('#toggle-password').setAttribute('aria-pressed', String(visible));
});
for (const field of ['email', 'password']) $(`#${field}`).addEventListener('input', () => { $(`#${field}`).removeAttribute('aria-invalid'); $(`#${field}-error`).hidden = true; $('#login-error').hidden = true; });
for (const type of ['keydown', 'keyup']) $('#password').addEventListener(type, event => { $('#caps-lock').hidden = !event.getModifierState('CapsLock'); });
$('#password').addEventListener('blur', () => { $('#caps-lock').hidden = true; });
$('#logout-button').addEventListener('click', async () => {
  $('#logout-button').disabled = true;
  try { await logout(); showLogin('', true); }
  catch (error) { if (error.status === 401) showLogin('', true); else { $('#admin-notice').textContent = `登出失敗：${error.message}`; $('#admin-notice').hidden = false; } }
  finally { $('#logout-button').disabled = false; }
});
async function recheckSession() {
  if (!session) return;
  try { session = await restoreSession(); await showDashboard(); }
  catch (error) { if (error.status === 401) showLogin('登入狀態已失效，請重新登入。', true); }
}
window.addEventListener('mori-auth-expired', () => showLogin('登入狀態已失效，請重新登入。', true));
document.addEventListener('visibilitychange', () => { if (!document.hidden) recheckSession(); });
window.addEventListener('pageshow', event => { if (event.persisted) recheckSession(); });
window.addEventListener('hashchange', routeWorkspace);
productManager = initializeProducts(authorize, can);
userManager = initializeUsers(authorize);
showLogin();
try { session = await restoreSession(); await showDashboard(); }
catch (error) { if (error.status !== 401) showLogin(error.message); }
try { const health = await api('/health'); $('#development-accounts').hidden = !health.development; } catch {}
document.body.dataset.authReady = 'true';
