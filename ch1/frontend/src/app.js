import { categories, totals, money, makeLine } from './menu.js';
import { fetchMenu as readCatalog, syncCart, imageSource, CATALOG_SIGNAL_KEY as CATALOG_KEY } from './catalog.js';
let menu, catalogError = '', catalogReady = false;
try { menu = await readCatalog(); catalogReady = true; } catch { menu = []; catalogError = '商品資料無法讀取，請確認 Python 後端已啟動。'; }
const $ = s => document.querySelector(s);
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let cart = [], table = '08', category = 'all', selected, quantity = 1, toastTimer;
function restoreCart(lines) {
  return lines.flatMap(line => {
    const item = menu.find(item => item.id === line.id);
    if (!item || !item.visible || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) return [];
    const option = item.options?.includes(line.option) ? line.option : (item.options?.[0] || '');
    return [makeLine(item, line.quantity, option, String(line.note || '').slice(0, 100))];
  });
}
try {
  const saved = JSON.parse(localStorage.getItem('mori-order') || '{}');
  if (/^(0[1-9]|1\d|20)$/.test(saved.table)) table = saved.table;
  if (Array.isArray(saved.cart)) cart = restoreCart(saved.cart);
  $('#order-note').value = typeof saved.note === 'string' ? saved.note.slice(0, 200) : '';
} catch { /* 儲存空間停用時仍可點餐。 */ }
function persist() { if (!catalogReady) return; try { localStorage.setItem('mori-order', JSON.stringify({ cart, table, note: $('#order-note').value })); } catch {} }
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2400); }
function renderMenu() {
  const query = $('#search').value.trim().toLowerCase();
  const dishes = menu.filter(item => item.visible && (category === 'all' || item.category === category) && (!$('#vegetarian').checked || item.vegetarian) && `${item.name} ${item.en} ${item.description}`.toLowerCase().includes(query));
  const active = categories.find(c => c[0] === category);
  $('#category-title').innerHTML = `${active[1]} <span>${active[2]}</span>`;
  $('#result-count').textContent = `${dishes.length} 道美好滋味`;
  $('#menu-grid').innerHTML = dishes.length ? dishes.map(item => `<article class="dish-card"><button class="card-image-button" data-dish="${item.id}" aria-label="查看${escape(item.name)}"><img src="${escape(imageSource(item))}" alt="${escape(item.name)}" loading="lazy">${item.tag ? `<span class="card-tag ${item.tag === '人氣必點' ? 'popular' : ''}">${escape(item.tag)}</span>` : ''}</button><div class="card-content"><h4>${escape(item.name)}</h4><span class="card-en">${escape(item.en)}</span><p class="card-description">${escape(item.description)}</p><div class="card-bottom"><span class="card-price"><small>NT$</small> ${money(item.price)}</span><button class="add-button" data-dish="${item.id}" aria-label="加入${escape(item.name)}">＋</button></div></div></article>`).join('') : '<div class="no-results"><h3>這個味道，還沒找到。</h3><p>換個關鍵字，或看看其他分類吧。</p><button id="reset-filters">查看所有餐點</button></div>';
  document.querySelectorAll('[data-category]').forEach(b => { b.classList.toggle('active', b.dataset.category === category); b.setAttribute('aria-pressed', String(b.dataset.category === category)); });
}
function renderCart() {
  const sum = totals(cart);
  $('#table-label').textContent = table; $('#cart-table').textContent = `TABLE ${table}`;
  for (const id of ['cart-count', 'mobile-count']) $(`#${id}`).textContent = sum.count;
  for (const id of ['subtotal', 'service', 'total']) $(`#${id}`).textContent = `NT$ ${money(sum[id])}`;
  $('#mobile-total').textContent = `NT$ ${money(sum.total)}`;
  $('#submit-order').disabled = !cart.length;
  $('#cart-items').innerHTML = cart.length ? cart.map((item, index) => `<div class="cart-item"><img src="${escape(imageSource(item))}" alt=""><div class="cart-item-info"><h4>${escape(item.name)}</h4>${item.option || item.note ? `<p>${escape([item.option, item.note].filter(Boolean).join('・'))}</p>` : ''}<div class="cart-item-bottom"><span>NT$ ${money(item.price * item.quantity)}</span><div class="quantity"><button data-change="-1" data-index="${index}" aria-label="減少${escape(item.name)}">−</button><output>${item.quantity}</output><button data-change="1" data-index="${index}" aria-label="增加${escape(item.name)}" ${item.quantity >= 99 ? 'disabled' : ''}>＋</button></div></div></div><button class="remove-item" data-remove="${index}" aria-label="移除${escape(item.name)}">×</button></div>`).join('') : `<div class="empty-cart"><svg viewBox="0 0 64 64" fill="none" stroke-width="1"><path d="M12 25h40l-5 27H17zM22 26l6-16m14 16-6-16M24 33v12m8-12v12m8-12v12"/><path d="M9 25h46"/><path d="m48 8 1-4m4 8 4-2M14 14l-3-3"/></svg><h3>你的美味故事，從這裡開始</h3><p>選幾道喜歡的料理，<br>為今晚增添一點美好。</p></div>`;
  persist();
}
async function openDish(id) {
  if (!await refreshCatalog()) return;
  selected = menu.find(item => item.id === id); quantity = 1;
  $('#dish-image').src = imageSource(selected); $('#dish-image').alt = selected.name;
  $('#dish-name').textContent = selected.name; $('#dish-en').textContent = selected.en;
  $('#dish-description').textContent = selected.description; $('#dish-allergens').textContent = `過敏原資訊：${selected.allergens}${selected.vegetarian ? '・奶蛋素' : ''}`;
  $('#dish-note').value = ''; $('#dish-options').hidden = !selected.options;
  $('#option-list').innerHTML = (selected.options || []).map((option, index) => `<label><input type="radio" name="option" value="${escape(option)}" ${index === 0 ? 'checked' : ''}> ${escape(option)}</label>`).join('');
  updateQuantity(); $('#dish-dialog').showModal();
}
function updateQuantity() { $('#dish-quantity').textContent = quantity; $('#dish-price').textContent = `NT$ ${money(selected.price * quantity)}`; $('#dish-minus').disabled = quantity === 1; $('#dish-plus').disabled = quantity === 99; }
$('#categories').innerHTML = categories.map(c => `<button data-category="${c[0]}" aria-pressed="${c[0] === 'all'}" class="${c[0] === 'all' ? 'active' : ''}">${c[1]}</button>`).join('');
$('#categories').addEventListener('click', e => { const b = e.target.closest('[data-category]'); if (b) { category = b.dataset.category; renderMenu(); } });
$('#search').addEventListener('input', renderMenu); $('#vegetarian').addEventListener('change', renderMenu);
$('#menu-grid').addEventListener('click', e => {
  const b = e.target.closest('[data-dish]'); if (b) openDish(b.dataset.dish);
  if (e.target.closest('#reset-filters')) { category = 'all'; $('#search').value = ''; $('#vegetarian').checked = false; renderMenu(); }
});
$('#dish-minus').addEventListener('click', () => { quantity = Math.max(1, quantity - 1); updateQuantity(); });
$('#dish-plus').addEventListener('click', () => { quantity = Math.min(99, quantity + 1); updateQuantity(); });
$('#dish-form').addEventListener('submit', async e => {
  e.preventDefault(); if (!await refreshCatalog() || !selected?.visible) return;
  const line = makeLine(selected, quantity, $('#option-list input:checked')?.value || '', $('#dish-note').value);
  const existing = cart.find(item => item.key === line.key);
  if (existing && existing.quantity + quantity > 99) { toast('同一餐點最多可點 99 份'); return; }
  if (existing) existing.quantity += quantity; else cart.push(line);
  renderCart(); $('#dish-dialog').close(); toast(`已將 ${selected.name} 加入點單`);
});
$('#cart-items').addEventListener('click', e => {
  const change = e.target.closest('[data-change]'), remove = e.target.closest('[data-remove]');
  if (change) { const index = Number(change.dataset.index); cart[index].quantity += Number(change.dataset.change); if (cart[index].quantity <= 0) cart.splice(index, 1); renderCart(); }
  if (remove) { cart.splice(Number(remove.dataset.remove), 1); renderCart(); }
});
$('#order-note').addEventListener('input', persist);
$('#table-input').innerHTML = Array.from({ length: 20 }, (_, i) => { const n = String(i + 1).padStart(2, '0'); return `<option value="${n}">${n} 桌</option>`; }).join('');
$('#table-button').addEventListener('click', () => { $('#table-input').value = table; $('#table-dialog').showModal(); });
$('#table-form').addEventListener('submit', e => { e.preventDefault(); table = $('#table-input').value; renderCart(); $('#table-dialog').close(); toast(`已切換至 ${table} 桌`); });
$('#about-button').addEventListener('click', () => $('#about-dialog').showModal());
let cartReturnFocus;
function closeCart() { $('#order-panel').classList.remove('mobile-open'); $('#order-panel').removeAttribute('role'); $('#order-panel').removeAttribute('aria-modal'); $('#mobile-cart').setAttribute('aria-expanded', 'false'); cartReturnFocus?.focus(); }
$('#mobile-cart').setAttribute('aria-expanded', 'false');
$('#mobile-cart').addEventListener('click', () => { cartReturnFocus = document.activeElement; $('#order-panel').classList.add('mobile-open'); $('#order-panel').setAttribute('role', 'dialog'); $('#order-panel').setAttribute('aria-modal', 'true'); $('#mobile-cart').setAttribute('aria-expanded', 'true'); $('#close-cart').focus(); });
$('#close-cart').addEventListener('click', closeCart);
document.addEventListener('keydown', e => {
  if (!$('#order-panel').classList.contains('mobile-open') || document.querySelector('dialog[open]')) return;
  if (e.key === 'Escape') closeCart();
  if (e.key === 'Tab') { const focusable = [...$('#order-panel').querySelectorAll('button:not(:disabled), textarea')].filter(el => el.getClientRects().length); const first = focusable[0], last = focusable.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
});
matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) closeCart(); });
$('#submit-order').addEventListener('click', async () => {
  if (!await refreshCatalog()) return;
  if (!cart.length) return;
  $('#review-table').textContent = `${table} 桌・共 ${totals(cart).count} 份餐點`;
  $('#review-items').innerHTML = cart.map(item => `<div class="review-item"><div>${escape(item.name)} × ${item.quantity}<small>${escape([item.option, item.note].filter(Boolean).join('・'))}</small></div><span>NT$ ${money(item.price * item.quantity)}</span></div>`).join('');
  $('#review-note').textContent = $('#order-note').value ? `訂單備註：${$('#order-note').value}` : '';
  $('#review-total').textContent = `NT$ ${money(totals(cart).total)}`; $('#review-dialog').showModal();
});
$('#confirm-order').addEventListener('click', async () => {
  if (!await refreshCatalog()) return;
  if (!cart.length) return;
  const now = new Date(), id = `MORI-${now.getTime().toString(36).toUpperCase()}`;
  const receipt = { id, createdAt: now.toISOString(), table, items: cart, note: $('#order-note').value, ...totals(cart), status: 'demo' };
  try { localStorage.setItem('mori-last-order', JSON.stringify(receipt)); } catch {}
  $('#receipt-id').textContent = id; $('#receipt-details').textContent = `${table} 桌・${receipt.count} 份・NT$ ${money(receipt.total)}`;
  cart = []; $('#order-note').value = ''; renderCart(); $('#review-dialog').close(); closeCart(); $('#success-dialog').showModal();
});
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', e => { const rect = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) dialog.close(); }));
async function refreshCatalog() {
  let next;
  try { next = await readCatalog(); } catch { toast('商品資料無法讀取，請確認後端服務後再試。'); return false; }
  if (!catalogReady) {
    menu = next;
    try { const saved = JSON.parse(localStorage.getItem('mori-order') || '{}'); if (Array.isArray(saved.cart)) cart = restoreCart(saved.cart); } catch {}
    catalogReady = true; renderMenu(); renderCart(); toast('菜單連線已恢復，點單已重新確認。'); return false;
  }
  if (JSON.stringify(next) === JSON.stringify(menu)) return true;
  menu = next;
  const nextCart = syncCart(cart, menu);
  const cartChanged = JSON.stringify(nextCart) !== JSON.stringify(cart);
  cart = nextCart;
  for (const selector of ['#dish-dialog', '#review-dialog']) { if ($(selector).open) $(selector).close(); }
  renderMenu(); renderCart();
  toast(cartChanged ? '菜單已更新：停售商品已移除，點單金額已重新計算，請再次確認。' : '菜單已更新，請重新選擇餐點。');
  return false;
}
window.addEventListener('storage', event => { if (event.key === CATALOG_KEY || event.key === null) refreshCatalog(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshCatalog(); });
window.addEventListener('pageshow', refreshCatalog);
setInterval(() => { if (!document.hidden) refreshCatalog(); }, 4000);
renderMenu(); renderCart();
if (catalogError) toast(catalogError);
