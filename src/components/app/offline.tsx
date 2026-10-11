"use client";
import {removeRetiredSpeakingPacks} from '@/lib/speaking/cleanup';
import {useEffect} from 'react';
export function OfflineRegistration(){useEffect(()=>{if(process.env.NODE_ENV==='production'&&'serviceWorker' in navigator)void navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{});},[]);return null;}

export function RetiredSpeakingCleanup(){useEffect(()=>{if('caches' in window)void removeRetiredSpeakingPacks(caches).catch(()=>{});},[]);return null;}
