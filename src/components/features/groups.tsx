'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {useLiveQuery} from 'dexie-react-hooks';
import {FolderHeart,Plus,PencilLine,Play,BookOpen,MessageCircle,ChevronLeft,ChevronRight} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Artwork,Back,EmptyState} from '@/components/app/shared';
import {ParentGate} from '@/components/app/parent-gate';
import {AudioControl} from '@/components/app/audio-control';
import {DatabaseLoading,ReadFailure} from '@/components/app/database-boundary';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {studyGroups,groupContents} from '@/data/local/groups';
const pageSize=12;
export function Groups(){const {repository}=useApp();return <ScopedGroups key={repository?.scope.id??'loading'}/>;}
function ScopedGroups(){
 const {repository,t}=useApp(),params=useSearchParams();
 const [mode,setMode]=useState<'words'|'sentences'>('words'),[query,setQuery]=useState(''),[page,setPage]=useState(0);
 const groupId=params.get('group');
 const data=useLiveQuery(async()=>{if(!repository)return null;try{const rows=await studyGroups(repository),selected=rows.find(row=>row.id===groupId);return {scope:repository.scope.id,error:false,rows,selected,content:selected?await groupContents(repository,selected,query):null};}catch{return {scope:repository.scope.id,error:true,rows:[],selected:undefined,content:null};}},[repository,groupId,query]);
 if(!data||data.scope!==repository?.scope.id)return <DatabaseLoading/>;
 if(data.error)return <ReadFailure/>;
 const selected=data.selected,content=data.content;
 const total=content?(mode==='words'?content.words.length:content.sentences.length):data.rows.length;
 const currentPage=Math.min(page,Math.max(0,Math.ceil(total/pageSize)-1));
 const start=currentPage*pageSize;
 return <div className="reading-page page-flow study-groups">
  <Back href={groupId?'/library/groups':'/library'}/>
  <header className="section-heading"><div><h1>{selected?selected.payload.deck.name:t('Nhóm học của con','My learning groups')}</h1><p className="muted">{t('Gom từ và câu theo chủ đề để dễ tìm, dễ học.','Keep words and sentences together by topic.')}</p></div><ParentGate href={`/library/groups/edit${selected?`?id=${encodeURIComponent(selected.id)}`:''}`}><Button variant={selected?"outline":"default"}>{selected?<PencilLine aria-hidden="true"/>:<Plus aria-hidden="true"/>}{selected?t('Sửa nhóm','Edit group'):t('Tạo nhóm','Create group')}</Button></ParentGate></header>
  {groupId&&!selected?<EmptyState title={t('Chưa mở được nhóm này','This group is unavailable')} description={t('Nhóm có thể đã đổi hoặc không thuộc thư viện đang mở. Quay lại để chọn nhóm khác.','Return to choose a group from the current library.')}/>:selected&&content?<>
   <div className="row-wrap group-overview"><FolderHeart aria-hidden="true"/><strong>{selected.payload.deck.group.wordIds.length} {t('từ','words')} · {selected.payload.deck.group.sentences.length} {t('câu','sentences')}</strong>{content.missing>0&&<span>{t(`${content.missing} mục cần bố mẹ kiểm lại`,`${content.missing} items need parent review`)}</span>}</div>
   {selected.payload.deck.group.wordIds.length>0&&<Button asChild className="self-start"><Link href={`/practice?deck=${encodeURIComponent(selected.id)}`}><Play aria-hidden="true"/>{t('Học từ trong nhóm','Practice group words')}</Link></Button>}
   <div className="content-modes group-tabs"><Button variant="segment" aria-pressed={mode==='words'} onClick={()=>{setMode('words');setPage(0);}}><BookOpen aria-hidden="true"/>{t('Từ','Words')}</Button><Button variant="segment" aria-pressed={mode==='sentences'} onClick={()=>{setMode('sentences');setPage(0);}}><MessageCircle aria-hidden="true"/>{t('Câu','Sentences')}</Button></div>
   <label>{t('Tìm trong nhóm','Search this group')}<Input type="search" value={query} onChange={event=>{setQuery(event.target.value);setPage(0);}} placeholder={t('Tìm tiếng Anh hoặc tiếng Việt…','Search English or Vietnamese…')}/></label>
   {!total&&<EmptyState title={t('Chưa có mục phù hợp','No matching items')} description={query?t('Thử từ khác nhé.','Try another word.'):t('Bố mẹ có thể thêm từng từ, câu hoặc cả bài học vào nhóm.','Parents can add words, sentences or a whole lesson.')}/>}
   {mode==='words'?<ul className="group-word-list">{content.words.slice(start,start+pageSize).map(word=><li key={word.id}><Link href={`/library/words/${encodeURIComponent(word.id)}`}><Artwork art={word.art} word={word.word} size={64}/><span><strong lang="en">{word.word}</strong><small>{word.vi} · {word.pos}</small></span></Link></li>)}</ul>:<div className="group-sentences">{content.sentences.slice(start,start+pageSize).map(item=><article key={item.id} className="group-sentence"><p lang="en">{item.textEn}</p><p>{item.textVi}</p><AudioControl text={item.textEn}/><Button asChild variant="link"><Link href={`/library/words/${encodeURIComponent(item.senseId)}`}>{t('Xem ngữ cảnh','View context')}</Link></Button></article>)}</div>}
  </>:<>{!data.rows.length?<EmptyState title={t('Một nhóm, một chủ đề','A group for every topic')} description={t('Ví dụ: Anh văn Family, Anh văn tiểu học. Bố mẹ chọn từ và câu đã lưu cho từng nhóm.','For example: Family English or Primary English. Parents choose saved words and sentences for each group.')}/>:<div className="group-list">{data.rows.slice(start,start+pageSize).map((row,i)=><Link className={`group-link ${i%2?'lilac':'mint'}`} key={row.id} href={`/library/groups?group=${encodeURIComponent(row.id)}`}><FolderHeart aria-hidden="true"/><span><strong>{row.payload.deck.name}</strong><small>{row.payload.deck.group.wordIds.length} {t('từ','words')} · {row.payload.deck.group.sentences.length} {t('câu','sentences')}</small></span><ChevronRight aria-hidden="true"/></Link>)}</div>}</>}
  {total>pageSize&&<nav className="picker-pagination" aria-label={t('Trang nhóm học','Learning group pages')}><Button variant="secondary" disabled={!currentPage} onClick={()=>setPage(currentPage-1)}><ChevronLeft aria-hidden="true"/>{t('Trước','Previous')}</Button><span>{currentPage+1} / {Math.ceil(total/pageSize)}</span><Button variant="secondary" disabled={start+pageSize>=total} onClick={()=>setPage(currentPage+1)}>{t('Sau','Next')}<ChevronRight aria-hidden="true"/></Button></nav>}
 </div>;
}
