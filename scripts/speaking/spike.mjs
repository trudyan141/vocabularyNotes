// Explicit, isolated local evaluation. Never invoked by dev/build/test or production.
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,mkdir,copyFile,mkdtemp,stat,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
import ts from 'typescript';
const run=promisify(execFile);
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const modelSource=ts.transpileModule(await readFile(join(root,'src/lib/speaking/model.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {speakingModel:manifest,speakingModelFiles,speakingModelUrl}=await import('data:text/javascript;base64,'+Buffer.from(modelSource).toString('base64'));
const args=process.argv.slice(2);
const option=name=>args.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const cache=resolve(option('--model-dir')??join(tmpdir(),'wfk-speaking-model',manifest.revision));
const output=resolve(option('--report')??join(root,'docs/evaluations/speaking-local-spike.json'));
const synthetic=args.includes('--synthetic');
if(synthetic&&option('--fixtures'))throw new Error('Choose exactly one fixture source');
if(!synthetic&&!option('--fixtures'))throw new Error('Use --synthetic (local macOS voice) or --fixtures=manifest.json; no microphone or external voice provider is used.');
await mkdir(join(cache,'onnx'),{recursive:true});
for(const file of speakingModelFiles){
 const path=join(cache,file);let exists=false;try{exists=(await stat(path)).isFile();}catch{}
 if(!exists){
  if(!args.includes('--download'))throw new Error('Model missing. Explicit --download is required for public file downloads.');
  const response=await fetch(speakingModelUrl(file),{signal:AbortSignal.timeout(180000)});
  if(!response.ok)throw new Error('Public model download unavailable; no paid fallback: '+response.status);
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(file===manifest.file&&(bytes.length!==manifest.bytes||createHash('sha256').update(bytes).digest('hex')!==manifest.sha256))throw new Error('Model integrity check failed');
  await writeFile(path,bytes);console.log('Downloaded public file '+file+' ('+bytes.length+' bytes)');
 }
}
const hash=createHash('sha256');for await(const chunk of createReadStream(join(cache,manifest.file)))hash.update(chunk);
if((await stat(join(cache,manifest.file))).size!==manifest.bytes||hash.digest('hex')!==manifest.sha256)throw new Error('Cached model integrity check failed');
const work=await mkdtemp(join(tmpdir(),'wfk-speaking-fixtures-'));
await mkdir(join(work,'runtime'));
const dist=join(root,'node_modules/@huggingface/transformers/dist');
const installed=JSON.parse(await readFile(join(dist,'../package.json'),'utf8'));
if(installed.version!==manifest.transformersVersion)throw new Error('Unexpected runtime version');
for(const file of ['transformers.min.js','ort-wasm-simd-threaded.jsep.mjs','ort-wasm-simd-threaded.jsep.wasm'])await copyFile(join(dist,file),join(work,'runtime',file));
await writeFile(join(work,'ctc.js'),ts.transpileModule(await readFile(join(root,'src/lib/speaking/ctc.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
let fixtures;
if(synthetic){
 if(process.platform!=='darwin')throw new Error('--synthetic needs the existing macOS Samantha voice; no automatic voice download. Supply --fixtures instead.');
 fixtures=[{id:'cat',text:'cat',reference:'k æ t'},{id:'book',text:'book',reference:'b ʊ k'},{id:'cup',text:'cup',reference:'k ʌ p'},{id:'apple',text:'apple',reference:'æ p ə l'},{id:'family',text:'They are a family.',reference:'ð eɪ ɑɹ ə f æ m ə l i'}];
 for(const fixture of fixtures){fixture.file=join(work,fixture.id+'.wav');await run('say',['-v','Samantha','-o',fixture.file,'--file-format=WAVE','--data-format=LEI16@16000',fixture.text]);}
}else{
 const supplied=resolve(option('--fixtures'));fixtures=JSON.parse(await readFile(supplied,'utf8'));
 if(!Array.isArray(fixtures)||!fixtures.length||fixtures.length>20||fixtures.some(f=>!f.id||!f.file||typeof f.text!=='string'))throw new Error('Invalid fixture manifest (1–20 public/permitted recordings only)');
 if(new Set(fixtures.map(f=>f.id)).size!==fixtures.length)throw new Error('Duplicate fixture ID');
 for(const fixture of fixtures){
  fixture.file=resolve(dirname(supplied),fixture.file);
  if(fixture.sha256){
   const bytes=await readFile(fixture.file);
   if(bytes.length!==fixture.bytes||createHash('sha256').update(bytes).digest('hex')!==fixture.sha256)throw new Error('Fixture integrity check failed: '+fixture.id);
  }
 }
}
const files=new Map([
 ['/spike.html',join(work,'spike.html')],['/worker.js',join(work,'worker.js')],['/ctc.js',join(work,'ctc.js')],
 ...['transformers.min.js','ort-wasm-simd-threaded.jsep.mjs','ort-wasm-simd-threaded.jsep.wasm'].map(file=>['/runtime/'+file,join(work,'runtime',file)]),
 ...speakingModelFiles.map(file=>['/model/wav2vec2/'+file,join(cache,file)]),
 ...fixtures.map(f=>['/audio/'+encodeURIComponent(f.id),f.file]),
]);
await writeFile(join(work,'worker.js'),`import {env,AutoProcessor,Wav2Vec2ForCTC} from '/runtime/transformers.min.js';
import {decodePhones} from '/ctc.js';
env.allowRemoteModels=false;env.allowLocalModels=true;env.localModelPath='/model/';env.useBrowserCache=false;
env.backends.onnx.wasm.wasmPaths='/runtime/';env.backends.onnx.wasm.numThreads=1;
let model,processor,vocab;
self.onmessage=async({data})=>{try{if(data.type==='load'){
 const start=performance.now();processor=await AutoProcessor.from_pretrained('wav2vec2');
 model=await Wav2Vec2ForCTC.from_pretrained('wav2vec2',{dtype:'q8',device:'wasm'});
 const words=await(await fetch('/model/wav2vec2/vocab.json')).json();vocab=Object.fromEntries(Object.entries(words).map(([phone,id])=>[id,phone]));
 self.postMessage({type:'ready',loadedMs:performance.now()-start});
}else{const start=performance.now();const inputs=await processor(data.samples);const output=await model(inputs);const logits=output.logits;
 const phones=decodePhones(logits.data,logits.dims.at(-1),vocab,data.samples.length/16,${manifest.blankId});
 self.postMessage({type:'result',phones,inferenceMs:performance.now()-start,durationMs:data.samples.length/16});
 logits.dispose();for(const tensor of Object.values(inputs))tensor.dispose?.();
}}catch(e){self.postMessage({type:'error',message:String(e.stack??e)});}};`);
await writeFile(join(work,'spike.html'),`<!doctype html><html lang="vi"><meta charset="utf-8"><title>Isolated local Speaking fixture evaluation</title><body><h1>Local fixture evaluation</h1><script>
const worker=new Worker('/worker.js',{type:'module'});let pending;
window.ask=(data)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>{worker.terminate();reject(new Error('Local inference timeout; no fallback'));},60000);pending={resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}};worker.postMessage(data,data.samples?[data.samples.buffer]:[]);});
worker.onerror=e=>pending?.reject(new Error(e.message));worker.onmessage=({data})=>data.type==='error'?pending.reject(new Error(data.message)):pending.resolve(data);
window.decode=async(path,padding)=>{const bytes=await(await fetch(path)).arrayBuffer();const context=new AudioContext({sampleRate:16000});const sound=await context.decodeAudioData(bytes);const raw=sound.getChannelData(0);const samples=new Float32Array(raw.length+padding*2);samples.set(raw,padding);await context.close();return samples;};
window.finish=()=>worker.terminate();</script></body></html>`);
const server=createServer(async(req,res)=>{
 const file=files.get(req.url?.split('?')[0]);
 if(req.method!=='GET'||!file){res.writeHead(404);res.end();return;}
 const kind=file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript':file.endsWith('.wasm')?'application/wasm':file.endsWith('.html')?'text/html':file.endsWith('.json')?'application/json':'application/octet-stream';
 res.writeHead(200,{'Content-Type':kind,'Content-Length':(await stat(file)).size});createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser;const requests=[],logs=[],results=[];
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:360,height:800}});
 await page.route('**/*',route=>{const req=route.request();requests.push({method:req.method(),url:req.url().replace(base,'')});return req.url().startsWith(base+'/')&&req.method()==='GET'?route.continue():route.abort();});
 page.on('console',m=>{if(m.type()==='error')logs.push(m.text().slice(0,300));});
 await page.goto(base+'/spike.html');const ready=await page.evaluate(()=>window.ask({type:'load'}));
 for(const fixture of fixtures){
  for(const padding of fixture.id==='cat'?[0,4000]:[4000]){
   const result=await page.evaluate(async({path,padding})=>window.ask({type:'run',samples:await window.decode(path,padding)}),{path:'/audio/'+encodeURIComponent(fixture.id),padding});
   results.push({id:fixture.id+(padding?'-padded':'-raw'),targetText:fixture.text,referencePhones:fixture.reference??null,...result});
  }
 }
 const silent=await page.evaluate(()=>window.ask({type:'run',samples:new Float32Array(16000)}));results.push({id:'silence',...silent});
 await page.evaluate(()=>window.finish());
 const fixtureSources=fixtures.map(f=>({id:f.id,source:f.source??null,creator:f.creator??null,license:f.license??null,sha256:f.sha256??null,referencePhones:f.reference??null}));
 const report={date:new Date().toISOString().slice(0,10),model:manifest,runtime:'Chromium ephemeral profile; Worker CPU/WASM, one thread; desktop host with360px viewport (not physical mobile)',source:synthetic?'Local macOS Samantha synthetic voice; temporary fixture files, not distributed or child data':'Permitted public pronunciation fixtures; see fixtureSources and manifest for attribution/integrity',fixtureSources,loadedMs:ready.loadedMs,results,requests,consoleErrors:logs,limits:{pronunciationCalibration:false,childValidation:false,physicalPhone:false,peakMemoryMeasured:false,scoreEnabled:false,childErrorColorsEnabled:false},scope:'SP1 feasibility only; no mic/UI/game/provider API/billing/deployment'};
 await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({loadedMs:ready.loadedMs,results:results.map(r=>({id:r.id,phones:r.phones.map(p=>p.phone).join(' '),inferenceMs:r.inferenceMs})),requests:requests.length,consoleErrors:logs,report:output}));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));await rm(work,{recursive:true,force:true});}
