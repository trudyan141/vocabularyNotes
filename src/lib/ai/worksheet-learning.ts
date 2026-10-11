import {grammarFamily} from '@/lib/learning/grammar-family';
import {z} from 'zod';
import {contentSchema,type LearningContent} from '@/data/local/content';
const ipa=z.string().max(2000).regex(/^\/[^<>\r\n\/]+\/$/u).nullable();
export const worksheetLearning=contentSchema.omit({senseId:true,targetRevision:true,approved:true,origin:true,lessonId:true}).extend({word:z.string().min(1).max(200),sourceEvidenceText:z.string().trim().min(1).max(2000),grammarVariants:contentSchema.shape.grammarVariants.unwrap().element.extend({exampleIpa:ipa.optional(),commonErrorIpa:ipa.optional(),correctionIpa:ipa.optional()}).array().max(8).optional(),exampleIpa:ipa,commonErrorIpa:ipa.optional(),correctionIpa:ipa.optional()}).strict();
export type WorksheetLearning=z.infer<typeof worksheetLearning>;
export function reviewedLearning(item:WorksheetLearning):Omit<LearningContent,'senseId'|'targetRevision'>{
 const {word,exampleIpa,commonErrorIpa,correctionIpa,...content}=item;void word;
 return {...content,grammarVariants:content.grammarVariants?.map(v=>({...v,exampleIpa:v.exampleIpa??undefined,commonErrorIpa:v.commonErrorIpa??undefined,correctionIpa:v.correctionIpa??undefined})),exampleIpa:exampleIpa??undefined,commonErrorIpa:commonErrorIpa??undefined,correctionIpa:correctionIpa??undefined,approved:true,origin:'user',source:'AI gợi ý dựa trên chữ gốc; bản dịch, ví dụ học thêm và giải thích do AI bổ sung. Người dùng kiểm và duyệt.'};
}
export function validateLearning(items:WorksheetLearning[],text:string,words:string[]){
 const normalize=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
 for(const item of items){
  if(!normalize(text).includes(normalize(item.sourceEvidenceText))||!words.some(word=>normalize(word)===normalize(item.word)))throw new Error('learning-evidence');
  if(!item.example.trim()||!item.exampleVi.trim()||(item.pattern&&!item.patternExplanation)||(item.grammarTitle&&[item.conditions,item.formula,item.analysis,item.commonError,item.correction].some(value=>!value.trim())))throw new Error('learning-incomplete');
  for(const variant of item.grammarVariants??[]){if(!variant.example.trim()||!variant.exampleVi.trim()||!variant.formula.trim()||!variant.analysis.trim())throw new Error('learning-incomplete');if(variant.sourceEvidenceText&&!normalize(text).includes(normalize(variant.sourceEvidenceText)))throw new Error('learning-evidence');for(const [sentence,phonetic] of [[variant.example,variant.exampleIpa],[variant.commonError,variant.commonErrorIpa],[variant.correction,variant.correctionIpa]])if(phonetic&&(!sentence?.trim()||((sentence.match(/[a-z]+(?:['’][a-z]+)*/gi)??[]).length>1&&phonetic.slice(1,-1).trim().split(/\s+/).length<2)))throw new Error('sentence-ipa');}
  for(const [text,ipa] of [[item.example,item.exampleIpa],[item.commonError,item.commonErrorIpa],[item.correction,item.correctionIpa]]){if(ipa&&(!text?.trim()||((text.match(/[a-z]+(?:['’][a-z]+)*/gi)??[]).length>1&&ipa.slice(1,-1).trim().split(/\s+/).length<2)))throw new Error('sentence-ipa');}
 }
}

export function combineLearningFamilies(items:WorksheetLearning[]){
 const output:WorksheetLearning[]=[];for(const item of items){const family=(item.grammarTitle||item.pattern)?grammarFamily(item.example,item.grammarFamily):undefined;const old=family?output.find(row=>row.word.toLowerCase()===item.word.toLowerCase()&&row.grammarFamily===family):undefined;
 if(old){const variant={formula:item.formula||item.pattern,example:item.example,exampleVi:item.exampleVi,exampleIpa:item.exampleIpa,analysis:item.analysis||item.patternExplanation,conditions:item.conditions,commonError:item.commonError,commonErrorIpa:item.commonErrorIpa,correction:item.correction,correctionIpa:item.correctionIpa,sourceEvidenceText:item.sourceEvidenceText};if(/^is it /i.test(item.example)&&!/^is it /i.test(old.example)){const previous={formula:old.formula||old.pattern,example:old.example,exampleVi:old.exampleVi,exampleIpa:old.exampleIpa,analysis:old.analysis||old.patternExplanation,conditions:old.conditions,commonError:old.commonError,commonErrorIpa:old.commonErrorIpa,correction:old.correction,correctionIpa:old.correctionIpa,sourceEvidenceText:old.sourceEvidenceText};const previousVariants=old.grammarVariants??[];Object.assign(old,item,{grammarFamily:family,grammarVariants:[previous,...previousVariants,...(item.grammarVariants??[])]});}else old.grammarVariants=[...(old.grammarVariants??[]),variant,...(item.grammarVariants??[])];if((old.grammarVariants?.length??0)>8)throw new Error('learning-too-large');}else output.push({...item,...(family?{grammarFamily:family}:{})});
 }return output;
}

// A printed a/an template must not lose its an form in supplementary teaching.
export function validateWorksheetTemplates(items:WorksheetLearning[],text:string){
 if(!/(?:it['’]s|it is)\s+a\s*\/\s*an\b/i.test(text))return;
 const plural=/\bthey are\b/i.test(text);
 const covered=items.some(item=>{
  if(!item.grammarTitle&&!item.pattern)return false;
  const examples=[item.example,...(item.grammarVariants??[]).map(variant=>variant.example)];
  return examples.some(example=>/^(?:it['’]s|it is)\s+a\s+[a-z]/i.test(example))&&examples.some(example=>/^(?:it['’]s|it is)\s+an\s+[a-z]/i.test(example))&&(!plural||examples.some(example=>/^they are\s+[a-z]/i.test(example)));
 });
 if(!covered)throw new Error('learning-template-incomplete');
}
