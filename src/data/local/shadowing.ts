import {Dexie} from 'dexie';
import type {LocalRepository} from './repository';
import {RepositoryError} from './repository';
import type {ScopedDocument} from './types';
import {shadowPayloadSchema,shadowContentId,type ShadowPayload} from '@/lib/learning/shadowing-content';
import {extensionHash,wordExtensionSource} from '@/lib/learning/extensions';
export const shadowManualJobs=new Set<string>();
export type ShadowRow=Omit<ScopedDocument,'payload'>&{payload:ShadowPayload};
/** Runs inside the content transaction. Queue only; no network can block Save. */
export async function queueShadow(repo:LocalRepository,senseId:string){
 if(repo.scope.kind==='shared'||repo.scope.kind==='demo')return;
 const word=await repo.word(senseId);if(!word?.approved)return;
 const source=wordExtensionSource(word),hash=await Dexie.waitFor(extensionHash(source)),table=repo.db.table<ShadowRow>('shadowingContent'),old=await table.get([repo.scope.id,shadowContentId(senseId)]);
 if(old&&(old.deletedAt||old.payload.sourceHash===hash&&old.payload.promptVersion===2||old.payload.edited||Object.keys(old.payload.decisions).length))return;
 const now=new Date().toISOString();await table.put({scopeId:repo.scope.id,id:shadowContentId(senseId),version:(old?.version??0)+1,createdAt:old?.createdAt??now,updatedAt:now,deletedAt:null,payload:{kind:'sense',targetId:senseId,senseId,source,sourceHash:hash,model:'pending',promptVersion:2,levels:([{level:'basic',sentences:[],reason:''},{level:'B1',sentences:[],reason:''},{level:'B2',sentences:[],reason:''}]),decisions:{},edited:false,status:'queued',error:null}});
}
export async function enqueueShadowLibrary(repo:LocalRepository){repo.assertContentWritable();const senses=await repo.db.senses.where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray();for(const sense of senses.filter(s=>!s.deletedAt))await repo.db.transaction('rw',repo.db.tables,()=>queueShadow(repo,sense.id));}
export async function saveShadowResult(repo:LocalRepository,row:ShadowRow,payload:ShadowPayload){repo.assertContentWritable();return repo.db.transaction('rw',repo.db.tables,async()=>{const table=repo.db.table<ShadowRow>('shadowingContent'),old=await table.get([repo.scope.id,row.id]),word=await repo.word(row.payload.senseId);if(!old||old.deletedAt||old.version!==row.version||!word||await Dexie.waitFor(extensionHash(wordExtensionSource(word)))!==row.payload.sourceHash)throw new RepositoryError('conflict');const checked=shadowPayloadSchema.parse(payload);if(checked.senseId!==old.payload.senseId||checked.sourceHash!==old.payload.sourceHash)throw new RepositoryError('invalid');await table.put({...old,payload:checked,version:old.version+1,updatedAt:new Date().toISOString()});});}
