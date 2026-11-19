import { menu, categories } from '../menu.js';
import { validateLogin, createDemoSession, isValidDemoSession, SESSION_KEY } from './auth.js';
import { initializeProducts } from './products.js';

const $ = selector => document.querySelector(selector);
let session = null, expiryTimer, productManager;
try { session = JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { /* 無法儲存時以記憶體維持目前登入。 */ }

function clearErrors() {
  for (const field of ['email', 'password']) {
    $(`#${field}`).removeAttribute('aria-invalid');
    $(`#${field}-error`).hidden = true;
    $(`#${field}-error`).textContent = '';
  }
  $('#login-error').hidden = true;
  $('#login-error').textContent = '';
}

function showLogin(message = '', focus = false) {
  productManager?.close();
  clearTimeout(expiryTimer);
  session = null;
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  $('#dashboard-view').hidden = true;
  $('#login-view').hidden = false;
  document.title = '管理員登入｜森暮 MORI Bistro';
  $('#password').value = '';
  $('#password').type = 'password';
  $('#toggle-password').setAttribute('aria-pressed', 'false');
  $('#toggle-password').setAttribute('aria-label', '顯示密碼');
  $('#caps-lock').hidden = true;
  clearErrors();
  if (message) { $('#login-error').textContent = message; $('#login-error').hidden = false; }
  if (focus) $('#email').focus();
}

function showDashboard(focus = false) {
  if (!isValidDemoSession(session)) { showLogin('登入狀態已到期，請重新登入。', focus); return; }
  $('#login-view').hidden = true;
  $('#dashboard-view').hidden = false;
  document.title = '管理首頁｜森暮 MORI Bistro';
  $('#dish-count').textContent = menu.length;
  $('#category-count').textContent = categories.filter(category => category[0] !== 'all').length;
  productManager.load();
  routeWorkspace();
  clearTimeout(expiryTimer);
  expiryTimer = setTimeout(() => showLogin('登入狀態已到期，請重新登入。', true), session.expiresAt - Date.now());
  if (focus) { $('#overview').focus(); window.scrollTo(0, 0); }
}

$('#login-form').addEventListener('submit', event => {
  event.preventDefault();
  clearErrors();
  const email = $('#email').value, password = $('#password').value;
  const errors = validateLogin(email, password);
  for (const [field, message] of Object.entries(errors)) {
    $(`#${field}`).setAttribute('aria-invalid', 'true');
    $(`#${field}-error`).textContent = message;
    $(`#${field}-error`).hidden = false;
  }
  if (Object.keys(errors).length) { $(`#${Object.keys(errors)[0]}`).focus(); return; }
  const nextSession = createDemoSession(email, password);
  if (!nextSession) {
    $('#login-error').textContent = '帳號或密碼不正確，請確認後再試一次。';
    $('#login-error').hidden = false;
    $('#password').setAttribute('aria-invalid', 'true');
    $('#password').focus();
    return;
  }
  session = nextSession;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch {}
  $('#password').value = '';
  showDashboard(true);
});

$('#toggle-password').addEventListener('click', () => {
  const visible = $('#password').type === 'password';
  $('#password').type = visible ? 'text' : 'password';
  $('#toggle-password').setAttribute('aria-label', visible ? '隱藏密碼' : '顯示密碼');
  $('#toggle-password').setAttribute('aria-pressed', String(visible));
});
for (const field of ['email', 'password']) {
  $(`#${field}`).addEventListener('input', () => {
    $(`#${field}`).removeAttribute('aria-invalid');
    $(`#${field}-error`).hidden = true;
    $('#login-error').hidden = true;
  });
}
for (const type of ['keydown', 'keyup']) {
  $('#password').addEventListener(type, event => { $('#caps-lock').hidden = !event.getModifierState('CapsLock'); });
}
$('#password').addEventListener('blur', () => { $('#caps-lock').hidden = true; });
$('#logout-button').addEventListener('click', () => showLogin('', true));
// 背景分頁或返回快取頁面時重新檢查，避免顯示過期的示範管理畫面。
function recheckSession() { if (session && !isValidDemoSession(session)) showLogin('登入狀態已到期，請重新登入。', true); }
document.addEventListener('visibilitychange', () => { if (!document.hidden) recheckSession(); });
window.addEventListener('pageshow', recheckSession);
function authorize() { if (isValidDemoSession(session)) return true; showLogin('登入狀態已到期，請重新登入。', true); return false; }
function routeWorkspace() {
  if ($('#dashboard-view').hidden) return;
  const products = location.hash === '#products';
  $('#overview-content').hidden = products; $('#products-content').hidden = !products;
  $('#workspace-page-name').textContent = products ? '商品管理' : '管理首頁';
  document.title = `${products ? '商品管理' : '管理首頁'}｜森暮 MORI Bistro`;
  document.querySelectorAll('[data-admin-nav]').forEach(link => { if ((link.dataset.adminNav === 'products') === products) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
}
window.addEventListener('hashchange', () => { if (!$('#dashboard-view').hidden && authorize()) routeWorkspace(); });
productManager = initializeProducts(authorize);
if (isValidDemoSession(session)) showDashboard(); else showLogin(session ? '登入狀態已到期，請重新登入。' : '');
