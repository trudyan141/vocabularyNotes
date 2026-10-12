import { expect, test } from '@playwright/test';

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
