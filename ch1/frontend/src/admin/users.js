import { api } from '../api.js';
import { escapeHtml as esc } from '../catalog.js';

export function initializeUsers(authorize) {
  const $ = selector => document.querySelector(selector);
  $('#users-content').innerHTML = `<div class="products-heading"><div><span class="eyebrow">PEOPLE BEHIND MORI</span><h1 id="users-heading">一起照顧森暮的每一天。</h1><p>管理夥伴帳號與操作權限。</p></div><button id="add-user" class="product-primary">新增帳號</button></div><div class="catalog-local-note">員工：新增、編輯商品。管理員：另可刪除商品、管理帳號。停用帳號或變更角色／密碼後，該帳號須重新登入。</div><p id="users-error" class="form-error" role="alert" hidden></p><div id="user-list" class="user-list"></div><p id="users-feedback" role="status"></p>`;
  document.body.insertAdjacentHTML('beforeend', `<dialog id="user-dialog" class="delete-dialog" aria-labelledby="user-dialog-title"><form id="user-form"><span class="eyebrow">YOUR TEAM, YOUR MORI</span><h2 id="user-dialog-title">新增帳號</h2><div class="product-fields user-fields"><label for="user-name">姓名</label><input id="user-name" required maxlength="60" autocomplete="off"><label for="user-email">電子郵件</label><input id="user-email" type="email" required maxlength="254" autocomplete="off"><label for="user-password">密碼 <small id="user-password-hint">8–128 字</small></label><input id="user-password" type="password" minlength="8" maxlength="128" autocomplete="new-password"><label for="user-role">角色</label><select id="user-role"><option value="staff">員工</option><option value="admin">管理員</option></select><label class="product-checkbox user-active"><input id="user-active" type="checkbox" checked>啟用帳號</label></div><p id="user-form-error" class="field-error" role="alert" hidden></p><div class="delete-actions"><button type="button" id="cancel-user" class="product-secondary">取消</button><button id="save-user" class="product-primary">儲存帳號</button></div></form></dialog>`);
  let users = [], editing = null;
  async function load() {
    if (!authorize('usersManage')) return;
    try {
      users = (await api('/users')).users; $('#users-error').hidden = true;
      $('#user-list').innerHTML = users.map(user => `<article class="user-row"><div><h3>${esc(user.name)}</h3><p>${esc(user.email)}</p></div><span class="role-badge">${user.role === 'admin' ? '管理員' : '員工'}</span><span class="user-state">${user.active ? '啟用中' : '已停用'}</span><button class="product-secondary" data-user-edit="${user.id}" aria-label="編輯${esc(user.name)}帳號">編輯</button></article>`).join('');
    } catch (error) { $('#users-error').textContent = error.message; $('#users-error').hidden = false; }
  }
  function open(user) {
    if (!authorize('usersManage')) return;
    editing = user; $('#user-form').reset();
    $('#user-dialog-title').textContent = user ? '編輯帳號' : '新增帳號';
    $('#user-name').value = user?.name || ''; $('#user-email').value = user?.email || ''; $('#user-email').disabled = !!user;
    $('#user-role').value = user?.role || 'staff'; $('#user-active').checked = user?.active ?? true; $('#user-active').disabled = !user;
    $('#user-password').required = !user; $('#user-password-hint').textContent = user ? '留白保留原密碼；新密碼 8–128 字' : '8–128 字';
    $('#user-form-error').hidden = true; $('#user-dialog').showModal();
  }
  $('#add-user').addEventListener('click', () => open(null));
  $('#user-list').addEventListener('click', event => { const button = event.target.closest('[data-user-edit]'); if (button) open(users.find(user => user.id === Number(button.dataset.userEdit))); });
  $('#cancel-user').addEventListener('click', () => $('#user-dialog').close());
  $('#user-form').addEventListener('submit', async event => {
    event.preventDefault(); if (!authorize('usersManage')) return;
    $('#save-user').disabled = true;
    try {
      const body = { name: $('#user-name').value.trim(), email: $('#user-email').value.trim(), role: $('#user-role').value, active: $('#user-active').checked, password: $('#user-password').value };
      await api(editing ? `/users/${editing.id}` : '/users', { method: editing ? 'PATCH' : 'POST', body });
      $('#user-password').value = ''; $('#user-dialog').close(); $('#users-feedback').textContent = '帳號已儲存。'; await load();
    } catch (error) { $('#user-form-error').textContent = error.message; $('#user-form-error').hidden = false; }
    finally { $('#save-user').disabled = false; }
  });
  return { load, close: () => { $('#user-password').value = ''; $('#user-dialog').close(); } };
}
