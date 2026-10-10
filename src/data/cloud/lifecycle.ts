import type {LocalRepository} from '@/data/local/repository';
export async function clearAccountCache(repo:LocalRepository,owner:string){
 if(!/^[a-f0-9-]{36}$/.test(owner))throw new Error('scope');
 await repo.db.transaction('rw',repo.db.tables,async()=>{
  const libraries=await repo.db.libraries.toArray();const scopes=libraries.filter(library=>library.scope.kind==='account'&&library.scope.ownerId===owner).map(library=>library.scopeId);
  for(const table of repo.db.tables){if(['metadata','libraries'].includes(table.name))continue;for(const scope of scopes)await table.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).delete();}
  await repo.db.libraries.bulkDelete(libraries.filter(library=>scopes.includes(library.scopeId)).map(library=>library.id));
  await repo.db.metadata.put({key:'chosen-local-library',value:'guest'});
 });
}
export function notifySignOut(){window.dispatchEvent(new Event('wfk-auth-changed'));if('BroadcastChannel' in window){const channel=new BroadcastChannel('wfk-auth');channel.postMessage('changed');channel.close();}}
