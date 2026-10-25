"use client";
import {isGrammarGame} from '@/lib/learning/game-registry';
import {useMemo} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {PracticeRepository,type Session} from '@/data/local/practice';
import type {CycleProgress} from '@/data/local/practice-cycle';

export function CycleProgressText({progress}:{progress:CycleProgress|null|undefined}){
 const {t}=useApp();if(!progress)return null;
 const grammar=isGrammarGame(progress.cycle.mode);
 const {done,total,unavailable,skipped,today}=progress;
 return <span className="cycle-progress-copy"><span className="cycle-progress-line">{t(`Cả bộ: ${done}/${total} ${grammar?'câu':'từ'} đã làm`,`Whole set: ${done}/${total} ${grammar?'sentences':'words'} practiced`)}</span>
  {(unavailable>0||skipped>0)&&<span className="cycle-progress-line">{[unavailable?t(`${unavailable} mục đã đổi hoặc không còn hợp lệ`,`${unavailable} items changed or unavailable`):'',skipped?t(`${skipped} mục đã bỏ qua, để làm sau`,`${skipped} skipped items to practice later`):''].filter(Boolean).join(' · ')}</span>}
  <small>{t(`Hôm nay: ${today} · Lần chơi gần nhất: `,`Today: ${today} · Last played: `)}{new Date(progress.lastPlayedAt).toLocaleDateString('vi-VN',{day:'numeric',month:'numeric'})}</small>
  {progress.complete&&<span className="cycle-progress-line">{unavailable?t('Đã làm hết phần còn hợp lệ của vòng này.','Finished the available items in this cycle.'):t('Con đã đi hết bộ này!','You practiced the whole set!')}</span>}
 </span>;
}
export function SavedCycleProgress({session}:{session:Session}){
 const {repository}=useApp();const practice=useMemo(()=>repository?new PracticeRepository(repository):null,[repository]);
 const snapshot=useLiveQuery(async()=>practice&&session.cycleId?{scope:practice.repository.scope.id,value:await practice.progress(session.cycleId)}:null,[practice,session.cycleId]);
 return <CycleProgressText progress={snapshot?.scope===repository?.scope.id?snapshot?.value:null}/>;
}
