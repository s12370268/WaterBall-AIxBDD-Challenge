import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
if (relative(root, output) !== 'dist') throw new Error('不安全的建置輸出路徑');
await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, 'admin'), { recursive: true });
await copyFile(resolve(root, 'index.html'), resolve(output, 'index.html'));
await copyFile(resolve(root, 'admin/index.html'), resolve(output, 'admin/index.html'));
await cp(resolve(root, 'src'), resolve(output, 'src'), { recursive: true });
await cp(resolve(root, 'public'), output, { recursive: true });
console.log('靜態網站已建置至 frontend/dist/');
