import {createHash} from 'node:crypto';
import {it,expect,vi} from 'vitest';
import {readFileSync,writeFileSync} from 'node:fs';
import {analyseWorksheet,configureParentAi} from '@/lib/ai/byok';
it('supplied worksheet retains listed phrase and all a/an/plural forms after cutoff recovery',async()=>{
 const pasted=readFileSync('/Users/trunglk/.codex/attachments/70167dbb-9d67-49fd-8945-f95e2d919301/Pasted text.txt','utf8');const key=pasted.match(/-H 'x-goog-api-key: ([^']+)'/)![1];const resume=process.env.WFK_LIVE_RESUME==='1';const original=JSON.parse(pasted.match(/--data-raw '(.*)'/s)![1]);
 vi.stubGlobal('window',{dispatchEvent:vi.fn()});vi.stubGlobal('localStorage',{getItem:()=>null,setItem:vi.fn(),removeItem:vi.fn()});configureParentAi({key,model:'gemini-3.5-flash-lite'});
 let calls=0;const summaries:unknown[]=[];
 const fetcher=async(url:RequestInfo|URL,init?:RequestInit)=>{
  calls++;if(!resume&&calls===1)return Response.json({candidates:[{finishReason:'MAX_TOKENS'}]});
  const response=await fetch(url,init),raw=await response.text();writeFileSync('/tmp/wfk-last-live-stream.txt',raw);let usage:unknown={};let finish='';
  for(const line of raw.split(/\r?\n/)){if(!line.startsWith('data:'))continue;const data=JSON.parse(line.slice(5));usage=data.usageMetadata??usage;finish=data.candidates?.[0]?.finishReason??finish;}
  const body=JSON.parse(init!.body as string);summaries.push({http:response.status,finish,usage,image:body.contents[0].parts.some((p:{inlineData?:unknown})=>!!p.inlineData),requestCharacters:(init!.body as string).length});return new Response(raw,{status:response.status,headers:response.headers});
 };
 try{
  const bytes=Buffer.from(original.contents[0].parts[1].inlineData.data,'base64');const base=JSON.parse(readFileSync('/tmp/wfk-recovered-result.json','utf8'));base.learning=[];const seed={version:1 as const,mode:'listed' as const,sourceTruncated:false,imageHash:createHash('sha256').update(bytes).digest('hex'),model:'gemini-3.5-flash-lite',result:base,wordQueue:[],learningQueue:[base.text]};const checkpoint=resume?JSON.parse(readFileSync('/tmp/wfk-live-checkpoint.json','utf8')):seed;const result=await analyseWorksheet(new Blob([bytes],{type:'image/jpeg'}),'listed',AbortSignal.timeout(300000),fetcher,undefined,{checkpoint:resume?checkpoint:undefined,onCheckpoint:value=>writeFileSync('/tmp/wfk-live-checkpoint.json',JSON.stringify(value))});
  writeFileSync('/tmp/wfk-recovered-result-final.json',JSON.stringify(result,null,2));writeFileSync('docs/evaluations/worksheet-recovery-2026-10-12/live-metadata.json',JSON.stringify({simulatedInitialCutoff:true,realCalls:calls-(resume?0:1),resumedTextOnly:resume,summaries,words:result.words.map(w=>w.word),learning:result.learning?.map(item=>({example:item.example,formula:item.formula,sourceEvidenceText:item.sourceEvidenceText,variants:item.grammarVariants?.map(v=>v.example)}))},null,2));
  for(const label of ['ball','cars','table','chairs','rulers','pens','pencil','crayons','eraser','teddy bears','books','box'])expect(result.words.map(w=>w.word)).toContain(label);const examples=(result.learning??[]).flatMap(item=>[item.example,...(item.grammarVariants??[]).map(v=>v.example)]);expect(examples.some(s=>/It's a /i.test(s))).toBe(true);expect(examples.some(s=>/It's an /i.test(s))).toBe(true);expect(examples.some(s=>/They are /i.test(s))).toBe(true);
 }catch(e){writeFileSync('/tmp/wfk-recovery-live-error-final.txt',JSON.stringify({code:e instanceof Error?e.message:'unknown',calls:calls-(resume?0:1),summaries}));throw new Error(`live recovery failed, metadata saved, calls=${calls-1}`);}finally{vi.unstubAllGlobals();}
},310000);
