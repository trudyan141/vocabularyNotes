"use client";
import {SavedCycleProgress} from './practice-progress';
import Link from 'next/link';
import {ArrowRight,Trophy,ChevronLeft,ChevronRight} from 'lucide-react';
import {useMemo,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {Artwork} from '@/components/app/shared';
import {PracticeRepository,type Session,type Mode} from '@/data/local/practice';
import {groupContents,type StudyGroup} from '@/data/local/groups';
import type {Deck} from '@/data/local/decks';
import type {ScopedDocument} from '@/data/local/types';
import {lessonTitle} from '@/lib/learning/lesson-presentation';
import {practiceHref} from '@/lib/learning/practice-filter';
export const modes:[Mode,string,string][]=[["flashcard","Thẻ ôn","Flashcards"],["picture-word","Nhìn hình chọn từ","Picture to word"],["word-picture","Nghe từ chọn hình","Word to picture"],["letters","Điền chữ thiếu","Missing letters"],["spelling","Gõ cả từ","Spell the word"],["missing-letters","Tìm ký tự thiếu","Find missing letters"],["grammar-card","Nghe & hiểu ngữ pháp","Listen & understand grammar"],["grammar","Xếp câu","Build sentences"]];
export const modeArt={flashcard:"book","picture-word":"apple","word-picture":"cat",letters:"pencil",spelling:"bag","missing-letters":"pencil",grammar:"notebook","grammar-card":"notebook"};
export function SessionCard({session,open,href,className="session-history-card"}:{session:Session;open?:()=>void;href?:string;className?:string}){const {t,repository}=useApp();const filter=session.filter;
 const names=useLiveQuery(async()=>{
  if(!repository)return null;const [lesson,deck,word]=await Promise.all([filter?.lesson?repository.db.lessons.get([repository.scope.id,filter.lesson]):null,filter?.deck?repository.db.table<ScopedDocument>('decks').get([repository.scope.id,filter.deck]):null,filter?.word?repository.word(filter.word):null]);
  const activeDeck=deck&&!deck.deletedAt?deck:null;const set=activeDeck&&filter?.set?(await groupContents(repository,activeDeck as StudyGroup)).sets.find(set=>set.id===filter.set):null;
  return {scope:repository.scope.id,lesson:lesson&&!lesson.deletedAt?lesson:null,deck:activeDeck?(activeDeck.payload.deck as Deck).name:null,set,word:word?.word};
 },[repository,filter?.lesson,filter?.deck,filter?.set,filter?.word]);
 const current=names?.scope===repository?.scope.id?names:null;
 const sources=!filter?[t('Phạm vi lượt cũ chưa được lưu','Scope of this older round was not saved')]:[
  ...(filter.deck?[`${t('Nhóm','Group')}: ${current?.deck??t('Nhóm đã chọn','Selected group')}`]:[]),
  ...(filter.lesson?[`${t('Bài','Lesson')}: ${current?.lesson?lessonTitle(current.lesson,t):t('Bài đã chọn','Selected lesson')}`]:[]),
  ...(filter.set?[`${t('Bài','Lesson')}: ${current?.set?lessonTitle(current.set,t):t('Bài trong nhóm đã chọn','Selected group lesson')}`]:[]),
  ...(filter.word?[`${t('Từ','Word')}: ${current?.word??t('Từ đã chọn','Selected word')}`]:[]),
  ...(!filter.deck&&!filter.lesson&&!filter.word?[t('Tất cả bài và nhóm','All lessons and groups')]:[]),
  ...(filter.due?[t('Từ đến hạn ôn','Words due for review')]:[]),...(filter.weak?[t('Từ cần luyện thêm','Words needing practice')]:[])
 ];const mode=modes.find(mode=>mode[0]===session.mode),correct=session.answers.filter(answer=>answer.correct).length;const content=<><span className="session-history-art"><Artwork art={modeArt[session.mode]} word="" size={54}/></span><span className="session-history-copy"><strong>{mode?t(mode[1],mode[2]):t('Buổi học','Learning session')}</strong><small>{new Date(session.completedAt??session.createdAt).toLocaleDateString('vi-VN',{day:'numeric',month:'numeric'})} · {session.questions.length} {t('câu','questions')}</small>{sources.map((source,i)=><small className="session-source" key={i}>{source}</small>)}<SavedCycleProgress session={session}/><span>{session.completedAt?t(session.mode==='grammar-card'?`Đã xem ${session.questions.length} câu`:session.mode==='flashcard'?`Nhớ rồi ${correct}/${session.questions.length}`:`Đúng ${correct}/${session.questions.length}`,session.mode==='grammar-card'?`Reviewed ${session.questions.length} sentences`:`${correct}/${session.questions.length} correct`):t(`Tiếp tục · ${session.position}/${session.questions.length}`,`Resume · ${session.position}/${session.questions.length}`)}</span></span>{session.completedAt?<Trophy className="session-history-mark" aria-hidden="true"/>:<ArrowRight className="session-history-mark" aria-hidden="true"/>}</>;return href?<Link className={className} href={href}>{content}</Link>:<button className={className} onClick={open}>{content}</button>;}
export function SessionHistory(){const {repository}=useApp();return <ScopedSessionHistory key={repository?.scope.id??'loading'}/>;}
function ScopedSessionHistory(){
 const {repository,t}=useApp();const [page,setPage]=useState(0),[open,setOpen]=useState(false);
 const practice=useMemo(()=>repository?new PracticeRepository(repository):null,[repository]);
 const snapshot=useLiveQuery(async()=>practice?{scope:practice.repository.scope.id,...await practice.historyPage(page,open)}:null,[practice,page,open]);
 const current=snapshot?.scope===repository?.scope.id?snapshot:null;
 return <details className="practice-options session-history-panel" onToggle={event=>setOpen(event.currentTarget.open)}><summary>{t('Lịch sử buổi học','Learning history')}{current?.total?` (${current.total})`:''}</summary>
 {open&&(!current?<p role="status">{t('Đang mở lịch sử…','Loading history…')}</p>:current.total?<><div className="session-history">{current.sessions.map(session=><SessionCard key={session.id} session={session} href={practiceHref(session.filter??{},session.id)}/>)}</div>{current.total>10&&<nav className="picker-pagination" aria-label={t('Trang lịch sử buổi học','Learning history pages')}><Button variant="secondary" disabled={!current.page} onClick={()=>setPage(current.page-1)}><ChevronLeft aria-hidden="true"/>{t('Trước','Previous')}</Button><span>{current.page+1} / {Math.ceil(current.total/10)}</span><Button variant="secondary" disabled={(current.page+1)*10>=current.total} onClick={()=>setPage(current.page+1)}>{t('Sau','Next')}<ChevronRight aria-hidden="true"/></Button></nav>}</>:<p>{t('Chưa có buổi học đã hoàn thành.','No completed sessions yet.')}</p>)}
 </details>;
}
