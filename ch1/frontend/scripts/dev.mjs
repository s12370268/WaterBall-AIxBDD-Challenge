import { createServer, request as proxyRequest } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
// 此伺服器只供前端本機開發，不是業務 API 後端。
const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 5173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.startsWith('/api/')) {
      const target = new URL(req.url, process.env.BACKEND_URL || 'http://127.0.0.1:5000');
      const upstream = proxyRequest(target, { method: req.method, headers: { ...req.headers, host: target.host }, timeout: 15000 }, response => {
        res.writeHead(response.statusCode, response.headers); response.pipe(res);
      });
      upstream.on('timeout', () => upstream.destroy());
      upstream.on('error', () => { if (!res.headersSent) { res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ error: '無法連線至 Python 後端，請先啟動後端服務。' })); } else res.end(); });
      req.pipe(upstream); return;
    }
    if (pathname === '/admin') { res.writeHead(302, { Location: '/admin/' }).end(); return; }
    const route = pathname === '/' ? '/index.html' : pathname === '/admin/' ? '/admin/index.html' : pathname;
    let file;
    if (/^\/assets\/[a-zA-Z0-9-]+\.(jpg|svg)$/.test(route)) file = resolve(root, 'public', '.' + route);
    else if (/^\/(index\.html|admin\/index\.html|src\/[a-zA-Z0-9/-]+\.(js|css))$/.test(route)) file = resolve(root, '.' + route);
    if (!file || !file.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(404).end('Not found'); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`MORI Bistro → http://localhost:${port}`));
