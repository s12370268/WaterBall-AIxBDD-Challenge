// 純前端展示用的帳密與工作階段；不能作為正式身分驗證或權限防護。
export const DEMO_EMAIL = 'admin@mori.demo';
export const DEMO_PASSWORD = 'Mori2026!';
export const SESSION_KEY = 'mori-admin-demo-session';
export const SESSION_DURATION = 8 * 60 * 60 * 1000;

export function validateLogin(email, password) {
  const errors = {};
  if (!email.trim()) errors.email = '請輸入管理員帳號。';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = '請輸入有效的電子郵件格式。';
  if (!password) errors.password = '請輸入密碼。';
  return errors;
}

export function createDemoSession(email, password, now = Date.now()) {
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) return null;
  return { email: DEMO_EMAIL, mode: 'demo', expiresAt: now + SESSION_DURATION };
}

export function isValidDemoSession(session, now = Date.now()) {
  return session?.mode === 'demo' && session.email === DEMO_EMAIL && Number.isFinite(session.expiresAt) && session.expiresAt > now && session.expiresAt <= now + SESSION_DURATION;
}
