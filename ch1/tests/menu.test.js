import test from 'node:test';
import assert from 'node:assert/strict';
import { totals, makeLine, menu } from '../menu.js';
test('空訂單為零，服務費取整數', () => {
  assert.deepEqual(totals([]), { subtotal: 0, service: 0, total: 0, count: 0 });
  assert.deepEqual(totals([{ price: 320, quantity: 2 }, { price: 980, quantity: 1 }]), { subtotal: 1620, service: 162, total: 1782, count: 3 });
  assert.equal(totals([{ price: 155, quantity: 1 }]).service, 16);
});
test('同菜色不同熟度或備註應建立獨立明細', () => {
  const item = menu.find(i => i.id === 'steak');
  const medium = makeLine(item, 1, '五分熟', ' 醬汁另外放 ');
  assert.equal(medium.note, '醬汁另外放');
  assert.equal(medium.key, makeLine(item, 2, '五分熟', '醬汁另外放').key);
  assert.notEqual(medium.key, makeLine(item, 1, '七分熟', '醬汁另外放').key);
  assert.notEqual(medium.key, makeLine(item, 1, '五分熟', '').key);
});
