import 'server-only';
import type { WebImageItem } from '@/lib/media/google-search';

const cache = new Map<string, { expires: number; items: WebImageItem[] }>();

const DANGEROUS_TITLE_PATTERN = /diseased|disease|ulcer|medical|wound|surgery|pathology|cadaver|autopsy|wellcome|amputation|specimen|infection|leprosy|cancer|injury|syphilis|gangrene|fracture|morgue|dissection|deformity|lesion|tumor|psm\s+v|ash\s*wednesday|addams|crucifix|funeral|cemetery|grave|tomb|skull/i;

const IRRELEVANT_PATTERNS = /chart|diagram|fingering|county|map|highlighted|guitar|violin|piano|sheet\s+music|pose\s+of|olaus\s+magnus|heraldry|coat\s+of\s+arms|escudo|flag\s+of|seal\s+of|sheffield|football|wels\.net|federal|funds\s+rate|interest\s+rate|treasury|inflation|stock|forex|log\s+scale/i;


export const CALENDAR_WORDS: Record<string, string> = {
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

function extractSubject(query: string): string {
  return query
    .replace(/^(one|two|three|four|five|six|seven|eight|nine|ten|[0-9]+)\s+/i, '')
    .replace(/^(a|an|the|this|that|these|those)\s+/i, '')
    .trim();
}

async function searchBingClipart(query: string, fetcher: typeof fetch = fetch): Promise<WebImageItem[]> {
  try {
    const cleanQuery = query.includes('clipart') ? query : `${query} clipart`;
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(cleanQuery)}&qft=+filterui:photo-clipart&first=1`;
    const res = await fetcher(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = [...html.matchAll(/m=['"]({.*?murl.*?})['"]/g)];

    return matches.slice(0, 16).flatMap((m, idx) => {
      try {
        const raw = m[1].replace(/&quot;/g, '"');
        const p = JSON.parse(raw) as { t?: string; murl?: string; turl?: string; purl?: string };
        if (!p.murl || !p.turl) return [];
        const title = (p.t || query).replace(/&amp;/g, '&').replace(/&#39;/g, "'").slice(0, 100);
        if (DANGEROUS_TITLE_PATTERN.test(title)) return [];
        if (IRRELEVANT_PATTERNS.test(title)) return [];

        let host = 'Web Clipart';
        try {
          if (p.purl) host = new URL(p.purl).hostname.replace(/^www\./, '');
        } catch {
          // ignore
        }

        return [{
          id: `web:${idx}:${p.murl.slice(-20)}`,
          title,
          thumbnailUrl: p.turl,
          imageUrl: p.murl,
          sourceUrl: p.purl || p.murl,
          source: 'web' as const,
          creator: host,
        }];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export const NUMBER_WORDS: Record<string, string> = {
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

  const digit = NUMBER_WORDS[normalized];
  const calendarTerm = CALENDAR_WORDS[normalized];

  let tasks: Promise<WebImageItem[]>[];

  if (digit) {
    // Trường hợp từ khóa là con số (ví dụ: "one", "two", "three", "1", "2"):
    // Tự động tìm "number 1", "number one" để ra hình vẽ chữ số, khối 3D số, bàn tay giơ số ngón
    tasks = [
      searchBingClipart(`number ${digit}`, fetcher),
      searchBingClipart(`number ${normalized}`, fetcher),
    ];
  } else if (calendarTerm) {
    // Trường hợp từ khóa là thứ trong tuần hoặc tháng (ví dụ: "wednesday", "monday"):
    // Tìm lịch học sinh, tờ lịch, ngày trong tuần
    tasks = [
      searchBingClipart(`${normalized} calendar`, fetcher),
      searchBingClipart(calendarTerm, fetcher),
    ];
  } else {
    const subject = extractSubject(normalized);

    // Bỏ hẳn Wikimedia Commons & Openverse theo yêu cầu người dùng, tập trung hoàn toàn vào Web Clipart & tranh vẽ thiếu nhi chuẩn
    tasks = [
      searchBingClipart(subject || normalized, fetcher),
    ];

    if (subject && subject !== normalized) {
      tasks.push(searchBingClipart(normalized, fetcher));
    }
  }

  const resultsLists = await Promise.all(tasks);

  const seenUrls = new Set<string>();
  const combined: WebImageItem[] = [];

  for (const list of resultsLists) {
    for (const item of list) {
      if (!item.imageUrl || seenUrls.has(item.imageUrl)) continue;
      seenUrls.add(item.imageUrl);
      combined.push(item);
    }
  }

  // Lưu cache 5 phút
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(cacheKey, { expires: Date.now() + 300000, items: combined.slice(0, 16) });

  return combined.slice(0, 16);
}

