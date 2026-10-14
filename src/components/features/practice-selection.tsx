'use client';
import {useEffect,useState,type ReactNode} from 'react';
import {usePathname,useRouter,useSearchParams} from 'next/navigation';
import {useApp} from '@/components/app/provider';
import {DatabaseLoading} from '@/components/app/database-boundary';
import {Button} from '@/components/ui/button';
import {practiceFilter,practiceHref} from '@/lib/learning/practice-filter';
import {readPracticeSelection,savePracticeSelection} from '@/data/local/practice-selection';

// Resolve the current library's selection before games can open an unfiltered round.
export function PracticeSelection({children}:{children:ReactNode}){
 const {repository,t}=useApp(),params=useSearchParams(),pathname=usePathname(),router=useRouter();
 const query=params.toString(),identity=`${repository?.scope.id}:${pathname}:${query}`;
 const [result,setResult]=useState<{identity:string;error:boolean}|null>(null),[retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!repository)return;
  let active=true;
  void (async()=>{
   try{
    const search=new URLSearchParams(query),filter=practiceFilter(search);
    if(Object.keys(filter).length)await savePracticeSelection(repository,filter);
    else if(!search.has('session')){
     const saved=await readPracticeSelection(repository);
     if(!active)return;
     if(Object.keys(saved).length){
      const restored=new URL(practiceHref(saved,undefined,pathname),'https://local.invalid');
      for(const [key,value] of search)if(!restored.searchParams.has(key))restored.searchParams.set(key,value);
      if(saved.due&&pathname==='/practice')restored.searchParams.set('hub','1');
      router.replace(`${pathname}?${restored.searchParams}`,{scroll:false});return;
     }
    }
    if(active)setResult({identity,error:false});
   }catch{if(active)setResult({identity,error:true});}
  })();
  return()=>{active=false;};
 },[repository,query,pathname,router,identity,retry]);
 if(result?.identity!==identity)return <DatabaseLoading/>;
 if(result.error)return <div className="page-flow"><p role="alert">{t('Chưa mở được phạm vi đang ôn. Thử lại nhé.','Could not open your practice selection. Please retry.')}</p><Button onClick={()=>{setResult(null);setRetry(n=>n+1);}}>{t('Thử lại','Retry')}</Button></div>;
 return children;
}
