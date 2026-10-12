import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';
import { fingerprint, assertSource, copySnapshot, parseOptions, fixtureEnvironment, requireFreePort } from '../lib/ui-runner.mjs';
import { workflowConfig } from '../../playwright.shared.ts';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'wfk-workflow-unit-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'src'));
  await mkdir(join(root, 'node_modules'));
  await writeFile(join(root, 'src', 'input.ts'), 'export const example = 1;');
  return root;
}

test('source identity notices dirty edits/additions and rejects stale verification', async t => {
  const root = await fixture(t);
  const before = await fingerprint(root);
  await writeFile(join(root, 'src', 'input.ts'), 'export const example = 2;');
  await assert.rejects(assertSource(root, before), /Source changed/);
  const edited = await fingerprint(root);
  await writeFile(join(root, 'src', 'new.ts'), 'export const added = true;');
  assert.notEqual(await fingerprint(root), edited);
});

test('snapshot excludes env files/artifacts and does not consume credentials', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'src', 'env.ts'), 'export const fixtureConfig = true;');
  const before = await fingerprint(root);
  await writeFile(join(root, '.env.local'), 'secret=fixture-sentinel');
  await writeFile(join(root, 'src', 'private.env'), 'secret=fixture-sentinel');
  await mkdir(join(root, '.next'));
  await writeFile(join(root, '.next', 'generated'), 'build-artifact');
  assert.equal(await fingerprint(root), before);
  const snapshot = join(root, 'isolated');
  await mkdir(snapshot);
  assert.equal(await copySnapshot(root, snapshot), before);
  assert.equal(await readFile(join(snapshot, 'src', 'input.ts'), 'utf8'), 'export const example = 1;');
  assert.equal(await readFile(join(snapshot, 'src', 'env.ts'), 'utf8'), 'export const fixtureConfig = true;');
  await assert.rejects(readFile(join(snapshot, '.env.local')), { code: 'ENOENT' });
  await assert.rejects(readFile(join(snapshot, 'src', 'private.env')), { code: 'ENOENT' });
});

test('source symlinks are rejected instead of copying an external private file', async t => {
  const root = await fixture(t);
  await writeFile(join(root, '.env.local'), 'fixture-sentinel');
  await symlink(join(root, '.env.local'), join(root, 'src', 'external.ts'));
  await assert.rejects(fingerprint(root), /Source symlink/);
});

test('fixture environment retains runtime essentials and replaces host AI/cloud keys', () => {
  const env = fixtureEnvironment({ PATH: '/fixture/bin', HOME: '/fixture/home', OPENAI_API_KEY: 'private-sentinel', SUPABASE_SECRET_KEY: 'private-sentinel', NEXT_PUBLIC_SUPABASE_URL: 'https://private.test', NODE_OPTIONS: '--inspect', WFK_LIVE_MEDIA: '1' }, parseOptions([]));
  assert.equal(env.PATH, '/fixture/bin');
  assert.equal(env.OPENAI_API_KEY, 'server-boundary-canary');
  assert.equal(env.SUPABASE_SECRET_KEY, undefined);
  assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, undefined);
  assert.equal(env.NODE_OPTIONS, undefined);
  assert.equal(env.WFK_LIVE_MEDIA, '0');
});

test('scope parser prevents arbitrary flags/paths, invalid port and incompatible cross-context port', () => {
  for (const args of [['--scope', 'typo'], ['--port', 'NaN'], ['--port', '1'], ['--headed'], ['../private.spec.ts'], ['--grep'], ['--port', '4338', 'learning.spec.ts'], ['--scope', 'cloud', 'scaffold.spec.ts'], ['demo-disabled.spec.ts'], ['--scope', 'release', 'scaffold.spec.ts']]) assert.throws(() => parseOptions(args));
  const options = parseOptions(['--', '--port', '4338', 'workflow-smoke.spec.ts', '--grep', 'owned preview']);
  assert.equal(options.port, 4338);
  assert.deepEqual(options.files, ['workflow-smoke.spec.ts']);
  assert.equal(parseOptions(['--scope', 'cloud']).mode, 'production');
});

test('occupied loopback port is rejected without stopping its owner', async t => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const port = server.address().port;
  await assert.rejects(requireFreePort(port), /occupied/);
  assert.equal(server.listening, true);
});

test('shared UI config retains baseURL inheritance for WebKit presets and keeps cloud fixture separate', () => {
  const config = workflowConfig('ui');
  assert.equal(config.use.baseURL, 'http://127.0.0.1:4320');
  assert.equal(config.projects.length, 2);
  assert.ok(config.projects.every(project => project.testIgnore.includes('workflow-cloud.spec.ts')));
  const cloud = workflowConfig('cloud');
  assert.equal(cloud.projects.length, 1);
  assert.equal(cloud.projects[0].use.baseURL, 'http://127.0.0.1:4328');
  assert.equal(cloud.webServer.length, 1);
});
