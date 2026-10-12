import { devices, type PlaywrightTestConfig } from '@playwright/test';
import path from 'node:path';

type Scope = 'ui' | 'no-demo' | 'cloud' | 'release';
const cloudSpecs = ['cloud.spec.ts', 'workflow-cloud.spec.ts'];
const noDemoSpecs = ['demo-disabled.spec.ts'];

export function workflowConfig(scope: Scope): PlaywrightTestConfig {
  const files = JSON.parse(process.env.WFK_E2E_FILES ?? '[]') as string[];
  const selected = files.length ? files : undefined;
  const port = Number(process.env.WFK_E2E_PORT ?? (scope === 'no-demo' ? 4322 : 4320));
  const workspace = process.env.WFK_E2E_WORKSPACE ?? process.cwd();
  const output = process.env.WFK_E2E_OUTPUT ?? process.cwd();
  const dev = process.env.WFK_E2E_MODE === 'dev';
  const next = `node node_modules/next/dist/bin/next ${dev ? 'dev --webpack' : 'start'} --hostname 127.0.0.1 --port`;
  const app = (appPort: number, demo: boolean) => ({ command: `${next} ${appPort}`, cwd: workspace, url: `http://127.0.0.1:${appPort}/api/health`, reuseExistingServer: false,
    env: { APP_DEMO_MODE: String(demo), AI_PROVIDER: 'none', OPENAI_API_KEY: 'server-boundary-canary', MEDIA_IMPORT_SIGNING_SECRET: 'test-only-media-receipt-key-32-characters' }, timeout: dev ? 90_000 : 30_000 });
  const cloud = { command: 'node scripts/cloud-test-server.mjs --test', cwd: workspace, url: 'http://127.0.0.1:4328/api/health', reuseExistingServer: false, timeout: 60_000 };
  const ui = ['desktop-chromium', 'mobile-chromium'].map(name => ({ name, testMatch: selected ?? '*.spec.ts', testIgnore: [...cloudSpecs, ...noDemoSpecs],
    use: { ...(name === 'desktop-chromium' ? devices['Desktop Chrome'] : devices['Pixel 7']), viewport: name === 'desktop-chromium' ? { width: 1280, height: 1000 } : { width: 360, height: 800 }, baseURL: `http://127.0.0.1:${port}` } }));
  const projects = scope === 'ui' ? ui : scope === 'no-demo' ? [{ name: 'demo-disabled', testMatch: selected ?? noDemoSpecs, use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${port}` } }]
    : scope === 'cloud' ? [{ name: 'cloud-integration', testMatch: selected ?? cloudSpecs, use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4328' } }]
      : [...ui, { name: 'cloud-integration', testMatch: cloudSpecs, use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4328' } }, { name: 'demo-disabled', testMatch: noDemoSpecs, use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4322' } }];
  const needsNoDemo = scope === 'ui' && (!selected || selected.includes('learning.spec.ts'));
  return { testDir: './tests/e2e', fullyParallel: true, forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0, workers: 2,
    reporter: [['list'], ['html', { open: 'never', outputFolder: path.join(output, 'playwright-report') }]], outputDir: path.join(output, 'test-results'),
    use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure' }, projects,
    webServer: scope === 'cloud' ? [cloud] : scope === 'no-demo' ? [app(port, false)] : scope === 'release' ? [cloud, app(port, true), app(4322, false)] : [app(port, true), ...(needsNoDemo ? [app(4322, false)] : [])] };
}
