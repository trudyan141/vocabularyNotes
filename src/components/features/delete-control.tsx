"use client";
import {useRef,useState} from 'react';
import {Trash2} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {deleteItem,type DeleteTarget} from '@/data/local/delete';
export function DeleteControl({target,label,description,onDeleted}:{target:DeleteTarget;label:string;description:string;onDeleted?:()=>void}){
 const {repository,t}=useApp();const [confirm,setConfirm]=useState<{target:DeleteTarget;scope:string}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');const lock=useRef(false);
 async function remove(){if(!repository||!confirm||lock.current)return;lock.current=true;setBusy(true);setError('');try{if(repository.scope.id!==confirm.scope)throw new Error('scope');await deleteItem(repository,confirm.target);setConfirm(null);onDeleted?.();}catch{setError(t('Chưa xóa được. Mục có thể đã đổi ở tab khác; tải lại rồi thử.','Could not delete. This item may have changed in another tab; reload and retry.'));}finally{lock.current=false;setBusy(false);}}
 return <div className="delete-control">{confirm?<div className="page-flow delete-confirm"><p>{description}</p><div className="row-wrap"><Button variant="destructive" disabled={busy} onClick={()=>void remove()}>{busy?t('Đang xóa…','Deleting…'):t('Xác nhận xóa','Confirm delete')}</Button><Button variant="outline" disabled={busy} onClick={()=>{setConfirm(null);setError('');}}>{t('Giữ lại','Keep it')}</Button></div></div>:<Button variant="ghost" className="delete-entry" disabled={!repository} onClick={()=>repository&&setConfirm({target:{...target},scope:repository.scope.id})}><Trash2 aria-hidden="true"/>{label}</Button>}{error&&<p role="alert">{error}</p>}</div>;
}
