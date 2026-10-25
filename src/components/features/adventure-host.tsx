'use client';
import {useMemo,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {DatabaseLoading} from '@/components/app/database-boundary';
import {Button} from '@/components/ui/button';
import {PracticeRepository} from '@/data/local/practice';
import type {PracticeFilter} from '@/lib/learning/practice-filter';
import {type AdventureMode} from '@/lib/learning/adventure-registry';
import {playWord} from '@/lib/learning/adventure-facts';
import {buildAdventure} from '@/lib/learning/adventure-engine';
import {loadPicture} from '@/lib/media/load-picture';
import {AdventureGame} from './adventure-game';
import {PracticeScope} from './practice-scope';
export function AdventureHost({mode,practice,filter,onLeave}:{mode:AdventureMode;practice:PracticeRepository;filter:PracticeFilter;onLeave:()=>void}){
 const {t}=useApp(),[retry,setRetry]=useState(0),identity=JSON.stringify(filter);
 const data=useLiveQuery(async()=>{try{const input=await practice.gameInputs(filter);const art=mode==='place-object'?'/illustrations/adventure-room.webp':null;if(art&&!await loadPicture(art))throw new Error('art-unavailable');return {input,error:false};}catch{return {input:null,error:true};}},[practice,identity,mode,retry]);
 const fingerprint=JSON.stringify(data?.input&&[data.input.words.map(w=>[w.id,w.revision,w.art,w.example,w.pronunciations]),data.input.grammars]);
 // Freeze the random draw across taps and audio state. Rebuild only for real source/scope changes.
 const pack=useMemo(()=>data?.input?buildAdventure(mode,data.input.words.flatMap(w=>{const ready=playWord(w);return ready?[ready]:[];}),data.input.grammars):null,[mode,fingerprint]); // eslint-disable-line react-hooks/exhaustive-deps
 if(!data)return <DatabaseLoading/>;
 if(data.error||!pack)return <section className="page-flow"><p role="alert">{t('Chưa mở được trò chơi. Mình thử lại nhé.','Could not open the game. Let’s retry.')}</p><Button onClick={()=>setRetry(n=>n+1)}>{t('Thử lại','Retry')}</Button><Button variant="outline" onClick={onLeave}>{t('Về chọn trò chơi','Back to games')}</Button></section>;
 return <AdventureGame key={`${mode}:${fingerprint}`} pack={pack} onLeave={onLeave} settings={<details className="dialogue-settings"><summary>{t('Thông tin bài chơi','Activity information')}</summary><div className="page-flow"><PracticeScope filter={filter} grammar={!!pack.grammar}/><p>{pack.source==='sample'?t('Đang chơi bộ mẫu vì phần đã chọn chưa có nội dung phù hợp.','Playing sample activities because this selection has no suitable content yet.'):t('Dùng nội dung đã duyệt trong phần đang chọn.','Using approved content from your selection.')}</p>{pack.grammar&&<p>{pack.grammar.formula}</p>}<p>{pack.eligible} {t('từ phù hợp trong lượt này','eligible words in this round')}</p>{mode==='sound-hunt'&&<p>{t('Nghe từ mẫu nguyên vẹn để tìm âm đầu theo IPA đã duyệt; không dùng tên chữ cái thay cho âm.','The full model word cues its first sound from approved IPA; letter names are not substituted for speech sounds.')}</p>}<p>{t('Điểm trò chơi không thay lịch ôn. Rời trang sẽ bắt đầu lại lượt này.','Game scores do not change review dates. Leaving restarts this round.')}</p></div></details>}/>;
}
