import {Dexie} from 'dexie';
import {z} from 'zod';
import type {LocalRepository} from '@/data/local/repository';
import {RepositoryError} from '@/data/local/repository';
import type {ShadowRow} from '@/data/local/shadowing';
import {parseCloudRow} from '@/lib/cloud/contracts';
import {extensionHash,wordExtensionSource} from '@/lib/learning/extensions';
import {contentHash} from '@/domain/identity';
import {remoteTransactions} from './notifications';
const pageSchema=z.object({rows:z.array(z.object({version:z.number().int().positive(),row:z.unknown()}).strict()).max(100),next:z.uuid().nullable()}).strict();
/** Restore all prepared proposals; user edits, decisions and tombstones always win. */
export async function receivePreparedShadowing(repo:LocalRepository,items:{version:number;row:unknown}[]){
 if(repo.scope.kind!=='account')throw new RepositoryError('scope');
 const rows=items.map(item=>({version:item.version,row:parseCloudRow('shadowingContent',item.row) as unknown as ShadowRow}));
 if(rows.some(({row,version})=>row.scopeId!==repo.scope.id||!Number.isSafeInteger(version)||version<1||row.id!==`shadow:${row.payload.senseId}`))throw new RepositoryError('scope');
 return repo.db.transaction('rw',repo.db.tables,async()=>{
  remoteTransactions.add(Dexie.currentTransaction!);let restored=0;
  for(const {row,version} of rows){const table=repo.db.table<ShadowRow>('shadowingContent'),old=await table.get([repo.scope.id,row.id]),checkpoints=repo.db.table('transferCheckpoints'),key=`baseline:shadowingContent:${row.id}`,baseline=await checkpoints.get([repo.scope.id,key]);
   const word=await repo.word(row.payload.senseId);if(!row.deletedAt&&word&&await Dexie.waitFor(extensionHash(wordExtensionSource(word)))!==row.payload.sourceHash)continue;
   if(old&&(old.deletedAt||old.payload.edited||Object.keys(old.payload.decisions).length))continue;
   if(baseline?.payload.baseline?.remoteVersion>version)continue;
   // Current unreviewed proposals are server-owned preparation, not learner edits.
   await table.put(row);const now=new Date().toISOString(),hash=await Dexie.waitFor(contentHash(row));
   await checkpoints.put({scopeId:repo.scope.id,id:key,version:1,createdAt:baseline?.createdAt??now,updatedAt:now,deletedAt:null,payload:{baseline:{entity:'shadowingContent',id:row.id,hash,remoteVersion:version}}});
   await checkpoints.delete([repo.scope.id,`conflict:shadowingContent:${row.id}`]);restored++;
  }return restored;
 });
}
export async function refreshPreparedShadowing(repo:LocalRepository,signal:AbortSignal){
 if(repo.scope.kind!=='account')return 0;let after:string|null=null,total=0;const cursors=new Set<string>();
 for(let page=0;page<100;page++){
  const params=new URLSearchParams({library:repo.scope.libraryId});if(after)params.set('after',after);
  const response=await fetch(`/api/cloud/shadowing?${params}`,{cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(15000)])});
  if(!response.ok)throw new RepositoryError('not-ready');const result=pageSchema.parse(await response.json());if(signal.aborted)throw new DOMException('Cancelled','AbortError');
  total+=await receivePreparedShadowing(repo,result.rows);if(!result.next)return total;if(cursors.has(result.next))throw new RepositoryError('invalid');cursors.add(result.next);after=result.next;
 }throw new RepositoryError('invalid');
}
