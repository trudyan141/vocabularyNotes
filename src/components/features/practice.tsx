"use client";
import dynamic from 'next/dynamic';
import {adventureGames,type AdventureMode} from '@/lib/learning/adventure-registry';
import {AdventureMenuArt} from './adventure-menu-art';
const AdventureHost=dynamic(()=>import('./adventure-host').then(module=>module.AdventureHost),{loading:()=> <DatabaseLoading/>});
import {ScopedDialogue} from './scoped-dialogue';
import {GrammarStarter,isStarterMode,type StarterMode} from './grammar-starter';
import {GameMenuArt} from './game-menu-art';
import {moveGame,spellingHintTiles} from '@/lib/learning/game-engine';
import {ExpansionQuestion} from './expansion-question';
import {gameRegistry,isExpansion,isPairGame,isGrammarGame} from '@/lib/learning/game-registry';
import type {GameMove} from '@/lib/learning/game-activity';

import {SessionCard,modes} from './session-history';
import {CycleProgressText} from './practice-progress';
import {RepositoryError} from '@/data/local/repository';
import {cycleSelection} from '@/lib/learning/coverage';
import {PracticeSelection} from './practice-selection';
import {savePracticeSelection} from '@/data/local/practice-selection';
import {PracticeScope} from './practice-scope';
import {GrammarCard} from './grammar-card';
import {practiceFilter,practiceHref,type PracticeFilter} from '@/lib/learning/practice-filter';
import {MissingLettersQuestion} from './missing-letters-question';
import {GrammarQuestion} from './grammar-question';
import {SentencePronunciation} from "@/components/app/sentence-pronunciation";
import Link from "next/link";
import NextImage from "next/image";
import {useGameSound} from '@/lib/audio/game-preference';
import {GameSounds} from "@/lib/audio/game-sounds";
import {BookOpen, Image, Volume2, Pencil, Keyboard, ArrowLeft, ArrowRight, Star, Check, Lightbulb, SkipForward, Trophy, Mic, Blocks, RotateCcw, Trash2} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {DatabaseLoading} from '@/components/app/database-boundary';
import {OperationStatus} from "@/components/ui/operation-status";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Artwork, EmptyState } from "@/components/app/shared";
import {WordPronunciation} from '@/components/app/word-pronunciation';
import { AudioControl } from "@/components/app/audio-control";
import { useApp } from "@/components/app/provider";
import { PracticeRepository, type Mode, type Session } from "@/data/local/practice";
import { type Rating } from "@/lib/learning/srs";
const modePrompts:Record<Mode,readonly [string,string]>={"match-pairs":[gameRegistry["match-pairs"].helpVi,gameRegistry["match-pairs"].helpEn],"memory-pairs":[gameRegistry["memory-pairs"].helpVi,gameRegistry["memory-pairs"].helpEn],"word-builder":[gameRegistry["word-builder"].helpVi,gameRegistry["word-builder"].helpEn],"grammar-cloze":[gameRegistry["grammar-cloze"].helpVi,gameRegistry["grammar-cloze"].helpEn],"grammar-repair":[gameRegistry["grammar-repair"].helpVi,gameRegistry["grammar-repair"].helpEn],"grammar-dialogue":[gameRegistry["grammar-dialogue"].helpVi,gameRegistry["grammar-dialogue"].helpEn],flashcard:["Lật thẻ, nhớ từ","Flip and remember"],"picture-word":["Nhìn thật kỹ nhé!","Look closely!"],"word-picture":["Lắng nghe rồi chọn","Listen and choose"],letters:["Tìm chữ còn thiếu","Find the missing letter"],spelling:["Thử tài đánh vần","Try spelling"],"missing-letters":["Điền 2–3 chữ vào từ","Fill 2–3 missing letters"],"grammar-card":["Nghe câu, xem nghĩa và cách dùng","Listen, read meaning and usage"],grammar:["Thử thách ghép câu đã học","Build a sentence you have learned"]};
const modeIcons={"match-pairs":Blocks,"memory-pairs":BookOpen,"word-builder":Pencil,"grammar-cloze":Blocks,"grammar-repair":Pencil,"grammar-dialogue":Volume2,flashcard:BookOpen,"picture-word":Image,"word-picture":Volume2,letters:Pencil,spelling:Keyboard,"missing-letters":Pencil,grammar:Blocks,"grammar-card":BookOpen};
export function PracticePreview(){return <PracticeSelection><PracticeGame/></PracticeSelection>;}
function PracticeGame(){
  const {repository,t,preferences}=useApp();const gameSound=useGameSound();const soundEnabled=useRef(gameSound.enabled);const sounds=useRef<GameSounds|null>(null);const params=useSearchParams(),router=useRouter();
  useEffect(()=>{soundEnabled.current=gameSound.enabled;if(!gameSound.enabled)sounds.current?.stop();},[gameSound.enabled]);
  useEffect(()=>{const stop=()=>sounds.current?.stop();const hidden=()=>{if(document.hidden)stop();};window.addEventListener('wfk-audio-stop',stop);document.addEventListener('visibilitychange',hidden);return()=>{sounds.current?.close();window.removeEventListener('wfk-audio-stop',stop);document.removeEventListener('visibilitychange',hidden);};},[]);
  const practice=useMemo(()=>repository?new PracticeRepository(repository):null,[repository]);
  const snapshot=useLiveQuery(async()=>practice?{scope:practice.repository.scope.id,sessions:await practice.resumableSessions()}:null,[practice]);
  const [adventure,setAdventure]=useState<AdventureMode|null>(null);const [session,setSession]=useState<Session|null>(null);const [starter,setStarter]=useState<StarterMode|null>(null);
  const pictureValidity=useLiveQuery(async()=>practice&&session?{id:session.id,valid:await practice.pictureSessionLoaded(session)}:null,[practice,session?.id]);
  const [failedPictureSession,setFailedPictureSession]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);const [error,setError]=useState("");const lock=useRef(false);
  const filter=practiceFilter(params);
  const selectionKey=cycleSelection('',filter);
  const progressSnapshot=useLiveQuery(async()=>practice?{scope:practice.repository.scope.id,items:await practice.progressForSelection(filter)}:null,[practice,selectionKey]);
  const progress=progressSnapshot?.scope===repository?.scope.id?progressSnapshot?.items??[]:[];
  const currentProgress=useLiveQuery(async()=>practice&&session?.cycleId?{sessionId:session.id,value:await practice.progress(session.cycleId)}:null,[practice,session?.id,session?.cycleId]);
  const coverage=currentProgress?.sessionId===session?.id?currentProgress?.value:null;
  function hubHref(next:PracticeFilter){const href=practiceHref(next);return next.due?`${href}&hub=1`:href;}
  function openSession(next:Session,prepared=false){
    window.dispatchEvent(new Event("wfk-audio-stop"));setError("");
    if(prepared){setSession(next);opened.current=`${next.scopeId}:${next.id}`;}else{setSession(null);opened.current="";}
    // A persisted IndexedDB session is client state on this same route.
    window.history.replaceState(null,'',practiceHref(next.filter??{},next.id));
  }
  async function leave(){
    if(lock.current)return;lock.current=true;setBusy(true);window.dispatchEvent(new Event("wfk-audio-stop"));setError("");
    try{if(practice&&session)await practice.discardUnstarted(session.id);opened.current="";setSession(null);window.history.replaceState(null,'',hubHref(session?.filter??filter));}
    catch{setError(t('Chưa đóng được lượt học. Thử lại nhé.','Could not close this round. Please retry.'));}
    finally{lock.current=false;setBusy(false);}
  }
  async function reset(){
    if(!repository||lock.current)return;lock.current=true;setBusy(true);setError('');
    try{await savePracticeSelection(repository,{});opened.current="";window.dispatchEvent(new Event("wfk-audio-stop"));router.replace("/practice",{scroll:false});}
    catch{setError(t('Chưa bỏ được bộ lọc. Thử lại nhé.','Could not clear the selection. Please retry.'));}
    finally{lock.current=false;setBusy(false);}
  }
  const reviewText=useMemo(()=>(vi:string,en:string)=>preferences.locale==="vi"?vi:en,[preferences.locale]);
  const review=params.get("review"),savedSession=params.get("session");const opened=useRef("");
  useEffect(()=>{if(!savedSession)void Promise.resolve().then(()=>setSession(null));},[savedSession]);
  useEffect(()=>{
    if(!practice||(!savedSession&&(params.get('hub')==='1'||(review!=="due"&&review!=="group"&&params.get('mode')!=="grammar"))))return;
    let active=true;const key=`${practice.repository.scope.id}:${savedSession??params.toString()}`;
    void Promise.resolve().then(async()=>{
      if(!active||opened.current===key)return;opened.current=key;lock.current=true;setBusy(true);setError("");
      try{
        const next=savedSession?await practice.loadSession(savedSession):await practice.start(params.get('mode')==='grammar'?'grammar-card':'flashcard',practiceFilter(params));
        if(!next)throw new Error('missing');
        if(active&&next.filter)await savePracticeSelection(practice.repository,next.filter);
        if(active){if(savedSession&&next.id===savedSession){setSession(next);opened.current=`${next.scopeId}:${next.id}`;}else openSession(next,true);}
      }catch{if(active)setError(reviewText('Chưa mở được buổi ôn. Chọn lại bài hoặc nhóm rồi thử lại nhé.','Could not open this session. Choose a lesson or group and retry.'));}
      finally{lock.current=false;if(active)setBusy(false);}
    });return()=>{active=false;};
  },[practice,review,savedSession,router,reviewText,params]);
  async function start(mode:Mode,replay?:Session,reviewOnly=false,newCycle=false){
    if(!practice||lock.current)return;if(mode==='grammar-dialogue'&&!replay){setStarter(mode);return;}window.dispatchEvent(new Event('wfk-audio-stop'));lock.current=true;setBusy(true);setError('');
    try{openSession(replay?await practice.replay(replay.id,reviewOnly):await practice.start(mode,filter,newCycle),true);}
    catch(cause){if(!replay&&isStarterMode(mode)&&cause instanceof RepositoryError&&(cause.code==='not-ready'||cause.code==='complete')){setStarter(mode);return;}setError(cause instanceof RepositoryError&&cause.code==='complete'?t('Con đã đi hết phần hợp lệ của bộ này. Bấm Bắt đầu vòng mới bên dưới để chơi tiếp.','You finished the available items. Choose Start a new cycle below to continue.'):replay?t('Nội dung lượt cũ đã đổi hoặc chưa mở được. Con chọn trò chơi để bắt đầu lượt mới nhé.','The old round changed or could not be opened. Choose a game to start a new round.'):isExpansion(mode)?t(gameRegistry[mode].requirement,gameRegistry[mode].requirementEn):mode==='grammar'||mode==='grammar-card'?t('Phần đang chọn chưa có ngữ pháp đã duyệt. Thêm bài có ngữ pháp hoặc chọn nhóm khác nhé.','No approved grammar in this selection. Add grammar or choose another group.'):t('Chưa đủ từ phù hợp cho kiểu học này. Thêm/duyệt từ hoặc chọn Thẻ ôn; game hình cần 3 hình khác nhau.','Not enough eligible words. Add approved words or choose flashcards; picture games need three distinct pictures.'));}
    finally{lock.current=false;setBusy(false);}
  }
  async function change(action:"reveal"|"hint"|"answer"|"check"|"move",input:{answer?:string;rating?:Rating;skipped?:boolean;understood?:boolean;move?:GameMove}={}){
    if(!practice||!session||lock.current)return;if(action!=="move")window.dispatchEvent(new Event("wfk-audio-stop"));sounds.current??=new GameSounds();sounds.current.unlock(soundEnabled.current);lock.current=true;setBusy(true);setError("");
    if(action==="move")try{setSession({...session,gameState:moveGame(session,input.move!)});}catch{/* Repository validates invalid moves. */}
    try{const next=action==="move"?await practice.move(session.id,session.version,input.move!):action==="check"?await practice.check(session.id,session.version,input.answer??""):action==="answer"?await practice.answer(session.id,session.version,input):await practice.reveal(session.id,session.version,action==="hint");setSession(next);if(action==="check")sounds.current.play(next.checkedCorrect?"correct":"again",soundEnabled.current);else if(next.completedAt)sounds.current.play("complete",soundEnabled.current);else if(action==="reveal")sounds.current.play("reveal",soundEnabled.current);}
    catch{if(action==="move")setSession(session);setError(t("Phiên chưa lưu được hoặc nội dung đã đổi. Phần đang học vẫn còn; mở lại phiên mới nhất hoặc thử lại.","Could not save or the content changed. Resume the latest session or retry."));}
    finally{lock.current=false;setBusy(false);}
  }
  const sessions=snapshot?.scope===repository?.scope.id?snapshot?.sessions??[]:[];
  if(adventure&&practice)return <AdventureHost key={`${repository?.scope.id}:${selectionKey}:${adventure}`} mode={adventure} practice={practice} filter={filter} onLeave={()=>{setAdventure(null);void leave();}}/>;
  if(starter==='grammar-dialogue'&&practice)return <ScopedDialogue key={`${repository?.scope.id}:${selectionKey}`} practice={practice} filter={filter} onLeave={()=>{setStarter(null);void leave();}}/>;
  if(starter)return <GrammarStarter key={`${repository?.scope.id}:${starter}`} mode={starter} onLeave={()=>{setStarter(null);void leave();}}/>;
  if(session&&!session.completedAt&&(session.mode==='picture-word'||session.mode==='word-picture'||isPairGame(session.mode))){
    if(pictureValidity?.id!==session.id)return <DatabaseLoading/>;
    if(!pictureValidity.valid||failedPictureSession===session.id)return <div className="reading-page page-flow"><EmptyState title={t('Hình trong lượt chơi đã đổi','Pictures changed')} description={t('Cùng chọn trò chơi để bắt đầu lượt mới nhé.','Choose a game to start a new round.')}><Button onClick={leave}>{t('Chọn trò chơi','Choose a game')}</Button></EmptyState></div>;
  }
  if(session && session.scopeId===repository?.scope.id){
    if(session.completedAt){const correct=session.answers.filter(a=>a.correct&&!a.skipped).length,wrong=session.answers.filter(a=>!a.correct&&!a.skipped).length;
      return <div className="reading-page page-flow game-result"><div className="game-celebration"><NextImage src="/illustrations/fox.svg" alt="" width={130} height={130}/><Trophy aria-hidden="true"/></div><h1>{t("Con đã hoàn thành!","Session complete!")}</h1><PracticeScope filter={session.filter} count={session.questions.length} boards={isPairGame(session.mode)} grammar={!!session.questions[0]?.grammar} progress={<CycleProgressText progress={coverage}/>}/><div className="practice-results"><p><Check aria-hidden="true"/> {correct} {session.mode==='grammar-card'?t("con chọn đã hiểu","you marked understood"):t("đúng / nhớ rồi","correct / remembered")}</p><p><BookOpen aria-hidden="true"/> {wrong} {session.mode==='grammar-card'?t("con muốn xem lại","you want to review"):t("cần ôn thêm","need review")}</p><p>{session.answers.filter(a=>a.skipped).length} {t("bỏ qua","skipped")} · {session.answers.filter(a=>a.hint).length} {t("dùng gợi ý","hints")}</p></div><p>{t("Điểm trò chơi không thay lịch ôn. Con có thể ôn thẻ để tự đánh giá trí nhớ.","Game scores do not change review dates. Use flashcards to rate your recall.")}</p>{session.cycleId&&coverage&&<Button disabled={busy} onClick={()=>void start(session.mode,undefined,false,coverage.complete)}><ArrowRight aria-hidden="true"/>{coverage.complete?t('Bắt đầu vòng mới','Start a new cycle'):coverage.total-coverage.done-coverage.unavailable===coverage.skipped?t('Làm các từ đã bỏ qua','Practice skipped items'):t('Tiếp từ mới','Continue with new items')}</Button>}{wrong>0&&<Button disabled={busy} onClick={()=>void start(session.mode,session,true)}><RotateCcw aria-hidden="true"/>{t(`Làm lại ${wrong} câu cần xem lại`,`Retry ${wrong} questions needing review`)}</Button>}<Button variant="secondary" disabled={busy} onClick={()=>void start(session.mode,session)}><RotateCcw aria-hidden="true"/>{busy?t('Đang mở lại…','Opening again…'):t('Chơi lại','Play again')}</Button><Button variant="secondary" disabled={busy} onClick={leave}>{t('Chọn trò chơi khác','Choose another game')}</Button>{error&&<p role="alert">{error}</p>}<Button asChild variant="outline"><Link href="/today"><ArrowLeft data-icon="inline-start" aria-hidden="true"/>{t("Về Hôm nay","Back to Today")}</Link></Button></div>;
    }
    return <div className="reading-page page-flow game-session"><div className="section-heading"><h1>{t(modes.find(m=>m[0]===session.mode)![1],modes.find(m=>m[0]===session.mode)![2])}</h1><Button variant="outline" disabled={busy} onClick={leave}>{t("Về chọn trò chơi","Back to games")}</Button></div>
      <PracticeScope filter={session.filter} count={session.questions.length} boards={isPairGame(session.mode)} grammar={!!session.questions[0]?.grammar} progress={<CycleProgressText progress={coverage}/>}/>
      <div className="game-progress"><span>{session.position+1} / {session.questions.length}</span><div role="progressbar" aria-label={t('Tiến độ buổi học','Session progress')} aria-valuenow={session.position} aria-valuemin={0} aria-valuemax={session.questions.length}><span style={{transform:`scaleX(${session.position/session.questions.length})`}}/></div></div>
      <QuestionView key={`${session.id}:${session.position}`} session={session} busy={busy} action={change} onPictureUnavailable={art=>{practice?.pictureFailed(art);setFailedPictureSession(session.id);}}/>
      {error&&<p role="alert">{error}</p>}
      {error&&practice&&<Button variant="outline" onClick={async()=>{const next=await practice.get(session.id);if(next){setSession(next);setError("");}}}>{t("Mở lại phiên đã lưu","Reload saved session")}</Button>}
    </div>;
  }
  return <div className="reading-page page-flow play-hub"><header className="play-welcome"><div><h1>{t("Chơi & học","Play & learn")}</h1><p>{t("Cùng Cáo chơi với từ nhé!","Let's play with words!")}</p></div><NextImage src="/illustrations/fox.svg" alt="" width={110} height={110}/></header>
    <PracticeScope filter={filter}><Button variant="outline" disabled={busy} onClick={()=>void reset()}><RotateCcw aria-hidden="true"/>{t("Ôn tất cả","Practise everything")}</Button></PracticeScope>
    <OperationStatus key="open-review" busy={busy} title={t("Đang mở buổi học…","Opening your session…")}/>
    {sessions.filter(s=>!s.completedAt).length>0&&<section className="page-flow"><h2>{t("Buổi học đang dở","Resume learning")}</h2><div className="session-history">{sessions.filter(s=>!s.completedAt).map(s=><PendingSession key={s.id} session={s} practice={practice!} open={()=>openSession(s)} busy={busy}/>)}</div></section>}
    {progress?.some(p=>(p.done>0||p.unavailable>0||p.skipped>0)&&!sessions.some(s=>s.cycleId===p.cycle.id))&&<section className="page-flow" aria-label={t('Tiến độ cả bộ','Set progress')}><h2>{t('Tiến độ cả bộ đang chọn','Progress in this selection')}</h2>{progress.filter(p=>(p.done>0||p.unavailable>0||p.skipped>0)&&!sessions.some(s=>s.cycleId===p.cycle.id)).map(p=><ProgressCard key={p.cycle.id} progress={p} practice={practice!} busy={busy} resume={()=>void start(p.cycle.mode,undefined,false,p.complete)}/>) }</section>}
    {!sessions.some(s=>!s.completedAt)&&<p className="play-suggestion">{t('Bắt đầu với Thẻ ôn:','Start with Flashcards:')} {t('lật thẻ rồi chọn Nhớ rồi hoặc Chưa nhớ.','flip a card, then choose Remembered or Again.')}</p>}
    {(['words','grammar'] as const).map(category=><section className="page-flow" key={category} aria-labelledby={`practice-${category}`}>
      <h2 id={`practice-${category}`}>{category==='words'?t('Từ vựng','Words'):t('Ngữ pháp','Grammar')}</h2>
      <div className="practice-modes">
        {adventureGames.filter(game=>game.category===category).map(game=><Button key={game.id} className="play-tile adventure-tile" aria-label={t(game.vi,game.en)} size="lg" variant="secondary" disabled={busy||!repository} onClick={()=>{window.dispatchEvent(new Event('wfk-audio-stop'));setAdventure(game.id);}}><span className="play-tile-art"><AdventureMenuArt cell={game.art}/></span><span className="play-tile-copy"><strong>{t(game.vi,game.en)}</strong><small>{t(game.helpVi,game.helpEn)}</small></span><ArrowRight className="play-tile-arrow" aria-hidden="true"/></Button>)}
        {category==='words'&&<Button asChild className="play-tile play-tile-speaking" size="lg" variant="secondary"><Link prefetch={false} href={practiceHref(filter,undefined,"/practice/speaking")}><span className="play-tile-art"><GameMenuArt mode="speaking"/><Mic aria-hidden="true"/></span><span className="play-tile-copy"><strong>{t("Nói cùng Cáo","Speak with Fox")}</strong><small>{t("Nghe và nói các từ đã học","Listen and say your words")}</small></span><ArrowRight className="play-tile-arrow" aria-hidden="true"/></Link></Button>}
        {modes.filter(([mode])=>mode!=='word-builder').filter(([mode])=>category==='grammar'?isGrammarGame(mode):!isGrammarGame(mode)).map(([mode,vi,en])=>{const Icon=modeIcons[mode];return <Button key={mode} className={`play-tile play-tile-${mode}`} aria-label={t(vi,en)} size="lg" variant="secondary" disabled={busy||!repository} onClick={()=>void start(mode)}><span className="play-tile-art"><GameMenuArt mode={mode}/><Icon aria-hidden="true"/></span><span className="play-tile-copy"><strong>{t(vi,en)}</strong><small>{t(modePrompts[mode][0],modePrompts[mode][1])}</small></span><ArrowRight className="play-tile-arrow" aria-hidden="true"/></Button>;})}
      </div>
    </section>)}

    {error&&<><p role="alert">{error}</p><Button asChild variant="outline"><Link href="/today"><ArrowLeft data-icon="inline-start" aria-hidden="true"/>{t("Về Hôm nay","Back to Today")}</Link></Button></>}
    {!repository&&<EmptyState title={t("Đang mở thư viện","Opening library")} description={t("Đợi một chút nhé.","Just a moment.")}/>}
    <Button asChild variant="link"><Link href="/profile">{t('Lịch sử buổi học trong Hồ sơ','Learning history in Profile')}</Link></Button>

  </div>;
}

