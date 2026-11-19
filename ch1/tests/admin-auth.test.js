import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLogin, createDemoSession, isValidDemoSession, SESSION_DURATION } from '../admin/auth.js';

test('登入必填與格式檢查，密碼保留原始字元', () => {
  assert.deepEqual(Object.keys(validateLogin(' ', '')), ['email', 'password']);
  assert.ok(validateLogin('admin', 'Mori2026!').email);
  assert.deepEqual(validateLogin('admin@mori.demo', 'Mori2026!'), {});
  assert.equal(createDemoSession('admin@mori.demo', ' Mori2026!'), null);
  assert.equal(createDemoSession('admin@mori.demo', 'wrong'), null);
});
test('示範登入工作階段不包含密碼，並正確處理到期與損壞資料', () => {
  const now = 1000;
  const session = createDemoSession(' ADMIN@MORI.DEMO ', 'Mori2026!', now);
  assert.deepEqual(session, { email: 'admin@mori.demo', mode: 'demo', expiresAt: now + SESSION_DURATION });
  assert.equal(isValidDemoSession(session, now), true);
  assert.equal(isValidDemoSession(session, session.expiresAt), false);
  for (const invalid of [null, {}, 'bad', { ...session, expiresAt: '1234' }, { ...session, expiresAt: Infinity }, { ...session, expiresAt: now + SESSION_DURATION + 1 }, { ...session, email: 'other@mori.demo' }]) assert.equal(isValidDemoSession(invalid, now), false);
});
