import {z} from 'zod';
import type {TargetWord,WordFeedback} from './assessment';
import {buildFeedback,canonicalPhone,isSpeakingPhone,phoneFeedback} from './feedback';
import {insertionAdvice} from './articulation';

const phone=z.string().min(1).max(20).refine(isSpeakingPhone);
const resultSchema=z.object({
 schemaVersion:z.literal(2),
 words:z.array(z.object({
  index:z.number().int().min(0).max(19),variantIndex:z.number().int().min(0).max(79),audibility:z.enum(['clear','unclear']),
  phones:z.array(z.object({expected:phone,heard:phone.nullable(),status:z.enum(['match','substitution','missing','uncertain'])}).strict()).min(1).max(80),
  insertions:z.array(z.object({afterIndex:z.number().int().min(-1).max(79),heard:phone}).strict()).max(20),
 }).strict()).min(1).max(20),
}).strict();


export function validTargets(targets:TargetWord[]){
 return targets.length>0&&targets.length<=20&&targets.every(target=>typeof target.text==='string'&&target.text.trim().length>0&&target.text.length<=200&&target.variants.length>0&&target.variants.length<=80&&target.variants.every(variant=>variant.length>0&&variant.length<=80&&variant.every(isSpeakingPhone)));
}

/** Provider evidence is validated before any score, colour or teaching text is derived. */
export function validateAudioAssessment(value:unknown,targets:TargetWord[]):WordFeedback[]{
 const parsed=resultSchema.safeParse(value);
 if(!parsed.success||!validTargets(targets)||parsed.data.words.length!==targets.length||new Set(parsed.data.words.map(word=>word.index)).size!==targets.length)throw new Error('evidence');
 return targets.map((target,index)=>{
  const row=parsed.data.words.find(word=>word.index===index),variant=row&&target.variants[row.variantIndex];
  if(!row||!variant||variant.length!==row.phones.length||row.phones.some((phone,i)=>phone.expected!==variant[i]))throw new Error('evidence');
  for(const phone of row.phones){
   if(phone.status==='match'&&(phone.heard===null||canonicalPhone(phone.heard)!==canonicalPhone(phone.expected)))throw new Error('evidence');
   if(phone.status==='substitution'&&(phone.heard===null||canonicalPhone(phone.heard)===canonicalPhone(phone.expected)))throw new Error('evidence');
   if((phone.status==='missing'||phone.status==='uncertain')&&phone.heard!==null)throw new Error('evidence');
  }
  let previous=-1;
  for(const insertion of row.insertions){if(insertion.afterIndex>=variant.length||insertion.afterIndex<previous)throw new Error('evidence');previous=insertion.afterIndex;}
  const phones=row.phones.map((phone,i)=>phoneFeedback(phone.expected,phone.heard===null?null:canonicalPhone(phone.heard),phone.status,i,variant));
  const insertions=row.insertions.map(insertion=>({...insertion,heard:canonicalPhone(insertion.heard),advice:insertionAdvice}));
  return buildFeedback(index,target.text,phones,insertions,row.audibility);
 });
}
