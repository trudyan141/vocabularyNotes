"use client";
import {useEffect,useState} from "react";
import {useApp} from "@/components/app/provider";

/** Counts represent finished items; unknown request duration stays indeterminate. */
export function OperationStatus({busy,title,message,error=false,completed,total}:{busy:boolean;title:string;message?:string;error?:boolean;completed?:number;total?:number}) {
  if(!busy&&!message)return null;
  return <div className="operation-status" data-error={error||undefined}>
    <div role={error?"alert":"status"}><strong>{title}</strong>{message&&<p>{message}</p>}</div>
    {busy&&<RunningProgress title={title} completed={completed} total={total}/>}
  </div>;
}

function RunningProgress({title,completed,total}:{title:string;completed?:number;total?:number}) {
  const {t}=useApp();const [seconds,setSeconds]=useState(0);
  useEffect(()=>{const start=Date.now();const timer=setInterval(()=>setSeconds(Math.floor((Date.now()-start)/1000)),1000);return()=>clearInterval(timer);},[]);
  return <><progress aria-label={title} max={total&&total>0?total:undefined} value={total&&total>0?completed:undefined}/><small aria-live="off">{t(`Đã chạy ${seconds} giây`,`Running for ${seconds} seconds`)}{total!=null&&` · ${completed??0}/${total}`}</small></>;
}
