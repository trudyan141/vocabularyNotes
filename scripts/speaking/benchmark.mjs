/** ADR094 operator pilot. Audio/results stay outside the repo; no automatic retries. */
import * as module from 'node:module';
import {existsSync} from 'node:fs';
import {readFile,writeFile,mkdir,realpath,open,rename,unlink} from 'node:fs/promises';
import {resolve,relative,dirname,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {validateManifest,pilotReport} from './metrics.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url)),sha=value=>createHash('sha256').update(value).digest('hex');
const args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i++){if(!/^--[a-z-]+$/.test(args[i]))throw new Error('Expected named arguments.');const key=args[i].slice(2);options[key]=args[i+1]&&!args[i+1].startsWith('--')?args[++i]:true;}
const flags=new Set(['help','validate','run','report','freeze','manifest','out','phase','variant','prompt-file','retry-failed','latency-file']);
if(Object.keys(options).some(key=>!flags.has(key)))throw new Error('Unknown argument.');
if(options.help||!Object.keys(options).length){console.log('Node24.14.1. --validate --manifest /private/manifest.json | --run --manifest ... --out /private/pilot --phase tuning|evaluation|repeat --variant baseline|candidate [--prompt-file /private/prompt.txt] | --freeze HASH --out ... | --report --manifest ... --out ... . Existing key via NEXT_PUBLIC_GEMINI_DEFAULT_KEY or GEMINI_API_KEY; never a command argument.');process.exit(0);}

