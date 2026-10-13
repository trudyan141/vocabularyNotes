import { describe, it, expect, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/server/cloud/auth', () => ({
  sameOrigin: (req: Request) => req.headers.get('origin') === 'http://localhost:3000',
  failure: (status: number, error: string) => Response.json({ error }, { status }),
  privateHeaders: { 'Cache-Control': 'private, no-store' },
}));
vi.mock('@/server/media/receipt', () => ({
  signMedia: () => 'fixture-receipt-token',
}));

import { POST as importUrlHandler } from '@/app/api/media/import-url/route';
import { POST as webSearchHandler } from '@/app/api/media/web-search/route';

describe('/api/media/import-url route', () => {
  it('rejects cross-origin requests with 403', async () => {
    const request = new Request('http://localhost:3000/api/media/import-url', {
      method: 'POST',
      headers: { origin: 'http://malicious.com' },
      body: JSON.stringify({ url: 'https://example.com/test.jpg' }),
    });
    const response = await importUrlHandler(request);
    expect(response.status).toBe(403);
  });

  it('rejects unsafe SSRF URLs (localhost, private IPs) with 400', async () => {
    const unsafeUrls = [
      'http://example.com/test.jpg', // not https
      'https://localhost/test.jpg',
      'https://127.0.0.1/test.jpg',
      'https://192.168.1.1/test.jpg',
      'https://10.0.0.1/test.jpg',
    ];
    for (const url of unsafeUrls) {
      const request = new Request('http://localhost:3000/api/media/import-url', {
        method: 'POST',
        headers: { origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const response = await importUrlHandler(request);
      expect(response.status).toBe(400);
    }
  });

  it('falls back to fallbackUrl when primary url fails', async () => {
    const sharp = (await import('sharp')).default;
    const dummyJpeg = await sharp({
      create: { width: 32, height: 32, channels: 3, background: { r: 100, g: 150, b: 200 } },
    }).jpeg().toBuffer();

    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url === 'https://dead-server.example/image.png') {
        throw new Error('Connection timeout');
      }
      return new Response(dummyJpeg, { status: 200, headers: { 'Content-Type': 'image/jpeg' } });
    });

    const request = new Request('http://localhost:3000/api/media/import-url', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://dead-server.example/image.png',
        fallbackUrl: 'https://cdn.example/thumb.jpg',
        title: 'Fallback Test',
      }),
    });

    const response = await importUrlHandler(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.candidate.id).toMatch(/^upload:/);
    expect(data.base64).toBeTruthy();
    fetchSpy.mockRestore();
  });

  it('successfully normalizes safe SVG vector images', async () => {
    const validSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>');
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(validSvg, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })
    );

    const request = new Request('http://localhost:3000/api/media/import-url', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://upload.wikimedia.org/test.svg',
        fallbackUrl: 'https://thumb.wikimedia.org/test.png',
        title: 'Blue Circle SVG',
      }),
    });

    const response = await importUrlHandler(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.candidate.id).toMatch(/^upload:/);
    expect(data.base64).toBeTruthy();
    fetchSpy.mockRestore();
  });
});

describe('/api/media/web-search route', () => {
  it('rejects cross-origin requests with 403', async () => {
    const request = new Request('http://localhost:3000/api/media/web-search', {
      method: 'POST',
      headers: { origin: 'http://malicious.com' },
      body: JSON.stringify({ word: 'apple' }),
    });
    const response = await webSearchHandler(request);
    expect(response.status).toBe(403);
  });

  it('rejects empty word with 400', async () => {
    const request = new Request('http://localhost:3000/api/media/web-search', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: '' }),
    });
    const response = await webSearchHandler(request);
    expect(response.status).toBe(400);
  });
});
