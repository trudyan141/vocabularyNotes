import {createHash} from 'node:crypto';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {analyseWorksheet,configureParentAi,ParentAiError} from '@/lib/ai/byok';
import {worksheetPassages,type WorksheetCheckpoint} from '@/lib/ai/worksheet-recovery';
import {familyWorksheet} from '../fixtures/family-worksheet';
const key='AIza-test-recovery-canary-123456';
const image=new Blob(['image'],{type:'image/jpeg'});
const word=(text:string)=>({literal:text,word:text,vi:'đồ vật',en:'A familiar object.',pos:'noun',sense:'object',example:`I see ${text}.`,exampleVi:'Con nhìn thấy đồ vật.',exampleIpa:null});
const answer=(data:unknown)=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(data)}]}}]});
const max=()=>Response.json({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{"text":"ball",'}]}}]});
const compact=(words:string[])=>({text:words.join('\n'),warnings:[],words:words.map(text=>({literal:text,word:text})),truncated:false});
beforeEach(()=>{vi.stubGlobal('window',{dispatchEvent:vi.fn()});vi.stubGlobal('localStorage',{getItem:()=>null,setItem:vi.fn(),removeItem:vi.fn()});configureParentAi({key,model:'gemini-3.5-flash-lite'});});
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();vi.restoreAllMocks();});
it('chunked mode starts with compact vision and never sends the full 10k-token prompt',async()=>{
 const labels=['ball','cars','table','box','pens'];const bodies:Record<string,unknown>[]=[];
 const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>{
  const body=JSON.parse(init!.body as string);bodies.push(body);
  if(bodies.length===1){expect(body.generationConfig.maxOutputTokens).toBe(6000);expect(body.contents[0].parts[1]).toHaveProperty('inlineData');return answer(compact(labels));}
  expect(body.contents[0].parts).toHaveLength(1);expect(body.generationConfig.maxOutputTokens).toBeLessThan(10000);
  const input=JSON.parse(body.contents[0].parts[0].text);return answer(input.words[0]?.literal?{words:input.words.map((target:{word:string})=>word(target.word))}:{learning:[]});
 });
 const result=await analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch,undefined,{chunked:true,onCheckpoint:vi.fn()});
 expect(result.words.map(item=>item.word)).toEqual(labels);expect(bodies).toHaveLength(4);
});
it('recovers truncated SSE using one compact image read then bounded sequential text-only batches',async()=>{
 const labels=['ball','cars','table','chairs','rulers','pens','pencil','crayons','eraser','teddy bears','books','box'];
 let active=0,peak=0;const bodies:Record<string,unknown>[]=[];let checkpoint:WorksheetCheckpoint|undefined;
 const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>{
  active++;peak=Math.max(peak,active);const body=JSON.parse(init!.body as string);bodies.push(body);await Promise.resolve();active--;
  if(bodies.length===1)return new Response(`data: ${JSON.stringify({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{"text":"ball"'}]}}]})}\r\n\r\n`,{headers:{'content-type':'text/event-stream'}});
  if(bodies.length===2)return answer(compact(labels));
  const input=JSON.parse(body.contents[0].parts[0].text);
  return answer(input.words[0]?.literal?{words:input.words.map((target:{word:string})=>word(target.word))}:{learning:[]});
 });
 const result=await analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch,undefined,{onCheckpoint:value=>{checkpoint=value;}});
 expect(result.words.map(item=>item.word)).toEqual(labels);expect(peak).toBe(1);expect(bodies).toHaveLength(6);
 expect(JSON.stringify(bodies.slice(2))).not.toContain('inlineData');expect(checkpoint?.wordQueue).toEqual([]);expect(checkpoint?.learningQueue).toEqual([]);
 expect(JSON.stringify(checkpoint)).not.toContain(key);expect(JSON.stringify(checkpoint)).not.toContain('aW1hZ2U=');
 for(const body of bodies.slice(2,5)){const input=JSON.parse((body as {contents:{parts:{text:string}[]}[]}).contents[0].parts[0].text);expect(input.words.length).toBeLessThanOrEqual(4);}
});
it('splits only a failed output batch, preserving all requested words',async()=>{
 let n=0;const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>{
  n++;if(n===1)return max();if(n===2)return answer(compact(['ball','cars','table','box']));
  const input=JSON.parse(JSON.parse(init!.body as string).contents[0].parts[0].text);if(n===3)return max();
  return answer(input.words[0]?.literal?{words:input.words.map((target:{word:string})=>word(target.word))}:{learning:[]});
 });
 const result=await analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch);
 expect(result.words.map(w=>w.word)).toEqual(['ball','cars','table','box']);expect(fetcher).toHaveBeenCalledTimes(6);
});
it('keeps validated chunks on quota failure; reload resumes without rereading image or repeating completed batches',async()=>{
 let checkpoint:WorksheetCheckpoint|undefined;let n=0;
 const first=vi.fn(async(_url:unknown,init?:RequestInit)=>{n++;if(n===1)return max();if(n===2)return answer(compact(['ball','cars','table','box','pens']));if(n===4)return Response.json({error:{status:'RESOURCE_EXHAUSTED'}},{status:429});const input=JSON.parse(JSON.parse(init!.body as string).contents[0].parts[0].text);return answer({words:input.words.map((target:{word:string})=>word(target.word))});});
 await expect(analyseWorksheet(image,'listed',new AbortController().signal,first as typeof fetch,undefined,{onCheckpoint:value=>{checkpoint=value;}})).rejects.toThrow('quota');
 expect(checkpoint?.result.words).toHaveLength(4);expect(checkpoint?.wordQueue.flat().map(w=>w.word)).toEqual(['pens']);expect(first).toHaveBeenCalledTimes(4);
 const restored=JSON.parse(JSON.stringify(checkpoint));const next=vi.fn(async(_url:unknown,init?:RequestInit)=>{const body=JSON.parse(init!.body as string);expect(body.contents[0].parts).toHaveLength(1);const input=JSON.parse(body.contents[0].parts[0].text);return answer(input.words[0]?.literal?{words:input.words.map((target:{word:string})=>word(target.word))}:{learning:[]});});
 const result=await analyseWorksheet(image,'listed',new AbortController().signal,next as typeof fetch,undefined,{checkpoint:restored,onCheckpoint:vi.fn()});expect(result.words).toHaveLength(5);expect(next).toHaveBeenCalledTimes(2);
});
it('repairs invalid supplementary grammar with text-only calls while retaining valid vocabulary and exact source evidence',async()=>{
 const invalid={...familyWorksheet,learning:[{...familyWorksheet.learning[2],analysis:''}]};
 const fetcher=vi.fn().mockResolvedValueOnce(answer(invalid)).mockResolvedValueOnce(answer({learning:familyWorksheet.learning}));
 const result=await analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch);expect(result.learning).toHaveLength(3);expect(result.words).toEqual(familyWorksheet.words);
 const body=JSON.parse(fetcher.mock.calls[1][1].body);expect(body.contents[0].parts).toHaveLength(1);expect(body.systemInstruction.parts[0].text).toContain('ENTIRE exact example');
});
it('rejects invented words in compact read and never saves them',async()=>{
 const checkpoint=vi.fn();const fetcher=vi.fn().mockResolvedValueOnce(max()).mockResolvedValueOnce(answer({...compact(['ball']),text:'book'}));
 await expect(analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch,undefined,{onCheckpoint:checkpoint})).rejects.toThrow('invalid-result');expect(checkpoint).not.toHaveBeenCalled();
});
it('does not treat a missing requested word as a successful batch',async()=>{
 let checkpoint:WorksheetCheckpoint|undefined;const fetcher=vi.fn().mockResolvedValueOnce(max()).mockResolvedValueOnce(answer(compact(['ball']))).mockResolvedValueOnce(answer({words:[]})).mockResolvedValueOnce(answer({words:[]}));
 await expect(analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch,undefined,{onCheckpoint:value=>{checkpoint=value;}})).rejects.toThrow('invalid-result');expect(checkpoint?.wordQueue.flat()).toHaveLength(1);expect(checkpoint?.result.words).toEqual([]);
});
it('keeps a source-limit failure across resume instead of falsely completing truncated input',async()=>{
 let checkpoint:WorksheetCheckpoint|undefined;const fetcher=vi.fn().mockResolvedValueOnce(max()).mockResolvedValueOnce(answer({...compact(['ball']),truncated:true}));
 await expect(analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch,undefined,{onCheckpoint:value=>{checkpoint=value;}})).rejects.toThrow('source-limit');
 const resumed=vi.fn();await expect(analyseWorksheet(image,'listed',new AbortController().signal,resumed as typeof fetch,undefined,{checkpoint,onCheckpoint:vi.fn()})).rejects.toThrow('source-limit');expect(resumed).not.toHaveBeenCalled();
});
it('abort after a checkpoint prevents further provider calls and retains completed data',async()=>{
 const controller=new AbortController();let checkpoint:WorksheetCheckpoint|undefined;const fetcher=vi.fn().mockResolvedValueOnce(max()).mockResolvedValueOnce(answer(compact(['ball'])));
 await expect(analyseWorksheet(image,'listed',controller.signal,fetcher as typeof fetch,undefined,{onCheckpoint:value=>{checkpoint=value;controller.abort();}})).rejects.toThrow();expect(fetcher).toHaveBeenCalledTimes(2);expect(checkpoint?.result.text).toBe('ball');
});
it('bounds long contexts while covering every original character, including dialogue across a boundary',()=>{
 const text=Array.from({length:300},(_,i)=>`${i}. Who are they? They are a family.`).join('\n');const chunks=worksheetPassages(text);expect(chunks.every(s=>s.length<=1400&&text.includes(s))).toBe(true);
 const covered=new Set<number>();for(const chunk of chunks){const start=text.indexOf(chunk);for(let i=start;i<start+chunk.length;i++)covered.add(i);}expect(covered.size).toBe(text.length);
});
it('holds the cross-tab lock for the complete recovery, without calling provider when busy',async()=>{
 const request=vi.fn(async(_name:unknown,_options:unknown,callback:(lock:null)=>unknown)=>callback(null));vi.stubGlobal('navigator',{locks:{request}});const fetcher=vi.fn();await expect(analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch)).rejects.toThrow('busy');expect(fetcher).not.toHaveBeenCalled();
});
it('rejects checkpoints containing invented pending targets before sending their text',async()=>{
 const fetcher=vi.fn();const checkpoint:WorksheetCheckpoint={version:1,mode:'listed',sourceTruncated:false,imageHash:createHash('sha256').update('image').digest('hex'),model:'gemini-3.5-flash-lite',result:{text:'ball',warnings:[],words:[],learning:[]},wordQueue:[[{literal:'secret',word:'secret'}]],learningQueue:[]};
 await expect(analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch,undefined,{checkpoint,onCheckpoint:vi.fn()})).rejects.toBeInstanceOf(ParentAiError);expect(fetcher).not.toHaveBeenCalled();
});
it('reads a newly cropped image instead of resuming a checkpoint for different pixels',async()=>{
 const checkpoint:WorksheetCheckpoint={version:1,mode:'listed',sourceTruncated:false,imageHash:'0'.repeat(64),model:'gemini-3.5-flash-lite',result:{text:'ball',warnings:[],words:[word('ball')],learning:[]},wordQueue:[],learningQueue:[]};
 const fetcher=vi.fn().mockResolvedValue(answer({text:'box',warnings:[],words:[word('box')],learning:[]}));
 const result=await analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch,undefined,{checkpoint,onCheckpoint:vi.fn()});expect(result.words[0].word).toBe('box');const body=JSON.parse(fetcher.mock.calls[0][1].body);expect(body.contents[0].parts[1]).toHaveProperty('inlineData');
});
it('uses compact recovery for a confirmed input-context error and does not retry general HTTP configuration errors',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce(Response.json({error:{status:'INVALID_ARGUMENT',message:'Input token count exceeds the maximum context limit.'}},{status:400})).mockResolvedValueOnce(answer(compact(['ball']))).mockResolvedValueOnce(answer({words:[word('ball')]})).mockResolvedValueOnce(answer({learning:[]}));
 await expect(analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch)).resolves.toMatchObject({words:[{word:'ball'}]});expect(fetcher).toHaveBeenCalledTimes(4);
});
it('classifies an upstream timeout without retrying or exposing a false network success',async()=>{
 const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>new Promise<Response>((_resolve,reject)=>init!.signal!.addEventListener('abort',()=>reject(new DOMException('Timeout','AbortError')))));
 vi.useFakeTimers();vi.spyOn(AbortSignal,'timeout').mockImplementation(ms=>{const controller=new AbortController();setTimeout(()=>controller.abort(),ms);return controller.signal;});const run=analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch);const rejected=expect(run).rejects.toThrow('timeout');
 await vi.waitFor(()=>expect(fetcher).toHaveBeenCalledTimes(1));await vi.advanceTimersByTimeAsync(60001);
 await rejected;
});
it('does not split or retry a failed network request during recovery',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce(max()).mockResolvedValueOnce(answer(compact(['ball','cars','table','box']))).mockRejectedValueOnce(new TypeError('fetch failed'));
 await expect(analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch)).rejects.toThrow('fetch failed');expect(fetcher).toHaveBeenCalledTimes(3);
});
it('repairs a malformed complete content response once without re-uploading its image',async()=>{
 const invalid={...familyWorksheet,learning:[{...familyWorksheet.learning[2],analysis:''}]};
 const fetcher=vi.fn().mockResolvedValueOnce(answer(invalid)).mockResolvedValueOnce(answer({learning:[{...familyWorksheet.learning[2],sourceEvidenceText:'Remember: invented quote'}]})).mockResolvedValueOnce(answer({learning:familyWorksheet.learning}));
 const result=await analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch);expect(result.learning).toHaveLength(3);expect(fetcher).toHaveBeenCalledTimes(3);
 const body=JSON.parse(fetcher.mock.calls[2][1].body);expect(body.contents[0].parts).toHaveLength(1);expect(JSON.parse(body.contents[0].parts[0].text).repair).toContain('sourceEvidenceText');
});
it('continues explicit leftover passages instead of silently stopping at the per-call learning limit',async()=>{
 const text='book\nWhat is it?\nIt is a book.';let checkpoint:WorksheetCheckpoint|undefined;
 const fetcher=vi.fn().mockResolvedValueOnce(answer({text,warnings:[],words:[word('book')],learning:[{example:'invalid'}]})).mockResolvedValueOnce(answer({learning:[],remainingPassages:['What is it?\nIt is a book.']})).mockResolvedValueOnce(answer({learning:[],remainingPassages:[]}));
 const result=await analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch,undefined,{onCheckpoint:value=>{checkpoint=value;}});expect(result.text).toBe(text);expect(fetcher).toHaveBeenCalledTimes(3);expect(checkpoint?.learningQueue).toEqual([]);
});
it('keeps a/an/plural in one unit with exact literal evidence and repairs a missing an form',async()=>{
 const source="ball eraser cars\nIt's a / an ...\nThey are ...";
 const unit={...familyWorksheet.learning[2],word:'ball',grammarFamily:'be-object-number',sourceEvidenceText:"It's a / an ...",example:"It's a ball.",exampleVi:'Đó là một quả bóng.',exampleIpa:null};
 const form=(example:string)=>({example,exampleVi:'Đó là đồ vật.',exampleIpa:null,analysis:'Giải thích thứ tự từ.',commonError:'It ball.',commonErrorIpa:null,correction:example,correctionIpa:null});
 const incomplete={word:'ball',forms:{a:form("It's a ball."),plural:form('They are cars.')}};
 const complete={...incomplete,forms:{...incomplete.forms,an:form("It's an eraser.")}};
 const fetcher=vi.fn().mockResolvedValueOnce(answer({text:source,warnings:[],words:['ball','eraser','cars'].map(word),learning:[unit]})).mockResolvedValueOnce(answer(incomplete)).mockResolvedValueOnce(answer(complete));
 const result=await analyseWorksheet(image,'listed',new AbortController().signal,fetcher as typeof fetch);expect(result.learning).toHaveLength(1);expect(result.learning?.[0]).toMatchObject({grammarFamily:'be-object-number',sourceEvidenceText:"It's a / an ..."});expect(result.learning?.[0].grammarVariants?.map(v=>v.example)).toEqual(["It's an eraser.",'They are cars.']);expect(fetcher).toHaveBeenCalledTimes(3);
 const body=JSON.parse(fetcher.mock.calls[2][1].body);expect(JSON.parse(body.contents[0].parts[0].text).repair).toContain('Do not omit the an form');expect(body.generationConfig.thinkingConfig.thinkingLevel).toBe('low');
 expect(result.learning?.[0].source).toContain('do dự án bổ sung');expect(result.learning?.[0].grammarVariants?.[1].sourceEvidenceText).toBe('They are ...');
});
