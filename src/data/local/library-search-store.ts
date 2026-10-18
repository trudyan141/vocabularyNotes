import {liveQuery,type Subscription} from 'dexie';
import type {LocalRepository,LibrarySearchProjection} from './repository';
type Snapshot={scopeId:string;value?:LibrarySearchProjection;error:boolean};
/** One live read projection per active repository, retained across page changes. */
export function librarySearchStore(repository:LocalRepository){
 let snapshot:Snapshot|undefined,subscription:Subscription|undefined,generation=0;
 const listeners=new Set<()=>void>();
 const notify=()=>listeners.forEach(listener=>listener());
 return {
  getSnapshot:()=>snapshot,
  subscribe:(listener:()=>void)=>{
   listeners.add(listener);
   if(!subscription){
    const ticket=generation;
    subscription=liveQuery(()=>repository.librarySearchProjection()).subscribe({
     next:value=>{if(ticket!==generation)return;snapshot={scopeId:repository.scope.id,value,error:false};notify();},
     error:()=>{if(ticket!==generation)return;snapshot={scopeId:repository.scope.id,error:true};notify();},
    });
   }
   // Keep observing while this repository is active, even off the Library route.
   return()=>{listeners.delete(listener);};
  },
  dispose:()=>{generation++;subscription?.unsubscribe();subscription=undefined;snapshot=undefined;listeners.clear();},
 };
}
