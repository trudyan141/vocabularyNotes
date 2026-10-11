'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {DatabaseLoading,ReadFailure} from '@/components/app/database-boundary';
import type {LearningContent} from '@/data/local/content';
/** Keep old bookmarks useful without exposing a separate sentence library. */
export function LegacySentenceLink({id}:{id:string}){
 const {repository}=useApp(),router=useRouter();
 const data=useLiveQuery(async()=>{
  if(!repository)return null;
  try{const [example,row]=await Promise.all([repository.db.examples.get([repository.scope.id,id]),repository.db.table('sentences').get([repository.scope.id,id])]);const senseId=example&&!example.deletedAt?example.senseId:row&&!row.deletedAt?(row.payload.content as LearningContent)?.senseId:null;return {scope:repository.scope.id,error:false,href:senseId?`/library/words/${encodeURIComponent(senseId)}`:'/library'};}catch{return {scope:repository.scope.id,error:true,href:'/library'};}
 },[repository,id]);
 useEffect(()=>{if(data&&data.scope===repository?.scope.id&&!data.error)router.replace(data.href);},[data,repository,router]);
 return data?.error?<ReadFailure/>:<DatabaseLoading/>;
}
