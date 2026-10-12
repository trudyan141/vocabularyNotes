'use client';
import {useEffect,useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import Link from 'next/link';
import {Trash2,Plus,ClipboardPaste} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Back,EmptyState} from '@/components/app/shared';
import {DatabaseLoading,ReadFailure} from '@/components/app/database-boundary';
import {Button} from '@/components/ui/button';
import {LocalPreview} from '@/components/ui/local-preview';

import {CaptureRepository} from '@/data/local/capture';
import {batchPhotos,preparePhotoBatch,photoBatchLimit} from '@/data/local/worksheet-batch';
import {ExtractForm} from './extract';
import type {ScopedDocument} from '@/data/local/types';
import type {WorksheetDraft} from '@/data/local/worksheet-batch';
import {ImageError} from '@/lib/capture/image';

import {useImagePaste} from './use-image-paste';

export function CaptureBatch({batchId}:{batchId:string}){
 const {repository,t}=useApp();const [busy,setBusy]=useState(false),[adding,setAdding]=useState(false),[error,setError]=useState(''),[deleteId,setDeleteId]=useState<string|null>(null);

 const lock=useRef(false),mounted=useRef(true),input=useRef<HTMLInputElement|null>(null);
 const data=useLiveQuery(async()=>{
  if(!repository)return null;
  try{const capture=new CaptureRepository(repository),photos=await batchPhotos(repository,batchId);const rows=await Promise.all(photos.map(async photo=>({...photo,image:(await capture.get(photo.id))?.prepared})));return {scope:repository.scope.id,rows,error:false,lesson:await repository.db.lessons.get([repository.scope.id,`ocr-batch:${batchId}`]),saved:await repository.db.table<ScopedDocument>('learningDrafts').get([repository.scope.id,`ocr:batch:${batchId}`])};}
  catch{return {scope:repository.scope.id,rows:[],error:true};}
 },[repository,batchId]);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 async function add(files:File[]){
  if(!repository||busy||lock.current||!files.length)return;
  const rows=data?.rows??[];if(rows.length+files.length>photoBatchLimit){setError(t('Một đợt có tối đa 10 ảnh. Chọn ít ảnh hơn hoặc thêm đợt mới.','A batch holds up to 10 photos. Choose fewer or start a new batch.'));return;}
  lock.current=true;setAdding(true);setError('');
  try{const result=await preparePhotoBatch(new CaptureRepository(repository),files,batchId,Math.max(-1,...rows.map(row=>row.batchOrder??0))+1);if(mounted.current&&result.failures.length)setError(result.failures.map(failure=>`${failure.name}: ${failure.error instanceof ImageError?t('Ảnh cần là JPEG/PNG/WebP, tối đa 10 MB và 20 MP.','Use JPEG/PNG/WebP, up to 10 MB and 20 MP.'):t('Chưa lưu được ảnh này. Thử lại nhé.','This photo could not be saved. Try again.')}`).join(' '));}
  finally{lock.current=false;if(mounted.current)setAdding(false);}
 }
 async function remove(id:string,version:number){
  if(!repository||busy||lock.current)return;if(deleteId!==id){setDeleteId(id);return;}
  lock.current=true;setAdding(true);setError('');try{await new CaptureRepository(repository).remove(id,version);setDeleteId(null);}catch{setError(t('Chưa xóa được nháp. Nháp có thể đã đổi; thử lại nhé.','The draft may have changed. Try deleting it again.'));}finally{lock.current=false;setAdding(false);}
 }
 const paste=useImagePaste(!!repository&&!busy&&!adding,add,setError);
 if(!data||data.scope!==repository?.scope.id)return <DatabaseLoading/>;if(data.error)return <ReadFailure/>;
 const signature=JSON.stringify(data.rows.map(row=>[row.id,row.version]));
 const photos=data.rows.flatMap(row=>row.image?[{id:row.id,blob:row.image}]:[]);
 return <div className="reading-page page-flow capture-batch"><Back href="/capture"/><h1>{t('Ảnh trong bài này','Photos in this lesson')}</h1>
 <p>{t('Xem ảnh, chỉnh ảnh nào cần rồi đọc cả đợt. Đọc hết ảnh, lọc trùng rồi duyệt và lưu một bài chung.','Check the photos, edit any that need it, then analyse the batch. Read every photo, remove duplicates, then review and save one lesson.')}</p>
 {error&&<p role="alert" className="submit-error">{error}</p>}

 <div className="row-wrap"><Button variant="outline" disabled={busy||adding||data.rows.length>=photoBatchLimit} onClick={()=>input.current?.click()}><Plus aria-hidden="true"/>{t('Thêm ảnh','Add photos')}</Button></div>
 <input ref={input} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,.heic,.heif" aria-label={t('Thêm ảnh vào đợt','Add photos to batch')} disabled={busy||adding} onChange={event=>{const files=Array.from(event.target.files??[]);event.target.value='';void add(files);}}/>
 {!busy&&<div className="row-wrap"><Button variant="outline" disabled={adding||paste.reading||data.rows.length>=photoBatchLimit} onClick={()=>void paste.pasteImages()}><ClipboardPaste aria-hidden="true"/>{paste.reading?t('Đang đọc ảnh…','Reading image…'):t('Dán thêm ảnh','Paste another photo')}</Button><small>{t('Có thể dán tiếp bằng Ctrl+V / ⌘V. Tối đa 10 ảnh mỗi đợt.','Paste again with Ctrl+V / ⌘V. Up to 10 photos per batch.')}</small></div>}
 {adding&&<p role="status">{t('Đang lưu ảnh…','Saving photos…')}</p>}
 {!data.rows.length&&<EmptyState title={t('Đợt này không còn ảnh','No photos in this batch')} description={t('Thêm ảnh để bắt đầu nhé.','Add photos to start.')}/>}
 <p className="batch-count" role="status">{t(`${data.rows.length}/10 ảnh trong bài này`,`${data.rows.length}/10 photos in this lesson`)}</p><ol className="batch-photo-list">{data.rows.map((row,index)=><li key={row.id} className="batch-photo-row"><div className="batch-photo-preview">{row.image&&<LocalPreview blob={row.image} label={t(`Ảnh ${index+1}`,`Photo ${index+1}`)}/>}</div><div className="page-flow"><h2>{t(`Ảnh ${index+1}`,`Photo ${index+1}`)}</h2><div className="row-wrap">{busy||adding?<span>{t('Chờ xong để chỉnh ảnh','Wait to edit photos')}</span>:<><Button asChild variant="outline"><Link href={`/capture/${row.id}/edit`}>{t('Chỉnh ảnh','Edit photo')}</Link></Button><Button variant="ghost" aria-label={t(`Xóa nháp ảnh ${index+1}`,`Delete photo draft ${index+1}`)} onClick={()=>void remove(row.id,row.version)}><Trash2 aria-hidden="true"/>{deleteId===row.id?t('Xác nhận xóa','Confirm delete'):t('Xóa nháp','Delete draft')}</Button></>}</div></div></li>)}</ol>
 {data.lesson&&!data.lesson.deletedAt?<div className="panel page-flow"><p>{t('Đã lưu tất cả ảnh thành một bài chung.','All photos were saved as one lesson.')}</p><Button asChild><Link href={`/library?lesson=${encodeURIComponent(`ocr-batch:${batchId}`)}`}>{t('Xem bài đã lưu','View saved lesson')}</Link></Button></div>:photos.length>0&&<ExtractForm key={`${data.scope}:${batchId}`} draftId={`batch:${batchId}`} batchId={batchId} photos={photos} signature={signature} disabled={adding} onBusyChange={setBusy} blob={photos[0].blob} title={data.rows[0].title} learnedOn={data.rows[0].learnedOn} initial={data.saved?.payload.data as WorksheetDraft|undefined} initialVersion={data.saved?.version??null}/>}
 </div>;
}
