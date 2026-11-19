import { categories, money } from '../menu.js';
import { readCatalog, saveCatalog, validateProduct, imageSource, escapeHtml as esc, CATALOG_KEY } from '../catalog.js';
import { preparePhoto } from './photos.js';

export function initializeProducts(authorize) {
  const host = document.querySelector('#products-content');
  host.innerHTML = `<div class="products-heading"><div><span class="eyebrow">CRAFT YOUR MENU</span><h1 id="products-heading">每一道料理，都有你的心意。</h1><p>管理照片、內容與價格，為客人準備剛剛好的菜單。</p></div><button class="product-primary" id="add-product">新增商品</button></div><div class="catalog-local-note">商品與照片僅儲存於此瀏覽器；同一瀏覽器的前台菜單會同步更新。</div><div id="catalog-error" class="form-error" role="alert" hidden></div><div class="product-toolbar"><label class="product-search"><span>搜尋商品</span><input id="product-search" type="search" placeholder="輸入商品名稱或描述"></label><label><span>菜單狀態</span><select id="product-status"><option value="all">全部商品</option><option value="visible">菜單顯示</option><option value="hidden">菜單隱藏</option></select></label></div><div class="product-list-heading"><h2>商品清單 <span id="product-result-count"></span></h2></div><div id="product-list"></div><p id="product-feedback" role="status" aria-live="polite"></p>`;
  document.body.insertAdjacentHTML('beforeend', `<dialog id="product-dialog" class="product-dialog" aria-labelledby="product-dialog-title"><form id="product-form" novalidate><header class="product-dialog-heading"><div><span class="eyebrow">A LITTLE CARE IN EVERY DISH</span><h2 id="product-dialog-title">新增商品</h2></div><button type="button" class="product-close" data-product-close aria-label="關閉商品表單">×</button></header><div class="product-form-body"><div class="photo-section"><label for="product-photo">商品照片 <span class="required">必填</span></label><div class="photo-preview"><img id="product-photo-preview" alt="商品照片預覽" hidden><span id="photo-placeholder">為料理選一張好照片</span></div><input id="product-photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help photo-error"><p id="photo-help">支援 JPG、PNG、WebP，單張上限 5 MB；儲存前自動縮圖。</p><p id="photo-error" class="field-error" role="alert" hidden></p></div><div class="product-fields"><label for="product-name">商品名稱 <span class="required">必填</span></label><input id="product-name" maxlength="60" required placeholder="例如：香煎鮭魚佐檸檬奶油"><label for="product-en">英文名稱 <small>選填</small></label><input id="product-en" maxlength="100" placeholder="Pan-seared Salmon"><div class="product-field-row"><div><label for="product-category">分類</label><select id="product-category">${categories.filter(c => c[0] !== 'all').map(c => `<option value="${c[0]}">${c[1]}</option>`).join('')}</select></div><div><label for="product-price">價格（NT$） <span class="required">必填</span></label><input id="product-price" type="number" min="0" max="999999" step="1" required placeholder="320"></div></div><label for="product-description">商品描述 <span class="required">必填</span></label><textarea id="product-description" maxlength="500" rows="4" required placeholder="介紹食材、風味與料理特色…"></textarea><label for="product-allergens">過敏原資訊 <small>選填</small></label><input id="product-allergens" maxlength="100" placeholder="例如：奶製品、堅果"><label class="product-checkbox"><input id="product-vegetarian" type="checkbox">蔬食餐點</label><label class="visibility-setting"><span><strong>在前台菜單呈現</strong><small>關閉後，客人將無法瀏覽或點選此商品。</small></span><input id="product-visible" type="checkbox" role="switch" checked></label></div></div><div class="product-form-footer"><p id="product-form-error" class="field-error" role="alert" hidden></p><div><button type="button" class="product-secondary" data-product-close>取消</button><button class="product-primary" id="save-product" type="submit">儲存商品</button></div></div></form></dialog><dialog id="delete-dialog" class="delete-dialog" aria-labelledby="delete-title"><span class="eyebrow">ONE LAST CHECK</span><h2 id="delete-title">確定刪除這道商品？</h2><p id="delete-description"></p><p>刪除後無法復原，也會從前台菜單移除。若只是暫時停售，可以改用「隱藏」。</p><p id="delete-error" class="field-error" role="alert" hidden></p><div class="delete-actions"><button id="cancel-delete" class="product-secondary">保留商品</button><button id="confirm-delete" class="danger-button">確認刪除</button></div></dialog>`);
  const $ = selector => document.querySelector(selector);
  let items = [], editing = null, image = '', deleting = null, photoVersion = 0, original = '';
  function report(message, error = false) { const el = $(error ? '#catalog-error' : '#product-feedback'); el.textContent = message; el.hidden = false; }
  function load() {
    try { items = readCatalog(); $('#catalog-error').hidden = true; render(); }
    catch (error) { report(error.message, true); $('#product-list').textContent = '目前無法載入商品，請重新整理後再試。'; }
  }
  function render() {
    const search = $('#product-search').value.trim().toLowerCase(), status = $('#product-status').value;
    const filtered = items.filter(item => `${item.name} ${item.description}`.toLowerCase().includes(search) && (status === 'all' || item.visible === (status === 'visible')));
    $('#product-result-count').textContent = `${filtered.length} 件`;
    $('#dish-count').textContent = items.length; $('#visible-count').textContent = items.filter(item => item.visible).length;
    $('#product-list').innerHTML = filtered.length ? filtered.map(item => `<article class="product-row"><img src="${esc(imageSource(item, '../'))}" alt="${esc(item.name)}"><div class="product-info"><h3>${esc(item.name)}</h3><span>${esc(categories.find(c => c[0] === item.category)?.[1])}</span><p>${esc(item.description)}</p></div><strong class="product-row-price">NT$ ${money(item.price)}</strong><button class="visibility-toggle ${item.visible ? 'is-visible' : ''}" data-visibility="${item.id}" role="switch" aria-checked="${item.visible}" aria-label="${esc(item.name)}的菜單呈現"><span aria-hidden="true"></span>${item.visible ? '顯示' : '隱藏'}</button><div class="product-actions"><button data-edit="${item.id}" aria-label="編輯${esc(item.name)}">編輯</button><button data-delete="${item.id}" aria-label="刪除${esc(item.name)}">刪除</button></div></article>`).join('') : '<div class="products-empty"><h3>這裡還沒有符合的商品。</h3><p>試著調整搜尋條件，或新增一道料理。</p></div>';
  }
  function persist(next, message) { saveCatalog(next); items = next; render(); report(message); window.dispatchEvent(new Event('mori-catalog-changed')); }
  function freshProduct(id, expected) {
    const latest = readCatalog();
    if (id && JSON.stringify(latest.find(item => item.id === id)) !== expected) throw new Error('商品已在其他分頁變更，請關閉表單並重新開啟後再試。');
    return latest;
  }
  function closeEditor() { photoVersion++; $('#product-dialog').close(); }
  function openEditor(id) {
    if (!authorize()) return;
    try { items = readCatalog(); } catch (error) { report(error.message, true); return; }
    const item = items.find(item => item.id === id);
    if (id && !item) { load(); report('商品已被移除。'); return; }
    editing = item || null; original = JSON.stringify(item); image = item?.image || ''; photoVersion++;
    $('#product-form').reset(); $('#product-dialog-title').textContent = item ? '編輯商品' : '新增商品';
    for (const field of ['name', 'en', 'category', 'price', 'description', 'allergens']) $(`#product-${field}`).value = item?.[field] ?? (field === 'category' ? 'starter' : '');
    $('#product-visible').checked = item?.visible ?? true; $('#product-vegetarian').checked = !!item?.vegetarian;
    $('#product-form-error').hidden = true; $('#photo-error').hidden = true; $('#save-product').disabled = false;
    updatePreview(); $('#product-dialog').showModal();
  }
  function updatePreview() { $('#product-photo-preview').hidden = !image; $('#photo-placeholder').hidden = !!image; if (image) $('#product-photo-preview').src = imageSource({ image }, '../'); else $('#product-photo-preview').removeAttribute('src'); }
  $('#add-product').addEventListener('click', () => openEditor());
  $('#product-search').addEventListener('input', render); $('#product-status').addEventListener('change', render);
  $('#product-list').addEventListener('click', event => {
    const edit = event.target.closest('[data-edit]'), remove = event.target.closest('[data-delete]'), toggle = event.target.closest('[data-visibility]');
    if (!authorize()) return;
    if (edit) openEditor(edit.dataset.edit);
    if (toggle) { try { const current = items.find(item => item.id === toggle.dataset.visibility); const latest = freshProduct(current.id, JSON.stringify(current)); persist(latest.map(item => item.id === current.id ? { ...item, visible: !item.visible } : item), current.visible ? '已隱藏商品，前台菜單已更新。' : '商品已顯示於前台菜單。'); } catch (error) { report(error.message, true); } }
    if (remove) { const item = items.find(item => item.id === remove.dataset.delete); deleting = { id: item.id, original: JSON.stringify(item) }; $('#delete-description').textContent = item.name; $('#delete-error').hidden = true; $('#delete-dialog').showModal(); }
  });
  $('#product-photo').addEventListener('change', async () => {
    const file = $('#product-photo').files[0]; if (!file) return;
    const version = ++photoVersion; $('#save-product').disabled = true; $('#photo-error').hidden = true;
    try { const prepared = await preparePhoto(file); if (version !== photoVersion) return; image = prepared; updatePreview(); }
    catch (error) { if (version !== photoVersion) return; $('#photo-error').textContent = error.message; $('#photo-error').hidden = false; $('#product-photo').value = ''; }
    finally { if (version === photoVersion) $('#save-product').disabled = false; }
  });
  $('#product-form').addEventListener('submit', event => {
    event.preventDefault(); if ($('#save-product').disabled || !authorize()) return;
    const price = $('#product-price').value;
    const product = { ...editing, id: editing?.id || `product-${crypto.randomUUID()}`, name: $('#product-name').value.trim(), en: $('#product-en').value.trim(), category: $('#product-category').value, price: price === '' ? '' : Number(price), description: $('#product-description').value.trim(), allergens: $('#product-allergens').value.trim() || '未提供，請洽服務人員', vegetarian: $('#product-vegetarian').checked, image, tag: editing?.tag || '', visible: $('#product-visible').checked };
    const errors = validateProduct(product);
    if (Object.keys(errors).length) { $('#product-form-error').textContent = Object.values(errors).join(' '); $('#product-form-error').hidden = false; const field = Object.keys(errors)[0]; $(field === 'image' ? '#product-photo' : `#product-${field}`).focus(); return; }
    try { const latest = freshProduct(editing?.id, original); const next = editing ? latest.map(item => item.id === editing.id ? product : item) : [...latest, product]; persist(next, editing ? '商品已更新。' : '商品已新增。'); closeEditor(); }
    catch (error) { $('#product-form-error').textContent = error.message; $('#product-form-error').hidden = false; }
  });
  document.querySelectorAll('[data-product-close]').forEach(button => button.addEventListener('click', closeEditor));
  $('#product-dialog').addEventListener('cancel', () => { photoVersion++; });
  $('#cancel-delete').addEventListener('click', () => $('#delete-dialog').close());
  $('#confirm-delete').addEventListener('click', () => {
    if (!authorize() || !deleting) return;
    try { const latest = freshProduct(deleting.id, deleting.original); persist(latest.filter(item => item.id !== deleting.id), '商品已刪除。'); $('#delete-dialog').close(); }
    catch (error) { $('#delete-error').textContent = error.message; $('#delete-error').hidden = false; }
  });
  window.addEventListener('storage', event => { if (event.key === CATALOG_KEY || event.key === null) load(); });
  return { load, close: () => { closeEditor(); $('#delete-dialog').close(); } };
}
