"use client";
import {useSyncExternalStore} from 'react';
import {preferencesKey} from './preferences';
function subscribe(fn:()=>void){window.addEventListener('storage',fn);return()=>window.removeEventListener('storage',fn);}
function current(){try{return JSON.parse(localStorage.getItem(preferencesKey)??'{}').locale==='en'?'en':'vi';}catch{return 'vi';}}
export function usePublicLocale(){const locale=useSyncExternalStore(subscribe,current,()=> 'vi');return (vi:string,en:string)=>locale==='vi'?vi:en;}
