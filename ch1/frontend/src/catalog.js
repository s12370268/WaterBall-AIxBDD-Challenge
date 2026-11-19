import { menu, categories } from './menu.js';
import { api } from './api.js';
export const CATALOG_KEY = 'mori-catalog-v1';
export const CATALOG_SIGNAL_KEY = 'mori-catalog-revision';
let revision = 0;
export async function fetchProducts() { const data = await api('/products'); revision = data.revision; return data.items; }
export async function fetchMenu() { return (await api('/menu')).items; }
export async function saveProducts(items) {
  const data = await api('/products', { method: 'PUT', body: { items, revision } });
  revision = data.revision;
  try { localStorage.setItem(CATALOG_SIGNAL_KEY, String(revision)); } catch {}
  return data.items;
}
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const imageSource = (item, prefix = '') => item.image.startsWith('data:image/') ? item.image : `${prefix}assets/${item.image}.jpg`;
export function validateProduct(item) {
  const errors = {};
  if (typeof item.name !== 'string' || !item.name.trim() || item.name.length > 60) errors.name = '請輸入 1–60 字的商品名稱。';
  if (typeof item.description !== 'string' || !item.description.trim() || item.description.length > 500) errors.description = '請輸入 1–500 字的商品描述。';
  if (item.tag !== undefined && (typeof item.tag !== 'string' || item.tag.length > 20)) errors.tag = '餐點標籤最多 20 字，或留白不顯示。';
  if (item.price === '' || !Number.isSafeInteger(item.price) || item.price < 0 || item.price > 999999) errors.price = '請輸入 0–999,999 元的整數價格。';
  if (!categories.some(c => c[0] !== 'all' && c[0] === item.category)) errors.category = '請選擇商品分類。';
  if (typeof item.image !== 'string' || !(/^[a-zA-Z0-9-]+$/.test(item.image) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(item.image)) || item.image.length > 800000) errors.image = '請上傳有效的商品照片。';
  return errors;
}
export function readCatalog(storage = localStorage) {
  const raw = storage.getItem(CATALOG_KEY);
  if (raw === null) return menu.map(item => ({ ...item, visible: true }));
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error('商品資料無法讀取，請先保留目前瀏覽器資料並聯絡維護人員。'); }
  if (data?.version !== 1 || !Array.isArray(data.items) || data.items.some(item => !item || !/^[a-zA-Z0-9-]+$/.test(item.id) || Object.keys(validateProduct(item)).length || typeof item.visible !== 'boolean' || typeof item.en !== 'string' || typeof item.tag !== 'string' || typeof item.allergens !== 'string' || (item.options !== undefined && (!Array.isArray(item.options) || item.options.some(option => typeof option !== 'string')))) || new Set(data.items.map(item => item.id)).size !== data.items.length) throw new Error('商品資料無法讀取，請先保留目前瀏覽器資料並聯絡維護人員。');
  return data.items;
}
export function saveCatalog(items, storage = localStorage) {
  // 先驗證整批內容；儲存失敗時不改動上一份成功資料。
  const serialized = JSON.stringify({ version: 1, items });
  readCatalog({ getItem: () => serialized });
  try { storage.setItem(CATALOG_KEY, serialized); }
  catch { throw new Error('儲存失敗：瀏覽器儲存空間不足或被停用，請縮小照片或允許網站儲存資料後重試。'); }
}
export function syncCart(cart, products) {
  return cart.flatMap(line => {
    const item = products.find(product => product.id === line.id && product.visible);
    return item ? [{ ...line, name: item.name, price: item.price, image: item.image }] : [];
  });
}
