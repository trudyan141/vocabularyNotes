import { expect, test } from '@playwright/test';

// Compile each route in order so another cold dev route cannot invalidate the observed page.
test.describe.configure({mode:'serial'});

test('owned preview serves the app and friendly 404 with safe navigation', async ({ page, request }) => {
  const health = await request.get('/api/health');
  expect(health.ok()).toBe(true);
  expect((await health.json()).data).toMatchObject({ app: 'words-for-kids', liveAi: false });
  await page.goto('/welcome');
  await expect(page.getByRole('link', { name: 'Bắt đầu', exact: true })).toBeVisible();
  const missing = await page.goto('/workflow-smoke-missing-page');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Về trang đầu', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('today remains open without unsolicited document reloads', async ({page}) => {
  let documents = 0;
  const errors: string[] = [];
  page.on('request', request => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++;
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/today');
  await expect(page.locator('main h1').first()).toBeVisible();
  await page.waitForLoadState('networkidle');
  const loadedDocuments = documents;
  // The reported dev HMR loop reloaded every ~0.3s. Observe idle time across many cycles.
  await page.waitForTimeout(8000);
  expect(documents).toBe(loadedDocuments);
  expect(errors).toEqual([]);
  await expect(page).toHaveURL(/\/today$/);
});
