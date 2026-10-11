import {remapGroup,type Deck} from '@/data/local/decks';
import type {LocalRepository} from '@/data/local/repository';
import type {ScopedDocument} from '@/data/local/types';
import {cloudTables,parseCloudRow,type PullTable} from '@/lib/cloud/contracts';
import {SyncError} from './sync';

// Called inside the pull transaction, before inserting the remote identity.
// Only an unpublished local identity may move; accepted history never changes IDs.
export async function reconcileIdentity(repo:LocalRepository,entity:PullTable,remote:Record<string,unknown>){
 if(!['entries','senses'].includes(entity)||remote.deletedAt)return;
 const table=repo.db.table<Record<string,unknown>>(entity),scope=repo.scope.id;
 const rows=await table.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray();
 const duplicate=rows.find(row=>row.id!==remote.id&&!row.deletedAt&&(entity==='entries'?row.canonicalKey===remote.canonicalKey&&row.caseMode===remote.caseMode:row.entryId===remote.entryId&&row.identity===remote.identity));
 if(!duplicate)return;
 const checkpoints=repo.db.table<ScopedDocument>('transferCheckpoints');
 if(await checkpoints.get([scope,`baseline:${entity}:${duplicate.id}`]))throw new SyncError('duplicate');
 const oldId=String(duplicate.id),newId=String(remote.id);
 for(const name of cloudTables){
  const references=await repo.db.table<Record<string,unknown>>(name).where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray();
  for(const original of references){
   const row=structuredClone(original);let changed=false;
   const replace=(field:string)=>{if(row[field]===oldId){row[field]=newId;changed=true;}};
   if(entity==='entries'&&(name==='senses'||name==='lessonItems'))replace('entryId');
   if(entity==='senses'){
    if(['examples','lessonItems','reviewEvents'].includes(name))replace('senseId');
    if(name==='notes'&&row.targetType==='sense')replace('targetId');
    const payload=row.payload as Record<string,unknown>|undefined;
    if(name==='decks'&&payload){const deck=payload.deck as Deck;if(deck.senseIds.includes(oldId)){deck.senseIds=[...new Set(deck.senseIds.map(id=>id===oldId?newId:id))];if(deck.group){deck.group=remapGroup(deck.group,id=>id===oldId?newId:id);}changed=true;}}
    if(name==='mediaAssets'&&payload){const asset=payload.asset as {senseId:string};if(asset.senseId===oldId){asset.senseId=newId;changed=true;}}
    if(name==='sentences'&&payload){const content=payload.content as {senseId:string};if(content.senseId===oldId){content.senseId=newId;changed=true;}}
    if(name==='gameAttempts'&&payload?.senseId===oldId){payload.senseId=newId;changed=true;}
    if(name==='practiceSessions'&&payload){const session=payload.session as {questions:{word:{id:string};choices:{id:string}[]}[]};for(const question of session.questions)for(const word of [question.word,...question.choices])if(word.id===oldId){word.id=newId;changed=true;}}
   }
   if(changed){if(await checkpoints.get([scope,`baseline:${name}:${original.id}`]))throw new SyncError('duplicate');if(name==='sentences'&&original.id===`extra-${oldId}`){row.id=`extra-${newId}`;await repo.db.table(name).delete([scope,String(original.id)]);}await repo.db.table(name).put(parseCloudRow(name,row));}
  }
 }
 await table.delete([scope,oldId]);
 if(entity==='senses'){
  if(await checkpoints.get([scope,`baseline:reviewStates:${oldId}`]))throw new SyncError('duplicate');
  await repo.db.table('reviewStates').delete([scope,oldId]);
 }
 // Lexeme metadata can be shared when the spelling matches. Sense content is
 // retained under the cloud ID so normal conflict review compares both versions.
 if(entity==='senses'||duplicate.displayText!==remote.displayText)await table.put(parseCloudRow(entity,{...duplicate,id:newId}));
 const at=new Date().toISOString();await checkpoints.put({scopeId:scope,id:`alias:${entity}:${oldId}`,version:1,createdAt:at,updatedAt:at,deletedAt:null,payload:{id:newId}});
}
