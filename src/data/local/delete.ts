import Dexie from 'dexie';
import {rebuildSearch} from './database';
import type {LocalRepository} from './repository';
import {RepositoryError} from './repository';
import type {Base} from './types';
export type DeleteTarget={table:'senses'|'decks'|'lessons'|'examples'|'sentences';id:string;version:number;revision?:string;part?:'patterns'|'grammar'};
/** Tombstones preserve history/backup and are consumed by the existing cloud sync. */
export async function deleteItem(repo:LocalRepository,target:DeleteTarget){
 return repo.db.transaction('rw',repo.db.tables,async()=>{
  const table=repo.db.table(target.table),row=await table.get([repo.scope.id,target.id]);
  if(!row||row.deletedAt||row.version!==target.version)throw new RepositoryError('conflict');
  const at=new Date().toISOString();
  const remove=async(name:string,value:Base)=>repo.db.table(name).put({...value,deletedAt:at,updatedAt:at,version:value.version+1});
  if(target.table==='senses'){
   const entry=await repo.db.entries.get([repo.scope.id,row.entryId]);
   if(!entry||entry.deletedAt||`${entry.version}:${row.version}`!==target.revision)throw new RepositoryError('conflict');
   await remove('senses',row);await repo.db.searchIndex.delete([repo.scope.id,row.id]);
   const others=await repo.db.senses.where('[scopeId+entryId]').equals([repo.scope.id,entry.id]).filter(s=>!s.deletedAt).count();
   if(!others){const archived={...entry,deletedAt:at,updatedAt:at,version:entry.version+1};delete archived.activeKey;await repo.db.entries.put(archived);}
  } else if(target.table==='sentences'&&target.part){
   const content={...row.payload.content};
   if(target.part==='patterns'){content.pattern='';content.patternExplanation='';}
   else for(const field of ['grammarTitle','conditions','formula','analysis','commonError','commonErrorIpa','correction','correctionIpa'])content[field]='';
   await table.put({...row,updatedAt:at,version:row.version+1,payload:{...row.payload,content}});
  } else {
   await remove(target.table,row);
   if(target.table==='examples')await rebuildSearch(Dexie.currentTransaction!);
   if(target.table==='lessons'){
    const links=await repo.db.lessonItems.where('[scopeId+lessonId]').equals([repo.scope.id,row.id]).filter(link=>!link.deletedAt).toArray();
    for(const link of links)await remove('lessonItems',link);
    const contents=await repo.db.table('sentences').where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).filter(c=>!c.deletedAt&&c.payload.content?.lessonId===row.id).toArray();
    for(const content of contents)await remove('sentences',content);
    await rebuildSearch(Dexie.currentTransaction!);
   }
  }
 });
}
