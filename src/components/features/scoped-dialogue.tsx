'use client';
import {useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {DatabaseLoading} from '@/components/app/database-boundary';
import {PracticeRepository} from '@/data/local/practice';
import type {PracticeFilter} from '@/lib/learning/practice-filter';
import {dialogueExamples,dialogueScenes} from '@/lib/learning/game-examples';
import {shuffled} from '@/lib/learning/random';
import {buildScopedDialogue} from '@/lib/learning/scoped-dialogue';
import {GrammarStarter} from './grammar-starter';
import {PracticeScope} from './practice-scope';

export function ScopedDialogue({practice,filter,onLeave}:{practice:PracticeRepository;filter:PracticeFilter;onLeave:()=>void}){
 const {t}=useApp(),[selected,setSelected]=useState(''),[retry,setRetry]=useState(0),[sampleOrder]=useState(()=>shuffled(dialogueExamples.map((_,i)=>i)));
 const playArea=useRef<HTMLDivElement>(null);
 const identity=JSON.stringify(filter);
 const data=useLiveQuery(async()=>{try{return {input:await practice.dialogueInputs(filter),error:false};}catch{return {input:null,error:true};}},[practice,identity,retry]);
 if(!data)return <DatabaseLoading/>;
 if(data.error)return <div className="page-flow"><p role="alert">{t('Chưa đọc được phần đang chọn. Thử lại nhé.','Could not load your selection. Please retry.')}</p><Button onClick={()=>setRetry(n=>n+1)}>{t('Thử lại','Retry')}</Button><Button variant="outline" onClick={onLeave}>{t('Về chọn trò chơi','Back to games')}</Button></div>;
 const {words,grammars}=data.input!,key=(index:number)=>JSON.stringify([grammars[index].id,grammars[index].formula,grammars[index].example]);
 const explicit=grammars.findIndex((_,i)=>key(i)===selected),index=explicit>=0?explicit:Math.max(0,grammars.findIndex(g=>buildScopedDialogue(g,words).length>0)),grammar=grammars[index];
 const rounds=grammar?buildScopedDialogue(grammar,words):[];
 return <div className="page-flow scoped-dialogue">
  <div ref={playArea} className="dialogue-play-area">
   {rounds.length>0?<GrammarStarter compact key={JSON.stringify([grammar.id,grammar.formula,grammar.example,rounds.map(r=>[r.wordId,r.scene.art,r.activity])])} mode="grammar-dialogue" dialogue={rounds} onLeave={onLeave}/>:<GrammarStarter compact key={`sample:${selected}`} mode="grammar-dialogue" sample dialogue={sampleOrder.map(i=>({activity:dialogueExamples[i],scene:{...dialogueScenes[i],word:dialogueScenes[i].art},wordId:`sample:${i}`,grammar:{id:`sample:${i}`,version:1,formula:'Is it + a/an + noun?',example:dialogueExamples[i].prompt,exampleVi:dialogueScenes[i].meaning}}))} onLeave={onLeave}/>}
  </div>
  <details className="dialogue-settings">
   <summary>{t('Đổi bài chơi','Change activity')}</summary>
   <div className="page-flow">
    <PracticeScope filter={filter} grammar/>
    {grammars.length>0&&<label className="dialogue-grammar-choice">{t('Cấu trúc dùng trong lượt chơi','Grammar for this round')}<select value={key(index)} onChange={e=>{window.dispatchEvent(new Event('wfk-audio-stop'));setSelected(e.target.value);const panel=e.currentTarget.closest('details');if(panel)panel.open=false;requestAnimationFrame(()=>{const heading=playArea.current?.querySelector('h1');heading?.focus({preventScroll:true});playArea.current?.scrollIntoView({block:'start'});});}}>{grammars.map((g,i)=><option key={key(i)} value={key(i)}>{g.formula} · {g.example}</option>)}</select></label>}
    {rounds.length>0?<><p className="dialogue-selected-words">{t('Từ dùng trong lượt này:','Words in this round:')} {rounds.map(r=>r.scene.word).join(' · ')}</p>{rounds.length<words.length&&<p className="muted">{t('Một số từ chưa có hình hoặc ví dụ đã duyệt phù hợp cấu trúc này nên chưa được đưa vào lượt chơi.','Some words lack a picture or an approved example compatible with this construction and are not used in this round.')}</p>}</>:<p className="dialogue-fallback-note">{t('Đang chơi bộ mẫu vì phần đã chọn chưa có câu hỏi phù hợp.','Playing sample questions because this selection has no suitable questions yet.')}</p>}
    <p className="muted">{t('Lượt chơi không đổi nội dung hay lịch ôn thư viện. Rời trang sẽ bắt đầu lại lượt này.','This round does not change library content or review dates. Leaving restarts this round.')}</p>
   </div>
  </details>
 </div>;
}
