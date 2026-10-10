import {z} from 'zod';
import type {LocalRepository} from './repository';
import {RepositoryError} from './repository';
import type {ScopedDocument} from './types';
const line=z.string().trim().max(2000);
export const contentSchema=z.object({senseId:z.string().min(1).max(100),targetRevision:z.string().max(100),example:line,exampleVi:line,readingHintVi:line,pattern:line,patternExplanation:line,grammarTitle:line,conditions:line,formula:line,analysis:line,commonError:line,correction:line,approved:z.literal(true),origin:z.literal('user')}).strict();
export type LearningContent=z.infer<typeof contentSchema>;
export async function saveContent(repo:LocalRepository,id:string,expectedVersion:number|null,input:LearningContent){const parsed=contentSchema.parse(input);if(!parsed.example||!parsed.exampleVi||(parsed.pattern&&!parsed.patternExplanation)||(parsed.grammarTitle&&[parsed.conditions,parsed.formula,parsed.analysis,parsed.commonError,parsed.correction].some(v=>!v)))throw new RepositoryError('invalid');return repo.db.transaction('rw',repo.db.tables,async()=>{const word=await repo.word(parsed.senseId);if(!word||word.revision!==parsed.targetRevision)throw new RepositoryError('conflict');const table=repo.db.table<ScopedDocument>('sentences'),old=await table.get([repo.scope.id,id]);if((old?.version??null)!==expectedVersion)throw new RepositoryError('conflict');const at=new Date().toISOString();const row={scopeId:repo.scope.id,id,createdAt:old?.createdAt??at,updatedAt:at,deletedAt:null,version:(old?.version??0)+1,payload:{content:parsed}};await table.put(row);return row;});}
