'use client';
import {useCallback,useSyncExternalStore} from 'react';
const fallback={visible:false,error:false};
const states=new Map<string,typeof fallback>(),listeners=new Map<string,Set<()=>void>>();
export const extensionVisibilityKey=(scope:string)=>`wfk.extensions.visible.v1:${scope}`;
export function useExtensionVisibility(scope:string){
 const subscribe=useCallback((listener:()=>void)=>{const group=listeners.get(scope)??new Set();group.add(listener);listeners.set(scope,group);if(!states.has(scope)){try{states.set(scope,{visible:localStorage.getItem(extensionVisibilityKey(scope))==='true',error:false});}catch{states.set(scope,{visible:false,error:true});}queueMicrotask(listener);}
 const storage=(event:StorageEvent)=>{if(event.key===extensionVisibilityKey(scope)){states.set(scope,{visible:event.newValue==='true',error:false});group.forEach(f=>f());}};window.addEventListener('storage',storage);return()=>{group.delete(listener);window.removeEventListener('storage',storage);};},[scope]);
 const get=useCallback(()=>states.get(scope)??fallback,[scope]);const state=useSyncExternalStore(subscribe,get,()=>fallback);
 return {...state,setVisible:(visible:boolean)=>{let error=false;try{localStorage.setItem(extensionVisibilityKey(scope),String(visible));}catch{error=true;}states.set(scope,{visible,error});listeners.get(scope)?.forEach(f=>f());}};
}
