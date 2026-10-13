import { z } from 'zod';
import { sameOrigin, failure, privateHeaders } from '@/server/cloud/auth';
import { searchFreeWebPictures } from '@/server/media/web-search';

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  word: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure(403, 'origin');

  try {
    const raw = await request.json();
    const { word } = searchSchema.parse(raw);
    const results = await searchFreeWebPictures(word);

    return Response.json({ results }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return failure(400, 'invalid-input');
    }
    return Response.json({ results: [] }, { headers: privateHeaders });
  }
}
