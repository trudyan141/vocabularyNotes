import 'server-only';
import {MsEdgeTTS, OUTPUT_FORMAT} from 'msedge-tts';

export const edgeVoice = 'en-US-EmmaNeural';
export const maxTtsText = 600;
let inFlight = 0;

export function ttsText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text && text.length <= maxTtsText && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(text) ? text : null;
}
function escapeXml(text: string) {
  return text.replace(/[<>&"']/g, char => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[char]!));
}

/** One bounded online request; no files, persistent cache, keys or paid provider. */
export async function synthesizeEdge(text: string, signal: AbortSignal, timings?:{connectMs?:number;firstAudioMs?:number;totalMs?:number}): Promise<Uint8Array> {
  if (!ttsText(text)) throw new Error('invalid');
  signal.throwIfAborted();
  if (inFlight >= 4) throw new Error('busy');
  inFlight++;
  const started=performance.now();
  const tts = new MsEdgeTTS({connectionTimeoutMs: 5000, synthesisTimeoutMs: 8000});
  const deadline = AbortSignal.timeout(12000);
  const stop = AbortSignal.any([signal, deadline]);
  const close = () => tts.close();
  stop.addEventListener('abort', close, {once: true});
  try {
    await tts.setMetadata(edgeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    if(timings)timings.connectMs=Math.round(performance.now()-started);
    stop.throwIfAborted();
    const {audioStream} = tts.toStream(escapeXml(text));
    const abortStream = () => audioStream.destroy(new Error('aborted'));
    stop.addEventListener('abort', abortStream, {once: true});
    try {
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of audioStream) {
        stop.throwIfAborted();
        size += chunk.length;
        if(timings&&timings.firstAudioMs===undefined&&chunk.length)timings.firstAudioMs=Math.round(performance.now()-started);
        if (size > 1024 * 1024) throw new Error('too-large');
        chunks.push(Buffer.from(chunk));
      }
      stop.throwIfAborted();
      if (!size) throw new Error('empty');
      if(timings)timings.totalMs=Math.round(performance.now()-started);
      return new Uint8Array(Buffer.concat(chunks));
    } finally {
      stop.removeEventListener('abort', abortStream);
      audioStream.destroy();
    }
  } finally {
    stop.removeEventListener('abort', close);
    tts.close();
    inFlight--;
  }
}
