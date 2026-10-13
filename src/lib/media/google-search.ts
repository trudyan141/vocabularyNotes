import type { GoogleSearchConfig } from './google-search-config';

export interface WebImageItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  imageUrl: string;
  sourceUrl: string;
  source: 'commons' | 'web' | 'google';
  creator?: string;
}

/**
 * Searches Google Custom Search API for images.
 * IMPORTANT: If config is missing or invalid, returns empty array without making any network requests.
 */
export async function searchGoogleImages(
  word: string,
  config: GoogleSearchConfig | null,
  signal?: AbortSignal
): Promise<WebImageItem[]> {
  // CRITICAL RULE: Không có key thì tuyệt đối không search Google
  if (!config || !config.apiKey.trim() || !config.cx.trim()) {
    return [];
  }

  const query = `${word} illustration clipart cartoon`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(
    config.apiKey.trim()
  )}&cx=${encodeURIComponent(
    config.cx.trim()
  )}&q=${encodeURIComponent(query)}&searchType=image&safe=active&num=8`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];

    return items
      .filter((item: { link?: string }) => typeof item.link === 'string' && item.link.startsWith('http'))
      .map((item: { title?: string; link: string; image?: { thumbnailLink?: string; contextLink?: string }; displayLink?: string }, index: number) => ({
        id: `google:${index}:${item.link.slice(-20)}`,
        title: item.title ? item.title.slice(0, 100) : word,
        thumbnailUrl: item.image?.thumbnailLink || item.link,
        imageUrl: item.link,
        sourceUrl: item.image?.contextLink || item.link,
        source: 'google' as const,
        creator: item.displayLink || 'Google Search',
      }));
  } catch {
    return [];
  }
}
