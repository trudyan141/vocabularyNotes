'use client';
import {useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {DatabaseLoading} from '@/components/app/database-boundary';
import {AudioControl} from '@/components/app/audio-control';
import {Button} from '@/components/ui/button';
import type {LocalRepository} from '@/data/local/repository';
import {refreshPreparedShadowing} from '@/data/cloud/shadowing';
import {saveShadowResult} from '@/data/local/shadowing';
import {pendingShadowUpgrades,type ShadowLevel} from '@/lib/learning/shadowing';
import type {PracticeFilter} from '@/lib/learning/practice-filter';
import {LevelExplanation} from './level-explanation';

export function ShadowUpgradeReview({repo,filter,level,baseText,familyId}:{repo:LocalRepository;filter:PracticeFilter;level:Exclude<ShadowLevel,'basic'>;baseText:string;familyId:string}){
 const {t}=useApp(),[busy,setBusy]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const data=useLiveQuery(async()=>{try{return {items:await pendingShadowUpgrades(repo,filter,level,baseText,familyId),error:false};}catch{return {items:[],error:true};}},[repo,filter.word,filter.lesson,filter.deck,filter.set,level,baseText,familyId,retry]);
 if(!data)return <DatabaseLoading/>;
 if(data.error)return <><p role="alert">{t('Chưa đọc được câu đang chờ duyệt.','Could not read pending sentences.')}</p><Button onClick={()=>setRetry(n=>n+1)}>{t('Thử lại','Retry')}</Button></>;
 const writable=repo.scope.kind!=='shared';
 return <div className="page-flow"><h2>{data.items.length?t(`Câu ${level} đã tạo, chờ duyệt`,`${level} sentence ready for review`):t('Chưa có bản nâng cao của câu này','No linked upgrade for this sentence yet')}</h2><p lang="en">{baseText}</p>{data.items.length?<>
 <p>{t('Xem câu dưới đây. Bấm duyệt để dùng câu này trong lượt chơi; các câu khác vẫn giữ trạng thái hiện tại.','Review the sentence below and approve it to use it in this round. Other sentences keep their current status.')}</p>
 {data.items.map(({row,line,index})=><section className="page-flow" key={`${row.id}:${index}`}><h3 lang="en">{line.text}</h3><p>{line.vi}</p><AudioControl text={line.text}/><LevelExplanation level={level} text={line.text} baseText={baseText}/>{writable?<Button disabled={busy} onClick={()=>{setBusy(true);setError('');void saveShadowResult(repo,row,{...row.payload,edited:true,decisions:{...row.payload.decisions,[`${level}:${index}`]:'approved'}}).catch(()=>setError(t('Chưa duyệt được vì nội dung đã đổi hoặc chưa lưu được. Thử lại nhé.','Could not approve; content changed or saving failed. Please retry.'))).finally(()=>setBusy(false));}}>{busy?t('Đang lưu…','Saving…'):t('Duyệt và dùng câu này','Approve and use this sentence')}</Button>:<p>{t('Chủ thư viện cần duyệt câu trước khi dùng trong game.','The library owner needs to approve this sentence before play.')}</p>}</section>)}
 </>:<><p>{t('Chưa tìm thấy câu đã duyệt hoặc câu chờ duyệt khớp câu gốc này. Mở phần chuẩn bị bên dưới để kiểm tra và bổ sung.','No approved or pending upgrade matches this original. Open preparation below to check and generate it.')}</p>{repo.scope.kind==='account'&&<Button disabled={busy} onClick={()=>{setBusy(true);setError('');void refreshPreparedShadowing(repo,AbortSignal.timeout(60000)).then(()=>setRetry(n=>n+1)).catch(()=>setError(t('Chưa tải được bộ câu từ tài khoản. Kiểm tra mạng rồi thử lại.','Could not retrieve prepared sentences. Check your connection and retry.'))).finally(()=>setBusy(false));}}>{busy?t('Đang tải bộ câu…','Loading prepared sentences…'):t('Tải lại tất cả câu đã tạo','Retrieve all prepared sentences')}</Button>}{writable&&<Button variant="outline" onClick={()=>{const panel=document.getElementById('shadowing-preparation');panel?.setAttribute('open','');panel?.scrollIntoView({block:'start'});}}>{t('Mở phần chuẩn bị câu','Open sentence preparation')}</Button>}</>}{error&&<p role="alert">{error}</p>}</div>;
}
