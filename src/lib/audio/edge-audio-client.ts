/** Session RAM only. Never persist learner text/audio in IDB, storage or a SW. */
export const edgeVoice='en-US-EmmaNeural';
const ttl=10*60*1000,maxBytes=4*1024*1024,maxClips=32;
type Clip={blob:Blob;expires:number};
type Pending={controller:AbortController;promise:Promise<Blob>;users:number};
const clips=new Map<string,Clip>(),pending=new Map<string,Pending>();
let bytes=0,generation=0;
const aborted=()=>new DOMException('Audio cancelled','AbortError');
function remove(key:string){const clip=clips.get(key);if(clip){bytes-=clip.blob.size;clips.delete(key);}}
export function clearEdgeAudio(){
 generation++;
 for(const item of pending.values())item.controller.abort();
 pending.clear();clips.clear();bytes=0;
}
export function edgeAudio(scope:string,text:string,signal:AbortSignal):Promise<Blob>{
 if(signal.aborted)return Promise.reject(aborted());
 if(!scope||!text.trim()||text.length>600)return Promise.reject(new Error('invalid-text'));
 // Synthesis is always rate 1; normal/slow are pitch-preserving playback rates.
 const key=JSON.stringify([scope,text,edgeVoice,1,'mp3']);
 for(const [id,clip] of clips)if(clip.expires<=Date.now())remove(id);
 const cached=clips.get(key);
 if(cached){clips.delete(key);clips.set(key,cached);return Promise.resolve(cached.blob);}
 let item=pending.get(key);
 if(!item){
  const controller=new AbortController(),ticket=generation;
  const created:Pending={controller,users:0,promise:Promise.resolve(new Blob())};
  created.promise=(async()=>{
   const response=await fetch('/api/audio/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])});
   if(!response.ok||!response.headers.get('content-type')?.startsWith('audio/'))throw new Error('unavailable');
   // Bound streamed input before constructing a Blob, including a missing/false Content-Length.
   const reader=response.body?.getReader();if(!reader)throw new Error('empty-audio');
   const chunks:Uint8Array<ArrayBuffer>[]=[];let size=0;
   try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024*1024)throw new Error('oversize-audio');chunks.push(new Uint8Array(value));}}
   catch(error){await reader.cancel().catch(()=>{});throw error;}
   finally{reader.releaseLock();}
   if(controller.signal.aborted||ticket!==generation)throw aborted();
   if(!size)throw new Error('empty-audio');
   const blob=new Blob(chunks,{type:'audio/mpeg'});
   while(clips.size>=maxClips||bytes+size>maxBytes){const oldest=clips.keys().next().value;if(oldest===undefined)break;remove(oldest);}
   clips.set(key,{blob,expires:Date.now()+ttl});bytes+=size;return blob;
  })().finally(()=>{if(pending.get(key)===created)pending.delete(key);});
  item=created;pending.set(key,item);
 }
 const shared=item;shared.users++;
 return new Promise((resolve,reject)=>{
  let settled=false;
  const finish=(error:unknown,blob?:Blob)=>{
   if(settled)return;settled=true;signal.removeEventListener('abort',cancel);shared.users--;
   if(error)reject(error);else resolve(blob!);
  };
  const cancel=()=>{finish(aborted());if(!shared.users&&pending.get(key)===shared){pending.delete(key);shared.controller.abort();}};
  signal.addEventListener('abort',cancel,{once:true});
  shared.promise.then(blob=>finish(null,blob),error=>finish(error));
  if(signal.aborted)cancel();
 });
}
