import {deleteItem} from './delete';
import {RepositoryError,type LocalRepository} from './repository';
import {saveContent,type LearningContent} from './content';
import {saveMedia,validateMedia} from './media';
import type {MediaAsset} from '@/lib/media/contracts';
import type {ScopedDocument,WordInput} from './types';
export type ContentSnapshot={id:string;version:number;content:LearningContent};
/** One explicit save, one transaction. A failed field/media/CAS write rolls everything back. */
export async function updateWord(repo:LocalRepository,id:string,revision:string,input:WordInput,snapshots:ContentSnapshot[],extra:LearningContent|null,prepared?:MediaAsset|null){
 const image=prepared?await validateMedia(prepared):null;
 if(image&&(image.senseId!==id||image.revision!==revision||image.word!==input.word))throw new RepositoryError('conflict');
 return repo.db.transaction('rw',repo.db.tables,async()=>{
  const current=await repo.word(id);if(!current||current.revision!==revision)throw new RepositoryError('conflict');
  const table=repo.db.table<ScopedDocument>('sentences');
  for(const snapshot of snapshots){const row=await table.get([repo.scope.id,snapshot.id]);if(!row||row.deletedAt||row.version!==snapshot.version)throw new RepositoryError('conflict');}
  // Do not let a concurrently created supplemental row silently escape the editor's snapshot.
  const linked=(await table.where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray()).filter(row=>!row.deletedAt&&(row.payload.content as LearningContent)?.senseId===id);
  if(linked.some(row=>!snapshots.some(snapshot=>snapshot.id===row.id)))throw new RepositoryError('conflict');
  let saved=await repo.reviewWord(id,revision,{...input,art:image?null:input.art});if(!saved)throw new RepositoryError('missing');
  if(image){await saveMedia(repo,{...image,word:saved.word,revision:saved.revision});saved=(await repo.word(id))!;}
  const rows:ContentSnapshot[]=[];
  for(const snapshot of snapshots){
   if(extra===null&&snapshot.id===`extra-${id}`){await deleteItem(repo,{table:'sentences',id:snapshot.id,version:snapshot.version});continue;}
   if(snapshot.content.targetRevision!==revision&&!(extra&&snapshot.id===`extra-${id}`)){rows.push(snapshot);continue;}
   const content=extra&&snapshot.id===`extra-${id}`?extra:snapshot.content;
   const row=await saveContent(repo,snapshot.id,snapshot.version,{...content,senseId:id,targetRevision:saved.revision});
   rows.push({id:row.id,version:row.version,content:row.payload.content as LearningContent});
  }
  if(extra&&!snapshots.some(snapshot=>snapshot.id===`extra-${id}`)){
   const row=await saveContent(repo,`extra-${id}`,null,{...extra,senseId:id,targetRevision:saved.revision});rows.push({id:row.id,version:row.version,content:row.payload.content as LearningContent});
  }
  return {word:saved,rows};
 });
}
