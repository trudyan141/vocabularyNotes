import {it,expect,vi,afterEach,beforeEach} from 'vitest';
import {validateWorksheet,aiCandidates,configureParentAi,analyseWorksheet,parentKeyStorage,parentModels,parentAi,refreshParentAi} from '@/lib/ai/byok';
const key='AIza'+'test-parent-browser-canary-123456';
const result={text:'pear',warnings:[],words:[{literal:'pear',word:'pear',vi:'quả lê',en:'A sweet fruit.',pos:'noun',sense:'fruit',example:'I eat a pear.',exampleVi:'Con ăn một quả lê.'}]};
const response=()=>({candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'private reasoning'},{text:JSON.stringify(result)}]}}]});
let values:Map<string,string>;
beforeEach(()=>{values=new Map();vi.stubGlobal('window',{dispatchEvent:vi.fn()});vi.stubGlobal('localStorage',{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)});configureParentAi(null);});
afterEach(()=>{vi.unstubAllGlobals();});
it('rejects invented evidence, unsupported fields and substring headwords',()=>{expect(()=>validateWorksheet({...result,text:'apple'})).toThrow();expect(()=>validateWorksheet({...result,script:'run'})).toThrow();expect(()=>validateWorksheet({...result,words:[{...result.words[0],literal:'pineapple',word:'apple'}],text:'pineapple'})).toThrow();expect(aiCandidates(validateWorksheet(result))[0]).toMatchObject({origin:'ai_generated',art:'openmoji-1F350',selected:true});});
it('uses direct Google headers and JPEG structured output; session keys are removable and never put in URLs',async()=>{
 configureParentAi({key,model:'gemini-3.5-flash-lite'},true);expect(values.has(parentKeyStorage)).toBe(true);
 const mock=vi.fn(async()=>Response.json(response()));
 await expect(analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,mock as typeof fetch)).resolves.toEqual(result);
 const [url,init]=mock.mock.calls[0] as unknown as [string,RequestInit];expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:streamGenerateContent?alt=sse');expect(url).not.toContain(key);expect(init.headers).toMatchObject({'x-goog-api-key':key});const body=JSON.parse(init.body as string);expect(body.contents[0].parts[1].inlineData).toMatchObject({mimeType:'image/jpeg',data:btoa('image')});expect(body.generationConfig.responseFormat.text.mimeType).toBe('APPLICATION_JSON');expect(body).not.toHaveProperty('tools');expect(init.credentials).toBe('omit');expect(mock.mock.calls).toHaveLength(1);
 configureParentAi(null);expect(values.has(parentKeyStorage)).toBe(false);await expect(analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,mock as typeof fetch)).rejects.toThrow('missing-key');
});
it.each(parentModels)('calls exactly the selected model $id without a fallback',async model=>{
 configureParentAi({key,model:model.id});expect(values.size).toBe(0);const mock=vi.fn(async()=>Response.json(response()));await analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'all',new AbortController().signal,mock as typeof fetch);expect(mock.mock.calls).toHaveLength(1);expect((mock.mock.calls[0] as unknown[])[0]).toBe(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:streamGenerateContent?alt=sse`);
});
it('rejects old OpenAI keys and model path injection while preserving stored data until explicitly replaced',()=>{
 values.set(parentKeyStorage,JSON.stringify({key:'sk-old-parent-key',model:'gpt-4.1-mini'}));refreshParentAi();expect(parentAi()).toBeNull();expect(values.has(parentKeyStorage)).toBe(true);expect(()=>configureParentAi({key:'sk-old-parent-key',model:'gemini-3.5-flash-lite'})).toThrow();expect(()=>configureParentAi({key,model:'gemini-test/../../secret'})).toThrow();configureParentAi({key,model:'gemini-3.5-flash-lite'},true);expect(parentAi()?.model).toBe('gemini-3.5-flash-lite');
});
it.each([{data:{promptFeedback:{blockReason:'SAFETY'}},code:'refused'},{data:{candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{}'}]}}]},code:'response'},{data:{candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({...result,text:'apple'})}]}}]},code:'evidence'}])('handles blocked, truncated or invented results without success',async({data,code})=>{
 configureParentAi({key,model:'gemini-3.5-flash-lite'});const mock=vi.fn(async()=>Response.json(data));await expect(analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,mock as typeof fetch)).rejects.toThrow(code);expect(mock.mock.calls).toHaveLength(1);
});
it.each([{status:400,code:'key',error:{details:[{reason:'API_KEY_INVALID'}]}},{status:400,code:'configuration',error:{}},{status:404,code:'model',error:{}},{status:429,code:'quota',error:{}}])('handles provider status $status as $code without leaking raw errors or retrying',async({status,code,error})=>{
 configureParentAi({key,model:'gemini-3.5-flash-lite'});const mock=vi.fn(async()=>Response.json({error:{...error,message:`secret ${key}`}},{status}));await expect(analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,mock as typeof fetch)).rejects.toThrow(new RegExp(`^${code}$`));expect(mock.mock.calls).toHaveLength(1);
});

it('accepts Google authorization key formats without requiring the legacy AIza prefix',()=>{configureParentAi({key:'AQ.'+'authorization-test-canary-123456',model:'gemini-3.5-flash-lite'},true);refreshParentAi();expect(parentAi()?.model).toBe('gemini-3.5-flash-lite');});

it('streams complete words before completion across split UTF-8/SSE frames without exposing thoughts',async()=>{
 configureParentAi({key,model:'gemini-3.5-flash-lite'});
 let controller!:ReadableStreamDefaultController<Uint8Array>;
 const body=new ReadableStream<Uint8Array>({start(value){controller=value;}});
 const encode=new TextEncoder();const updates:import('@/lib/ai/byok').AiProgress[]=[];
 const run=analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,vi.fn(async()=>new Response(body,{headers:{'content-type':'text/event-stream'}})) as typeof fetch,value=>updates.push(value));
 const raw=JSON.stringify(result);const prefix=raw.slice(0,-2);
 const frame=`: heartbeat\r\ndata: ${JSON.stringify({candidates:[{content:{parts:[{thought:true,text:'secret thought'},{text:prefix}]}}]})}\r\n\r\n`;
 const bytes=encode.encode(frame);for(let i=0;i<bytes.length;i++)controller.enqueue(bytes.slice(i,i+1));
 await vi.waitFor(()=>expect(updates.at(-1)?.words).toHaveLength(1));expect(updates.at(-1)?.text).toBe('pear');expect(JSON.stringify(updates)).not.toContain('secret thought');
 controller.enqueue(encode.encode(`data: ${JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:raw.slice(-2)}]}}]})}\n\n`));controller.close();await expect(run).resolves.toEqual(result);expect(updates.at(-1)?.stage).toBe('validating');
});
it.each(['truncated','refused','oversized','cancelled'])('discards %s streams and releases the reader',async kind=>{
 configureParentAi({key,model:'gemini-3.5-flash-lite'});const abort=new AbortController();let cancelled=false;
 const body=new ReadableStream<Uint8Array>({start(controller){if(kind==='cancelled')return;controller.enqueue(new TextEncoder().encode(kind==='oversized'?'x'.repeat(500001):`data: ${JSON.stringify({candidates:[{...(kind==='refused'?{finishReason:'SAFETY'}:{}),content:{parts:[{text:JSON.stringify(result)}]}}]})}\n\n`));if(kind!=='oversized')controller.close();},cancel(){cancelled=true;}});
 const run=analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',abort.signal,vi.fn(async()=>new Response(body,{headers:{'content-type':'text/event-stream'}})) as typeof fetch);
 if(kind==='cancelled'){await new Promise(resolve=>setTimeout(resolve,5));abort.abort();}
 await expect(run).rejects.toThrow();if(kind==='cancelled'||kind==='oversized')expect(cancelled).toBe(true);
});

it('retains Google HTTP/status/field diagnostics but never credentials, metadata or long image payloads',async()=>{
 configureParentAi({key,model:'gemini-3.5-flash-lite'});
 const mock=vi.fn(async()=>Response.json({error:{status:'INVALID_ARGUMENT',message:`Unknown name responseFormat; credential ${key}; data ${'a'.repeat(500)}; consumer projects/1234567890`,details:[{reason:'INVALID_ARGUMENT',metadata:{credential:key},fieldViolations:[{field:'generation_config.responseFormat',description:`Unknown field; credential ${key}`}]}]}},{status:400}));
 const error=await analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,mock as typeof fetch).catch(e=>e);
 expect(error.code).toBe('configuration');expect(error.details).toMatchObject({http:400,status:'INVALID_ARGUMENT',model:'gemini-3.5-flash-lite'});expect(error.details.fields[0]).toContain('Unknown field');const displayed=JSON.stringify(error);expect(displayed).not.toContain(key);expect(displayed).not.toContain('1234567890');expect(displayed).not.toContain('a'.repeat(500));expect(displayed).not.toContain('metadata');expect(displayed).toContain('responseFormat');
});
it('distinguishes free-tier preconditions and preserves HTTP status even for non-JSON errors',async()=>{
 configureParentAi({key,model:'gemini-3.5-flash-lite'});
 const first=await analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,vi.fn(async()=>Response.json({error:{status:'FAILED_PRECONDITION',message:'Free tier not available in your country.'}},{status:400})) as typeof fetch).catch(e=>e);expect(first.code).toBe('precondition');expect(first.details.message).toContain('Free tier');
 const second=await analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,vi.fn(async()=>new Response(`<html>${key}</html>`,{status:502})) as typeof fetch).catch(e=>e);expect(second.details.http).toBe(502);expect(JSON.stringify(second)).not.toContain(key);
});
