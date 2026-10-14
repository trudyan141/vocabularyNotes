'use client';
import {useLiveQuery} from 'dexie-react-hooks';
import {BookOpen} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import type {PracticeFilter} from '@/lib/learning/practice-filter';
import type {ScopedDocument} from '@/data/local/types';
import {groupContents,type StudyGroup} from '@/data/local/groups';
import type {Deck} from '@/data/local/decks';
export function PracticeScope({filter,count,grammar=false,children}:{filter?:PracticeFilter;count?:number;grammar?:boolean;children?:React.ReactNode}){
 const {repository,t}=useApp();
 const names=useLiveQuery(async()=>{
  if(!repository||!filter)return null;
  const [lesson,deck,word]=await Promise.all([filter.lesson?repository.db.lessons.get([repository.scope.id,filter.lesson]):null,filter.deck?repository.db.table<ScopedDocument>('decks').get([repository.scope.id,filter.deck]):null,filter.word?repository.word(filter.word):null]);
  const set=filter.set&&deck&&!deck.deletedAt?(await groupContents(repository,deck as StudyGroup)).sets.find(set=>set.id===filter.set):null;
  return {set:set?`${set.learnedOn} · ${set.title}`:null,scope:repository.scope.id,lesson:lesson&&!lesson.deletedAt?`${lesson.learnedOn} · ${lesson.title}`:null,deck:deck&&!deck.deletedAt?(deck.payload.deck as Deck).name:null,word:word?.word};
 },[repository,filter?.lesson,filter?.deck,filter?.word,filter?.set]);
 const current=names?.scope===repository?.scope.id?names:null;
 const labels=!filter?[t('Phạm vi của lượt cũ chưa được lưu','The scope of this older round was not saved')]:[
  ...(filter.lesson?[`${t('Bài','Lesson')}: ${current?.lesson??t('Bài đã chọn','Selected lesson')}`]:[]),
  ...(filter.deck?[`${t('Nhóm / bộ thẻ','Group / deck')}: ${current?.deck??t('Nhóm đã chọn','Selected group')}`]:[]),
  ...(filter.set?[`${t('Bài trong nhóm','Group lesson')}: ${current?.set??t('Bài đã chọn','Selected lesson')}`]:[]),
  ...(filter.word?[`${t('Từ','Word')}: ${current?.word??t('Từ đã chọn','Selected word')}`]:[]),
  ...(!filter.lesson&&!filter.deck&&!filter.word?[t('Tất cả bài và nhóm học','All lessons and groups')]:[]),
  ...(!grammar&&filter.due?[t('Chỉ từ đến hạn ôn','Only words due for review')]:[]),...(!grammar&&filter.weak?[t('Chỉ từ cần luyện thêm','Only words needing practice')]:[]),
 ];
 return <section className="practice-scope" aria-label={t('Phạm vi đang ôn','Current practice scope')}><div><strong><BookOpen aria-hidden="true"/>{t('Đang ôn','Practising')}</strong><p>{labels.join(' · ')}</p>{count!==undefined&&<small>{t(`${count} ${grammar?'câu ngữ pháp':'từ'} trong lượt này`,`${count} ${grammar?'grammar sentences':'words'} in this round`)}</small>}</div>{children}</section>;
}
