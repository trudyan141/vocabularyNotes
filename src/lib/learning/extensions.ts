import {z} from 'zod';
import {contentHash} from '@/domain/identity';
const line=z.string().trim().min(1).max(2000),optionalLine=z.string().trim().max(2000).nullable();
export const extensionSourceSchema=z.object({kind:z.enum(['sense','grammar']),word:z.string().min(1).max(200),pos:z.string().max(60),sense:z.string().max(1000),definition:z.string().max(1000),meaningVi:z.string().max(1000),example:z.string().max(2000),formula:z.string().max(2000),conditions:z.string().max(2000),variants:z.array(z.object({formula:z.string().max(2000),example:z.string().max(2000)}).strict()).max(8)}).strict();
export type ExtensionSource=z.infer<typeof extensionSourceSchema>;
export const extensionSuggestionSchema=z.object({text:line,meaningVi:line,relation:z.enum(['near_synonym','collocation','reformulation','idea_expansion']),usageVi:line,differenceVi:line,formula:optionalLine,conditionsVi:optionalLine,analysisVi:optionalLine,commonError:optionalLine,correction:optionalLine,examples:z.array(z.object({text:line,vi:line,ipa:optionalLine}).strict()).length(2)}).strict();
export type ExtensionSuggestion=z.infer<typeof extensionSuggestionSchema>;
export const extensionLevelSchema=z.object({level:z.enum(['B1','B2']),status:z.enum(['available','no_suggestion','needs_context']),reasonVi:z.string().max(2000),suggestions:z.array(extensionSuggestionSchema).max(2)}).strict();
export const extensionResultSchema=z.object({levels:z.array(extensionLevelSchema).length(2)}).strict();
export type ExtensionResult=z.infer<typeof extensionResultSchema>;
export function validateExtensionResult(value:unknown,kind:ExtensionSource['kind']):ExtensionResult{
 const parsed=extensionResultSchema.parse(value);
 if(new Set(parsed.levels.map(l=>l.level)).size!==2)throw new Error('extension-levels');
 for(const level of parsed.levels){if((level.status==='available')!==!!level.suggestions.length||level.status!=='available'&&!level.reasonVi.trim())throw new Error('extension-status');
 for(const s of level.suggestions){if(s.examples[0].text===s.examples[1].text)throw new Error('extension-examples');if(kind==='grammar'&&[s.formula,s.conditionsVi,s.analysisVi,s.commonError,s.correction].some(v=>!v?.trim()))throw new Error('extension-grammar');for(const example of s.examples)if(example.ipa&&!/^\/[^<>\r\n\/]+\/$/u.test(example.ipa))throw new Error('extension-ipa');}}
 return parsed;
}
export const extensionPayloadSchema=z.object({kind:z.enum(['sense','grammar']),targetId:z.string().min(1).max(200),senseId:z.string().min(1).max(200),source:extensionSourceSchema,sourceHash:z.string().regex(/^[a-f0-9]{64}$/),model:z.string().min(1).max(100),promptVersion:z.literal(1),result:extensionResultSchema.nullable(),error:z.string().max(100).nullable(),decisions:z.record(z.string(),z.enum(['approved','rejected'])),edited:z.boolean(),jobId:z.string().max(200).optional()}).strict();
export type ExtensionPayload=z.infer<typeof extensionPayloadSchema>;
export type ExtensionDraft={key:string;source:ExtensionSource;sourceHash:string;model:string;promptVersion:1;result:ExtensionResult|null;error:string|null};
export const extensionDraftSchema=z.object({key:z.string().min(1).max(200),source:extensionSourceSchema,sourceHash:z.string().regex(/^[a-f0-9]{64}$/),model:z.string().max(100),promptVersion:z.literal(1),result:extensionResultSchema.nullable(),error:z.string().max(100).nullable()}).strict();
export const extensionId=(kind:ExtensionSource['kind'],targetId:string)=>`extension-${kind}:${targetId}`;
export const extensionHash=(source:ExtensionSource)=>contentHash(extensionSourceSchema.parse(source));
export function wordExtensionSource(word:{word:string;pos:string;sense:string;en:string;vi:string;example:string}):ExtensionSource{return {kind:'sense',word:word.word,pos:word.pos,sense:word.sense,definition:word.en,meaningVi:word.vi,example:word.example,formula:'',conditions:'',variants:[]};}
export function grammarExtensionSource(word:{word:string;pos:string;sense:string;en:string;vi:string},content:{example:string;formula:string;conditions:string;grammarVariants?:{formula:string;example:string}[]}):ExtensionSource{return {...wordExtensionSource({...word,example:content.example}),kind:'grammar',formula:content.formula,conditions:content.conditions,variants:(content.grammarVariants??[]).map(({formula,example})=>({formula,example}))};}
