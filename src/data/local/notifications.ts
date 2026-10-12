import type {LocalRepository} from './repository';
import type {ScopedDocument} from './types';

export type AppNotification = {
 id: 'device-lessons' | 'sync-attention' | 'image-draft';
 kind: 'guest-copy' | 'sync' | 'capture';
 signature: string;
 unread: boolean;
 count?: number;
 draftId?: string;
 draftTitle?: string;
};
const dismissedKey = (repo: LocalRepository, id: string) => `notification-dismissed:${repo.scope.id}:${id}`;
const readKey = (repo: LocalRepository, id: string) => `notification-read:${repo.scope.id}:${id}`;

// Notifications project actionable state; reading never transfers or changes learning data.
export async function listNotifications(repo: LocalRepository): Promise<AppNotification[]> {
 const items: AppNotification[] = [];
 const draft = await repo.db.captureDrafts.where('[scopeId+updatedAt]').between([repo.scope.id, ''], [repo.scope.id, '\uffff']).filter(row => !row.deletedAt).reverse().first();
 if (draft) items.push({id:'image-draft',kind:'capture',signature:draft.id,unread:true,draftId:draft.id,draftTitle:draft.title});
 if (repo.scope.kind !== 'account') return withReadState(repo, items);
 const choice = await repo.db.metadata.get(`guest-copy-choice:${repo.scope.ownerId}`);
 const selected = await repo.db.metadata.get('active-guest');
 const guest = selected ? await repo.db.libraries.get(selected.value) : null;
 if (!choice && guest?.scope.kind === 'guest') {
  const count = await repo.db.senses.where('[scopeId+id]').between([guest.scope.id, ''], [guest.scope.id, '\uffff']).filter(row => !row.deletedAt).count();
  if (count) items.push({id: 'device-lessons', kind: 'guest-copy', signature: guest.scope.id, unread: true, count});
 }
 const status = await repo.db.table<ScopedDocument>('transferCheckpoints').get([repo.scope.id, 'cloud-status']);
 if (['unavailable', 'conflict', 'duplicate'].includes(String(status?.payload.status))) {
  const conflicts = await repo.db.table<ScopedDocument>('transferCheckpoints').where('[scopeId+id]').between([repo.scope.id, 'conflict:'], [repo.scope.id, 'conflict:\uffff']).toArray();
  const pending = await repo.db.outbox.get([repo.scope.id, 'cloud-pending']);
  const signature = JSON.stringify([status?.payload.status, status?.payload.lastSyncedAt ?? null, (pending?.payload.packet as {operationId?: string} | undefined)?.operationId ?? null, conflicts.map(row => [row.id, row.payload.conflict])]);
  items.push({id: 'sync-attention', kind: 'sync', signature, unread: true});
 }
 return withReadState(repo, items);
}
async function withReadState(repo: LocalRepository, items: AppNotification[]) {
 const visible = await Promise.all(items.map(async item => {
  if ((await repo.db.metadata.get(dismissedKey(repo, item.id)))?.value === item.signature) return null;
  return {...item, unread: (await repo.db.metadata.get(readKey(repo, item.id)))?.value !== item.signature};
 }));
 return visible.filter((item): item is AppNotification => item !== null);
}
export async function markNotificationRead(repo: LocalRepository, item: AppNotification) {
 await repo.db.metadata.put({key: readKey(repo, item.id), value: item.signature});
}
export async function declineDeviceCopy(repo: LocalRepository) {
 if (repo.scope.kind !== 'account') throw new Error('account-required');
 await repo.db.metadata.put({key: `guest-copy-choice:${repo.scope.ownerId}`, value: 'no'});
}

/** Dismiss only this version of the reminder; never remove its source or pending work. */
export async function dismissNotification(repo: LocalRepository, item: AppNotification) {
 await repo.db.metadata.put({key: dismissedKey(repo, item.id), value: item.signature});
}
