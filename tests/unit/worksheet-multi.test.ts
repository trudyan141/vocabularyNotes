import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {configureParentAi} from '@/lib/ai/byok';
import {analyseWorksheets,mergeGrammar,type MultiCheckpoint} from '@/lib/ai/worksheet-multi';
import {familyWorksheet} from '../fixtures/family-worksheet';
const photos=[{id:'one',blob:new Blob(['one'],{type:'image/jpeg'})},{id:'two',blob:new Blob(['two'],{type:'image/jpeg'})}];
const answer=(value:unknown)=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}]});
const word=(word:string)=>({word,literal:word,vi:'đồ vật',en:'An object.',pos:'noun',sense:'object',example:`I see ${word}.`,exampleVi:'Con thấy đồ vật.',exampleIpa:null});
beforeEach(()=>{vi.stubGlobal('window',{dispatchEvent:vi.fn()});vi.stubGlobal('localStorage',{getItem:()=>null,setItem:vi.fn(),removeItem:vi.fn()});configureParentAi({key:'AIza-fixture-multi-123456789',model:'gemini-3.5-flash-lite'});});
afterEach(()=>vi.unstubAllGlobals());
function provider(failAt=0){let calls=0,scans=0;const stages:string[]=[];const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>{calls++;const body=JSON.parse(init!.body as string);expect(body.generationConfig.maxOutputTokens).toBeLessThan(10000);if(calls===failAt)return Response.json({error:{status:'RESOURCE_EXHAUSTED'}},{status:429});if(body.contents[0].parts.some((part:{inlineData?:unknown})=>part.inlineData)){scans++;stages.push('scan');return answer({text:'pear\nbook',warnings:[],words:[{word:'pear',literal:'pear'},{word:'book',literal:'book'}],truncated:false});}const input=JSON.parse(body.contents[0].parts[0].text);if(input.words[0]?.literal){expect(scans).toBe(2);stages.push('meanings');return answer({words:input.words.map((item:{word:string})=>word(item.word))});}stages.push('grammar');return answer({learning:[]});});return {fetcher,stages};}
it('scans every photo before enrichment, dedups words and identical grammar sources, with one common result',async()=>{const {fetcher,stages}=provider();let saved:MultiCheckpoint|undefined;const result=await analyseWorksheets(photos,'same','listed',new AbortController().signal,undefined,undefined,state=>{saved=state;},fetcher as typeof fetch);expect(stages).toEqual(['scan','scan','meanings','grammar']);expect(result.words.map(item=>item.word)).toEqual(['pear','book']);expect(saved?.complete).toBe(true);expect(saved?.pages).toHaveLength(2);expect(JSON.stringify(saved)).not.toContain('AIza');});
it('quota interruption persists all scanned sources, resumes without image uploads or repeated completed chunks',async()=>{const first=provider(3);let checkpoint:MultiCheckpoint|undefined;await expect(analyseWorksheets(photos,'same','listed',new AbortController().signal,undefined,undefined,state=>{checkpoint=state;},first.fetcher as typeof fetch)).rejects.toThrow('quota');expect(checkpoint?.pages).toHaveLength(2);expect(checkpoint?.complete).toBe(false);const next=vi.fn(async(_url:unknown,init?:RequestInit)=>{const body=JSON.parse(init!.body as string);expect(body.contents[0].parts).toHaveLength(1);const input=JSON.parse(body.contents[0].parts[0].text);return answer(input.words[0]?.literal?{words:input.words.map((item:{word:string})=>word(item.word))}:{learning:[]});});const result=await analyseWorksheets(photos,'same','listed',new AbortController().signal,undefined,JSON.parse(JSON.stringify(checkpoint)),undefined,next as typeof fetch);expect(result.words).toHaveLength(2);expect(next).toHaveBeenCalledTimes(2);});
it('changed photo signature invalidates a checkpoint and scans the whole updated source before meanings',async()=>{const first=provider();let checkpoint:MultiCheckpoint|undefined;await analyseWorksheets(photos,'old','listed',new AbortController().signal,undefined,undefined,state=>{checkpoint=state;},first.fetcher as typeof fetch);const next=provider();await analyseWorksheets(photos,'new','listed',new AbortController().signal,undefined,checkpoint,undefined,next.fetcher as typeof fetch);expect(next.stages.slice(0,2)).toEqual(['scan','scan']);});
it('abort after first source keeps that source and makes no meaning request',async()=>{const controller=new AbortController(),{fetcher}=provider();let checkpoint:MultiCheckpoint|undefined;await expect(analyseWorksheets(photos,'same','listed',controller.signal,undefined,undefined,state=>{checkpoint=state;controller.abort();},fetcher as typeof fetch)).rejects.toThrow();expect(checkpoint?.pages).toHaveLength(1);expect(fetcher).toHaveBeenCalledTimes(1);});
it('combines duplicate declared grammar constructions across target words while preserving distinct source sentences',()=>{const grammar=familyWorksheet.learning[2];const result=mergeGrammar([grammar,{...grammar,word:'another'},familyWorksheet.learning[0],familyWorksheet.learning[1]]);expect(result).toHaveLength(3);expect(result[0].grammarVariants?.length??0).toBe(grammar.grammarVariants?.length??0);});
it('retains seventy distinct source words with four-word requests after both image scans',async()=>{
 let scans=0;const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>{const body=JSON.parse(init!.body as string);if(body.contents[0].parts.some((part:{inlineData?:unknown})=>part.inlineData)){const labels=Array.from({length:35},(_,i)=>`item${String.fromCharCode(97+Math.floor((scans*35+i)/26))}${String.fromCharCode(97+(scans*35+i)%26)}`);scans++;return answer({text:labels.join('\n'),warnings:[],words:labels.map(word=>({word,literal:word})),truncated:false});}const input=JSON.parse(body.contents[0].parts[0].text);expect(scans).toBe(2);if(input.words[0]?.literal){expect(input.words.length).toBeLessThanOrEqual(4);return answer({words:input.words.map((item:{word:string})=>word(item.word))});}return answer({learning:[]});});
 const result=await analyseWorksheets(photos,'seventy','listed',new AbortController().signal,undefined,undefined,undefined,fetcher as typeof fetch);expect(new Set(result.words.map(item=>item.word)).size).toBe(70);
});
it('one common headword carries contexts from both images and retains different returned senses',async()=>{
 let scans=0;const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>{const body=JSON.parse(init!.body as string);if(body.contents[0].parts.some((part:{inlineData?:unknown})=>part.inlineData)){const text=scans++?'I sit by the river bank.':'I go to the bank for money.';return answer({text,warnings:[],words:[{word:'bank',literal:'bank'}],truncated:false});}const input=JSON.parse(body.contents[0].parts[0].text);if(input.words[0]?.literal){expect(input.words).toHaveLength(1);expect(input.words[0].context).toContain('money');expect(input.words[0].context).toContain('river');return answer({words:[{...word('bank'),sense:'money'},{...word('bank'),sense:'river'}]});}return answer({learning:[]});});
 const result=await analyseWorksheets(photos,'contexts','listed',new AbortController().signal,undefined,undefined,undefined,fetcher as typeof fetch);expect(result.words.map(item=>item.sense)).toEqual(['money','river']);
});
it('truncated source never proceeds to meanings or reports complete, including resume',async()=>{
 let checkpoint:MultiCheckpoint|undefined;const fetcher=vi.fn(async()=>answer({text:'pear',warnings:['More content'],words:[{word:'pear',literal:'pear'}],truncated:true}));
 await expect(analyseWorksheets(photos,'truncated','listed',new AbortController().signal,undefined,undefined,state=>{checkpoint=state;},fetcher as typeof fetch)).rejects.toThrow('source-limit');expect(checkpoint?.complete).toBe(false);expect(fetcher).toHaveBeenCalledTimes(1);
 const next=vi.fn(async()=>answer({text:'pear',warnings:[],words:[{word:'pear',literal:'pear'}],truncated:false}));await expect(analyseWorksheets(photos,'truncated','listed',new AbortController().signal,undefined,checkpoint,undefined,next as typeof fetch)).rejects.toThrow('source-limit');
});
it('repairs one malformed second scan before enriching the photographed body-part labels',async()=>{
 const labels=[['four fingers','two feet','two legs','one mouth'],['one mouth','two ears','two hands','two legs','two arms','two feet']];
 let scans=0;const stages:string[]=[];let checkpoint:MultiCheckpoint|undefined;
 const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>{
  const body=JSON.parse(init!.body as string);
  if(body.contents[0].parts.some((part:{inlineData?:unknown})=>part.inlineData)){
   stages.push('scan');const index=scans++===0?0:1;
   const scan={text:labels[index].join('\n'),warnings:[],words:labels[index].map(word=>({word,literal:word})),truncated:false};
   if(scans===2){const {truncated,...invalid}=scan;void truncated;return answer(invalid);}
   return answer(scan);
  }
  expect(scans).toBe(3);const input=JSON.parse(body.contents[0].parts[0].text);
  stages.push(input.words[0]?.literal?'meanings':'grammar');return answer(input.words[0]?.literal?{words:input.words.map((item:{word:string})=>word(item.word))}:{learning:[]});
 });
 const result=await analyseWorksheets(photos,'body-parts','listed',new AbortController().signal,undefined,undefined,value=>{checkpoint=value;},fetcher as typeof fetch);
 expect(result.words.map(item=>item.word)).toEqual(['four fingers','two feet','two legs','one mouth','two ears','two hands','two arms']);
 expect(stages).toEqual(['scan','scan','scan','meanings','meanings','grammar','grammar']);expect(checkpoint?.complete).toBe(true);
});
it('accepts wrapped source labels as evidence through enrichment and grammar validation',async()=>{
 const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>{
  const body=JSON.parse(init!.body as string);
  if(body.contents[0].parts.some((part:{inlineData?:unknown})=>part.inlineData))return answer({text:'four\nfingers\ntwo   feet',warnings:[],words:[{word:'four fingers',literal:'four fingers'},{word:'two feet',literal:'two feet'}],truncated:false});
  const input=JSON.parse(body.contents[0].parts[0].text);return answer(input.words[0]?.literal?{words:input.words.map((item:{word:string})=>word(item.word))}:{learning:[]});
 });
 const result=await analyseWorksheets(photos,'wrapped','listed',new AbortController().signal,undefined,undefined,undefined,fetcher as typeof fetch);
 expect(result.words.map(item=>item.word)).toEqual(['four fingers','two feet']);expect(result.text).toContain('four\nfingers');
});
it('bounds repeated malformed scans and resumes only the failed photo with prior source intact',async()=>{
 let saved:MultiCheckpoint|undefined;
 const first=vi.fn().mockResolvedValueOnce(answer({text:'four fingers',warnings:[],words:[{word:'four fingers',literal:'four fingers'}],truncated:false})).mockResolvedValue(answer({text:'two ears',words:[]}));
 await expect(analyseWorksheets(photos,'bounded','listed',new AbortController().signal,undefined,undefined,value=>{saved=value;},first as typeof fetch)).rejects.toThrow('invalid-result');
 expect(first).toHaveBeenCalledTimes(3);expect(saved?.pages).toHaveLength(1);expect(saved?.complete).toBe(false);
 let scans=0;const next=vi.fn(async(_url:unknown,init?:RequestInit)=>{
  const body=JSON.parse(init!.body as string);
  if(body.contents[0].parts.some((part:{inlineData?:unknown})=>part.inlineData)){scans++;return answer({text:'two ears',warnings:[],words:[{word:'two ears',literal:'two ears'}],truncated:false});}
  const input=JSON.parse(body.contents[0].parts[0].text);return answer(input.words[0]?.literal?{words:input.words.map((item:{word:string})=>word(item.word))}:{learning:[]});
 });
 const result=await analyseWorksheets(photos,'bounded','listed',new AbortController().signal,undefined,saved,value=>{saved=value;},next as typeof fetch);
 expect(scans).toBe(1);expect(result.words.map(item=>item.word)).toEqual(['four fingers','two ears']);expect(saved?.complete).toBe(true);
});
it('reads all four shape slides when scan phrases include sentence punctuation and numeric counting labels',async()=>{
 const slides=[{text:"Let's count the number\nof sides...",words:[{literal:'sides',word:'sides'}]},{text:'It has three sides.',words:[{literal:'sides',word:'sides'}]},{text:"Let's count!\n1\n2\n3",words:[{literal:"Let's count!",word:'count'},...['1','2','3'].map(word=>({literal:word,word}))]},{text:'How many sides does a\ntriangle have?',words:[{literal:'sides',word:'sides'},{literal:'triangle',word:'triangle'}]}];
 let scans=0;const stages:string[]=[];let saved:MultiCheckpoint|undefined;
 const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>{const body=JSON.parse(init!.body as string);if(body.contents[0].parts.some((part:{inlineData?:unknown})=>part.inlineData)){stages.push('scan');scans++;const index=Number(atob(body.contents[0].parts.find((part:{inlineData?:unknown})=>part.inlineData).inlineData.data));return answer({...slides[index],warnings:[],truncated:false});}expect(scans).toBe(4);const input=JSON.parse(body.contents[0].parts[0].text);if(input.words[0]?.literal){stages.push('meanings');expect(input.words.find((item:{word:string})=>item.word==='sides').context).toContain('triangle');return answer({words:input.words.map((item:{word:string})=>({...word(item.word),sense:item.word==='sides'?'shape edges':'shape'}))});}stages.push('grammar');return answer({learning:[]});});
 const four=Array.from({length:4},(_,i)=>({id:String(i),blob:new Blob([String(i)],{type:'image/jpeg'})}));
 const result=await analyseWorksheets(four,'shape-slides','listed',new AbortController().signal,undefined,undefined,state=>{saved=state;},fetcher as typeof fetch);
 expect(result.words.map(item=>item.word)).toEqual(['sides',"Let's count",'triangle']);expect(result.text).toContain("Let's count!\n1\n2\n3");expect(saved?.complete).toBe(true);expect(stages).toEqual(['scan','scan','scan','scan','meanings','grammar','grammar','grammar','grammar']);
});