const json=async path=>JSON.parse(await readFile(path,'utf8'));
const write=async(path,value)=>{await writeFile(path+'.tmp',JSON.stringify(value,null,2)+'\n',{mode:0o600});await rename(path+'.tmp',path);};
let lock;
try{
 if(typeof module.registerHooks!=='function')throw new Error('Use the project Node24.14.1 runtime.');
 module.registerHooks({resolve(specifier,context,next){if(specifier.startsWith('.')&&context.parentURL?.startsWith(pathToFileURL(root+'src/lib/speaking/').href)&&existsSync(fileURLToPath(new URL(specifier+'.ts',context.parentURL))))return next(new URL(specifier+'.ts',context.parentURL).href,context);return next(specifier,context);}});
 const [{validateAudioAssessment,validTargets},{pronunciationScore},{speakingGeminiPrompt}]=await Promise.all([import('../../src/lib/speaking/contract.ts'),import('../../src/lib/speaking/assessment.ts'),import('../../src/lib/speaking/prompt.ts')]);
 let clips,manifestHash,priorRequests=0;
 if(options.manifest){const raw=await readFile(resolve(options.manifest));manifestHash=sha(raw);const manifest=JSON.parse(raw);priorRequests=manifest.priorRequests??0;clips=validateManifest(manifest);for(const clip of clips)if(!validTargets(clip.targets))throw new Error('Manifest reference is outside the app inventory.');}
 if(options.validate){if(!clips)throw new Error('Provide a completed manifest.');console.log('PASS manifest structure/split/review declarations. Human labels, permissions and acoustic quality still need the actual reviewers. No provider calls.');process.exit(0);}
 if(typeof options.out!=='string'||!isAbsolute(options.out))throw new Error('Use an absolute private output directory outside the repository.');
 const supplied=resolve(options.out);if(!relative(root,supplied).startsWith('..'))throw new Error('Private pilot output must be outside the repository.');
 await mkdir(supplied,{recursive:true,mode:0o700});const output=await realpath(supplied);if(!relative(root,output).startsWith('..'))throw new Error('Output symlink resolves inside the repository.');
 const lockPath=resolve(output,'pilot.lock');lock=await open(lockPath,'wx',0o600);
 const statePath=resolve(output,'pilot-state.json');const state=existsSync(statePath)?await json(statePath):{version:1,manifestHash,priorRequests,selectedHash:null,startedEvaluation:false,configs:{},attempts:[]};
 const requestCount=()=>state.attempts.length+(state.priorRequests??0);
 if(state.version!==1||!Array.isArray(state.attempts)||!Number.isInteger(state.priorRequests??0)||(state.priorRequests??0)<0)throw new Error('Invalid pilot state; do not reset budget state to bypass its limit.');
 if(manifestHash&&state.manifestHash!==manifestHash)throw new Error('Dataset changed. Start a separately identified pilot, never mix benchmark states.');
 if(options.freeze){if(!state.configs[options.freeze]||state.configs[options.freeze].variant!=='candidate'||!state.attempts.some(attempt=>attempt.hash===options.freeze&&attempt.phase==='tuning'&&!attempt.result.error)||state.startedEvaluation)throw new Error('Freeze a tuned candidate before opening evaluation.');state.selectedHash=options.freeze;await write(statePath,state);console.log('Candidate frozen; held-out results must not be used to tune again.');}
 else if(options.report){
  if(!clips||!state.selectedHash)throw new Error('Completed manifest and frozen candidate required.');
  function latest(phase,hash){const rows=new Map();for(const attempt of state.attempts.filter(item=>item.phase===phase&&item.hash===hash))rows.set(attempt.id,attempt.result);return [...rows.values()];}
  const evaluation=clips.filter(clip=>clip.split==='evaluation'),results=latest('evaluation',state.selectedHash);
  if(options['latency-file']){
   const timings=await json(resolve(options['latency-file']));
   if(timings.configHash!==state.selectedHash||!timings.device||!timings.network||!Array.isArray(timings.cases)||timings.cases.length!==60||new Set(timings.cases.map(row=>row.id)).size!==60)throw new Error('End-to-end latency needs device/network and all 60 clip IDs for the frozen candidate.');
   for(const row of timings.cases){const result=results.find(result=>result.id===row.id);if(!result||!Number.isFinite(row.latencyMs)||row.latencyMs<0)throw new Error('Invalid end-to-end measurement.');result.latencyMs=row.latencyMs;result.latencyScope='end_to_end';}
  }
  const report=pilotReport(evaluation,results,latest('repeat',state.selectedHash));
  report.totalRequests=requestCount();report.totalRequestErrors=state.attempts.filter(row=>row.result.error).length;
  const baseline=Object.entries(state.configs).find(([,config])=>config.variant==='baseline');if(baseline)report.baseline=pilotReport(evaluation,latest('evaluation',baseline[0]));
  report.configs=Object.fromEntries(Object.entries(state.configs).map(([hash,config])=>[hash,{variant:config.variant,model:config.model}]));await write(resolve(output,'report.json'),report);console.log(JSON.stringify({status:report.status,gates:report.gates,totalRequests:report.totalRequests}));
 }else if(options.run){
  if(!clips||!['tuning','evaluation','repeat'].includes(options.phase)||!['baseline','candidate'].includes(options.variant))throw new Error('Provide manifest, phase and variant.');
  if(state.startedEvaluation&&options.phase==='tuning')throw new Error('Held-out was opened; this pilot cannot be tuned again.');
  const {validateObservation}=await import('../../src/lib/speaking/observation.ts');
  const {speakingRequestBody,speakingRequestTimeoutMs}=await import('../../src/lib/speaking/request.ts');
  const baseline=await json(resolve(root,'docs/evaluations/speaking-assessment-v2/baseline.json'));
  const prompt=options.variant==='baseline'?baseline.prompt:options['prompt-file']?await readFile(resolve(options['prompt-file']),'utf8'):speakingGeminiPrompt;
  if(typeof prompt!=='string'||!prompt.trim()||prompt.length>20000)throw new Error('Invalid prompt.');
  const model='gemini-3.5-flash-lite',scoringFingerprint=sha(await readFile(resolve(root,'src/lib/speaking/assessment.ts'))),normalizerFingerprint=sha(await readFile(resolve(root,'src/lib/speaking/feedback.ts'))),contractFingerprint=sha((await Promise.all(['contract.ts','observation.ts','request.ts'].map(file=>readFile(resolve(root,'src/lib/speaking/'+file))))).map(buffer=>buffer.toString()).join('\n'));
  const config={variant:options.variant,model,prompt,scoringFingerprint,normalizerFingerprint,contractFingerprint},hash=sha(JSON.stringify(config));
  if(options.variant==='candidate'&&!state.configs[hash]&&Object.values(state.configs).filter(config=>config.variant==='candidate').length>=2)throw new Error('At most two candidate prompts per pilot.');
  if(options.phase!=='tuning'&&(!state.selectedHash||options.variant==='candidate'&&state.selectedHash!==hash))throw new Error('Freeze the selected candidate before held-out; app/prompt changes require a new pilot.');
  if(options.phase==='repeat'&&options.variant!=='candidate')throw new Error('Repeat only the selected candidate.');
  let selected=clips.filter(clip=>clip.split===(options.phase==='tuning'?'tuning':'evaluation'));
  if(options.phase==='repeat'){
   const done=new Set(state.attempts.filter(row=>row.phase==='evaluation'&&row.hash===hash).map(row=>row.id));if(done.size!==60)throw new Error('Complete candidate evaluation before repeat.');
   selected=['child','adult'].flatMap(age=>selected.filter(clip=>clip.ageGroup===age&&clip.quality==='clear').slice(0,5));
  }
  selected=selected.filter(clip=>{const old=state.attempts.filter(row=>row.phase===options.phase&&row.hash===hash&&row.id===clip.id).at(-1);return !old||options['retry-failed']===true&&old.result.error;});
  if(requestCount()+selected.length>300)throw new Error('Pilot request budget would exceed 300.');
  // Validate every selected file before spending any quota. No audio is rewritten or copied.
  for(const clip of selected){const bytes=await readFile(resolve(dirname(resolve(options.manifest)),clip.audioPath));if(sha(bytes)!==clip.sha256||bytes.length<8044||bytes.length>320044||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE'||bytes.readUInt32LE(24)!==16000||bytes.readUInt16LE(22)!==1||bytes.readUInt16LE(34)!==16)throw new Error('Audio SHA/format/bounds mismatch; provide the exact permitted mono16k WAV.');}
  const key=process.env.NEXT_PUBLIC_GEMINI_DEFAULT_KEY||process.env.GEMINI_API_KEY;if(!key)throw new Error('No authorized existing key in the process environment; no requests sent.');
  state.configs[hash]=config;if(options.phase!=='tuning')state.startedEvaluation=true;await write(statePath,state);
  console.log(JSON.stringify({phase:options.phase,variant:options.variant,configHash:hash,remainingClips:selected.length,requestsSoFar:requestCount()}));
  for(const clip of selected){
   const bytes=await readFile(resolve(dirname(resolve(options.manifest)),clip.audioPath));const started=performance.now();let result;
   // Reserve a request durably before network I/O so an interrupted process cannot erase spend.
   const attempt={id:clip.id,phase:options.phase,hash,result:{id:clip.id,score:null,status:'uncertain',events:[],priority:null,error:'interrupted'}};state.attempts.push(attempt);await write(statePath,state);
   try{
    const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','x-goog-api-key':key},signal:AbortSignal.timeout(options.variant==='baseline'?30000:speakingRequestTimeoutMs),body:JSON.stringify(options.variant==='candidate'?{...speakingRequestBody(clip.targets,bytes.toString('base64')),systemInstruction:{parts:[{text:prompt}]}}:{systemInstruction:{parts:[{text:prompt}]},contents:[{role:'user',parts:[{text:JSON.stringify({targets:clip.targets.map((target,index)=>({index,...target}))})},{inlineData:{mimeType:'audio/wav',data:bytes.toString('base64')}}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:4000,temperature:0}})});
    if(!response.ok)throw new Error(response.status===429?'quota':response.status===401||response.status===403?'access':'provider');
    const reader=response.body.getReader();let length=0;const chunks=[];try{while(true){const item=await reader.read();if(item.done)break;length+=item.value.byteLength;if(length>50000)throw new Error('response');chunks.push(Buffer.from(item.value));}}finally{await reader.cancel().catch(()=>{});}
    const raw=JSON.parse(Buffer.concat(chunks).toString('utf8')),candidate=raw.candidates?.[0];if(candidate?.finishReason!=='STOP')throw new Error('response');
    const value=JSON.parse(candidate.content.parts.filter(part=>!part.thought&&typeof part.text==='string').map(part=>part.text).join(''));
    let wire=value,baselineScore;
    if(options.variant==='baseline'){
     const text=z.string().min(1).max(500).refine(v=>!/[<>]|https?:\/\//i.test(v)),phone=z.string().min(1).max(20).refine(v=>!/[\s<>/\d]|https?:/i.test(v));
     const parsed=z.object({words:z.array(z.object({index:z.number().int().min(0).max(19),score:z.number().int().min(0).max(100).nullable(),advice:text,phones:z.array(z.object({expected:phone,heard:phone.nullable(),status:z.enum(['match','retry','missing','uncertain']),advice:text}).strict()).min(1).max(80)}).strict()).min(1).max(20)}).strict().parse(value);
     baselineScore=parsed.words[0]?.score;
     wire={schemaVersion:2,words:parsed.words.map(row=>{const target=clip.targets[row.index],variantIndex=target?.variants.findIndex(variant=>variant.length===row.phones.length&&variant.every((phone,i)=>phone===row.phones[i].expected));const unclear=row.phones.some(phone=>phone.status==='uncertain');if(unclear!==(row.score===null))throw new Error('evidence');return {index:row.index,variantIndex,audibility:unclear?'unclear':'clear',insertions:[],phones:row.phones.map(({expected,heard,status})=>({expected,heard,status:status==='retry'||status==='missing'&&heard!==null?'substitution':status}))};})};
    }
    const feedback=options.variant==='baseline'?validateAudioAssessment(wire,clip.targets):validateObservation(value,clip.targets),events=feedback.flatMap(word=>word.status==='uncertain'?[]:[...word.phones.flatMap((phone,index)=>phone.status==='match'||phone.status==='uncertain'?[]:[{wordIndex:word.index,index,kind:phone.status==='missing'?'missing':'substitution',heard:phone.heard}]),...word.insertions.map(item=>({wordIndex:word.index,index:item.afterIndex,kind:'insertion',heard:item.heard}))]);
    const main=events.find(event=>event.kind==='missing'||feedback[0].phones[event.index]?.status==='incorrect')??events.find(event=>event.kind==='insertion')??events[0]??null;
    result={id:clip.id,score:options.variant==='baseline'?baselineScore:pronunciationScore(feedback),status:feedback[0].status,events,priority:main,error:null};
    await write(resolve(output,`${hash}-${options.phase}-${clip.id}-raw.json`),value);
   }catch(error){const known=['quota','access','provider','response','evidence'];result={id:clip.id,score:null,status:'uncertain',events:[],priority:null,error:known.includes(error.message)?error.message:'invalid_or_network'};}
   result.latencyMs=Math.round(performance.now()-started);result.latencyScope='provider_only';attempt.result=result;await write(statePath,state);
   if(result.error==='quota'||result.error==='access'){console.log(JSON.stringify({status:'pending_external',reason:result.error,requestsSoFar:requestCount()}));process.exitCode=2;break;}
  }
  console.log(JSON.stringify({status:process.exitCode===2?'pending_external':'run_finished',phase:options.phase,configHash:hash,requestsSoFar:requestCount()}));
 }else throw new Error('Choose validate, run, freeze or report.');
}catch(error){console.error(error.message);process.exitCode=1;}finally{if(lock){const path=resolve(options.out,'pilot.lock');await lock.close();await unlink(path).catch(()=>{});}}
