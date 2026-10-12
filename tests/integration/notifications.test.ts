import 'fake-indexeddb/auto';
import {afterEach, expect, it} from 'vitest';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {listNotifications, markNotificationRead, declineDeviceCopy, dismissNotification} from '@/data/local/notifications';
import {catalog} from '@/lib/learning/catalog';
import {saveCloudStatus} from '@/data/cloud/sync';
const dbs: LibraryDatabase[] = [];
async function fixture() {
 const db = new LibraryDatabase(`notifications-${crypto.randomUUID()}`); dbs.push(db); await db.open();
 const guest = new LocalRepository(db, {kind:'guest', id:'guest:test'});
 await db.libraries.put({id:'guest:test', scope:guest.scope, scopeId:guest.scope.id, seeded:true});
 await db.metadata.put({key:'active-guest', value:'guest:test'});
 await guest.saveLesson({operationId:'seed', title:'Fruit', learnedOn:'2026-10-12', sourceType:'manual', items:[{...catalog[0], id:'apple', approved:true}]});
 const account = new LocalRepository(db, {kind:'account', id:'account:a:l', ownerId:'a', libraryId:'l'});
 return {db, guest, account};
}
afterEach(async () => {for (const db of dbs.splice(0)) await db.delete();});
it('reading persists across reopening without copying lessons; decisions are owner isolated', async () => {
 const {db, guest, account} = await fixture();
 const [notice] = await listNotifications(account); expect(notice.count).toBe(1); expect(notice.unread).toBe(true);
 await markNotificationRead(account, notice); db.close(); await db.open();
 expect((await listNotifications(account))[0].unread).toBe(false);
 expect(await db.senses.where('scopeId').equals(account.scope.id).count()).toBe(0);
 await declineDeviceCopy(account); expect(await listNotifications(account)).toEqual([]);
 expect(await db.senses.where('scopeId').equals(guest.scope.id).count()).toBe(1);
 const other = new LocalRepository(db, {kind:'account', id:'account:b:m', ownerId:'b', libraryId:'m'});
 expect((await listNotifications(other))[0].unread).toBe(true);
 expect(await listNotifications(guest)).toEqual([]);
});
it('repeated sync retries do not re-alert; new pending work and recovery update the inbox', async () => {
 const {db, account} = await fixture(); await declineDeviceCopy(account);
 await saveCloudStatus(account, 'unavailable'); const [notice] = await listNotifications(account);
 await markNotificationRead(account, notice); await saveCloudStatus(account, 'unavailable');
 expect((await listNotifications(account))[0].unread).toBe(false);
 const at = new Date().toISOString();
 await db.outbox.put({scopeId:account.scope.id,id:'cloud-pending',version:1,createdAt:at,updatedAt:at,deletedAt:null,payload:{packet:{operationId:'new-work'}}});
 expect((await listNotifications(account))[0].unread).toBe(true);
 await saveCloudStatus(account, 'saved'); expect(await listNotifications(account)).toEqual([]);
});
it('legacy copy choices and deleted device words do not create a notice', async () => {
 const {db, guest, account} = await fixture();
 await db.metadata.put({key:'guest-copy-choice:a', value:'review'}); expect(await listNotifications(account)).toEqual([]);
 await db.metadata.delete('guest-copy-choice:a');
 await db.senses.where('scopeId').equals(guest.scope.id).modify({deletedAt:new Date().toISOString()});
 expect(await listNotifications(account)).toEqual([]);
});
it('unfinished photo reminder works for guests, keeps edits read, isolates scope and clears with the draft', async () => {
 const {db, guest, account} = await fixture(); const at = new Date().toISOString();
 const draft = {scopeId:guest.scope.id,id:'photo-1',version:1,createdAt:at,updatedAt:at,deletedAt:null,title:'Family photo',learnedOn:'2026-10-12',tags:'',consent:false,sourceKey:'source',preparedKey:'prepared',transform:{rotation:0,crop:{x:0,y:0,width:1,height:1}},width:100,height:100,byteSize:100,phase:'editing',consentVersion:null};
 await db.table('captureDrafts').put(draft);
 const [notice] = await listNotifications(guest);expect(notice.kind).toBe('capture');expect(notice.draftId).toBe('photo-1');
 await markNotificationRead(guest,notice);await db.table('captureDrafts').update([guest.scope.id,'photo-1'],{title:'Edited title',updatedAt:'2026-10-13T00:00:00.000Z'});
 expect((await listNotifications(guest))[0].unread).toBe(false);expect((await listNotifications(account)).some(row=>row.kind==='capture')).toBe(false);
 await db.table('captureDrafts').delete([guest.scope.id,'photo-1']);expect(await listNotifications(guest)).toEqual([]);
 await db.table('captureDrafts').put({...draft,id:'photo-2'});expect((await listNotifications(guest))[0].unread).toBe(true);
});

it('dismissal persists, keeps learning and pending work, isolates accounts and allows a new notice', async () => {
 const {db,guest,account}=await fixture();
 const [copy]=await listNotifications(account);await dismissNotification(account,copy);db.close();await db.open();
 expect(await listNotifications(account)).toEqual([]);expect(await db.metadata.get('guest-copy-choice:a')).toBeUndefined();
 expect(await db.senses.where('scopeId').equals(guest.scope.id).count()).toBe(1);
 const other=new LocalRepository(db,{kind:'account',id:'account:b:m',ownerId:'b',libraryId:'m'});expect(await listNotifications(other)).toHaveLength(1);
 await saveCloudStatus(account,'unavailable');const [sync]=await listNotifications(account);await dismissNotification(account,sync);await saveCloudStatus(account,'unavailable');expect(await listNotifications(account)).toEqual([]);
 const at=new Date().toISOString();await db.outbox.put({scopeId:account.scope.id,id:'cloud-pending',version:1,createdAt:at,updatedAt:at,deletedAt:null,payload:{packet:{operationId:'fresh-work'}}});
 expect((await listNotifications(account))[0].unread).toBe(true);expect(await db.outbox.get([account.scope.id,'cloud-pending'])).toBeDefined();
});
it('failed dismissal keeps the notification visible', async () => {
 const {db,account}=await fixture();const [notice]=await listNotifications(account);db.close();
 await expect(dismissNotification(account,notice)).rejects.toThrow();await db.open();expect(await listNotifications(account)).toHaveLength(1);
});
