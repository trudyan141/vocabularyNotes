import { z } from 'zod';
import { sameOrigin, failure, privateHeaders } from '@/server/cloud/auth';
import { normalizeImported, boundedFetch } from '@/server/media/commons';
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
  title: z.string().max(200).optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  creator: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure(403, 'origin');

  try {
    const raw = await request.json();
    const { url, title, sourceUrl, creator } = importUrlSchema.parse(raw);

    // Fetch ảnh tối đa 4MB với timeout 8s
    const bytes = await boundedFetch(url, 4_000_000);

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
    const normalized = await normalizeImported(tempCandidate, bytes);
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
