import { api, setCsrfToken } from '../api.js';

export function validateLogin(email, password) {
  const errors = {};
  if (!email.trim()) errors.email = '請輸入後台帳號。';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = '請輸入有效的電子郵件格式。';
  if (!password) errors.password = '請輸入密碼。';
  return errors;
}

export async function login(email, password) {
  const session = await api('/auth/login', { method: 'POST', body: { email, password }, quiet: true });
  setCsrfToken(session.csrfToken); return session;
}
export async function restoreSession() {
  const session = await api('/auth/session', { quiet: true });
  setCsrfToken(session.csrfToken); return session;
}
export async function logout() { await api('/auth/logout', { method: 'POST', body: {}, quiet: true }); setCsrfToken(); }
