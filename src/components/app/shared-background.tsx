'use client';
import {useEffect} from 'react';
import type {Transaction} from 'dexie';
import {useApp} from './provider';
import {sharedEngine,learningTables} from '@/data/cloud/sharing';
import {remoteTransactions} from '@/data/cloud/notifications';
export function SharedBackground(){const {repository}=useApp();useEffect(()=>{
 if(!repository?.readOnly)return;const repo=repository;let active=true,timer:ReturnType<typeof setTimeout>|undefined;
 async function run(){if(!active)return;if(!repo.canPractice){repo.accessValid=false;window.dispatchEvent(new Event('wfk-audio-stop'));window.dispatchEvent(new Event('wfk-share-status'));return;}if(!navigator.onLine||document.hidden)return;try{await sharedEngine(repo).synchronize();}catch{}if(active)window.dispatchEvent(new Event('wfk-share-status'));}
 const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>void run(),150);};
 const seen=new WeakSet<Transaction>();const committed=(row:{scopeId?:string},tx:Transaction)=>{if(row.scopeId!==repo.scope.id||seen.has(tx))return;seen.add(tx);tx.on('complete',()=>{if(!remoteTransactions.has(tx))schedule();});};
 const cleanups=learningTables.map(name=>{const table=repo.db.table(name);const create=(_key:unknown,row:{scopeId?:string},tx:Transaction)=>committed(row,tx),update=(_change:unknown,_key:unknown,row:{scopeId?:string},tx:Transaction)=>committed(row,tx),remove=(_key:unknown,row:{scopeId?:string},tx:Transaction)=>committed(row,tx);table.hook('creating',create);table.hook('updating',update);table.hook('deleting',remove);return()=>{table.hook('creating').unsubscribe(create);table.hook('updating').unsubscribe(update);table.hook('deleting').unsubscribe(remove);};});
 const expiry=Number.isFinite(repo.remainingLeaseMs)?setTimeout(()=>void run(),repo.remainingLeaseMs+1):undefined;
 const poll=setInterval(()=>void run(),15000);window.addEventListener('focus',schedule);window.addEventListener('online',schedule);document.addEventListener('visibilitychange',schedule);schedule();return()=>{active=false;clearTimeout(timer);clearTimeout(expiry);clearInterval(poll);cleanups.forEach(fn=>fn());window.removeEventListener('focus',schedule);window.removeEventListener('online',schedule);document.removeEventListener('visibilitychange',schedule);};
},[repository]);return null;}
