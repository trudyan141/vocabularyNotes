import { createHash } from 'node:crypto';
import { readdir, lstat, readFile, mkdir, writeFile, copyFile, symlink, realpath } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { createServer } from 'node:net';

const roots = ['src', 'public', 'tests', 'scripts', 'supabase', 'docs/evaluations/t00'];
const rootFiles = ['package.json', 'pnpm-lock.yaml', '.nvmrc', 'next.config.ts', 'tsconfig.json', 'eslint.config.mjs', 'postcss.config.mjs', 'vitest.config.mts'];
const excluded = name => name.startsWith('.env') || name.endsWith('.env') || /\.env\.|\.pem$/.test(name) || ['node_modules', '.next', '__pycache__', '.temp', '.branches'].includes(name);

export async function inputFiles(root) {
  const files = [];
  async function visit(relative) {
    const absolute = join(root, relative);
    let stat;
    try { stat = await lstat(absolute); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    if (excluded(basename(relative))) return;
    if (stat.isSymbolicLink()) throw new Error(`Source symlink is unsupported: ${relative}`);
    if (stat.isDirectory()) {
      for (const child of (await readdir(absolute)).sort()) await visit(join(relative, child));
    } else if (stat.isFile()) files.push(relative);
  }
  for (const name of rootFiles) await visit(name);
  for (const name of (await readdir(root)).filter(name => /^playwright.*\.(ts|mts)$/.test(name))) await visit(name);
  for (const name of roots) await visit(name);
  return [...new Set(files)].sort();
}

export async function fingerprint(root) {
  const hash = createHash('sha256');
  for (const file of await inputFiles(root)) {
    const bytes = await readFile(join(root, file));
    hash.update(`${file}\0${bytes.length}\0`).update(bytes);
  }
  return hash.digest('hex');
}

export async function assertSource(root, expected) {
  if (await fingerprint(root) !== expected) throw new Error('Source changed: discard this run and select the current source; do not report a stale PASS.');
}

export async function copySnapshot(root, destination) {
  const before = await fingerprint(root);
  for (const file of await inputFiles(root)) {
    const target = join(destination, file);
    await mkdir(join(target, '..'), { recursive: true });
    await copyFile(join(root, file), target);
  }
  await assertSource(root, before);
  if (await fingerprint(destination) !== before) throw new Error('Snapshot differs from selected source.');
  await symlink(await realpath(join(root, 'node_modules')), join(destination, 'node_modules'), 'dir');
  return before;
}

export function parseOptions(args) {
  const options = { scope: 'ui', mode: 'dev', list: false, live: false, files: [] };
  const valued = new Set(['scope', 'mode', 'port', 'grep', 'project', 'snapshot']);
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--') continue;
    if (argument === '--list') options.list = true;
    else if (argument === '--live-media') options.live = true;
    else if (argument.startsWith('--')) {
      const name = argument.slice(2);
      if (!valued.has(name) || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Unknown or missing option: ${argument}`);
      options[name] = args[++index];
    } else {
      if (!/^[a-z0-9-]+\.spec\.ts$/.test(argument)) throw new Error('Select spec basenames, not paths or arbitrary Playwright flags.');
      options.files.push(argument);
    }
  }
  if (!['ui', 'no-demo', 'cloud', 'release'].includes(options.scope)) throw new Error('scope must be ui, no-demo, cloud or release');
  const cloud = ['cloud.spec.ts', 'workflow-cloud.spec.ts'];
  const noDemo = ['demo-disabled.spec.ts'];
  if (options.scope === 'release' && options.files.length) throw new Error('Release runs the full inventory; use ui, cloud or no-demo for selected specs.');
  if (options.files.some(file => options.scope === 'cloud' ? !cloud.includes(file) : options.scope === 'no-demo' ? !noDemo.includes(file) : [...cloud, ...noDemo].includes(file))) throw new Error('Selected spec belongs to another fixture scope.');
  if (!['dev', 'production'].includes(options.mode)) throw new Error('mode must be dev or production');
  if (['cloud', 'release'].includes(options.scope)) options.mode = 'production';
  options.port = Number(options.port ?? (options.scope === 'no-demo' ? 4322 : 4320));
  if (!Number.isInteger(options.port) || options.port < 1024 || options.port > 65535) throw new Error('port must be an integer from 1024 to 65535');
  if (options.port !== 4320 && options.scope !== 'no-demo' && (options.scope === 'release' || options.files.length === 0 || options.files.some(file => ['learning.spec.ts', 'cloud-refresh.spec.ts'].includes(file)))) throw new Error('These cross-context specs need port 4320; choose a narrow spec for a custom port.');
  return options;
}

export function fixtureEnvironment(source, options) {
  const allowed = ['PATH', 'HOME', 'USER', 'LOGNAME', 'TMPDIR', 'TMP', 'TEMP', 'SYSTEMROOT', 'WINDIR', 'LANG', 'LC_ALL', 'TERM', 'CI', 'TASK_PG_BIN'];
  const env = Object.fromEntries(allowed.filter(key => source[key] !== undefined).map(key => [key, source[key]]));
  return { ...env, NEXT_TELEMETRY_DISABLED: '1', AI_PROVIDER: 'none', APP_DEMO_MODE: 'true', OPENAI_API_KEY: 'server-boundary-canary',
    NEXT_PUBLIC_GEMINI_DEFAULT_KEY: 'AQ.test-default-parent-key-canary-123456', MEDIA_IMPORT_SIGNING_SECRET: 'test-only-media-receipt-key-32-characters',
    WFK_LIVE_MEDIA: options.live ? '1' : '0', WFK_E2E_SCOPE: options.scope, WFK_E2E_MODE: options.mode, WFK_E2E_PORT: String(options.port), WFK_E2E_FILES: JSON.stringify(options.files) };
}

export async function requireFreePort(port) {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', () => reject(new Error(`Port ${port} is occupied; choose another owned port or wait. No existing server was stopped.`)));
    server.listen(port, '127.0.0.1', resolve);
  });
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

export async function record(path, value) { await writeFile(path, `${JSON.stringify(value, null, 2)}\n`); }
