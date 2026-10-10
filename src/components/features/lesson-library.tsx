'use client';
import {useState} from 'react';
import Link from 'next/link';
import {CalendarDays, ChevronLeft, ChevronRight, ImagePlus, PencilLine, Play, Search, X, BookOpen, FileImage, Keyboard, FolderPlus} from 'lucide-react';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {Artwork, Back, EmptyState} from '@/components/app/shared';
import {ParentGate} from '@/components/app/parent-gate';
import {DatabaseLoading, ReadFailure} from '@/components/app/database-boundary';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {LessonEditor} from '@/components/features/lesson-editor';
import {lessonSets} from '@/data/local/lesson-library';
import {learningDate, lessonTitle} from '@/lib/learning/lesson-presentation';
import type {Lesson} from '@/data/local/types';

const PAGE_SIZE = 12;
export function LessonLibrary() {
  const {repository,t} = useApp();
  const [query,setQuery] = useState('');
  const [page,setPage] = useState(0);
  const [editing,setEditing] = useState<Lesson|null>(null);
  const [saved,setSaved] = useState('');
  const data = useLiveQuery(async()=> {
    if (!repository) return null;
    try {return {scope:repository.scope.id,error:false,rows:await lessonSets(repository,query)};}
    catch {return {scope:repository.scope.id,error:true,rows:[]};}
  },[repository,query]);
  if (!data || data.scope !== repository?.scope.id) return <DatabaseLoading/>;
  if (data.error) return <ReadFailure/>;
  const currentPage = Math.min(page,Math.max(0,Math.ceil(data.rows.length/PAGE_SIZE)-1));
  const visible = data.rows.slice(currentPage*PAGE_SIZE,(currentPage+1)*PAGE_SIZE);
  const days = [...new Set(visible.map(row=>row.lesson.learnedOn))];
  const addPhoto = <ParentGate href="/capture"><Button variant="secondary"><ImagePlus data-icon="inline-start" aria-hidden="true"/>{t('Thêm ảnh / file cho bộ mới','Add a photo / file for a new set')}</Button></ParentGate>;
  return <div className="reading-page page-flow lesson-library">
    <Back href="/library"/>
    <header className="lesson-library-heading">
      <div><h1>{t('Bộ từ theo ngày','Word sets by date')}</h1><p>{t('Tìm bài của con, cùng ôn một chút nhé!','Find your lesson. Let’s learn a little together!')}</p></div>
      {addPhoto}
    </header>
    <div className="lesson-search">
      <label htmlFor="sets-search">{t('Tìm bộ từ','Find a word set')}</label>
      <div className="lesson-search-field"><Search aria-hidden="true"/><Input id="sets-search" type="search" value={query} onChange={event=>{setQuery(event.target.value);setPage(0);}} placeholder={t('Tên bài, từ hoặc ngày học…','Title, word or learning date…')}/>{query&&<Button variant="ghost" size="icon" aria-label={t('Xóa tìm kiếm','Clear search')} onClick={()=>{setQuery('');setPage(0);}}><X aria-hidden="true"/></Button>}</div>
    </div>
    {saved&&<p className="lesson-save-status" role="status">{saved}</p>}
    {!days.length&&<EmptyState title={query?t('Chưa tìm thấy bộ từ','No matching word sets'):t('Bộ từ đầu tiên của con','Your first word set')} description={query?t('Thử một từ trong bài hoặc ngày học khác nhé.','Try a word from the lesson or another learning date.'):t('Thêm ảnh bài học, hoặc gõ từ mới để bắt đầu.','Add a lesson photo, or type new words to get started.')}><ParentGate href="/add"><Button><PencilLine data-icon="inline-start" aria-hidden="true"/>{t('Gõ từ mới cho con','Type new words')}</Button></ParentGate></EmptyState>}
    {days.map(day=><section className="lesson-day-group" key={day} aria-label={learningDate(day,t)}>
      <h2 className="lesson-date"><CalendarDays aria-hidden="true"/><time dateTime={day}>{learningDate(day,t)}</time></h2>
      <div className="lesson-set-list">
        {visible.filter(row=>row.lesson.learnedOn===day).map(({lesson,total,newCount,reviewCount,preview,words})=> {
          const title=lessonTitle(lesson,t);
          const SourceIcon=lesson.sourceType==='image'?FileImage:lesson.sourceType==='demo'?BookOpen:Keyboard;
          return <article className="lesson-set" key={lesson.id}>
            <div className={`lesson-set-art ${lesson.sourceType==='manual'?'lilac':'mint'}`} aria-hidden="true">
              {preview.some(word=>word.art)?preview.filter(word=>word.art).slice(0,3).map((word,i)=><div className="lesson-preview-art" key={i}><Artwork art={word.art} word={word.word} size={80}/></div>):<BookOpen/>}
            </div>
            <div className="lesson-set-content">
              <div className="lesson-set-title"><div><h3>{title}</h3><p className="lesson-source"><SourceIcon aria-hidden="true"/>{lesson.sourceType==='image'?t('Bài từ ảnh','From a photo'):lesson.sourceType==='demo'?t('Bài mẫu','Sample lesson'):t('Bố mẹ thêm từ','Added by parents')}</p></div><Button variant="ghost" size="icon" aria-label={`${t('Đổi tên / ngày','Change title / date')}: ${title}`} onClick={()=>{setSaved('');setEditing(lesson);}}><PencilLine aria-hidden="true"/></Button></div>
              <p className="lesson-word-preview">{words.join(' · ')}{total>words.length&&` · +${total-words.length}`}</p>
              <div className="lesson-set-counts"><strong>{total} {t('từ','words')}</strong><span>{newCount} {t('từ mới','new')}</span>{reviewCount>0&&<span>{reviewCount} {t('ôn lại','review')}</span>}</div>
              <div className="lesson-set-actions"><Button asChild><Link href={`/practice?lesson=${encodeURIComponent(lesson.id)}`}><Play data-icon="inline-start" aria-hidden="true"/>{t('Học bộ này','Learn this set')}</Link></Button><Button asChild variant="ghost"><Link href={`/library?lesson=${encodeURIComponent(lesson.id)}`}><BookOpen data-icon="inline-start" aria-hidden="true"/>{t('Xem bộ từ','View set')}</Link></Button><ParentGate href={`/library/groups/edit?lesson=${encodeURIComponent(lesson.id)}`}><Button variant="ghost"><FolderPlus aria-hidden="true"/>{t("Thêm vào nhóm","Add to group")}</Button></ParentGate></div>
            </div>
            {editing?.scopeId===repository?.scope.id&&editing.id===lesson.id&&<LessonEditor key={`${editing.scopeId}:${editing.id}:${editing.version}`} lesson={editing} close={()=>setEditing(null)} saved={title=>{setEditing(null);setSaved(t(`Đã lưu tên bộ: ${title}`,`Saved set title: ${title}`));}}/>}
          </article>;
        })}
      </div>
    <ParentGate href={`/library/groups/edit?day=${encodeURIComponent(day)}`}><Button variant="ghost" className="self-start"><FolderPlus aria-hidden="true"/>{t("Thêm cả ngày vào nhóm","Add this day to a group")}</Button></ParentGate></section>)}
    {data.rows.length>PAGE_SIZE&&<nav className="lesson-pagination row-wrap" aria-label={t('Trang bộ từ','Word set pages')}><Button variant="secondary" disabled={currentPage===0} onClick={()=>{setEditing(null);setPage(currentPage-1);}}><ChevronLeft data-icon="inline-start" aria-hidden="true"/>{t('Trang trước','Previous')}</Button><span role="status">{currentPage+1} / {Math.ceil(data.rows.length/PAGE_SIZE)}</span><Button variant="secondary" disabled={(currentPage+1)*PAGE_SIZE>=data.rows.length} onClick={()=>{setEditing(null);setPage(currentPage+1);}}>{t('Trang sau','Next')}<ChevronRight data-icon="inline-end" aria-hidden="true"/></Button></nav>}
    <details className="lesson-help"><summary>{t('Từ mới và ôn lại là gì?','What do new and review mean?')}</summary><p>{t('Từ mới xuất hiện lần đầu trong thư viện. Ôn lại là từ đã có ở bài trước. Mỗi ảnh là một bộ riêng; từ bố mẹ gõ được gom theo ngày học.','New words appear for the first time in your library. Review words appeared in an earlier set. Each photo has its own set; typed words are grouped by learning date.')}</p></details>
  </div>;
}
