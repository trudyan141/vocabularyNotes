'use client';
import {useSyncExternalStore} from 'react';
import {preferencesKey,readPreferences} from '@/lib/preferences';
const key='wfk.game-sound.v1';
let snapshot={enabled:true,error:false},loaded=false;
const listeners=new Set<()=>void>();
function notify(){for(const listener of listeners)listener();}
function subscribe(listener:()=>void){
 listeners.add(listener);
 if(!loaded){loaded=true;try{const raw=localStorage.getItem(key);snapshot={enabled:raw===null?readPreferences(localStorage.getItem(preferencesKey)).sound:raw!=='false',error:false};localStorage.setItem(key,String(snapshot.enabled));}catch{snapshot={...snapshot,error:true};}notify();}
 const storage=(event:StorageEvent)=>{if(event.key===key){snapshot={enabled:event.newValue!=='false',error:false};notify();}};
 window.addEventListener('storage',storage);return()=>{listeners.delete(listener);window.removeEventListener('storage',storage);};
}
const server={enabled:true,error:false};
/** Device sound effects are separate from the account's requested speech preference. */
export function useGameSound(){
 const state=useSyncExternalStore(subscribe,()=>snapshot,()=>server);
 return {...state,setEnabled:(enabled:boolean)=>{let error=false;try{localStorage.setItem(key,String(enabled));}catch{error=true;}snapshot={enabled,error};window.dispatchEvent(new Event('wfk-audio-stop'));notify();return !error;}};
}
