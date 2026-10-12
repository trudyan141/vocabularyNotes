import process from 'node:process';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtemp, readFile, mkdir, rm, open } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { parseOptions, fixtureEnvironment, fingerprint, copySnapshot, assertSource, requireFreePort, record } from './lib/ui-runner.mjs';

const root = resolve(import.meta.dirname, '..');
let child, lock, run, result;
let cancelled = false;
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  cancelled = true;
  if (child) { try { process.kill(-child.pid, signal); } catch { child.kill(signal); } }
});

async function command(binary, args, cwd, env, label) {
  if (cancelled) throw new Error('Run cancelled; no additional command was started.');
  const logPath = join(run, `${label}.log`);
  const handle = await open(logPath, 'w');
  const started = Date.now();
  let code;
  try {
    code = await new Promise((resolveCode, reject) => {
      child = spawn(binary, args, { cwd, env, stdio: ['ignore', handle.fd, handle.fd], detached: true });
      child.once('error', reject);
      child.once('close', resolveCode);
    });
  } finally { child = undefined; await handle.close(); }
  const output = await readFile(logPath, 'utf8');
  result.commands.push({ label, command: [binary, ...args], elapsedMs: Date.now() - started, exitCode: code, log: logPath });
  console.log(`${label}: ${code === 0 ? 'PASS' : 'FAIL'} (${((Date.now() - started) / 1000).toFixed(1)}s); log ${logPath}`);
  if (code !== 0 || cancelled) throw new Error(`${label} failed.\n${output.slice(-6000)}`);
  return output;
}

try {
  const options = parseOptions(process.argv.slice(2));
  const source = await fingerprint(root);
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const environment = fixtureEnvironment(process.env, options);
  run = await mkdtemp(join(tmpdir(), 'wfk-ui-result-'));
  result = { startedAt: new Date().toISOString(), sourceRoot: root, commit, fingerprint: source, scope: options.scope, mode: options.mode, specs: options.files,
    node: process.version, provider: options.live ? 'live-media-opt-in; AI fixture' : 'fixture', commands: [], tokens: 'unavailable' };
  environment.WFK_E2E_OUTPUT = run;
  const selection = ['exec', 'playwright', 'test', '--config', 'playwright.scoped.config.ts'];
  if (options.grep) selection.push('--grep', options.grep);
  if (options.project) selection.push('--project', options.project);
  const discovery = await command('pnpm', [...selection, '--list', '--reporter=list'], root, environment, 'discovery');
  const total = Number(discovery.match(/Total:\s+(\d+)\s+tests?/)?.[1] ?? 0);
  if (!total) throw new Error('Discovery selected zero tests; fix the scope/filter.');
  result.discoveredTests = total;
  console.log(`Selected ${total} tests; source ${commit.slice(0, 7)} / ${source.slice(0, 12)}`);
  if (!options.list) {
    const ports = options.scope === 'cloud' ? [4328, 4329] : options.scope === 'release' ? [options.port, 4322, 4328, 4329] : options.scope === 'no-demo' ? [options.port] : [options.port, ...(options.files.length === 0 || options.files.includes('learning.spec.ts') ? [4322] : [])];
    for (const port of new Set(ports)) await requireFreePort(port);
    const workspace = options.snapshot ? resolve(options.snapshot) : await mkdtemp(join(tmpdir(), 'wfk-ui-source-'));
    const manifestPath = join(workspace, '.wfk-snapshot.json');
    if (options.snapshot) {
      const saved = JSON.parse(await readFile(manifestPath, 'utf8'));
      if (saved.owner !== 'words-for-kids/test-ui' || saved.sourceRoot !== root || saved.fingerprint !== source || saved.live !== options.live || (options.mode === 'production' && !saved.built)) throw new Error('Snapshot is stale or belongs to another source/mode. Create a new snapshot.');
      await assertSource(workspace, saved.snapshotFingerprint);
    }
    lock = join(workspace, '.wfk-active');
    try { await mkdir(lock); } catch { lock = undefined; throw new Error('Snapshot is owned by another run. Do not reuse or stop it.'); }
    if (!options.snapshot) {
      await copySnapshot(root, workspace);
      if (options.mode === 'production') await command('pnpm', ['build', '--webpack'], workspace, environment, 'build');
      else await command('pnpm', ['run', 'predev'], workspace, environment, 'prepare');
      await assertSource(root, source);
      await record(manifestPath, { owner: 'words-for-kids/test-ui', sourceRoot: root, fingerprint: source, snapshotFingerprint: await fingerprint(workspace), built: options.mode === 'production', live: options.live });
    }
    result.snapshot = workspace;
    environment.WFK_E2E_WORKSPACE = workspace;
    await assertSource(root, source);
    const saved = JSON.parse(await readFile(manifestPath, 'utf8'));
    await assertSource(workspace, saved.snapshotFingerprint);
    console.log(`Owned snapshot: ${workspace}`);
    await command('pnpm', [...selection, '--reporter=line'], root, environment, 'browser');
    await assertSource(root, source);
    await assertSource(workspace, saved.snapshotFingerprint);
  }
  result.status = options.list ? 'discovered' : 'passed';
} catch (error) {
  if (result) result.status = 'failed';
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (lock) await rm(lock, { recursive: true, force: true });
  if (result) { result.finishedAt = new Date().toISOString(); await record(join(run, 'result.json'), result); console.log(`Evidence: ${join(run, 'result.json')}`); }
}
