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
const NUMBER_WORDS: Record<string, string> = {
  zero: '0', '0': '0',
  one: '1', '1': '1',
  two: '2', '2': '2',
  three: '3', '3': '3',
  four: '4', '4': '4',
  five: '5', '5': '5',
  six: '6', '6': '6',
  seven: '7', '7': '7',
  eight: '8', '8': '8',
  nine: '9', '9': '9',
  ten: '10', '10': '10',
  eleven: '11', '11': '11',
  twelve: '12', '12': '12',
  thirteen: '13', '13': '13',
  fourteen: '14', '14': '14',
  fifteen: '15', '15': '15',
  sixteen: '16', '16': '16',
  seventeen: '17', '17': '17',
  eighteen: '18', '18': '18',
  nineteen: '19', '19': '19',
  twenty: '20', '20': '20',
};

const CALENDAR_WORDS: Record<string, string> = {
  monday: 'Monday calendar',
  tuesday: 'Tuesday calendar',
  wednesday: 'Wednesday calendar',
  thursday: 'Thursday calendar',
  friday: 'Friday calendar',
  saturday: 'Saturday calendar',
  sunday: 'Sunday calendar',
  january: 'January calendar',
  february: 'February calendar',
  march: 'March calendar',
  april: 'April calendar',
  may: 'May calendar',
  june: 'June calendar',
  july: 'July calendar',
  august: 'August calendar',
  september: 'September calendar',
  october: 'October calendar',
  november: 'November calendar',
  december: 'December calendar',
};

export async function searchGoogleImages(
  word: string,
  config: GoogleSearchConfig | null,
  signal?: AbortSignal
): Promise<WebImageItem[]> {
  // CRITICAL RULE: Không có key thì tuyệt đối không search Google
  if (!config || !config.apiKey.trim() || !config.cx.trim()) {
    return [];
  }

  const normalized = word.trim().toLowerCase();
  const digit = NUMBER_WORDS[normalized];
  const calendarTerm = CALENDAR_WORDS[normalized];
  const query = digit
    ? `number ${digit} illustration clipart cartoon`
    : calendarTerm
    ? `${normalized} day calendar illustration clipart cartoon`
    : `${word} illustration clipart cartoon`;

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
