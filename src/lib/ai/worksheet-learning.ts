import {z} from 'zod';
import {contentSchema,type LearningContent} from '@/data/local/content';
const ipa=z.string().max(2000).regex(/^\/[^<>\r\n\/]+\/$/u).nullable();
export const worksheetLearning=contentSchema.omit({senseId:true,targetRevision:true,approved:true,origin:true,lessonId:true}).extend({word:z.string().min(1).max(200),sourceEvidenceText:z.string().trim().min(1).max(2000),exampleIpa:ipa,commonErrorIpa:ipa.optional(),correctionIpa:ipa.optional()}).strict();
export type WorksheetLearning=z.infer<typeof worksheetLearning>;
export function reviewedLearning(item:WorksheetLearning):Omit<LearningContent,'senseId'|'targetRevision'>{
 const {word,exampleIpa,commonErrorIpa,correctionIpa,...content}=item;void word;
 return {...content,exampleIpa:exampleIpa??undefined,commonErrorIpa:commonErrorIpa??undefined,correctionIpa:correctionIpa??undefined,approved:true,origin:'user',source:'AI gợi ý dựa trên chữ gốc; bản dịch, ví dụ học thêm và giải thích do AI bổ sung. Người dùng kiểm và duyệt.'};
}
export function validateLearning(items:WorksheetLearning[],text:string,words:string[]){
 const normalize=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
 for(const item of items){
  if(!normalize(text).includes(normalize(item.sourceEvidenceText))||!words.some(word=>normalize(word)===normalize(item.word)))throw new Error('learning-evidence');
  if(!item.example.trim()||!item.exampleVi.trim()||(item.pattern&&!item.patternExplanation)||(item.grammarTitle&&[item.conditions,item.formula,item.analysis,item.commonError,item.correction].some(value=>!value.trim())))throw new Error('learning-incomplete');
  for(const [text,ipa] of [[item.example,item.exampleIpa],[item.commonError,item.commonErrorIpa],[item.correction,item.correctionIpa]]){if(ipa&&(!text?.trim()||((text.match(/[a-z]+(?:['’][a-z]+)*/gi)??[]).length>1&&ipa.slice(1,-1).trim().split(/\s+/).length<2)))throw new Error('sentence-ipa');}
 }
}
