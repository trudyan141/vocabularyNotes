import {ParentAiError,parentAi,type AiProgress,worksheetResult} from './byok';
import {recoverWorksheet,type WorksheetCheckpoint} from './worksheet-recovery';
import {type WorksheetLearning} from './worksheet-learning';
import {z} from 'zod';

type Result=z.infer<typeof worksheetResult>;
export type MultiCheckpoint={version:1;signature:string;model:string;mode:'listed'|'all';pages:WorksheetCheckpoint[];chunks:WorksheetCheckpoint[];grammar:(WorksheetCheckpoint|null)[];complete:boolean};
const key=(value:string)=>value.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export function multiResult(state:MultiCheckpoint):Result{
 const words=state.chunks.flatMap(chunk=>chunk.result.words),seen=new Set<string>();
 const learning=state.grammar.flatMap(page=>page?.result.learning??[]).filter(item=>{const identity=JSON.stringify([key(item.example),key(item.formula),key(item.sourceEvidenceText)]);if(seen.has(identity))return false;seen.add(identity);return true;});
 return {text:state.pages.map(page=>page.result.text).join('\n\n'),warnings:[...new Set(state.pages.flatMap(page=>page.result.warnings))],words,learning:mergeGrammar(learning)};
}
// Explicit construction/form identity only. Keep source sentences independent.
export function mergeGrammar(items:WorksheetLearning[]):WorksheetLearning[]{
 const output:WorksheetLearning[]=[];
 for(const item of items){
  const family=item.grammarFamily||item.formula||item.pattern;
  const previous=family&&output.find(old=>key(old.grammarFamily||old.formula||old.pattern)===key(family));
  if(!previous){output.push(structuredClone(item));continue;}
  const variants=[...(previous.grammarVariants??[]),item,...(item.grammarVariants??[])];
  const known=new Set([key(previous.formula)||key(previous.example)]);
  previous.grammarVariants=variants.filter(variant=>{const identity=key(variant.formula)||key(variant.example);if(known.has(identity))return false;known.add(identity);return true;}).map(({formula,example,exampleVi,exampleIpa,conditions,analysis,commonError,commonErrorIpa,correction,correctionIpa,sourceEvidenceText})=>({formula,example,exampleVi,exampleIpa,conditions,analysis,commonError,commonErrorIpa,correction,correctionIpa,sourceEvidenceText}));
  // Never discard variants beyond the existing per-unit bound.
  if(previous.grammarVariants.length>8)throw new ParentAiError('source-limit');
 }
 return output;
}
export async function analyseWorksheets(photos:{id:string;blob:Blob}[],signature:string,mode:'listed'|'all',signal:AbortSignal,onProgress?:(value:AiProgress)=>void,resume?:MultiCheckpoint,onCheckpoint?:(value:MultiCheckpoint)=>void|Promise<void>,fetcher:typeof fetch=fetch){
 const config=parentAi();if(!config)throw new ParentAiError('missing-key');
 if(!photos.length||photos.length>10)throw new ParentAiError('image');
 const execute=async()=>{
  const state:MultiCheckpoint=resume?.version===1&&resume.signature===signature&&resume.model===config.model&&resume.mode===mode?structuredClone(resume):{version:1,signature,model:config.model,mode,pages:[],chunks:[],grammar:[],complete:false};
  const publish=async()=>{await onCheckpoint?.(structuredClone(state));onProgress?.({stage:'splitting',...multiResult(state)});};
  // No enrichment request occurs before every source image is read.
  for(let i=state.pages.length;i<photos.length;i++){
   const blob=photos[i].blob;if(blob.type!=='image/jpeg'||!blob.size||blob.size>3000000)throw new ParentAiError('image');
   const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let at=0;at<bytes.length;at+=8192)binary+=String.fromCharCode(...bytes.subarray(at,at+8192));
   const imageHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(byte=>byte.toString(16).padStart(2,'0')).join('');
   await recoverWorksheet({config,image:{inlineData:{mimeType:blob.type,data:btoa(binary)}},imageHash,mode,signal,fetcher,scanOnly:true,onCheckpoint:async page=>{state.pages[i]=page;await publish();}});
  }
  if(state.pages.some(page=>page.sourceTruncated))throw new ParentAiError('source-limit');
  // Dedup literal headwords before meaning lookup; include contexts from every photo.
  const targets=new Map<string,{literal:string;word:string;contexts:string[]}>();
  for(const page of state.pages)for(const target of page.wordQueue.flat()){
   const identity=key(target.word),old=targets.get(identity)??{...target,contexts:[]};
   const at=key(page.result.text).indexOf(key(target.literal));const context=page.result.text.slice(Math.max(0,at-100),at+target.literal.length+100);
   if(!old.contexts.includes(context))old.contexts.push(context);targets.set(identity,old);
  }
  const values=[...targets.values()];
  for(let offset=0;offset<values.length;offset+=4){
   const index=offset/4,batch=values.slice(offset,offset+4);
   const initial:WorksheetCheckpoint={version:1,mode,model:config.model,imageHash:state.pages[0].imageHash,sourceTruncated:false,result:{text:batch.map(item=>[item.literal,item.contexts[0]].join('\n')).join('\n\n'),warnings:[],words:[],learning:[]},wordQueue:[batch.map(({literal,word})=>({literal,word}))],learningQueue:[]};
   const checkpoint=state.chunks[index]??initial;
   await recoverWorksheet({config,image:null,imageHash:checkpoint.imageHash,mode,signal,fetcher,checkpoint,skipLearning:true,wordContexts:Object.fromEntries(batch.map(item=>[key(item.word),item.contexts.join('\n')])),onCheckpoint:async chunk=>{state.chunks[index]=chunk;await publish();}});
  }
  const words=state.chunks.flatMap(chunk=>chunk.result.words);
  for(let i=0;i<state.pages.length;i++){
   const page=state.pages[i];
   // Identical source pages share grammar processing; no per-image review/save.
   if(state.pages.slice(0,i).some(old=>key(old.result.text)===key(page.result.text))){state.grammar[i]=null;continue;}
   const seed=words.filter(word=>key(page.result.text).includes(key(word.literal)));if(seed.length>50)throw new ParentAiError('source-limit');
   const initial={...page,wordQueue:[],result:{...page.result,words:seed}};
   await recoverWorksheet({config,image:null,imageHash:page.imageHash,mode,signal,fetcher,checkpoint:state.grammar[i]??initial,onCheckpoint:async chunk=>{state.grammar[i]=chunk;await publish();}});
  }
  state.complete=true;await publish();return multiResult(state);
 };
 if(typeof navigator!=='undefined'&&navigator.locks)return navigator.locks.request('wfk-parent-ai',{ifAvailable:true},async lock=>{if(!lock)throw new ParentAiError('busy');return execute();});
 return execute();
}
