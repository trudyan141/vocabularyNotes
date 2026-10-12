import {afterEach,expect,it,vi} from 'vitest';
import {loadPicture} from '@/lib/media/load-picture';
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
function image(result:'ready'|'error'|'empty'|'decode-error'|'timeout'){
 vi.stubGlobal('Image',class{
  naturalWidth=result==='empty'?0:16;naturalHeight=16;
  onload:(()=>void)|null=null;onerror:(()=>void)|null=null;
  set src(_src:string){queueMicrotask(()=>{if(result==='error')this.onerror?.();else if(result!=='timeout')this.onload?.();});}
  decode(){return result==='decode-error'?Promise.reject(new Error('broken')):Promise.resolve();}
 });
}
it('accepts a decoded image and rejects failed, empty and undecodable responses',async()=>{
 for(const result of ['ready','error','empty','decode-error'] as const){image(result);expect(await loadPicture('/illustrations/test.svg')).toBe(result==='ready');}
});
it('bounds an image that never finishes loading and rejects non-browser callers',async()=>{
 vi.stubGlobal('Image',undefined);expect(await loadPicture('/test.svg')).toBe(false);
 vi.useFakeTimers();image('timeout');const pending=loadPicture('/test.svg');await vi.advanceTimersByTimeAsync(8000);expect(await pending).toBe(false);
});
