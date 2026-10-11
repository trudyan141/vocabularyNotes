'use client';
import {useEffect} from 'react';
import type {Transaction} from 'dexie';
import {useApp} from './provider';
import {cloudTables} from '@/lib/cloud/contracts';
import {synchronizePreferences} from '@/data/cloud/preferences';
import {remoteTransactions} from '@/data/cloud/notifications';
import {syncEngine,SyncError,saveCloudStatus} from '@/data/cloud/sync';
export function CloudBackground(){const {repository}=useApp();useEffect(()=>{
 if(!repository||repository.scope.kind!=='account')return;
 const repo=repository;let active=true,timer:ReturnType<typeof setTimeout>|undefined,failures=0,running=false,again=false;
 const scheduled=new WeakSet<Transaction>();
 async function run(){if(!active||!navigator.onLine||document.hidden)return;if(running){again=true;return;}running=true;again=false;
  try{await syncEngine(repo).synchronize();await synchronizePreferences(repo);failures=0;if(active){await saveCloudStatus(repo,'saved');window.dispatchEvent(new Event('wfk-cloud-synced'));}}
  catch(error){if(!active)return;if(error instanceof SyncError&&error.code==='signed-out'){window.dispatchEvent(new Event('wfk-auth-changed'));return;}await saveCloudStatus(repo,error instanceof SyncError&&['conflict','duplicate'].includes(error.code)?error.code:'unavailable').catch(()=>{});if(!(error instanceof SyncError&&['conflict','duplicate'].includes(error.code))&&++failures<=3)timer=setTimeout(()=>void run(),Math.min(60000,3000*2**failures));}
  finally{running=false;if(again&&active)schedule();}
 }
 function schedule(){if(!active)return;if(timer)clearTimeout(timer);timer=setTimeout(()=>void run(),150);}
 function committed(row:{scopeId?:string},transaction:Transaction){if(row.scopeId!==repo.scope.id||scheduled.has(transaction))return;scheduled.add(transaction);transaction.on('complete',()=>{if(!remoteTransactions.has(transaction))schedule();});}
 const cleanups=cloudTables.map(name=>{const table=repo.db.table(name);const creating=(_key:unknown,row:{scopeId?:string},tx:Transaction)=>committed(row,tx),updating=(_changes:unknown,_key:unknown,row:{scopeId?:string},tx:Transaction)=>committed(row,tx),deleting=(_key:unknown,row:{scopeId?:string},tx:Transaction)=>committed(row,tx);
  table.hook('creating',creating);table.hook('updating',updating);table.hook('deleting',deleting);return()=>{table.hook('creating').unsubscribe(creating);table.hook('updating').unsubscribe(updating);table.hook('deleting').unsubscribe(deleting);};});
 let unwatch:(()=>void)|undefined;
 void import('@/data/cloud/realtime').then(({watchCloud})=>{if(active&&repo.scope.kind==='account')unwatch=watchCloud(repo.scope.ownerId,repo.scope.libraryId,schedule);});
 // Reconnect catch-up and a sparse safety poll cover missed notifications/free quota outages.
 const poll=setInterval(()=>void run(),60000);window.addEventListener('wfk-cloud-local-change',schedule);window.addEventListener('online',schedule);window.addEventListener('focus',schedule);document.addEventListener('visibilitychange',schedule);schedule();
 return()=>{active=false;clearInterval(poll);if(timer)clearTimeout(timer);unwatch?.();cleanups.forEach(fn=>fn());window.removeEventListener('wfk-cloud-local-change',schedule);window.removeEventListener('online',schedule);window.removeEventListener('focus',schedule);document.removeEventListener('visibilitychange',schedule);};
 },[repository]);return null;}
