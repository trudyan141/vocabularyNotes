import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {edgeAudio,clearEdgeAudio} from '@/lib/audio/edge-audio-client';
const response=()=>new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'audio/mpeg'}});
beforeEach(()=>clearEdgeAudio());
afterEach(()=>{clearEdgeAudio();vi.unstubAllGlobals();vi.useRealTimers();});
it('replays the same exact clip from RAM and separates scope and text',async()=>{
 const fetcher=vi.fn(async()=>response());vi.stubGlobal('fetch',fetcher);
 const signal=new AbortController().signal;
 const first=await edgeAudio('guest:a','apple',signal);
 expect(await edgeAudio('guest:a','apple',signal)).toBe(first);
 await edgeAudio('guest:b','apple',signal);await edgeAudio('guest:a','Apple',signal);
 expect(fetcher).toHaveBeenCalledTimes(3);
 clearEdgeAudio();await edgeAudio('guest:a','apple',signal);expect(fetcher).toHaveBeenCalledTimes(4);
});
it('coalesces pending synthesis without letting one consumer cancel another',async()=>{
 let release!:(response:Response)=>void;
 const fetcher=vi.fn(()=>new Promise<Response>(resolve=>{release=resolve;}));vi.stubGlobal('fetch',fetcher);
 const a=new AbortController(),b=new AbortController();
 const first=edgeAudio('a','apple',a.signal),second=edgeAudio('a','apple',b.signal);
 const stopped=expect(first).rejects.toMatchObject({name:'AbortError'});a.abort();await stopped;
 expect(fetcher.mock.calls).toHaveLength(1);release(response());expect((await second).size).toBe(3);
});
it('aborts the actual request for the last consumer and permits immediate retry',async()=>{
 let upstream:AbortSignal|undefined;
 vi.stubGlobal('fetch',vi.fn((_url,init)=>{upstream=init.signal;return new Promise((_resolve,reject)=>upstream?.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError'))));}));
 const c=new AbortController(),result=edgeAudio('a','apple',c.signal);
 const stopped=expect(result).rejects.toMatchObject({name:'AbortError'});c.abort();await stopped;expect(upstream?.aborted).toBe(true);
 const fetcher=vi.fn(async()=>response());vi.stubGlobal('fetch',fetcher);
 await edgeAudio('a','apple',new AbortController().signal);expect(fetcher).toHaveBeenCalledOnce();
});
it('does not retain late audio across a scope reset or a failed request',async()=>{
 let release!:(response:Response)=>void;
 vi.stubGlobal('fetch',()=>new Promise<Response>(resolve=>{release=resolve;}));
 const result=edgeAudio('a','apple',new AbortController().signal);
 const rejected=expect(result).rejects.toMatchObject({name:'AbortError'});clearEdgeAudio();release(response());await rejected;
 const fetcher=vi.fn().mockResolvedValueOnce(new Response('unavailable',{status:503})).mockImplementation(async()=>response());vi.stubGlobal('fetch',fetcher);
 await expect(edgeAudio('a','apple',new AbortController().signal)).rejects.toThrow('unavailable');
 await edgeAudio('a','apple',new AbortController().signal);expect(fetcher).toHaveBeenCalledTimes(2);
});
it('bounds the clip count and expires session clips',async()=>{
 vi.useFakeTimers();const fetcher=vi.fn(async()=>response());vi.stubGlobal('fetch',fetcher);const signal=new AbortController().signal;
 for(let i=0;i<33;i++)await edgeAudio('a',`word ${i}`,signal);
 await edgeAudio('a','word 0',signal);expect(fetcher).toHaveBeenCalledTimes(34);
 await edgeAudio('a','word 0',signal);expect(fetcher).toHaveBeenCalledTimes(34);
 vi.advanceTimersByTime(10*60*1000+1);await edgeAudio('a','word 0',signal);expect(fetcher).toHaveBeenCalledTimes(35);
});
it('bounds bytes before buffering the complete upstream response and rejects empty/invalid input',async()=>{
 const fetcher=vi.fn(async()=>new Response(new Uint8Array(1024*1024+1),{headers:{'Content-Type':'audio/mpeg'}}));vi.stubGlobal('fetch',fetcher);const signal=new AbortController().signal;
 await expect(edgeAudio('a','apple',signal)).rejects.toThrow('oversize-audio');
 fetcher.mockImplementation(async()=>new Response(null,{headers:{'Content-Type':'audio/mpeg'}}));
 await expect(edgeAudio('a','apple',signal)).rejects.toThrow('empty-audio');
 for(const text of ['', 'a'.repeat(601)])await expect(edgeAudio('a',text,signal)).rejects.toThrow('invalid-text');
 expect(fetcher).toHaveBeenCalledTimes(2);
});
