import {Dexie} from 'dexie';
import {z} from 'zod';
import {LocalRepository} from '@/data/local/repository';
import {LibraryDatabase,rebuildSearch} from '@/data/local/database';
import type {ScopedDocument} from '@/data/local/types';
import {cloudTables,parseCloudRow,type PullTable} from '@/lib/cloud/contracts';
import {contentHash} from '@/domain/identity';
import {reScope,shareContextSchema,sharedScopeId,SharingError,type ShareContext,type ShareSelection} from '@/lib/sharing';
import {remoteTransactions} from './notifications';

import {shareCall,activeShareKey} from './share-api';
export {shareCall,activeShareKey,selectedShare} from './share-api';
export async function openSharedRepository(db:LibraryDatabase,selection:ShareSelection,isCurrent=()=>true){
 const context=shareContextSchema.parse(await shareCall({action:'context',kind:selection.kind,id:selection.id}));
 if(!isCurrent())throw new SharingError('context-changed');
 const scope={kind:'shared' as const,id:sharedScopeId(context),ownerId:context.ownerId,libraryId:context.libraryId,access:context};
 const repo=new LocalRepository(db,scope);
 const recoveryKey=`share-device-last:${context.ownerId}:${context.libraryId}`;
 if(context.kind==='device'){
  const previous=await db.metadata.get(recoveryKey);
  if(previous&&previous.value!==scope.id){
   const pending=await db.outbox.get([previous.value,'share-pending']);
   let dirty=!!pending;
   for(const entity of learningTables){for(const row of await db.table(entity).where('[scopeId+id]').between([previous.value,''],[previous.value,'\uffff']).toArray()){const baseline=(await db.table<ScopedDocument>('transferCheckpoints').get([previous.value,baselineKey(entity,String(row.id))]))?.payload;const hash=await contentHash(reScope(parseCloudRow(entity,row),sourceScope(context)));if(hash!==baseline?.hash)dirty=true;}}
   if(dirty){
    await db.transaction('rw',[db.outbox,db.table<ScopedDocument>('transferCheckpoints'),...learningTables.map(name=>db.table(name))],async()=>{
     remoteTransactions.add(Dexie.currentTransaction!);
     for(const entity of learningTables){
      const rows=await db.table(entity).where('[scopeId+id]').between([previous.value,''],[previous.value,'\uffff']).toArray();
      for(const row of rows){
       await db.table(entity).put(reScope(row,scope.id));
       const checkpoint=await db.table<ScopedDocument>('transferCheckpoints').get([previous.value,baselineKey(entity,String(row.id))]);
       if(checkpoint)await db.table<ScopedDocument>('transferCheckpoints').put(reScope(checkpoint,scope.id));
      }
     }
     if(pending)await db.outbox.put(reScope(pending,scope.id));
     await db.outbox.delete([previous.value,'share-pending']);
    });
   }
  }
  const held=await db.outbox.where('[scopeId+id]').between([previous?.value??scope.id,'share-held:'],[previous?.value??scope.id,'share-held:\uffff']).toArray();for(const row of held)await db.outbox.put(reScope(row,scope.id));
  await db.metadata.put({key:recoveryKey,value:scope.id});
 }
 if(!isCurrent())throw new SharingError('context-changed');
 await db.metadata.delete('share-choice-reset');
 await db.metadata.put({key:activeShareKey,value:JSON.stringify({kind:context.kind,id:context.id})});
 try{await sharedEngine(repo).synchronize();}catch(error){if(!(error instanceof SharingError)||!['progress-conflict','content-changed'].includes(error.code))throw error;}
 return repo;
}
export const learningTables=['practiceSessions','reviewEvents','gameAttempts'] as const;
type LearningTable=typeof learningTables[number];
type Pending={operationId:string;items:{entity:LearningTable;baseVersion:number;row:Record<string,unknown>}[]};
const snapshotSchema=z.object({context:shareContextSchema,snapshotId:z.uuid(),watermark:z.number().int().nonnegative(),page:z.number().int().nonnegative(),pages:z.number().int().positive(),items:z.array(z.object({entity:z.enum([...cloudTables,'reviewStates']),id:z.string().max(200),version:z.number().int().positive(),row:z.unknown()}).strict()).max(100)}).strict();
type Snapshot=z.infer<typeof snapshotSchema>;
const baselineKey=(entity:string,id:string)=>`share-baseline:${entity}:${id}`;
const sourceScope=(ctx:ShareContext)=>`account:${ctx.ownerId}:${ctx.libraryId}`;
function record(scopeId:string,id:string,payload:Record<string,unknown>):ScopedDocument{const at=new Date().toISOString();return {scopeId,id,payload,version:1,createdAt:at,updatedAt:at,deletedAt:null};}
export class SharedSync {
 private running:Promise<void>|null=null;
 constructor(readonly repo:LocalRepository){if(repo.scope.kind!=='shared')throw new SharingError('invalid-context');}
 private context(){if(this.repo.scope.kind!=='shared')throw new SharingError('invalid-context');return this.repo.scope.access;}
 private selection(){const {kind,id}=this.context();return {kind,id};}
 synchronize(){if(this.running)return this.running;this.running=this.run().finally(()=>{this.running=null;});return this.running;}
 ensurePending(){return this.prepare();}
 async keepPendingAndReload(){
  if(this.running)await this.running.catch(()=>{});
  const {repo}=this,scope=repo.scope.id;
  await repo.db.transaction('rw',repo.db.tables,async()=>{
   remoteTransactions.add(Dexie.currentTransaction!);
   const saved:Record<string,unknown[]>={};
   for(const entity of learningTables){saved[entity]=await repo.db.table(entity).where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray();}
   const pending=await repo.db.outbox.get([scope,'share-pending']);
   await repo.db.outbox.put(record(scope,`share-held:${crypto.randomUUID()}`,{records:saved,packet:pending?.payload??null}));
   for(const entity of learningTables)await repo.db.table(entity).where('[scopeId+id]').between([scope,''],[scope,'\uffff']).delete();
   await repo.db.outbox.delete([scope,'share-pending']);
   await repo.db.table<ScopedDocument>('transferCheckpoints').delete([scope,'share-watermark']);
  });
  await this.synchronize();
 }
 private async prepare(){
  const repo=this.repo,scope=repo.scope.id,context=this.context();
  return repo.db.transaction('rw',[...learningTables.map(name=>repo.db.table(name)),repo.db.outbox,repo.db.table<ScopedDocument>('transferCheckpoints')],async()=>{
   if(await repo.db.outbox.get([scope,'share-pending']))return true;
   const items:Pending['items']=[];let bytes=0;
   scan:for(const entity of learningTables){
    const rows=await repo.db.table(entity).where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray();
    for(const raw of rows){
     const row=parseCloudRow(entity,raw),id=String(row.id);
     const baseline=(await repo.db.table<ScopedDocument>('transferCheckpoints').get([scope,baselineKey(entity,id)]))?.payload;
     const hash=await Dexie.waitFor(contentHash(reScope(row,sourceScope(context))));
     if(hash===baseline?.hash)continue;
     const size=new TextEncoder().encode(JSON.stringify(row)).length;
     if(size>1_800_000)throw new SharingError('item-too-large');
     if(items.length===100||bytes+size>1_800_000)break scan;
     items.push({entity,baseVersion:Number(baseline?.remoteVersion??0),row});bytes+=size;
    }
   }
   if(!items.length)return false;
   await repo.db.outbox.put(record(scope,'share-pending',{operationId:crypto.randomUUID(),items}));return true;
  });
 }
 private async flush(){
  const repo=this.repo,scope=repo.scope.id,context=this.context();
  const pending=await repo.db.outbox.get([scope,'share-pending']);if(!pending)return;
  const packet=pending.payload as unknown as Pending;
  const result=await shareCall<{accepted:{entity:string;id:string;version:number}[]}>({action:'progress',...this.selection(),...packet});
  const names={practiceSessions:'practice_sessions',reviewEvents:'review_events',gameAttempts:'game_attempts'};
  if(result.accepted.length!==packet.items.length)throw new SharingError('invalid-receipt');
  await repo.db.transaction('rw',repo.db.outbox,repo.db.table<ScopedDocument>('transferCheckpoints'),async()=>{
   for(const item of packet.items){
    const ack=result.accepted.find(row=>row.id===item.row.id&&row.entity===names[item.entity]);if(!ack)throw new SharingError('invalid-receipt');
    const hash=await Dexie.waitFor(contentHash(reScope(item.row,sourceScope(context))));
    await repo.db.table<ScopedDocument>('transferCheckpoints').put(record(scope,baselineKey(item.entity,String(item.row.id)),{hash,remoteVersion:ack.version}));
   }
   const current=await repo.db.outbox.get([scope,'share-pending']);if(current?.payload.operationId===packet.operationId)await repo.db.outbox.delete([scope,'share-pending']);
  });
 }
 private async pull(){
  const repo=this.repo,scope=repo.scope.id,context=this.context();
  const marker=z.object({context:shareContextSchema,watermark:z.number().int().nonnegative()}).strict().parse(await shareCall({action:'watermark',...this.selection()}));
  if(marker.context.id!==context.id||marker.context.libraryId!==context.libraryId)throw new SharingError('invalid-context');
  const previous=await repo.db.table<ScopedDocument>('transferCheckpoints').get([scope,'share-watermark']);
  if(previous?.payload.value===marker.watermark)return;
  const first=snapshotSchema.parse(await shareCall({action:'snapshot',...this.selection()}));
  const pages:Snapshot[]=[first];
  for(let page=1;page<first.pages;page++)pages.push(snapshotSchema.parse(await shareCall({action:'page',...this.selection(),snapshotId:first.snapshotId,page})));
  if(pages.some((page,index)=>page.page!==index||page.snapshotId!==first.snapshotId||page.context.id!==context.id||page.context.libraryId!==context.libraryId||page.watermark!==first.watermark||page.pages!==first.pages))throw new SharingError('invalid-snapshot');
  if(!repo.canPractice)throw new SharingError('session-expired');
  const incoming=pages.flatMap(page=>page.items).map(item=>{
   const row=parseCloudRow(item.entity,item.row);
   if(row.id!==item.id||row.scopeId!==sourceScope(context))throw new SharingError('invalid-scope');
   return {...item,row:reScope(row,scope)};
  });
  await repo.db.transaction('rw',repo.db.tables,async()=>{
   remoteTransactions.add(Dexie.currentTransaction!);
   const byTable=new Map<PullTable,typeof incoming>();for(const item of incoming){const rows=byTable.get(item.entity)??[];rows.push(item);byTable.set(item.entity,rows);}
   for(const entity of [...cloudTables,'reviewStates'] as PullTable[]){
    if(entity==='evidence')continue;
    const rows=byTable.get(entity)??[],ids=new Set(rows.map(row=>row.id)),table=repo.db.table(entity);
    if(!learningTables.includes(entity as LearningTable)){
     const existing=await table.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).primaryKeys();
     await table.bulkDelete(existing.filter(key=>!ids.has(String((key as string[])[1]))));
    }
    for(const item of rows){
     const old=await table.get([scope,item.id]);const baseline=(await repo.db.table<ScopedDocument>('transferCheckpoints').get([scope,baselineKey(entity,item.id)]))?.payload;
     const hash=await Dexie.waitFor(contentHash(reScope(item.row,sourceScope(context))));
     if(learningTables.includes(entity as LearningTable)&&old){
      const localHash=await Dexie.waitFor(contentHash(reScope(parseCloudRow(entity,old),sourceScope(context))));
      if(localHash!==baseline?.hash&&localHash!==hash)continue;
     }
     await table.put(item.row);
     await repo.db.table<ScopedDocument>('transferCheckpoints').put(record(scope,baselineKey(entity,item.id),{hash,remoteVersion:item.version}));
    }
   }
   await rebuildSearch(Dexie.currentTransaction!);
   await repo.db.table<ScopedDocument>('transferCheckpoints').put(record(scope,'share-watermark',{value:first.watermark}));
  });
 }
 private async run(){
  try{
   if(!this.repo.canPractice)throw new SharingError('session-expired');
   let conflict:SharingError|null=null;
   try{
    await this.flush();
    for(let batch=0;batch<100;batch++){if(!await this.prepare())break;await this.flush();}
   }catch(error){if(error instanceof SharingError&&['progress-conflict','content-changed'].includes(error.code))conflict=error;else throw error;}
   await this.pull();
   if(conflict)throw conflict;
   await this.repo.db.table<ScopedDocument>('transferCheckpoints').put(record(this.repo.scope.id,'share-status',{status:'saved',syncedAt:new Date().toISOString()}));
  }catch(error){
   if(error instanceof SharingError&&['session-expired','access-revoked'].includes(error.code))this.repo.accessValid=false;
   await this.repo.db.table<ScopedDocument>('transferCheckpoints').put(record(this.repo.scope.id,'share-status',{status:'error',code:error instanceof SharingError?error.code:'sharing-unavailable'})).catch(()=>{});
   throw error;
  }
 }
}
const engines=new WeakMap<LocalRepository,SharedSync>();
export function sharedEngine(repo:LocalRepository){let engine=engines.get(repo);if(!engine){engine=new SharedSync(repo);engines.set(repo,engine);}return engine;}
