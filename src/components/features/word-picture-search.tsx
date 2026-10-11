'use client';
import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
import {ImagePlus} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Input} from '@/components/ui/input';
import {SubmitButton} from '@/components/ui/submit-button';
import {mediaCandidate,mediaAsset,type MediaCandidate,type MediaAsset} from '@/lib/media/contracts';
import {saveMedia} from '@/data/local/media';
import type {LibraryWord} from '@/data/local/types';
export function WordPictureSearch({word,onSaved,onPrepared,onBusyChange}:{word:LibraryWord;onBusyChange?:(busy:boolean)=>void;onPrepared?:(asset:MediaAsset)=>void;onSaved?:(result:{revision:string;art:string})=>void}) {
 const {repository,t}=useApp();const [busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false),[candidates,setCandidates]=useState<MediaCandidate[]>([]);
 const [source,setSource]=useState('');const [operation,setOperation]=useState<'search'|'picture'|null>(null);const [found,setFound]=useState(false);const fileInput=useRef<HTMLInputElement|null>(null);
 const controller=useRef<AbortController|null>(null);
 useEffect(()=>()=>controller.current?.abort(),[]);
 useEffect(()=>{onBusyChange?.(busy);},[busy,onBusyChange]);
 async function request(operation:'search'|'import'|'upload',body:unknown,signal:AbortSignal){
  const response=await fetch(`/api/media/${operation}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  if(!response.ok)throw Error('unavailable');return response.json();
 }
 async function search(){
  if(busy)return;setOperation('search');setFound(false);setSaved(false);const worker=new AbortController();controller.current=worker;setBusy(true);setError('');
  try{const data=await request('search',{word:word.word,sense:word.en||word.sense,consent:true},AbortSignal.any([worker.signal,AbortSignal.timeout(25000)]));
   const rows=mediaCandidate.array().max(5).parse(data.candidates);setCandidates(rows);setFound(rows.length>0);if(!rows.length)setError(t('Chưa tìm được hình. Thử lại sau nhé.','No picture found. Please try again later.'));
  }catch{if(!worker.signal.aborted)setError(t('Chưa tải được hình. Thử lại nhé.','Could not load pictures. Please retry.'));}
  finally{if(!worker.signal.aborted)setBusy(false);}
 }
 async function choose(candidate:MediaCandidate){
  if(busy||!repository)return;setOperation('picture');const worker=new AbortController();controller.current=worker;setBusy(true);setError('');
  try{const data=await request('import',{id:candidate.id,title:candidate.title,consent:true},AbortSignal.any([worker.signal,AbortSignal.timeout(25000)]));
   if(worker.signal.aborted)return;
   const asset=mediaAsset.parse({...data,senseId:word.id,word:word.word,revision:word.revision,status:'ready',approved:true});if(onPrepared){onPrepared(asset);setSaved(true);setCandidates([]);return;}const art=await saveMedia(repository,asset);onSaved?.({art,revision:`${word.revision.split(':')[0]}:${Number(word.revision.split(':')[1])+1}`});setSaved(true);setCandidates([]);
  }catch{if(!worker.signal.aborted)setError(t('Chưa lưu được hình. Thử lại hoặc mở lại từ nếu đã sửa ở thiết bị khác.','Could not save the picture. Retry or reopen the word if it changed on another device.'));}
  finally{if(!worker.signal.aborted)setBusy(false);}
 }
 async function upload(file:File){
  if(busy||!repository)return;setOperation('picture');if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4_000_000){setError(t('Chọn ảnh JPG, PNG hoặc WebP dưới 4 MB nhé.','Choose a JPG, PNG or WebP under 4 MB.'));return;}
  const worker=new AbortController();controller.current=worker;setBusy(true);setError('');
  try{const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));const data=await request('upload',{base64:btoa(binary),filename:file.name.slice(0,160),source:source.trim()},AbortSignal.any([worker.signal,AbortSignal.timeout(25000)]));if(worker.signal.aborted)return;const asset=mediaAsset.parse({...data,senseId:word.id,word:word.word,revision:word.revision,status:'ready',approved:true});if(onPrepared){onPrepared(asset);setSaved(true);setCandidates([]);return;}const art=await saveMedia(repository,asset);onSaved?.({art,revision:`${word.revision.split(':')[0]}:${Number(word.revision.split(':')[1])+1}`});setSaved(true);setCandidates([]);
  }catch{if(!worker.signal.aborted)setError(t('Chưa lưu được ảnh. Kiểm tra ảnh và đường dẫn nguồn rồi thử lại.','Could not save the image. Check the image and source URL and retry.'));}finally{if(!worker.signal.aborted)setBusy(false);if(fileInput.current)fileInput.current.value='';}
 }
 return <section className="page-flow word-picture-search">
 {saved?<p className="picture-saved" role="status">{onPrepared?t('Đã chọn hình. Bấm Lưu chỉnh sửa bên dưới để lưu.','Picture selected. Save your edits below to keep it.'):t('Đã lưu hình.','Picture saved.')}</p>:<SubmitButton type="button" variant="secondary" state={operation==='search'?(busy?'pending':error?'error':found?'success':'idle'):'idle'} error={operation==='search'?error:undefined} successLabel={t('Đã tìm thấy hình · tìm lại','Pictures found · search again')} disabled={busy} onClick={()=>void search()}><ImagePlus aria-hidden="true"/>{busy?t('Đang tải hình…','Loading pictures…'):t('Tìm hình','Find pictures')}</SubmitButton>}
 {error&&operation==='picture'&&<p className="submit-error" role="alert">{error}</p>}
 <div className="picture-results">{candidates.map(candidate=><article key={candidate.id}>
  <button type="button" disabled={busy} data-submit-state={operation==='picture'?(busy?'pending':error?'error':saved?'success':'idle'):'idle'} aria-label={t(`Dùng hình cho ${word.word}: ${candidate.title}`,`Use picture for ${word.word}: ${candidate.title}`)} onClick={()=>void choose(candidate)}><Image unoptimized src={candidate.imageUrl||""} alt={candidate.title} width={160} height={160}/></button>
  <a href={candidate.sourceUrl} target="_blank" rel="noreferrer">{candidate.creator} · {candidate.license}</a>
 </article>)}</div>
 {!saved&&<details className="picture-upload"><summary>{t('Dùng ảnh khác','Use another image')}</summary><div className="page-flow"><a href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(word.word+' children illustration')}`} target="_blank" rel="noreferrer">{t('Tìm ảnh trên Google','Search Google Images')}</a><label>{t('Nguồn hình','Image source')}<Input type="url" value={source} onChange={event=>setSource(event.target.value)} placeholder="https://…" maxLength={500}/></label><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event=>{const file=event.target.files?.[0];if(file)void upload(file);}}/><SubmitButton type="button" variant="outline" state={operation==='picture'?(busy?'pending':error?'error':'idle'):'idle'} disabled={busy} onClick={()=>fileInput.current?.click()}>{t('Chọn ảnh trên máy','Choose image from device')}</SubmitButton></div></details>}
 </section>;
}
