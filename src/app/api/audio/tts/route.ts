import {NextRequest, NextResponse} from 'next/server';
import {sameOrigin} from '@/server/cloud/auth';
import {synthesizeEdge, ttsText} from '@/server/edge-tts';
export const runtime = 'nodejs';
export const maxDuration = 20;
export async function POST(request: NextRequest) {
  const headers = {'Cache-Control':'private, no-store'};
  if (!sameOrigin(request)) return NextResponse.json({error:'forbidden'}, {status:403, headers});
  let text: string | null;
  try {
    const raw = await request.text();
    if (raw.length > 4000) throw new Error('invalid');
    const data = JSON.parse(raw);
    if (!data || Object.keys(data).join() !== 'text') throw new Error('invalid');
    text = ttsText(data.text);
    if (!text) throw new Error('invalid');
  } catch { return NextResponse.json({error:'invalid'}, {status:400, headers}); }
  try {
    const timings:{connectMs?:number;firstAudioMs?:number;totalMs?:number}={};
    const audio = await synthesizeEdge(text, request.signal,timings);
    const timing=`edge_connect;dur=${timings.connectMs??0}, edge_first_audio;dur=${timings.firstAudioMs??0}, edge_complete;dur=${timings.totalMs??0}`;
    return new NextResponse(new Uint8Array(audio), {headers:{...headers,'Content-Type':'audio/mpeg','X-Content-Type-Options':'nosniff','Server-Timing':timing}});
  } catch {
    return NextResponse.json({error:'unavailable'}, {status:503, headers});
  }
}
