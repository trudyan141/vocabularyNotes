import { expect, test } from '@playwright/test';

test('owned cloud fixture serves loopback identity and enforces anonymous boundary', async ({ request }) => {
  const fixture = await request.get('http://127.0.0.1:4329/fixture/health');
  expect(await fixture.json()).toEqual({ fixture: true });
  const response = await request.get('/api/cloud/sync?library=92000000-0000-4000-8000-000000000009&cursor=0');
  expect(response.status()).toBe(401);
});
