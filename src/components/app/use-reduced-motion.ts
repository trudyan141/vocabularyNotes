'use client';
import {useSyncExternalStore} from 'react';
import {useApp} from './provider';
const subscribe=(listener:()=>void)=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');query.addEventListener('change',listener);return()=>query.removeEventListener('change',listener);};
const get=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function useReducedMotion(){const {preferences}=useApp();const system=useSyncExternalStore(subscribe,get,()=>false);return preferences.reduceMotion||system;}
