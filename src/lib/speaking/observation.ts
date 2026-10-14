import {z} from 'zod';
import type {TargetWord,PhoneFeedback,InsertionFeedback} from './assessment';
import {validTargets} from './contract';
import {canonicalPhone,isSpeakingPhone,isNearSubstitution,speakingPhoneInventory,buildFeedback,phoneFeedback} from './feedback';
import {insertionAdvice} from './articulation';

const token=z.string().refine(value=>value==='?'||isSpeakingPhone(value));
const schema=z.object({schemaVersion:z.literal(3),words:z.array(z.object({index:z.number().int().min(0).max(19),audibility:z.enum(['clear','unclear']),heard:z.array(token).max(100)}).strict()).min(1).max(20)}).strict();
/** The model observes. Code owns reference alignment and all scoring decisions. */
export function validateObservation(value:unknown,targets:TargetWord[]){
 const parsed=schema.safeParse(value);
 if(!parsed.success||!validTargets(targets)||parsed.data.words.length!==targets.length||new Set(parsed.data.words.map(row=>row.index)).size!==targets.length)throw new Error('observation');
 return targets.map((target,index)=>{
  const row=parsed.data.words.find(row=>row.index===index);if(!row)throw new Error('observation');
  const expected=target.variants[0];
  if(row.audibility==='unclear'||!row.heard.length)return buildFeedback(index,target.text,expected.map((phone,i)=>phoneFeedback(phone,null,'uncertain',i,expected)),[],'unclear');
  const heard=row.heard.map(canonicalPhone);
  const candidates=target.variants.map(expected=>{
  // Half credit for near substitutions, a full cost for omission/insertion/gross.
  const cost=Array.from({length:expected.length+1},()=>new Uint16Array(heard.length+1));
  for(let i=0;i<=expected.length;i++)cost[i][0]=i*2;
  for(let j=0;j<=heard.length;j++)cost[0][j]=j*2;
  const substitution=(i:number,j:number)=>canonicalPhone(expected[i])===heard[j]?0:isNearSubstitution(expected[i],heard[j])?1:2;
  for(let i=1;i<=expected.length;i++)for(let j=1;j<=heard.length;j++)cost[i][j]=Math.min(cost[i-1][j]+2,cost[i][j-1]+2,cost[i-1][j-1]+substitution(i-1,j-1));
  const phones:PhoneFeedback[]=[],insertions:InsertionFeedback[]=[];let i=expected.length,j=heard.length;
  while(i||j){
   if(i&&j&&cost[i][j]===cost[i-1][j-1]+substitution(i-1,j-1)){
    const sound=heard[j-1];phones.unshift(phoneFeedback(expected[i-1],sound==='?'?null:sound,sound==='?'?'uncertain':substitution(i-1,j-1)===0?'match':'substitution',i-1,expected));i--;j--;
   }else if(i&&cost[i][j]===cost[i-1][j]+2){phones.unshift(phoneFeedback(expected[i-1],null,'missing',i-1,expected));i--;}
   else{insertions.unshift({afterIndex:i-1,heard:heard[j-1],advice:insertionAdvice});j--;}
  }
  return {cost:cost[expected.length][heard.length],feedback:buildFeedback(index,target.text,phones,insertions,'clear')};
  });
  candidates.sort((a,b)=>a.cost-b.cost);return candidates[0].feedback;
 });
}
/** Plain JSON Schema; no zod refinements, nullable dialect or mirrored expected/status fields. */
export function observationProviderSchema(targets:TargetWord[]){
 return {type:'object',properties:{schemaVersion:{type:'integer',enum:[3]},words:{type:'array',minItems:targets.length,maxItems:targets.length,items:{type:'object',properties:{index:{type:'integer',minimum:0,maximum:targets.length-1},audibility:{type:'string',enum:['clear','unclear']},heard:{type:'array',maxItems:100,items:{type:'string',enum:[...speakingPhoneInventory,'ɡ','ɹ','?']}}},required:['index','audibility','heard'],additionalProperties:false}}},required:['schemaVersion','words'],additionalProperties:false};
}
