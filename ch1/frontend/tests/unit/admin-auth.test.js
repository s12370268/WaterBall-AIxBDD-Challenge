import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLogin } from '../../src/admin/auth.js';

test('登入表單必填與電子郵件格式驗證', () => {
  assert.deepEqual(Object.keys(validateLogin(' ', '')), ['email', 'password']);
  assert.ok(validateLogin('invalid', 'password').email);
  assert.deepEqual(validateLogin('admin@mori.demo', 'Mori2026!'), {});
});
