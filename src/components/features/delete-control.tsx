"use client";
import {useRef,useState} from 'react';
import {Trash2} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {SubmitButton} from '@/components/ui/submit-button';
import {submitError} from '@/lib/submit-error';
import {Button} from '@/components/ui/button';
import {deleteItem,type DeleteTarget} from '@/data/local/delete';
export function DeleteControl({target,label,description,onDeleted,iconOnly=false,targets}:{iconOnly?:boolean;targets?:DeleteTarget[];target:DeleteTarget;label:string;description:string;onDeleted?:()=>void}){
 const {repository,t}=useApp();const [confirm,setConfirm]=useState<{target:DeleteTarget;targets:DeleteTarget[];scope:string}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');const lock=useRef(false);
 async function remove(){if(!repository||!confirm||lock.current)return;lock.current=true;setBusy(true);setError('');try{if(repository.scope.id!==confirm.scope)throw new Error('scope');await repository.db.transaction('rw',repository.db.tables,async()=>{for(const item of confirm.targets)await deleteItem(repository,item);});setConfirm(null);onDeleted?.();}catch(cause){setError(submitError(cause,t));}finally{lock.current=false;setBusy(false);}}
 if(repository?.readOnly)return null;
 return <div className="delete-control">{confirm?<div className="page-flow delete-confirm"><p>{description}</p><div className="row-wrap"><SubmitButton type="button" variant="destructive" state={busy?'pending':error?'error':'idle'} error={error} disabled={busy} onClick={()=>void remove()}>{busy?t('Đang xóa…','Deleting…'):t('Xác nhận xóa','Confirm delete')}</SubmitButton><Button variant="outline" disabled={busy} onClick={()=>{setConfirm(null);setError('');}}>{t('Giữ lại','Keep it')}</Button></div></div>:<Button variant="ghost" className={iconOnly?"delete-entry delete-icon-only":"delete-entry"} aria-label={label} title={label} size={iconOnly?"icon":"default"} disabled={!repository} onClick={()=>repository&&setConfirm({target:{...target},targets:(targets??[target]).map(value=>({...value})),scope:repository.scope.id})}><Trash2 aria-hidden="true"/>{!iconOnly&&label}</Button>}</div>;
}
