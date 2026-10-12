"use client";
import Link from 'next/link';
import {useLiveQuery} from 'dexie-react-hooks';
import {ArrowRight,BookOpen} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {Back,EmptyState} from '@/components/app/shared';
import {DatabaseLoading,ReadFailure} from '@/components/app/database-boundary';
import {studyGroups} from '@/data/local/groups';
export function ReviewGroups(){
 const {repository,t}=useApp();const data=useLiveQuery(async()=>{if(!repository)return null;try{return {scope:repository.scope.id,rows:await studyGroups(repository),error:false};}catch{return {scope:repository.scope.id,rows:[],error:true};}},[repository]);
 if(!data||data.scope!==repository?.scope.id)return <DatabaseLoading/>;if(data.error)return <ReadFailure/>;
 return <div className="reading-page page-flow"><Back/><h1>{t('Ôn bài theo nhóm','Review by group')}</h1>{!data.rows.length&&<EmptyState title={t('Chưa có nhóm học','No learning groups yet')} description={t('Tạo nhóm từ những bài đã lưu nhé.','Create a group from your saved lessons.')}><Link href="/library/groups/edit">{t('Tạo nhóm','Create a group')}</Link><Button asChild variant="outline"><Link href="/practice">{t('Ôn tất cả từ','Review all words')}</Link></Button></EmptyState>}<div className="review-group-list">{data.rows.map(row=><Link className="review-group-card" key={row.id} href={`/practice?review=group&deck=${encodeURIComponent(row.id)}${row.payload.deck.group.wordIds.length?'':'&mode=grammar'}`}><span className="review-group-icon"><BookOpen aria-hidden="true"/></span><span><strong>{row.payload.deck.name}</strong><small>{row.payload.deck.group.wordIds.length} {t('từ','words')} · {row.payload.deck.group.grammar?.length??0} {t('cấu trúc','structures')}</small></span><ArrowRight aria-hidden="true"/></Link>)}</div></div>;
}
