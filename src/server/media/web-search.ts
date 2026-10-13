import 'server-only';
import type { WebImageItem } from '@/lib/media/google-search';

const cache = new Map<string, { expires: number; items: WebImageItem[] }>();

async function searchCommons(query: string, fetcher: typeof fetch = fetch): Promise<WebImageItem[]> {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrnamespace: '6',
    gsrlimit: '6',
    gsrsearch: `${query} illustration`,
    prop: 'imageinfo',
    iiprop: 'url|mime|thumbmime|sha1|extmetadata',
    iiurlwidth: '320',
  }).toString();

  try {
    const response = await fetcher(url.href, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WordsForKids/0.1 (educational-illustrations)' },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const pages = Object.values(data.query?.pages ?? {}) as Array<Record<string, unknown>>;

    return pages
      .flatMap((page) => {
        const info = (page.imageinfo as Array<Record<string, unknown>> | undefined)?.[0];
        if (!info || typeof info.thumburl !== 'string' || typeof info.url !== 'string') return [];
        const metadata = (info.extmetadata as Record<string, { value: string }> | undefined) ?? {};
        const title = typeof page.title === 'string' ? page.title.replace(/^File:/i, '').replace(/\.[a-z0-9]+$/i, '') : query;
        const creator = metadata.Artist?.value || metadata.Credit?.value || 'Wikimedia Commons';
        const cleanedCreator = creator.replace(/<[^>]*>/g, '').trim().slice(0, 80) || 'Wikimedia Commons';

        return [{
          id: `commons:${String(page.pageid)}`,
          title: title.slice(0, 100),
          thumbnailUrl: info.thumburl,
          imageUrl: info.url,
          sourceUrl: typeof info.descriptionurl === 'string' ? info.descriptionurl : info.url,
          source: 'commons' as const,
          creator: cleanedCreator,
        }];
      });
  } catch {
    return [];
  }
}

async function searchDuckDuckGo(query: string, fetcher: typeof fetch = fetch): Promise<WebImageItem[]> {
  try {
    const initUrl = `https://duckduckgo.com/?q=${encodeURIComponent(`${query} illustration clipart`)}&iax=images&ia=images`;
    const initRes = await fetcher(initUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!initRes.ok) return [];
    const html = await initRes.text();
    const vqdMatch = html.match(/vqd=["']?([0-9-]+)/) || html.match(/vqd=([0-9-]+)/);
    if (!vqdMatch) return [];

    const vqd = vqdMatch[1];
    const searchUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(
      `${query} illustration clipart`
    )}&vqd=${vqd}&f=,,,type:clipart,,&p=1&s=0`;

    const searchRes = await fetcher(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://duckduckgo.com/',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!searchRes.ok) return [];
    const data = await searchRes.json();
    const results = Array.isArray(data.results) ? data.results : [];

    return results.slice(0, 12).map((item: { title?: string; image?: string; thumbnail?: string; url?: string }, idx: number) => {
      let host = 'Web';
      try {
        if (item.url) host = new URL(item.url).hostname.replace(/^www\./, '');
      } catch {
        // ignore
      }
      return {
        id: `web:${idx}:${(item.image || '').slice(-20)}`,
        title: (item.title || query).slice(0, 100),
        thumbnailUrl: item.thumbnail || item.image || '',
        imageUrl: item.image || item.thumbnail || '',
        sourceUrl: item.url || item.image || '',
        source: 'web' as const,
        creator: host,
      };
    }).filter((item: WebImageItem) => item.imageUrl && item.thumbnailUrl);
  } catch {
    return [];
  }
}

export async function searchFreeWebPictures(
  word: string,
  fetcher: typeof fetch = fetch
): Promise<WebImageItem[]> {
  const normalized = word.trim().toLowerCase();
  const cacheKey = `web:${normalized}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.items;
  }

  // Tầng 1: Wikimedia Commons
  // Tầng 2: Web Image Search (DuckDuckGo SafeSearch)
  const [commonsResults, webResults] = await Promise.all([
    searchCommons(normalized, fetcher),
    searchDuckDuckGo(normalized, fetcher),
  ]);

  // Kết hợp kết quả: Ưu tiên Commons giáo dục trước, sau đó là Web đa dạng
  const seenUrls = new Set<string>();
  const combined: WebImageItem[] = [];

  for (const item of [...commonsResults, ...webResults]) {
    if (!item.imageUrl || seenUrls.has(item.imageUrl)) continue;
    seenUrls.add(item.imageUrl);
    combined.push(item);
  }

  // Lưu cache 5 phút
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(cacheKey, { expires: Date.now() + 300000, items: combined.slice(0, 16) });

  return combined.slice(0, 16);
}
