import {Dexie} from 'dexie';
import type {LocalRepository} from './repository';
import {RepositoryError} from './repository';
import type {ScopedDocument} from './types';
import type {LearningContent} from './content';
import {extensionPayloadSchema,extensionId,extensionHash,wordExtensionSource,grammarExtensionSource,validateExtensionResult,type ExtensionPayload,type ExtensionDraft,type ExtensionSource} from '@/lib/learning/extensions';
export type ExtensionRow=Omit<ScopedDocument,'payload'>&{payload:ExtensionPayload};
export async function currentExtensionSource(repo:LocalRepository,kind:ExtensionSource['kind'],targetId:string){
 if(kind==='sense'){const word=await repo.word(targetId);return word?{senseId:word.id,source:wordExtensionSource(word)}:null;}
 const row=await repo.db.table<ScopedDocument>('sentences').get([repo.scope.id,targetId]);if(!row||row.deletedAt)return null;
 const content=row.payload.content as LearningContent,word=await repo.word(content.senseId);if(!word||content.targetRevision!==word.revision)return null;
 return {senseId:word.id,source:grammarExtensionSource(word,content)};
}
export async function saveExtensionProposal(repo:LocalRepository,kind:ExtensionSource['kind'],targetId:string,draft:ExtensionDraft,jobId?:string){
 repo.assertContentWritable();
 return repo.db.transaction('rw',repo.db.tables,async()=>{
  const current=await currentExtensionSource(repo,kind,targetId);if(!current)return false;
  const hash=await Dexie.waitFor(extensionHash(current.source));if(hash!==draft.sourceHash||draft.source.kind!==kind)return false;
  const table=repo.db.table<ExtensionRow>('learningExtensions'),id=extensionId(kind,targetId),old=await table.get([repo.scope.id,id]);
  if(old&&(old.deletedAt||old.payload.edited||Object.keys(old.payload.decisions).length||old.payload.sourceHash===hash&&old.payload.result))return false;
  if(draft.result)validateExtensionResult(draft.result,kind);
  const now=new Date().toISOString();const payload=extensionPayloadSchema.parse({kind,targetId,senseId:current.senseId,source:current.source,sourceHash:hash,model:draft.model,promptVersion:1,result:draft.result,error:draft.error,decisions:{},edited:false,...(jobId?{jobId}:{})});
  await table.put({scopeId:repo.scope.id,id,version:(old?.version??0)+1,createdAt:old?.createdAt??now,updatedAt:now,deletedAt:null,payload});return true;
 });
}
export async function editExtension(repo:LocalRepository,id:string,version:number,result:ExtensionPayload['result'],decisions:ExtensionPayload['decisions']){
 repo.assertContentWritable();return repo.db.transaction('rw',repo.db.tables,async()=>{
 const table=repo.db.table<ExtensionRow>('learningExtensions'),old=await table.get([repo.scope.id,id]);if(!old||old.deletedAt||old.version!==version||!result)throw new RepositoryError('conflict');
 const current=await currentExtensionSource(repo,old.payload.kind,old.payload.targetId);if(!current||await Dexie.waitFor(extensionHash(current.source))!==old.payload.sourceHash)throw new RepositoryError('conflict');
 const checked=validateExtensionResult(result,old.payload.kind);const payload=extensionPayloadSchema.parse({...old.payload,result:checked,decisions,edited:true,error:null});
 for(const key of Object.keys(decisions))if(!checked.levels.some(l=>l.suggestions.some((_,i)=>`${l.level}:${i}`===key)))throw new RepositoryError('invalid');
 await table.put({...old,payload,version:old.version+1,updatedAt:new Date().toISOString()});
 });
}
export async function extensionTargets(repo:LocalRepository){
 const senses=await repo.db.senses.where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray();
 const targets:{key:string;kind:ExtensionSource['kind'];targetId:string;source:ExtensionSource}[]=[];
 const eligible=senses.filter(s=>!s.deletedAt&&s.learningApprovalStatus==='approved'&&s.contentVersion===s.approvedContentVersion);
 const words=await repo.words(eligible.map(s=>s.id)),byId=new Map(words.map(w=>[w.id,w]));
 for(const word of words)targets.push({key:extensionId('sense',word.id),kind:'sense',targetId:word.id,source:wordExtensionSource(word)});
 const rows=await repo.db.table<ScopedDocument>('sentences').where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray();
 for(const row of rows){const content=row.payload.content as LearningContent,word=byId.get(content?.senseId);if(row.deletedAt||!content?.approved||!content.grammarTitle&&!content.pattern||!word||content.targetRevision!==word.revision)continue;targets.push({key:extensionId('grammar',row.id),kind:'grammar',targetId:row.id,source:grammarExtensionSource(word,content)});}
 return targets;
}
export async function runExtensionJob(repo:LocalRepository,signal:AbortSignal,onProgress?:(done:number,total:number)=>void){
 repo.assertContentWritable();const {prepareLearningExtensions}=await import('@/lib/ai/learning-extensions');const targets=await extensionTargets(repo),jobId=`extensions:${crypto.randomUUID()}`;let done=0;
 const prior:ExtensionDraft[]=[];for(const target of targets){const old=await repo.db.table<ExtensionRow>('learningExtensions').get([repo.scope.id,target.key]);if(old&&(old.deletedAt||old.payload.edited||Object.keys(old.payload.decisions).length||old.payload.result&&old.payload.sourceHash===await extensionHash(target.source))){done++;continue;}prior.push({key:target.key,source:target.source,sourceHash:await extensionHash(target.source),model:'pending',promptVersion:1,result:null,error:null});}
 onProgress?.(done,targets.length);
 const pending=targets.filter(t=>prior.some(p=>p.key===t.key));
 await prepareLearningExtensions(pending,signal,[],async drafts=>{for(const draft of drafts){const target=pending.find(t=>t.key===draft.key)!;await saveExtensionProposal(repo,target.kind,target.targetId,draft,jobId);}onProgress?.(done+drafts.length,targets.length);});
 return {total:targets.length,jobId};
}
