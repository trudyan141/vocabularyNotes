import {sha256} from './speaking/hashes/sha2.js';
import {speakingModel as manifest,speakingModelFiles,speakingModelUrl} from './speaking/model.js';
import {decodePhones} from './speaking/ctc.js';
const cacheName='wfk-speaking-model-'+manifest.revision;
const runtimeFiles=['transformers.min.js','ort-wasm-simd-threaded.jsep.mjs','ort-wasm-simd-threaded.jsep.wasm'];
const marker=new URL('/speaking/ready-'+manifest.revision,self.location.origin).href;
let model,processor,vocab;
const chunkKey=(url,index)=>url+'?wfk-part='+index;
async function cachedFile(cache,url){const response=await cache.match(url);if(!response||!url.endsWith('.onnx'))return response;const index=await response.json();let part=0;return new Response(new ReadableStream({async pull(controller){if(part>=index.chunks){controller.close();return;}const chunk=await cache.match(chunkKey(url,part++));if(!chunk){controller.error(new Error('missing'));return;}controller.enqueue(new Uint8Array(await chunk.arrayBuffer()));}}),{headers:{'Content-Length':String(index.bytes),'Content-Type':'application/octet-stream'}});}
const send=(type,rest={})=>self.postMessage({type,...rest});
async function ready(){const cache=await caches.open(cacheName);if(!await cache.match(marker))return false;for(const url of [...speakingModelFiles.map(speakingModelUrl),...runtimeFiles.map(file=>new URL('/speaking/runtime/'+file,self.location.origin).href)]){const response=await cache.match(url);if(!response)return false;if(url.endsWith('.onnx')){const index=await response.json();if(index.bytes!==manifest.bytes||index.sha256!==manifest.sha256||!Number.isInteger(index.chunks)||index.chunks<1||index.chunks>30)return false;for(let i=0;i<index.chunks;i++)if(!await cache.match(chunkKey(url,i)))return false;}}return true;}
async function download(){const cache=await caches.open(cacheName);if(await ready())return;const estimate=await navigator.storage.estimate();if(estimate.quota&&estimate.quota-(estimate.usage??0)<manifest.bytes*1.3)throw new Error('storage');let completed=0;
 for(const url of [...speakingModelFiles.map(speakingModelUrl),...runtimeFiles.map(file=>new URL('/speaking/runtime/'+file,self.location.origin).href)]){
 const response=await fetch(url,{credentials:'omit',cache:'no-store'});if(!response.ok||!response.body)throw new Error('download');
 let size=0;const max=url.endsWith('.onnx')?manifest.bytes:30_000_000,hash=sha256.create(),reader=response.body.getReader();let notified=0,index=0,used=0;const chunkBytes=16*1024*1024;let block=new Uint8Array(chunkBytes);
 const store=async()=>{if(!used)return;await cache.put(chunkKey(url,index++),new Response(block.subarray(0,used)));block=new Uint8Array(chunkBytes);used=0;};
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new Error('size');}hash.update(value);let offset=0;while(offset<value.length){const length=Math.min(chunkBytes-used,value.length-offset);block.set(value.subarray(offset,offset+length),used);used+=length;offset+=length;if(used===chunkBytes)await store();}if(size-notified>1_000_000){notified=size;send('progress',{loaded:completed+size});}}
 await store();const digest=[...hash.digest()].map(b=>b.toString(16).padStart(2,'0')).join('');if(url.endsWith('.onnx')&&(size!==manifest.bytes||digest!==manifest.sha256))throw new Error('integrity');
 if(url.endsWith('.onnx'))await cache.put(url,Response.json({chunks:index,bytes:size,sha256:digest}));else{const blocks=[];for(let i=0;i<index;i++)blocks.push(await(await cache.match(chunkKey(url,i))).arrayBuffer());await cache.put(url,new Response(new Blob(blocks),{headers:{'Content-Type':url.endsWith('.wasm')?'application/wasm':url.endsWith('.js')||url.endsWith('.mjs')?'text/javascript':'application/json'}}));for(let i=0;i<index;i++)await cache.delete(chunkKey(url,i));}completed+=size;send('progress',{loaded:completed});
 }
 await cache.put(marker,new Response('ready'));
}
async function load(){if(model)return;if(!await ready())throw new Error('missing');const cache=await caches.open(cacheName),runtime=new URL('/speaking/runtime/transformers.min.js',self.location.origin).href;const entry=await cache.match(runtime);if(!entry)throw new Error('missing');
 // Module runtime URL is served locally; cached by the dedicated Speaking cache on download.
 const {env,AutoProcessor,Wav2Vec2ForCTC}=await import(runtime);
 env.allowRemoteModels=false;env.allowLocalModels=true;env.localModelPath='/speaking/model/';env.useBrowserCache=false;env.useCustomCache=true;
 env.customCache={match:async key=>{const suffix=String(key).split('/speaking/model/wav2vec2/')[1];return suffix?cachedFile(cache,speakingModelUrl(suffix)):cache.match(key);},put:async()=>{}};
 env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.wasmPaths='/speaking/runtime/';
 processor=await AutoProcessor.from_pretrained('wav2vec2');model=await Wav2Vec2ForCTC.from_pretrained('wav2vec2',{dtype:'q8',device:'wasm'});const response=await cache.match(speakingModelUrl('vocab.json'));const words=await response.json();vocab=Object.fromEntries(Object.entries(words).map(([phone,id])=>[id,phone]));
}
self.onmessage=async({data})=>{try{if(data.type==='status')send('status',{ready:await ready()});else if(data.type==='download'){await download();send('status',{ready:true});}else if(data.type==='run'){await load();const inputs=await processor(data.samples),output=await model(inputs);try{send('result',{phones:decodePhones(output.logits.data,output.logits.dims.at(-1),vocab,data.samples.length/16,manifest.blankId)});}finally{output.logits.dispose();for(const tensor of Object.values(inputs))tensor.dispose?.();}}}catch(error){send('error',{reason:error instanceof Error?error.message:'unavailable'});}};
