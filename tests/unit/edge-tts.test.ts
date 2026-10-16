import {Readable} from 'node:stream';
import {beforeEach,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
vi.mock('server-only',()=>({}));
const fixture=vi.hoisted(()=>({metadata:vi.fn(),stream:vi.fn(),close:vi.fn()}));
vi.mock('msedge-tts',()=>({MsEdgeTTS:class{setMetadata=fixture.metadata;toStream=fixture.stream;close=fixture.close;},OUTPUT_FORMAT:{AUDIO_24KHZ_48KBITRATE_MONO_MP3:'mp3'}}));
import {synthesizeEdge,ttsText,edgeVoice} from '@/server/edge-tts';
import {POST} from '@/app/api/audio/tts/route';
beforeEach(()=>{fixture.metadata.mockReset().mockResolvedValue(undefined);fixture.stream.mockReset().mockImplementation(()=>({audioStream:Readable.from([Buffer.from('mp3')])}));fixture.close.mockClear();});
it('uses the fixed multilingual voice and escapes user text as XML data',async()=>{
 expect(Buffer.from(await synthesizeEdge('Hi <voice> & "x"',new AbortController().signal)).toString()).toBe('mp3');
 expect(fixture.metadata).toHaveBeenCalledWith(edgeVoice,'mp3');expect(fixture.stream).toHaveBeenCalledWith('Hi &lt;voice&gt; &amp; &quot;x&quot;');expect(fixture.close).toHaveBeenCalled();
});
it('rejects invalid text, empty/oversize streams and releases the connection after errors',async()=>{
 for(const value of ['',null,'x'.repeat(601),'x\u0000'])expect(ttsText(value)).toBeNull();
 for(const chunks of [[],[Buffer.alloc(1024*1024+1)]]){
 fixture.stream.mockReturnValueOnce({audioStream:Readable.from(chunks)});await expect(synthesizeEdge('hello',new AbortController().signal)).rejects.toThrow();
 }
 expect(fixture.close).toHaveBeenCalledTimes(2);
});
it('aborts a pending stream and bounds concurrent requests',async()=>{
 const controllers=Array.from({length:4},()=>new AbortController());
 fixture.stream.mockImplementation(()=>({audioStream:new Readable({read(){}})}));
 const requests=controllers.map(c=>synthesizeEdge('hello',c.signal));
 const outcomes=Promise.allSettled(requests);
 await vi.waitFor(()=>expect(fixture.stream).toHaveBeenCalledTimes(4));
 await expect(synthesizeEdge('extra',new AbortController().signal)).rejects.toThrow('busy');
 controllers.forEach(c=>c.abort());expect((await outcomes).every(r=>r.status==='rejected')).toBe(true);
 fixture.stream.mockImplementation(()=>({audioStream:Readable.from([Buffer.from('ok')])}));
 expect(await synthesizeEdge('again',new AbortController().signal)).toHaveLength(2);
});
it('route enforces origin, text-only payload, no-store audio and upstream errors',async()=>{
 const request=(body:unknown,origin='http://localhost:3000')=>new NextRequest('http://localhost:3000/api/audio/tts',{method:'POST',headers:{Origin:origin},body:JSON.stringify(body)});
 expect((await POST(request({text:'hi'},'https://evil.test'))).status).toBe(403);
 for(const body of [null,{text:''},{text:'hi',voice:'other'},{text:'x'.repeat(4001)}])expect((await POST(request(body))).status).toBe(400);
 expect(fixture.metadata).not.toHaveBeenCalled();
 const result=await POST(request({text:'Hello!'}));expect(result.status).toBe(200);expect(result.headers.get('content-type')).toBe('audio/mpeg');expect(result.headers.get('cache-control')).toBe('private, no-store');
 fixture.metadata.mockRejectedValueOnce(new Error('upstream'));expect((await POST(request({text:'hello'}))).status).toBe(503);
});
