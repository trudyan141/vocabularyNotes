import {z} from 'zod';
import {onlineIllustration} from '@/lib/media/online-search';
export function GET(request:Request){const url=new URL(request.url);const parsed=z.object({word:z.string().regex(/^[a-zA-Z][a-zA-Z '-]{0,79}$/),pos:z.string().max(60),definition:z.string().max(1000)}).safeParse(Object.fromEntries(url.searchParams));if(!parsed.success)return Response.json({error:'invalid'},{status:400});return Response.json({result:onlineIllustration(parsed.data.word,parsed.data.pos,parsed.data.definition)},{headers:{'Cache-Control':'private, no-store'}});}
