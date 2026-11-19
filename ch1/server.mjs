import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('.');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/admin') { res.writeHead(302, { Location: '/admin/' }).end(); return; }
    const route = pathname === '/' ? '/index.html' : pathname === '/admin/' ? '/admin/index.html' : pathname;
    const file = resolve(root, '.' + route);
    const relative = file.slice(root.length + 1).replaceAll(sep, '/');
    if (!file.startsWith(root + sep) || !(/^(index\.html|styles\.css|app\.js|menu\.js|catalog\.js|admin\/(index\.html|admin\.css|admin\.js|auth\.js|products\.js|photos\.js|products\.css)|assets\/[^/]+\.(jpg|svg))$/.test(relative))) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404).end('Not found'); }
}).listen(5173, '127.0.0.1', () => console.log('MORI Bistro → http://localhost:5173'));
