import { z } from 'zod';
import { sameOrigin, failure, privateHeaders } from '@/server/cloud/auth';
import { normalizeImported } from '@/server/media/commons';
import { signMedia } from '@/server/media/receipt';

export const dynamic = 'force-dynamic';

function isSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    // Chặn localhost và dải IP nội bộ (SSRF Protection)
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      /^169\.254\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

const importUrlSchema = z.object({
  url: z.string().url().refine(isSafeUrl, 'Invalid or unsafe URL'),
  fallbackUrl: z.string().url().refine(isSafeUrl).optional().or(z.literal('')),
  title: z.string().max(200).optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  creator: z.string().max(100).optional(),
});

async function fetchOne(targetUrl: string, timeoutMs: number): Promise<Buffer> {
  const res = await fetch(targetUrl, {
    cache: 'no-store',
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arrayBuf = await res.arrayBuffer();
  if (arrayBuf.byteLength > 5_000_000) throw new Error('too-large');
  return Buffer.from(arrayBuf);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure(403, 'origin');

  try {
    const raw = await request.json();
    const { url, fallbackUrl, title, sourceUrl, creator } = importUrlSchema.parse(raw);

    // Fetch ảnh với cơ chế fallback tự động nếu website nguồn bị chết/timeout
    let bytes: Buffer;
    try {
      bytes = await fetchOne(url, 4000);
    } catch (err) {
      if (fallbackUrl && fallbackUrl !== url) {
        bytes = await fetchOne(fallbackUrl, 5000);
      } else {
        throw err;
      }
    }

    const safeTitle = (title || 'web-image').slice(0, 80).replace(/[^\w\s-]/g, '').trim() || 'web-image';
    const tempCandidate = {
      id: 'upload:pending',
      title: `File:${safeTitle}.jpg`,
      sourceUrl: sourceUrl || url,
      imageUrl: '' as const,
      creator: 'User supplied' as const,
      license: 'User supplied' as const,
      licenseUrl: '' as const,
      credit: `${safeTitle}${creator ? ` (${creator})` : ''} — User supplied`,
    };

    // Chuẩn hóa ảnh: resize inside 512x512, JPEG 85, < 500KB
    // Hỗ trợ cả file SVG với trustedSvg=true (được kiểm tra an toàn script/entity)
    let normalized;
    try {
      normalized = await normalizeImported(tempCandidate, bytes, true);
    } catch (normErr) {
      // Nếu file gốc (SVG bị lỗi hoặc không an toàn) thất bại nhưng có fallbackUrl (ảnh PNG/JPG thumbnail), thử fallbackUrl!
      if (fallbackUrl && fallbackUrl !== url) {
        const fallbackBytes = await fetchOne(fallbackUrl, 5000);
        normalized = await normalizeImported(tempCandidate, fallbackBytes, false);
      } else {
        throw normErr;
      }
    }

    const finalCandidate = {
      ...tempCandidate,
      id: `upload:${normalized.sha256}`,
    };

    const checkedAt = new Date().toISOString();
    const receipt = signMedia(finalCandidate, normalized.sha256, checkedAt);

    return Response.json(
      {
        candidate: finalCandidate,
        base64: normalized.base64,
        sha256: normalized.sha256,
        checkedAt,
        receipt,
      },
      { headers: privateHeaders }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return failure(400, 'invalid-input');
    }
    return failure(503, 'import-failed');
  }
}
