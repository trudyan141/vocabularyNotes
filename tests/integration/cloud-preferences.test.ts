import 'fake-indexeddb/auto';
import {it,expect,vi,afterEach} from 'vitest';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {queuePreferences,synchronizePreferences,accountPreferences} from '@/data/cloud/preferences';
const owner='60000000-0000-4000-8000-000000000006',library='70000000-0000-4000-8000-000000000007';
const dbs:LibraryDatabase[]=[];
afterEach(async()=>{vi.unstubAllGlobals();for(const db of dbs)await db.delete();dbs.length=0;});
function repo(){const db=new LibraryDatabase('preferences-'+crypto.randomUUID());dbs.push(db);return new LocalRepository(db,{kind:'account',id:`account:${owner}:${library}`,ownerId:owner,libraryId:library});}
it('persists pending account preferences across reconnect and does not clear a newer edit on old acknowledgement',async()=>{
 const a=repo();await a.db.open();await queuePreferences(a,{profileName:'Bé'});
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}',{status:503})));await expect(synchronizePreferences(a)).rejects.toThrow();
 vi.stubGlobal('fetch',vi.fn(async()=>{await queuePreferences(a,{profileAvatar:'fox'});return Response.json({ownerId:owner,libraryId:library,preferences:{profileName:'Bé'}});}));await synchronizePreferences(a);expect(await accountPreferences(a)).toMatchObject({profileName:'Bé',profileAvatar:'fox'});
 const sent:unknown[]=[];vi.stubGlobal('fetch',vi.fn(async(_url,init)=>{sent.push(JSON.parse(init.body));return Response.json({ownerId:owner,libraryId:library,preferences:{profileName:'Bé',profileAvatar:'fox'}});}));await synchronizePreferences(a);expect(sent).toEqual([{libraryId:library,patch:{profileName:'Bé',profileAvatar:'fox'}}]);expect(await accountPreferences(a)).toMatchObject({profileName:'Bé',profileAvatar:'fox'});
});
it('rejects preferences for another owner/library and cannot expose another scope cache',async()=>{const a=repo();await a.db.open();await queuePreferences(a,{profileName:'A'});vi.stubGlobal('fetch',vi.fn(async()=>Response.json({ownerId:'80000000-0000-4000-8000-000000000008',libraryId:library,preferences:{profileName:'other'}})));await expect(synchronizePreferences(a)).rejects.toThrow('scope');expect(await accountPreferences(a)).toMatchObject({profileName:'A'});const b=new LocalRepository(a.db,{kind:'account',id:'account:other:other',ownerId:'other',libraryId:'other'});expect(await accountPreferences(b)).toBeNull();});