function QuestionView({session,busy,action,onPictureUnavailable}:{session:Session;busy:boolean;onPictureUnavailable:(art:string)=>void;action:(action:"reveal"|"hint"|"answer"|"check"|"move",input?:{answer?:string;rating?:Rating;skipped?:boolean;understood?:boolean;move?:GameMove})=>Promise<void>}){
  const {t,preferences}=useApp();const q=session.questions[session.position],word=q.word;const [answer,setAnswer]=useState("");const feedback=session.checkedAnswer!=null?(session.checkedCorrect?t("Đúng rồi!","Correct!"):<>{t("Đáp án là ","The answer is ")}<strong lang="en">{word.word}</strong>{t(". Mình cùng xem lại nhé.",". Let's review it.")}</>):null;const [detailed,setDetailed]=useState(false);const [typing,setTyping]=useState(false);const pending=useRef<string|null>(null);
  const prompt=useRef<HTMLHeadingElement>(null);useEffect(()=>{prompt.current?.focus({preventScroll:true});},[session.revealed,session.checkedAnswer]);
  const choices=session.mode==="picture-word"||session.mode==="word-picture";
  const positions=q.missingIndices??[q.missingIndex];
  const mask=[...word.word].map((letter,i)=>positions.includes(i)?"_":letter).join(" ");
  function check(value:string){if(busy||feedback!==null)return;pending.current=value;void action("check",{answer:value});}
  if(isExpansion(session.mode))return <ExpansionQuestion session={session} busy={busy} action={action} onPictureUnavailable={onPictureUnavailable}/>;
  if(session.mode==="grammar-card")return <GrammarCard session={session} busy={busy} action={action}/>;
  if(session.mode==="grammar")return <GrammarQuestion session={session} busy={busy} action={action}/>;
  return <section className={`practice-question page-flow game-board ${typing?'is-typing ':''}${feedback?(session.checkedCorrect?"is-correct":"try-again"):""}`} data-revealed={session.revealed}>
    {session.mode==="flashcard"?<><Artwork art={word.art} word={word.word} size={180}/><h2 ref={prompt} tabIndex={-1} lang={session.direction==="vi-en"?"vi":"en"}>{session.direction==="vi-en"?word.vi:word.word}</h2>{session.direction!=="vi-en"&&<AudioControl text={word.word} autoPlay/>}
      {session.revealed?<><h3>{session.direction==="vi-en"?word.word:word.vi}</h3>{session.direction==="vi-en"&&<AudioControl text={word.word} autoPlay/>}      <div className="row-wrap">{(["Again","Good",...(detailed||!preferences.childFriendly?["Hard","Easy"]:[])] as Rating[]).map(rating=><Button key={rating} disabled={busy} onClick={()=>void action("answer",{rating})}>{t({Again:"Chưa nhớ",Good:"Nhớ rồi",Hard:"Nhớ khó",Easy:"Rất dễ"}[rating],rating)}</Button>)}</div><Button variant="link" onClick={()=>setDetailed(v=>!v)}>{t("Đánh giá chi tiết","Detailed ratings")}</Button><details className="flashcard-details"><summary>{t("Ví dụ và cách đọc","Examples and pronunciation")}</summary><div className="page-flow"><p lang="en">{word.en}</p><p lang="en">{word.example}</p><SentencePronunciation text={word.example} pronunciations={word.examplePronunciations}/>{word.pronunciations.map((p,i)=><p key={i}>{p.verified?p.ipa:null} {p.readingHintVi&&`· ${p.readingHintVi}`}</p>)}
</div></details></>:<Button size="lg" disabled={busy} onClick={()=>void action("reveal")}>{t("Xem đáp án","Show answer")}</Button>}</>:
      <><h2 ref={prompt} tabIndex={-1} className="game-prompt">{session.mode==="picture-word"?t("Từ nào đúng với hình?","Which word matches?"):session.mode==="word-picture"?word.word:word.vi}</h2>
      {session.mode==="picture-word"&&<div className="game-picture-stage"><Artwork art={word.art} word={word.word} onUnavailable={onPictureUnavailable} size={180}/></div>}
      {choices&&<><AudioControl text={word.word} autoPlay/>{session.mode==="picture-word"&&<WordPronunciation text={word.word} pronunciations={word.pronunciations}/>}</>}
      {(session.mode==="letters"||session.mode==="spelling"||session.mode==="missing-letters")&&word.art&&<div className="game-picture-stage game-picture-small"><Artwork art={word.art} word={word.word} hideWord size={120}/></div>}
      {session.mode==="missing-letters"&&<AudioControl text={word.word} autoPlay/>}
      {session.mode==="spelling"&&feedback&&<p className="letter-mask" lang="en">{word.word}</p>}
      {session.mode==="letters"&&<p className="letter-mask" lang="en">{feedback?word.word:mask}</p>}
      {choices?<div className="game-answers">{q.choices.map(choice=><button key={choice.id} data-result={feedback?(choice.word===word.word?"correct":choice.word===session.checkedAnswer?"incorrect":"idle"):"idle"} disabled={busy||feedback!==null} aria-label={session.mode==="word-picture"?`${t("Hình","Picture")} ${q.choices.indexOf(choice)+1}`:choice.word} onClick={()=>check(choice.word)}>
        {session.mode==="word-picture"?<Artwork art={choice.art} word={choice.word} onUnavailable={onPictureUnavailable} size={90}/>:choice.word}{feedback&&choice.word===word.word&&<Check className="answer-check" aria-hidden="true"/>}</button>)}</div>:
      session.mode==="missing-letters"?<MissingLettersQuestion word={word.word} positions={q.missingIndices!} busy={busy} checked={feedback!==null} onCheck={check}/>:<form onSubmit={e=>{e.preventDefault();check(session.mode==="letters"?[...word.word].map((letter,i)=>positions.includes(i)?([...answer][positions.indexOf(i)]??" "):letter).join(""):answer);}}><label htmlFor="practice-answer">{session.mode==="letters"?t("Gõ chữ còn thiếu","Enter the missing letter"):t("Gõ từ tiếng Anh","Type the English word")}</label><Input id="practice-answer" onFocus={()=>setTyping(true)} value={answer} maxLength={session.mode==="letters"?positions.length:200} autoComplete="off" disabled={busy||feedback!==null} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&e.nativeEvent.isComposing)e.preventDefault();}}/><Button type="submit" disabled={busy||feedback!==null||!answer.trim()}><Check data-icon="inline-start" aria-hidden="true"/>{t("Kiểm tra","Check")}</Button></form>}
      {session.hint&&session.mode==="spelling"&&feedback===null&&<div className="spelling-letter-hint"><p>{t("Các chữ của từ này đã được trộn lên:","The letters of this word, mixed up:")}</p><div className="sentence-tiles" lang="en">{spellingHintTiles(word.word,q.id).map(tile=><span className="spelling-hint-letter" key={tile.id}>{tile.text}</span>)}</div></div>}
      {session.hint&&session.mode!=="spelling"&&<p>{session.mode==="missing-letters"?t(`Chữ thiếu đầu tiên là ${[...word.word][q.missingIndices![0]]}.`,`The first missing letter is ${[...word.word][q.missingIndices![0]]}.`):<>{t("Gợi ý: bắt đầu bằng ","Hint: starts with ")}{word.word[0]}</>}</p>}
      {feedback?<><div className="game-feedback"><NextImage src="/illustrations/fox.svg" alt="" width={64} height={64}/><p role="status">{feedback}</p>{session.checkedCorrect&&<span className="feedback-stars" aria-hidden="true"><Star/><Star/><Star/></span>}</div><p>{word.vi} · {word.example}</p><Button disabled={busy} onClick={()=>void action("answer",{answer:pending.current??""})}>{t("Câu tiếp theo","Next question")}<ArrowRight aria-hidden="true"/></Button></>:<div className="row-wrap"><Button variant="outline" disabled={busy} onClick={()=>void action("hint")}><Lightbulb aria-hidden="true"/>{t("Gợi ý","Hint")}</Button><Button variant="ghost" disabled={busy} onClick={()=>void action("answer",{skipped:true})}><SkipForward aria-hidden="true"/>{t("Bỏ qua","Skip")}</Button></div>}</>}
  </section>;
}

