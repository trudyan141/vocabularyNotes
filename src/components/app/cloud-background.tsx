'use client';
import {useEffect} from 'react';
import {liveQuery} from 'dexie';
import {useApp} from './provider';
import {cloudTables} from '@/lib/cloud/contracts';
import {syncEngine,SyncError,saveCloudStatus} from '@/data/cloud/sync';
export function CloudBackground(){const {repository}=useApp();useEffect(()=>{if(!repository||repository.scope.kind!=='account')return;let active=true;let timer:ReturnType<typeof setTimeout>|undefined;let failures=0;let running=false;
 async function run(){if(!active||running||!navigator.onLine||document.visibilityState==='hidden')return;running=true;try{await syncEngine(repository!).synchronize();failures=0;if(active)await status('saved');}catch(error){if(!active)return;if(error instanceof SyncError&&error.code==='signed-out'){window.dispatchEvent(new Event('wfk-auth-changed'));return;}await status(error instanceof SyncError&&(error.code==='conflict'||error.code==='duplicate')?error.code:'unavailable');if(!(error instanceof SyncError&&['conflict','duplicate'].includes(error.code))&&++failures<=3)timer=setTimeout(()=>void run(),Math.min(60000,3000*2**failures));}finally{running=false;}}
 async function status(value:string){if(active&&repository)await saveCloudStatus(repository,value).catch(()=>{});}
 function schedule(){if(!active)return;if(timer)clearTimeout(timer);timer=setTimeout(()=>void run(),3000);}
 const subscription=liveQuery(async()=>Promise.all(cloudTables.map(async name=>{const rows=await repository.db.table(name).where('[scopeId+id]').between([repository.scope.id,''],[repository.scope.id,'\uffff']).toArray();return rows.reduce((sum,row)=>sum+(row.version??1),0)+rows.length;}))).subscribe({next:schedule,error:()=>{}});
 const poll=setInterval(()=>void run(),30000);window.addEventListener('online',schedule);return()=>{active=false;clearInterval(poll);subscription.unsubscribe();if(timer)clearTimeout(timer);window.removeEventListener('online',schedule);};},[repository]);return null;}
