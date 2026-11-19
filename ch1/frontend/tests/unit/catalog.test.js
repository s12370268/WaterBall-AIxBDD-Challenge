import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG_KEY, readCatalog, saveCatalog, validateProduct, syncCart, escapeHtml } from '../../src/catalog.js';
const makeStorage = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; };
test('商品新增修改、隱藏與刪除持久保存，刪光後不恢復示意商品', () => {
  const storage = makeStorage(), items = readCatalog(storage);
  assert.equal(items.length, 9);
  const item = { ...items[0], id: 'new-product', name: '新料理', visible: false, price: 0 };
  saveCatalog([...items, item], storage);
  assert.equal(readCatalog(storage).at(-1).visible, false);
  assert.equal(readCatalog(storage).at(-1).price, 0);
  saveCatalog([], storage);
  assert.deepEqual(readCatalog(storage), []);
});
test('拒絕無效價格、不安全圖片與毀損資料，不覆寫有效資料', () => {
  const storage = makeStorage(), items = readCatalog(storage), item = items[0];
  for (const price of ['', -1, .5, NaN, Infinity, 1000000]) assert.ok(validateProduct({ ...item, price }).price);
  assert.ok(validateProduct({ ...item, image: 'javascript:alert(1)' }).image);
  assert.ok(validateProduct({ ...item, name: ' ' }).name);
  assert.ok(validateProduct({ ...item, description: '' }).description);
  saveCatalog(items, storage);
  const previous = storage.getItem(CATALOG_KEY);
  assert.throws(() => saveCatalog([{ ...item, price: -2 }], storage));
  assert.equal(storage.getItem(CATALOG_KEY), previous);
  assert.throws(() => readCatalog({ getItem: () => 'broken' }));
  assert.throws(() => saveCatalog(items, { setItem: () => { throw new Error('Quota'); } }), /儲存失敗/);
});
test('商品改價更新點單，隱藏刪除商品移出，文字輸出轉義', () => {
  const items = readCatalog(makeStorage());
  const cart = items.slice(0, 3).map(item => ({ id: item.id, price: item.price, quantity: 2 }));
  const updated = [{ ...items[0], price: 100 }, { ...items[1], visible: false }];
  assert.deepEqual(syncCart(cart, updated).map(item => [item.id, item.price, item.quantity]), [[items[0].id, 100, 2]]);
  assert.equal(escapeHtml('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
});
