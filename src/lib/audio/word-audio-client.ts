import {audioWord,wordAudioSchema,type WordAudio} from './word-audio';
const cache=new Map<string,{expires:number;request:Promise<WordAudio|null>}>();
export function wordAudio(text:string):Promise<WordAudio|null>{
 const word=audioWord(text);if(!word||!navigator.onLine)return Promise.resolve(null);
 const old=cache.get(word);if(old&&old.expires>Date.now())return old.request;
 const request=fetch('/api/audio/word',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({word}),cache:'no-store',signal:AbortSignal.timeout(18000)}).then(async response=>{
  if(!response.ok)throw new Error('unavailable');const data=await response.json();if(data.word!==word)throw new Error('stale');if(data.sample===null)return null;
  const parsed=wordAudioSchema.safeParse(data.sample);return parsed.success&&parsed.data.word===word?parsed.data:null;
 }).catch(()=>{cache.delete(word);return null;});
 if(cache.size>=128)cache.delete(cache.keys().next().value!);cache.set(word,{request,expires:Date.now()+60000});return request;
}
