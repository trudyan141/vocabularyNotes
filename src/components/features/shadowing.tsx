'use client';
import Image from 'next/image';
import {useEffect,useState} from 'react';
import {refreshPreparedShadowing} from '@/data/cloud/shadowing';
import {useSearchParams} from 'next/navigation';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {DatabaseLoading} from '@/components/app/database-boundary';
import {Back} from '@/components/app/shared';
import {AudioControl} from '@/components/app/audio-control';
import {Button} from '@/components/ui/button';
import {PracticeSelection} from './practice-selection';
import {PracticeScope} from './practice-scope';
import {ShadowTake,type ShadowScore} from './shadowing-take';
import {ShadowContentTools} from './shadowing-preparation';
import {LevelExplanation} from './level-explanation';
import {ShadowUpgradeReview} from './shadowing-upgrade-review';
import {practiceFilter,practiceHref} from '@/lib/learning/practice-filter';
import {useExtensionVisibility} from '@/lib/learning/extension-visibility';
import {shadowPool,type ShadowLevel} from '@/lib/learning/shadowing';

export function Shadowing(){const {repository}=useApp(),params=useSearchParams(),{visible}=useExtensionVisibility(repository?.scope.id??'none');return <PracticeSelection><ShadowGame key={`${repository?.scope.id}:${params.toString()}:${visible}`}/></PracticeSelection>;}
function ShadowGame(){
 const {repository,t}=useApp(),params=useSearchParams(),filter=practiceFilter(params),visibility=useExtensionVisibility(repository?.scope.id??'none');
 const [chosen,setChosen]=useState<ShadowLevel>('basic'),[round,setRound]=useState(0),[position,setPosition]=useState(0),[retry,setRetry]=useState(0),[scores,setScores]=useState<Record<number,ShadowScore>>({}),[anchor,setAnchor]=useState<{text:string;familyId:string}|null>(null),[basicPosition,setBasicPosition]=useState(0);
 const level=visibility.visible?chosen:'basic';
 useEffect(()=>{if(!repository||repository.scope.kind!=='account')return;const controller=new AbortController();void refreshPreparedShadowing(repository,controller.signal).catch(()=>{});return()=>controller.abort();},[repository]);
 const [seed]=useState(()=>Math.random());
 const rank=(id:string)=>{let n=Math.floor(seed*1000000)+round;for(const c of id)n=Math.imul(n,31)+c.charCodeAt(0)|0;return n;};
 const data=useLiveQuery(async()=>{if(!repository)return null;try{return {level,round,pool:(await shadowPool(repository,filter,level,anchor?.text,anchor?.familyId)).sort((a,b)=>rank(a.id)-rank(b.id)).slice(0,5),error:false};}catch{return {level,round,pool:[],error:true};}},[repository,params.toString(),level,round,retry,anchor?.text,anchor?.familyId]);
 function change(next:ShadowLevel){window.dispatchEvent(new Event('wfk-audio-stop'));const active=current?.pool[position];if(chosen==='basic'&&active){setBasicPosition(position);setAnchor({text:active.text,familyId:active.familyId??active.source});}if(next==='basic')setAnchor(null);setScores({});setChosen(next);setPosition(next==='basic'?basicPosition:0);}
 const current=data?.level===level&&data.round===round?data:null,item=current?.pool[position];
 return <div className="reading-page page-flow"><Back href={practiceHref(filter)}/><header className="section-heading"><h1>{t('Shadowing · Nói theo Cáo','Shadowing with Fox')}</h1><Image src="/illustrations/fox.svg" width={80} height={80} alt=""/></header>
 <div key={`${visibility.visible}:${level}`} className="page-flow">{!current?<DatabaseLoading/>:current.error?<><p role="alert">{t('Chưa đọc được bài. Thử lại nhé.','Could not read the lesson.')}</p><Button onClick={()=>setRetry(n=>n+1)}>{t('Thử lại','Retry')}</Button></>:!item&&level!=='basic'&&!current.pool.length?<section className="page-flow">{repository&&anchor&&<ShadowUpgradeReview repo={repository} filter={filter} level={level} baseText={anchor.text} familyId={anchor.familyId}/>}<Button onClick={()=>change('basic')}>{t('Về câu cơ bản','Back to basic')}</Button></section>:!item?<><h2>{t('Con đã hoàn thành!','Well done!')}</h2><p>{Object.keys(scores).length} / {current.pool.length} {t('câu có điểm','scored sentences')}</p>{Object.values(scores).length>0&&<p>{Object.values(scores).some(s=>s.temporary)?t('Điểm tạm: ','Temporary score: '):t('Điểm luyện tập: ','Practice score: ')}{Math.round(Object.values(scores).reduce((n,s)=>n+s.score,0)/Object.values(scores).length)}/100</p>}<Button onClick={()=>{setScores({});setPosition(0);setRound(n=>n+1);}}>{t('Lượt mới','New round')}</Button></>:<section className="page-flow" key={`${round}:${item.id}`}><p>{position+1} / {current.pool.length} · {level==='basic'?t('Cơ bản','Basic'):level}</p><h2 lang="en">{item.text}</h2>{level!=='basic'&&<details><summary>{t('Câu gốc của bé','Original basic sentence')}</summary><p lang="en">{item.baseText}</p></details>}{level!=='basic'&&<LevelExplanation level={level} text={item.text} baseText={item.baseText}/>}<p>{t('Nghe mẫu, rồi nói lại cả câu.','Listen, then repeat the whole sentence.')}</p><div className="row-wrap"><AudioControl text={item.text}/><AudioControl text={item.text} slow/></div><ShadowTake text={item.text} onResult={value=>setScores(old=>{const next={...old};if(value)next[position]=value;else delete next[position];return next;})}/><Button onClick={()=>{window.dispatchEvent(new Event('wfk-audio-stop'));setPosition(n=>n+1);}}>{t('Câu tiếp theo','Next sentence')}</Button><details><summary>{t('Nghĩa câu','Meaning')}</summary><p>{item.vi}</p></details></section>}</div>
 <details key={`settings:${visibility.visible}`}><summary>{t('Đổi bài chơi','Change activity')}</summary><PracticeScope filter={filter}/><p>{current?.pool[0]?.source==='sample'?t('Đang dùng câu mẫu vì phần chọn chưa có câu phù hợp đã duyệt.','Using sample sentences.'):t('Câu từ nội dung đã duyệt trong phạm vi chọn.','Approved sentences in your selection.')}</p><Button variant="outline" onClick={()=>change('basic')}>{t('Cơ bản','Basic')}</Button>{visibility.visible&&<details><summary>Shadowing B1–B2</summary><p>{t('Gợi ý mức luyện, chưa xác minh CEFR.','Practice suggestions; CEFR not verified.')}</p><div className="row-wrap">{(['B1','B2'] as const).map(l=><Button key={l} variant="outline" onClick={()=>change(l)}>{l}</Button>)}</div></details>}<p>{t('Điểm luyện tập do AI ước lượng; không chứng nhận trình độ. Bản thu và điểm chỉ giữ trong lượt này.','AI practice estimate, not a proficiency certificate. Recordings and scores stay in this round.')}</p></details>
 <ShadowContentTools/>
 </div>;
}
