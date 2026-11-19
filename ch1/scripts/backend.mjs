import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const backend = fileURLToPath(new URL('../backend/', import.meta.url));
const python = process.env.MORI_PYTHON || resolve(backend, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
if (!existsSync(python)) {
  console.error('請先執行 uv sync --project backend，或設定 MORI_PYTHON 指向已安裝 Flask 的 Python。');
  process.exit(1);
}
const args = process.argv.includes('--test') ? ['-m', 'unittest', 'discover', '-s', 'tests', '-v'] : ['run.py'];
const child = spawn(python, args, { cwd: backend, stdio: 'inherit', windowsHide: true });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
