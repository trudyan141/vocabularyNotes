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
 const [url,init]=mock.mock.calls[0] as unknown as [string,RequestInit];expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent');expect(url).not.toContain(key);expect(init.headers).toMatchObject({'x-goog-api-key':key});const body=JSON.parse(init.body as string);expect(body.contents[0].parts[1].inlineData).toMatchObject({mimeType:'image/jpeg',data:btoa('image')});expect(body.generationConfig.responseFormat.text.mimeType).toBe('application/json');expect(body).not.toHaveProperty('tools');expect(init.credentials).toBe('omit');expect(mock.mock.calls).toHaveLength(1);
 configureParentAi(null);expect(values.has(parentKeyStorage)).toBe(false);await expect(analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,mock as typeof fetch)).rejects.toThrow('missing-key');
});
it.each(parentModels)('calls exactly the selected model $id without a fallback',async model=>{
 configureParentAi({key,model:model.id});expect(values.size).toBe(0);const mock=vi.fn(async()=>Response.json(response()));await analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'all',new AbortController().signal,mock as typeof fetch);expect(mock.mock.calls).toHaveLength(1);expect((mock.mock.calls[0] as unknown[])[0]).toBe(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent`);
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
