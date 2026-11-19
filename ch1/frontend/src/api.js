let csrfToken = '';
export function setCsrfToken(token = '') { csrfToken = token; }
export async function api(path, { method = 'GET', body, quiet = false } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method, credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', 'X-Mori-Client': 'web', ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch { throw new Error('無法連線至後端，請確認服務已啟動後再試。'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !quiet) window.dispatchEvent(new Event('mori-auth-expired'));
    const error = new Error(data.error || '操作失敗，請稍後再試。'); error.status = response.status; throw error;
  }
  return data;
}
