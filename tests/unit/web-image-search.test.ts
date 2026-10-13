import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getGoogleSearchConfig, setGoogleSearchConfig } from '@/lib/media/google-search-config';
import { searchGoogleImages } from '@/lib/media/google-search';

describe('google-search-config', () => {
  let values: Map<string, string>;

  beforeEach(() => {
    values = new Map();
    vi.stubGlobal('window', { dispatchEvent: vi.fn() });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when no key or cx is stored', () => {
    expect(getGoogleSearchConfig()).toBeNull();
  });

  it('stores and retrieves apiKey and cx correctly', () => {
    setGoogleSearchConfig({ apiKey: 'AIzaSyTestKey123', cx: '0123456789cx' });
    const config = getGoogleSearchConfig();
    expect(config).toEqual({ apiKey: 'AIzaSyTestKey123', cx: '0123456789cx' });
  });

  it('clears config when passed null', () => {
    setGoogleSearchConfig({ apiKey: 'AIzaSyTestKey123', cx: '0123456789cx' });
    expect(getGoogleSearchConfig()).not.toBeNull();
    setGoogleSearchConfig(null);
    expect(getGoogleSearchConfig()).toBeNull();
  });

  it('falls back to environment variables when localStorage is empty', () => {
    const originalKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_KEY;
    const originalCx = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX;
    process.env.NEXT_PUBLIC_GOOGLE_SEARCH_KEY = 'EnvKey999';
    process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX = 'EnvCx999';

    expect(getGoogleSearchConfig()).toEqual({ apiKey: 'EnvKey999', cx: 'EnvCx999' });

    process.env.NEXT_PUBLIC_GOOGLE_SEARCH_KEY = originalKey;
    process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX = originalCx;
  });
});

describe('searchGoogleImages', () => {
  it('returns empty array and never fetches when config is null', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const results = await searchGoogleImages('apple', null);
    expect(results).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('returns empty array when apiKey or cx is blank', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const results = await searchGoogleImages('apple', { apiKey: '   ', cx: '' });
    expect(results).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('formats Google custom search response items when valid', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            title: 'Apple Vector Art',
            link: 'https://images.example/apple.jpg',
            image: {
              thumbnailLink: 'https://images.example/thumb.jpg',
              contextLink: 'https://example.com/apple',
            },
            displayLink: 'example.com',
          },
        ],
      }),
    } as Response);

    const results = await searchGoogleImages('apple', { apiKey: 'valid-key', cx: 'valid-cx' });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      title: 'Apple Vector Art',
      imageUrl: 'https://images.example/apple.jpg',
      thumbnailUrl: 'https://images.example/thumb.jpg',
      source: 'google',
    });
    fetchSpy.mockRestore();
  });
});
