'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import Image from 'next/image';
import {ArrowLeft,Check,Lightbulb,RotateCcw,ShoppingBasket,SkipForward,Undo2} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {Artwork} from '@/components/app/shared';
import {AudioControl} from '@/components/app/audio-control';
import {SentencePronunciation} from '@/components/app/sentence-pronunciation';
import {adventureGames} from '@/lib/learning/adventure-registry';
import {categories,type PlayWord} from '@/lib/learning/adventure-facts';
import {adventureCorrect,newAdventureState,type AdventurePack,type PlaceZone} from '@/lib/learning/adventure-engine';


export function AdventureGame({pack,onLeave,settings}:{pack:AdventurePack;onLeave:()=>void;settings:ReactNode}){
 const {t}=useApp(),config=adventureGames.find(g=>g.id===pack.mode)!,[position,setPosition]=useState(0),[state,setState]=useState(newAdventureState),[answers,setAnswers]=useState<Record<number,boolean|null>>({}),[pictureError,setPictureError]=useState(false),[pictureTry,setPictureTry]=useState(0),heading=useRef<HTMLHeadingElement>(null);
 const complete=position>=pack.questions.length,q=pack.questions[Math.min(position,pack.questions.length-1)],mode=pack.mode,checked=state.checked;
 const cue=!q?'':mode==='listen-bingo'?q.choices[q.order![state.marked.length]]?.text??'':q.cue;
 const stop=()=>window.dispatchEvent(new Event('wfk-audio-stop'));
 useEffect(()=>()=>{window.dispatchEvent(new Event('wfk-audio-stop'));},[]);
 function next(skip=false){stop();if(skip)setAnswers(previous=>Object.hasOwn(previous,position)?previous:{...previous,[position]:null});setPosition(n=>n+1);setState(newAdventureState());setPictureError(false);requestAnimationFrame(()=>{heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:'start'});});}
 function check(nextState=state){if(checked||pictureError)return;stop();const correct=adventureCorrect(mode,q,nextState);setState({...nextState,checked:true,correct});setAnswers(previous=>Object.hasOwn(previous,position)?previous:{...previous,[position]:correct});}
 function choose(index:number){if(checked||pictureError)return;check({...state,selected:index,wrong:false});}
 const picture=(word:PlayWord,size=100)=><Artwork key={`${word.id}:${pictureTry}`} art={word.art} word={word.text} hideWord size={size} onUnavailable={()=>setPictureError(true)}/>;
 const correctCount=Object.values(answers).filter(Boolean).length;
 if(!q)return <section className="page-flow"><p role="alert">{t('Chưa mở được câu chơi. Mình chọn lại nhé.','Could not open the activity. Please choose again.')}</p><Button onClick={onLeave}>{t('Về chọn trò chơi','Back to games')}</Button></section>;
 return <div className="reading-page page-flow adventure-game" data-game={mode}>
  <div className="section-heading"><h1 ref={heading} tabIndex={-1}>{t(config.vi,config.en)}</h1><Button variant="outline" onClick={()=>{stop();onLeave();}}><ArrowLeft aria-hidden="true"/>{t('Về chọn trò chơi','Back to games')}</Button></div>
  {complete?<section className="page-flow adventure-finish"><Image src="/illustrations/fox.svg" alt="" width={140} height={150}/><h2>{t('Con đã hoàn thành!','You finished!')}</h2><p role="status">{correctCount} / {pack.questions.length} {t('câu đúng','correct answers')}</p>{Object.values(answers).includes(null)&&<p>{Object.values(answers).filter(value=>value===null).length} {t('câu bỏ qua','skipped questions')}</p>}<Button onClick={()=>{stop();setPosition(0);setAnswers({});setState(newAdventureState());}}><RotateCcw aria-hidden="true"/>{t('Chơi lại','Play again')}</Button></section>:<>
   <p className="adventure-progress">{position+1} / {pack.questions.length}{mode==='listen-bingo'&&` · ${state.marked.length}/${q.choices.length}`}</p>
   <section className="game-board page-flow adventure-board" aria-label={t(config.vi,config.en)}>
    <p className="adventure-help">{t(config.helpVi,config.helpEn)}</p>
    {!checked&&cue&&<AudioControl key={`${position}:${cue}`} text={cue} autoPlay showSource={false}/>}
    {pictureError?<div className="page-flow"><p role="alert">{t('Hình chưa tải được. Mình thử lại nhé.','The picture could not load. Let’s retry.')}</p><Button onClick={()=>{setPictureTry(n=>n+1);setPictureError(false);}}>{t('Tải lại hình','Retry picture')}</Button><Button variant="outline" onClick={()=>next(true)}>{t('Chơi câu khác','Another question')}</Button></div>:<>
    {mode==='sort-baskets'&&<><div className="adventure-target">{picture(q.target,150)}</div><div className="adventure-baskets">{q.categories!.map((category,i)=><Button key={category} className="adventure-basket" variant="outline" disabled={checked} aria-pressed={state.selected===i} onClick={()=>choose(i)}><ShoppingBasket aria-hidden="true"/>{picture(q.choices[i],54)}<span lang="en">{categories[category].en}</span><small>{categories[category].vi}</small></Button>)}</div></>}
    {mode==='listen-bingo'&&<div className="adventure-bingo" data-count={q.choices.length}>{q.choices.map((word,i)=><Button key={word.id} variant="outline" className="adventure-picture" disabled={checked||state.marked.includes(i)} aria-label={t(`Hình ${i+1}`,`Picture ${i+1}`)} data-marked={state.marked.includes(i)} onClick={()=>{if(i===q.order![state.marked.length]){const nextState={...state,marked:[...state.marked,i],wrong:false};if(nextState.marked.length===q.choices.length)check(nextState);else setState(nextState);}else {setState(s=>({...s,wrong:true}));setAnswers(previous=>Object.hasOwn(previous,position)?previous:{...previous,[position]:false});}}}>{picture(word)}{state.marked.includes(i)&&<Check className="adventure-mark" aria-hidden="true"/>}</Button>)}</div>}
    {(mode==='word-detective'||mode==='sound-hunt')&&<>
     {mode==='word-detective'?<p className="adventure-clue" lang="en">{q.cue}</p>:<div className="adventure-sound-anchor">{picture(q.anchor!,80)}<strong lang="en">{q.anchor!.text}</strong><span lang="en">/{q.phoneme}/</span></div>}
     <div className="adventure-choices">{q.choices.map((word,i)=><div key={word.id} className="adventure-choice"><Button variant="outline" className="adventure-picture" disabled={checked} aria-pressed={state.selected===i} aria-label={t(`Hình ${i+1}`,`Picture ${i+1}`)} onClick={()=>choose(i)}>{picture(word)}</Button>{mode==='sound-hunt'&&<AudioControl text={word.text} showSource={false}/>}</div>)}</div>
    </>}
    {mode==='place-object'&&<>
     <div className="adventure-place" data-zone={state.zone??''}>
      {(['on','under','in'] as PlaceZone[]).map((zone,i)=><Button key={zone} className={`adventure-zone zone-${zone}`} variant="outline" disabled={checked||state.selected===null} aria-label={t(['Trên bàn','Dưới bàn','Trong hộp'][i],['On the table','Under the table','In the box'][i])} aria-pressed={state.zone===zone} onClick={()=>check({...state,zone,wrong:false})}>{state.zone===zone?picture(q.target,80):<span lang="en">{zone}</span>}</Button>)}<span className="adventure-box-front" aria-hidden="true"/>
     </div>
     {!checked&&<Button variant="outline" className="adventure-object-pick" disabled={checked} aria-label={state.zone?t('Trả đồ vật','Return object'):t('Chọn đồ vật','Select object')} aria-pressed={state.selected!==null} onClick={()=>setState(s=>({...s,selected:s.selected===null?0:null,zone:null}))}>{state.zone?<Undo2 aria-hidden="true"/>:picture(q.target,86)}</Button>}
    </>}
    {mode==='one-many'&&<><div className="adventure-quantity" aria-label={t(`${q.count} hình`,`${q.count} pictures`)}>{Array.from({length:q.count!},(_,i)=><span key={i}>{picture(q.target,100)}</span>)}</div><div className="activity-options">{q.forms!.map((form,i)=><Button key={form} variant="secondary" disabled={checked} lang="en" aria-pressed={state.selected===i} onClick={()=>choose(i)}>{form}</Button>)}</div></>}
    {mode==='fox-shop'&&<>
     <div className="adventure-shopkeeper"><Image src="/illustrations/fox.svg" alt="" width={92} height={102}/><p lang="en">{q.cue}</p></div>
     <div className="adventure-shop-shelf">{q.choices.map((word,i)=><Button key={word.id} variant="outline" className="adventure-picture" disabled={checked||state.picked.filter(index=>index===i).length>=3} aria-label={t(`Thêm món ${i+1}`,`Add item ${i+1}`)} onClick={()=>setState(s=>({...s,picked:[...s.picked,i]}))}>{picture(word,90)}</Button>)}</div>
     <div className="adventure-shop-tray" aria-label={t('Khay hàng','Order tray')}>{state.picked.length?state.picked.map((index,i)=><Button key={i} variant="outline" disabled={checked} className="adventure-cart-item" aria-label={t(`Bỏ món ${i+1}`,`Remove item ${i+1}`)} onClick={()=>setState(s=>({...s,picked:s.picked.filter((_,at)=>at!==i)}))}>{picture(q.choices[index],64)}</Button>):<p>{t('Chạm món trên kệ để thêm vào khay','Tap a shelf item to fill the tray')}</p>}</div>
    </>}
    {state.wrong&&<p role="status">{t('Cùng nghe lại rồi thử nhé!','Listen again and try!')}</p>}
    {!checked&&<><div className="row-wrap">{mode==='fox-shop'&&<Button disabled={!state.picked.length} onClick={()=>check()}><Check aria-hidden="true"/>{t('Giao hàng','Deliver')}</Button>}{(mode==='place-object'||mode==='fox-shop')&&<Button variant="outline" disabled={!state.picked.length&&state.selected===null} onClick={()=>setState(newAdventureState())}><Undo2 aria-hidden="true"/>{t('Làm lại','Reset')}</Button>}</div><div className="row-wrap"><Button variant="outline" onClick={()=>setState(s=>({...s,hint:true}))}><Lightbulb aria-hidden="true"/>{t('Gợi ý','Hint')}</Button><Button variant="ghost" onClick={()=>next(true)}><SkipForward aria-hidden="true"/>{t('Bỏ qua','Skip')}</Button></div>{state.hint&&<p>{q.explanation}</p>}</>}
    {checked&&<div className="grammar-feedback page-flow"><strong role="status">{state.correct?t('Đúng rồi!','Correct!'):t('Mình cùng thử lại nhé!','Let’s try again!')}</strong><p>{q.explanation}</p><p lang="en">{q.solution}</p><SentencePronunciation text={q.solution}/>{!state.correct&&<Button variant="outline" onClick={()=>{stop();setState(newAdventureState());}}><RotateCcw aria-hidden="true"/>{t('Thử lại câu này','Try this question again')}</Button>}<Button onClick={()=>next()}>{t('Câu tiếp theo','Next question')}</Button></div>}
    </>}
   </section>
  </>}
  {settings}
 </div>;
}
