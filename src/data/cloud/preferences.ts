import type {LocalRepository} from '@/data/local/repository';
import {readPreferences,type Preferences} from '@/lib/preferences';
const key=(repo:LocalRepository)=>`account-preferences:${repo.scope.id}`;
export async function queuePreferences(repo:LocalRepository,patch:Partial<Preferences>){
 await repo.db.transaction('rw',repo.db.metadata,async()=>{const row=await repo.db.metadata.get(key(repo)),state=JSON.parse(row?.value??'{}');await repo.db.metadata.put({key:key(repo),value:JSON.stringify({...state,pending:{...state.pending,...patch},ticket:crypto.randomUUID()})});});
 if(typeof window!=='undefined')window.dispatchEvent(new Event('wfk-cloud-local-change'));
}
export async function synchronizePreferences(repo:LocalRepository){
 if(repo.scope.kind!=='account')return;const scope=repo.scope,snapshot=await repo.db.metadata.get(key(repo)),state=JSON.parse(snapshot?.value??'{}');
 const response=await fetch('/api/cloud/preferences',state.pending?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({libraryId:scope.libraryId,patch:state.pending}),signal:AbortSignal.timeout(10000)}:{cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('preferences-unavailable');const data=await response.json();if(data.ownerId!==scope.ownerId||data.libraryId!==scope.libraryId)throw new Error('scope');
 await repo.db.transaction('rw',repo.db.metadata,async()=>{const current=JSON.parse((await repo.db.metadata.get(key(repo)))?.value??'{}');await repo.db.metadata.put({key:key(repo),value:JSON.stringify({...current,preferences:readPreferences(JSON.stringify(data.preferences)),...(state.ticket===current.ticket?{pending:null}:{} )})});});
}
export async function accountPreferences(repo:LocalRepository){const row=await repo.db.metadata.get(key(repo));if(!row)return null;const state=JSON.parse(row.value);return state.preferences||state.pending?{...readPreferences(JSON.stringify(state.preferences)),...state.pending} as Preferences:null;}
