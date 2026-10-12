'use client';
import {useState} from 'react';
import Image from 'next/image';
import {useSearchParams} from 'next/navigation';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {Back,EmptyState} from '@/components/app/shared';
import {Button} from '@/components/ui/button';
import {DatabaseLoading,ReadFailure} from '@/components/app/database-boundary';
import type {LibraryWord} from '@/data/local/types';
import {skipPicture,skippedPictures} from '@/data/local/picture-preferences';
import {SubmitButton} from '@/components/ui/submit-button';
import {submitError} from '@/lib/submit-error';
import {WordPictureSearch} from './word-picture-search';
export function PrepareLibrary(){
 const {repository,t}=useApp(),params=useSearchParams(),lesson=params.get('lesson');const [page,setPage]=useState(0);
 const data=useLiveQuery(async()=>{if(!repository)return null;try{const excludeIds=await skippedPictures(repository);const [missing,all]=await Promise.all([repository.search('',{approvedOnly:true,libraryOnly:true,missingArt:true,excludeIds,limit:12,offset:page*12,lesson}),repository.search('',{approvedOnly:true,limit:1,lesson})]);const currentPage=Math.min(page,Math.max(0,Math.ceil(missing.total/12)-1));const result=currentPage===page?missing:await repository.search('',{approvedOnly:true,libraryOnly:true,missingArt:true,excludeIds,limit:12,offset:currentPage*12,lesson});return {scope:repository.scope.id,error:false,...result,totalWords:all.total,currentPage};}catch{return {scope:repository.scope.id,error:true,words:[],total:0,totalWords:0,currentPage:0};}},[repository,lesson,page]);
 if(!data||data.scope!==repository?.scope.id)return <DatabaseLoading/>;if(data.error)return <ReadFailure/>;
 return <div className="reading-page page-flow"><Back href={lesson?`/library?lesson=${encodeURIComponent(lesson)}`:'/library'}/><h1>{t('Bổ sung hình cho từ','Add word pictures')}</h1>
 {!data.total&&<EmptyState title={data.totalWords?t('Không còn từ cần bổ sung hình','No more pictures to add'):t('Cùng thêm hình cho từ nhé!','Let’s add word pictures!')} description={data.totalWords?t('Cáo đã xem hết rồi! Quay về thư viện để chọn bài học nhé.','Fox checked them all! Head to your library to choose a lesson.'):t('Thêm vài từ trước, rồi cùng Cáo chọn hình dễ thương cho bài học.','Add a few words, then choose cute pictures with Fox.')}><Button asChild><a href={data.totalWords?(lesson?`/library?lesson=${encodeURIComponent(lesson)}`:'/library'):'/add'}>{data.totalWords?t('Về thư viện','Back to library'):t('Thêm từ mới','Add a word')}</a></Button></EmptyState>}
 {data.words.map(word=><PictureItem key={word.id} word={word}/>)}
 {data.total>12&&<nav className="picker-pagination"><Button variant="secondary" disabled={!data.currentPage} onClick={()=>setPage(data.currentPage-1)}>{t('Trước','Previous')}</Button><span>{data.currentPage+1} / {Math.ceil(data.total/12)}</span><Button variant="secondary" disabled={(data.currentPage+1)*12>=data.total} onClick={()=>setPage(data.currentPage+1)}>{t('Sau','Next')}</Button></nav>}
 </div>;
}

function PictureItem({word:group}:{word:LibraryWord}){
 const [selectedId,setSelectedId]=useState(group.id);
 const senses=group.relatedSenses??[group];
 const word=senses.find(sense=>sense.id===selectedId)??senses[0];
 const {repository,t}=useApp();const [busy,setBusy]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 return <article className="picture-prepare-item"><header><Image src="/illustrations/fox.svg" alt="" width={56} height={56}/><div><h2 lang="en">{word.word}</h2><p>{word.vi}</p></div></header>{senses.length>1&&<label className="picture-sense-choice">{t('Nghĩa cần hình','Meaning to illustrate')}<select value={word.id} disabled={busy||saving} onChange={event=>{setSelectedId(event.target.value);setError('');}}>{senses.map(sense=><option key={sense.id} value={sense.id}>{sense.vi} · {sense.pos}</option>)}</select></label>}<div className="picture-prepare-actions"><SubmitButton type="button" variant="outline" state={saving?'pending':error?'error':'idle'} error={error} disabled={busy||saving} onClick={async()=>{if(!repository||saving)return;setSaving(true);setError('');try{await skipPicture(repository,word.id,word.revision);}catch(cause){setError(submitError(cause,t));}finally{setSaving(false);}}}>{t('Không bổ sung','Skip picture')}</SubmitButton><WordPictureSearch key={`${word.id}:${word.revision}`} word={word} onBusyChange={setBusy}/></div></article>;
}
