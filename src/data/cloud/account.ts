import {z} from 'zod';
import {CloudRequestError,safeCloudCodes} from '@/lib/account-profile';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
export const accountLibrarySchema=z.object({id:z.uuid(),ownerId:z.uuid(),name:z.string().max(200)}).strict();
export type AccountLibrary=z.infer<typeof accountLibrarySchema>;
export async function requestCloudLibrary(){const response=await fetch('/api/cloud/library',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});if(!response.ok){const body=await response.json().catch(()=>({}));throw new CloudRequestError(safeCloudCodes.has(body.error)?body.error:'cloud-unavailable',response.status);}return accountLibrarySchema.parse((await response.json()).library);}
export async function openAccountRepository(db:LibraryDatabase,library:AccountLibrary){const validated=accountLibrarySchema.parse(library);await db.open();const scope={kind:'account' as const,id:`account:${validated.ownerId}:${validated.id}`,ownerId:validated.ownerId,libraryId:validated.id};await db.transaction('rw',db.libraries,async()=>{const existing=await db.libraries.get(validated.id);if(existing&&existing.scopeId!==scope.id)throw new Error('scope');if(!existing)await db.libraries.add({id:validated.id,scopeId:scope.id,scope,seeded:false});});return new LocalRepository(db,scope);}
