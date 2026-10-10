import {it,expect,vi,afterEach} from 'vitest';
import {validateWorksheet,aiCandidates,configureParentAi,analyseWorksheet,parentKeyStorage} from '@/lib/ai/byok';
const result={text:'pear',warnings:[],words:[{literal:'pear',word:'pear',vi:'quả lê',en:'A sweet fruit.',pos:'noun',sense:'fruit',example:'I eat a pear.',exampleVi:'Con ăn một quả lê.'}]};
afterEach(()=>{vi.unstubAllGlobals();});
it('rejects invented evidence, unsupported fields and substring headwords',()=>{expect(()=>validateWorksheet({...result,text:'apple'})).toThrow();expect(()=>validateWorksheet({...result,script:'run'})).toThrow();expect(()=>validateWorksheet({...result,words:[{...result.words[0],literal:'pineapple',word:'apple'}],text:'pineapple'})).toThrow();expect(aiCandidates(validateWorksheet(result))[0]).toMatchObject({origin:'ai_generated',art:'openmoji-1F350',selected:true});});
it('uses a direct fixed endpoint with no application-server calls or automatic retry; keys can be removed',async()=>{
 const values=new Map<string,string>();vi.stubGlobal('window',{dispatchEvent:vi.fn()});vi.stubGlobal('localStorage',{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)});
 configureParentAi({key:'sk-test-parent-canary',model:'gpt-4.1-mini'},true);expect(values.has(parentKeyStorage)).toBe(true);
 const mock=vi.fn(async()=>Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(result)}]}]}));
 await analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,mock as typeof fetch);
 expect(mock.mock.calls).toHaveLength(1);const [url,init]=mock.mock.calls[0] as unknown as [string,RequestInit];expect(url).toBe('https://api.openai.com/v1/responses');expect(JSON.parse(init.body as string).store).toBe(false);expect(init.credentials).toBe('omit');
 configureParentAi(null);expect(values.has(parentKeyStorage)).toBe(false);await expect(analyseWorksheet(new Blob(['image'],{type:'image/jpeg'}),'listed',new AbortController().signal,mock as typeof fetch)).rejects.toThrow('missing-key');
});
