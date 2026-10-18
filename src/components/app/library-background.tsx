'use client';
import dynamic from 'next/dynamic';
import {useApp} from './provider';
// Guest navigation does not need sync, archive parsers or account transports.
const CloudBackground=dynamic(()=>import('./cloud-background').then(module=>module.CloudBackground),{ssr:false});
const SharedBackground=dynamic(()=>import('./shared-background').then(module=>module.SharedBackground),{ssr:false});
export function LibraryBackground(){
 const {repository}=useApp();
 return repository?.scope.kind==='account'?<CloudBackground/>:repository?.readOnly?<SharedBackground/>:null;
}