function ProgressCard({progress,practice,busy,resume}:{progress:import('@/data/local/practice-cycle').CycleProgress;practice:PracticeRepository;busy:boolean;resume:()=>void}){
 const {t}=useApp(),[pending,setPending]=useState(false),[error,setError]=useState(''),lock=useRef(false),mode=modes.find(m=>m[0]===progress.cycle.mode)!;
 return <div className="session-history-card progress-cycle"><div className="session-history-copy"><strong>{t(mode[1],mode[2])}</strong><CycleProgressText progress={progress}/></div><div className="row-wrap progress-cycle-actions"><Button variant="secondary" disabled={busy||pending} onClick={resume}>{progress.complete?t('Bắt đầu vòng mới','Start a new cycle'):t('Tiếp tục','Continue')}</Button><Button variant="ghost" hidden={practice.repository.readOnly} disabled={busy||pending} aria-label={t(`Xóa tiến độ ${mode[1]}`,`Delete progress for ${mode[2]}`)} onClick={async()=>{if(lock.current)return;lock.current=true;setPending(true);setError('');try{await practice.removeProgress(progress.cycle.id);}catch{setError(t('Chưa xóa được tiến độ. Thử lại từ danh sách mới nhé.','Could not delete progress. Retry from the updated list.'));}finally{lock.current=false;setPending(false);}}}><Trash2 aria-hidden="true"/></Button></div>{error&&<p role="alert">{error}</p>}</div>;
}

function PendingSession({session,practice,open,busy}:{session:Session;practice:PracticeRepository;open:()=>void;busy:boolean}){
 const {t}=useApp();const [pending,setPending]=useState(false),[error,setError]=useState('');const lock=useRef(false);
 return <div className="session-history-card pending-session"><SessionCard className="session-history-open" session={session} open={open}/><Button variant="ghost" hidden={practice.repository.readOnly} disabled={busy||pending} aria-label={t('Xóa buổi học đang dở','Delete unfinished session')} onClick={async()=>{
  if(lock.current)return;lock.current=true;setPending(true);setError('');
  try{await practice.remove(session.id,session.version);}catch{setError(t('Chưa xóa được lượt này. Lượt có thể đã đổi; thử lại từ danh sách mới nhé.','Could not delete this round. It may have changed; retry from the updated list.'));}finally{lock.current=false;setPending(false);}
 }}><Trash2 aria-hidden="true"/><span className="sr-only">{pending?t('Đang xóa…','Deleting…'):t('Xóa lượt','Delete round')}</span></Button>{error&&<p role="alert">{error}</p>}</div>;
}
