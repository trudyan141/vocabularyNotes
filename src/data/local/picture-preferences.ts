import type {LocalRepository} from './repository';
import {RepositoryError} from './repository';
// A scoped device preference: does not change the word, its approval or revision.
const key=(repo:LocalRepository)=>`picture-skips:${repo.scope.id}`;
export async function skippedPictures(repo:LocalRepository):Promise<string[]>{
 const row=await repo.db.metadata.get(key(repo));if(!row)return [];
 const ids:unknown=JSON.parse(row.value);if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string'))throw new RepositoryError('invalid');return ids;
}
export async function skipPicture(repo:LocalRepository,id:string,revision:string){
 await repo.db.transaction('rw',repo.db.tables,async()=>{
  const word=await repo.word(id);if(!word||word.revision!==revision||!word.approved)throw new RepositoryError('conflict');
  const ids=await skippedPictures(repo);await repo.db.metadata.put({key:key(repo),value:JSON.stringify([...new Set([...ids,id])])});
 });
}
