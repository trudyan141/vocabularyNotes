import type {LocalRepository} from '@/data/local/repository';
import {PracticeRepository} from '@/data/local/practice';
import type {PracticeFilter} from './practice-filter';
import type {ShadowRow} from '@/data/local/shadowing';
import {extensionHash,wordExtensionSource} from './extensions';
export type ShadowLevel='basic'|'B1'|'B2';
export type ShadowSentence={id:string;text:string;vi:string;level:ShadowLevel;source:string;baseText?:string;familyId?:string};
export function eligibleShadowSentence(text:string){const words=text.match(/[a-z]+(?:['’][a-z]+)*/gi)??[];return words.length>=2&&words.length<=24&&text.length<=220&&!/[<>\[\]{}]/.test(text)&&!text.includes('…');}
const samples=[{base:'I can jump.',vi:'Con có thể nhảy.',B1:'I can jump over the line without touching it.',B1vi:'Con có thể nhảy qua vạch mà không chạm vào nó.',B2:'I can jump over the line confidently, even when the space is limited.',B2vi:'Con có thể tự tin nhảy qua vạch, ngay cả khi không gian hạn chế.'},{base:'The apple is red.',vi:'Quả táo màu đỏ.',B1:'The apple is red, with a few lighter patches on its skin.',B1vi:'Quả táo màu đỏ, với vài mảng nhạt hơn trên vỏ.',B2:'The apple is red, although its colour is not entirely uniform.',B2vi:'Quả táo màu đỏ, mặc dù màu sắc không hoàn toàn đồng đều.'}];
export function shadowSamplePool(level:ShadowLevel):ShadowSentence[]{return samples.map((s,i)=>({id:`sample:${level}:${i}`,familyId:`sample:${i}`,baseText:s.base,text:level==='basic'?s.base:s[level],vi:level==='basic'?s.vi:level==='B1'?s.B1vi:s.B2vi,level,source:'sample'}));}
export function linkedShadowLines(rows:ShadowRow[],level:ShadowLevel,baseText?:string){return rows.flatMap(row=>row.payload.levels.filter(l=>l.level===level).flatMap(l=>l.sentences.flatMap((s,i)=>{if(row.payload.decisions[`${level}:${i}`]!=='approved'||!eligibleShadowSentence(s.text))return [];if(level!=='basic'&&(row.payload.promptVersion!==2||!s.baseText||baseText!==undefined&&s.baseText!==baseText))return [];return [{id:`${row.id}:${row.version}:${level}:${i}`,familyId:row.payload.senseId,baseText:s.baseText??s.text,text:s.text,vi:s.vi,level,source:row.id}];})));}
export async function shadowPool(repo:LocalRepository,filter:PracticeFilter,level:ShadowLevel,baseText?:string,familyId?:string):Promise<ShadowSentence[]>{
 const words=await new PracticeRepository(repo).speakingWords(filter),scope=repo.scope.id,result:ShadowSentence[]=[];
 if(level==='basic'){
 // Use the same primary example as the prepared family. Grammar cards can contain
 // noun phrases, and additional examples have no upgrade in this per-sense bundle.
 for(const word of words)if(eligibleShadowSentence(word.example))result.push({id:`${word.id}:${word.revision}:primary`,familyId:word.id,baseText:word.example,text:word.example,vi:word.exampleVi,level,source:word.id});
 if(!result.length){const grammar=await new PracticeRepository(repo).shadowGrammar(filter);for(const g of grammar)if(eligibleShadowSentence(g.example)&&/[.!?]$/.test(g.example.trim()))result.push({id:`grammar:${g.id}:${g.version}:${g.example}`,familyId:g.id,baseText:g.example,text:g.example,vi:g.exampleVi,level,source:g.id});}
 }
 const generated=await repo.db.table<ShadowRow>('shadowingContent').where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray();const valid:ShadowRow[]=[];
 for(const row of generated){const word=words.find(w=>w.id===row.payload.senseId);if(row.deletedAt||!word||row.payload.status!=='ready'||familyId&&row.payload.senseId!==familyId||await extensionHash(wordExtensionSource(word))!==row.payload.sourceHash)continue;valid.push(row);}
 result.push(...linkedShadowLines(valid,level,baseText));
 const seen=new Set<string>();const unique=result.filter(s=>{const key=`${s.familyId}:${s.text.normalize('NFKC').trim().toLowerCase()}`;if(seen.has(key))return false;seen.add(key);return true;});
 // Samples are an entry path only when there are no basic library sentences.
 // Switching an existing sentence to B1/B2 must never silently change its topic.
 return unique.length?unique:level==='basic'?shadowSamplePool(level):familyId?.startsWith('sample:')?shadowSamplePool(level).filter(s=>s.familyId===familyId&&s.baseText===baseText):[];
}

/** Pending material is reviewable in place, never silently admitted to the game. */
export async function pendingShadowUpgrades(repo:LocalRepository,filter:PracticeFilter,level:Exclude<ShadowLevel,'basic'>,baseText:string,familyId:string){
 const word=(await new PracticeRepository(repo).speakingWords(filter)).find(w=>w.id===familyId);if(!word)return [];
 const row=await repo.db.table<ShadowRow>('shadowingContent').get([repo.scope.id,`shadow:${familyId}`]);
 if(!row||row.deletedAt||row.payload.status!=='ready'||row.payload.promptVersion!==2||row.payload.senseId!==familyId||await extensionHash(wordExtensionSource(word))!==row.payload.sourceHash)return [];
 return row.payload.levels.filter(l=>l.level===level).flatMap(l=>l.sentences.flatMap((line,index)=>line.baseText===baseText&&eligibleShadowSentence(line.text)&&!row.payload.decisions[`${level}:${index}`]?[{row,line,index}]:[]));
}
