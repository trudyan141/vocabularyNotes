'use client';
import {useState,useEffect,type ReactNode} from 'react';
import Link from 'next/link';
import {useLiveQuery} from 'dexie-react-hooks';
import type {ScopedDocument} from '@/data/local/types';
import {useApp} from './provider';
import {Link2} from 'lucide-react';
import {Button} from '@/components/ui/button';
export function sharedMutationPath(path:string){return /^\/(add|capture)(\/|\?|$)/.test(path)||path.startsWith('/library/prepare')||path.startsWith('/library/groups/edit')||/\/library\/words\/[^/]+\/(edit|notes)/.test(path);}
export function SharingBoundary({path,children}:{path:string;children:ReactNode}){const {repository,t}=useApp();const [,update]=useState(0);useEffect(()=>{const changed=()=>update(n=>n+1);window.addEventListener('wfk-share-status',changed);return()=>window.removeEventListener('wfk-share-status',changed);},[]);if(!repository?.readOnly)return children;
 const safe=/^\/(settings|share|connect|libraries|profile|account)(\/|$)/.test(path);
 if(sharedMutationPath(path)||!repository.canPractice&&!safe)return <div className="reading-page page-flow"><h1>{t(repository.canPractice?'Kho được chia sẻ chỉ để học':'Kết nối cần được mở lại',repository.canPractice?'Shared libraries are for learning':'Reconnect to continue')}</h1><p>{t('Bài gốc và kết quả đã đồng bộ vẫn được giữ.','Original lessons and synced results are kept.')}</p><Button asChild><Link href="/libraries">{t('Chọn thư viện','Choose library')}</Link></Button><Button asChild variant="outline"><Link href="/connect">{t('Nhập mã mới','Enter a new code')}</Link></Button></div>;return children;}
export function SharedStatusLink(){
 const {repository,t}=useApp();const [,update]=useState(0);
 const status=useLiveQuery(async()=>repository?.readOnly?repository.db.table<ScopedDocument>('transferCheckpoints').get([repository.scope.id,'share-status']):null,[repository]);
 const pending=useLiveQuery(async()=>repository?.readOnly?repository.db.outbox.get([repository.scope.id,'share-pending']):null,[repository]);
 useEffect(()=>{const changed=()=>update(value=>value+1);window.addEventListener('wfk-share-status',changed);return()=>window.removeEventListener('wfk-share-status',changed);},[]);
 if(!repository?.readOnly)return null;
 const attention=!repository.canPractice||status?.payload.status==='error'||!!pending;
 const label=t(attention?'Thư viện đang nhận · Cần kiểm tra kết nối':'Thư viện đang nhận · Chỉ học',attention?'Received library · Connection needs attention':'Received library · Learning only');
 return <Button asChild variant="ghost" size="icon" className="shared-status-link"><Link href="/settings#shared-library" prefetch={false} aria-label={label} title={label}><Link2 aria-hidden="true"/>{attention&&<span className="shared-status-dot" aria-hidden="true"/>}</Link></Button>;
}
