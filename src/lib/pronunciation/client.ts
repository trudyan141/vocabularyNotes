import type {SentenceIpa} from './sentence';
const cache=new Map<string,Promise<SentenceIpa|null>>(),queue:{text:string;resolve:(value:SentenceIpa|null)=>void}[]=[];
let running=false;
async function drain(){
 if(running)return;running=true;
 try{while(queue.length){const jobs=queue.splice(0,16);try{const response=await fetch('/api/pronunciation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texts:jobs.map(job=>job.text)}),cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('unavailable');const {results}=await response.json();for(const job of jobs){const row=Array.isArray(results)?results.find((row:SentenceIpa)=>row.text===job.text):null;job.resolve(row?.verified===false&&row.accent==='US'&&(row.ipa===null||typeof row.ipa==='string')?row:null);if(!row?.ipa)cache.delete(job.text);}}catch{jobs.forEach(job=>{cache.delete(job.text);job.resolve(null);});}}}
 finally{running=false;}
}
export function sentenceIpa(text:string){if(!text.trim()||text.length>2000)return Promise.resolve(null);const old=cache.get(text);if(old)return old;const result=new Promise<SentenceIpa|null>(resolve=>queue.push({text,resolve}));cache.set(text,result);if(cache.size>128)cache.delete(cache.keys().next().value!);queueMicrotask(()=>void drain());return result;}
