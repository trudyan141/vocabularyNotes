'use client';
import {useSyncExternalStore} from 'react';
import type {AccountStatus} from './account-profile';
const server:AccountStatus|null=null;
let current:AccountStatus|null=null,request:Promise<AccountStatus>|null=null,epoch=0;
const listeners=new Set<()=>void>();
export function readAuth(){
 if(request)return request;
 const ticket=epoch;
 request=fetch('/api/auth/status',{cache:'no-store',signal:AbortSignal.timeout(10000)}).then(async response=>{if(!response.ok)throw new Error('auth-unavailable');const status=await response.json() as AccountStatus;if(ticket!==epoch)throw new Error('auth-changed');current=status;listeners.forEach(fn=>fn());return status;}).finally(()=>{if(ticket===epoch)request=null;});
 return request;
}
export function invalidateAuth(){epoch++;request=null;current=null;listeners.forEach(fn=>fn());}
export function useAuthStatus(){return useSyncExternalStore(listener=>{listeners.add(listener);return()=>listeners.delete(listener);},()=>current,()=>server);}
