import { catalog, type LookupWord } from '@/lib/learning/catalog';
export type OcrCandidate={id:string;literal:string;word:string;vi:string;en:string;pos:string;sense:string;example:string;exampleVi:string;selected:boolean;art:string|null;origin?:'ai_generated'|'user'|'source'};
export function candidates(text:string,mode:'listed'|'all'):OcrCandidate[]{
 const parts=mode==='listed'?text.split(/\r?\n/).map(s=>s.trim()).filter(s=>/^[A-Za-z][A-Za-z '\-]{0,79}$/.test(s)):text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)??[];
 const seen=new Set<string>();const result:OcrCandidate[]=[];
 for(const literal of parts){const key=literal.toLowerCase();if(seen.has(key))continue;seen.add(key);const known:LookupWord|undefined=catalog.find(item=>item.word.toLowerCase()===key);
 result.push({id:`ocr-${result.length}`,literal,word:literal,vi:known?.vi??'',en:known?.en??'',pos:known?.pos??'unknown',sense:known?.sense??'',example:known?.example??'',exampleVi:known?.exampleVi??'',selected:!!known,art:known?.art??null});if(result.length>=100)break;}
 return result;
}
