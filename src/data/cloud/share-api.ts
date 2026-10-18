import {z} from 'zod';
import type {LibraryDatabase} from '@/data/local/database';
import {shareCommandSchema,SharingError,type ShareCommand,type ShareSelection} from '@/lib/sharing';
export async function shareCall<T=unknown>(command:ShareCommand,signal?:AbortSignal):Promise<T>{
 const response=await fetch('/api/share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(shareCommandSchema.parse(command)),cache:'no-store',signal:signal??AbortSignal.timeout(20000)});
 const body=await response.json().catch(()=>({}));
 if(!response.ok)throw new SharingError(body.error??'sharing-unavailable',response.status);
 return body as T;
}
export const activeShareKey='active-shared-library';
export async function selectedShare(db:LibraryDatabase):Promise<ShareSelection|null>{
 const row=await db.metadata.get(activeShareKey);
 if(!row)return null;
 try{return z.object({kind:z.enum(['email','device']),id:z.uuid()}).strict().parse(JSON.parse(row.value));}catch{throw new SharingError('invalid-context');}
}
