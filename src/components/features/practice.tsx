"use client";
import {GrammarQuestion} from './grammar-question';
import {SentencePronunciation} from "@/components/app/sentence-pronunciation";
import {ActionLink} from "@/components/app/action-link";
import type {ScopedDocument} from "@/data/local/types";
import type {Deck} from "@/data/local/decks";
import Link from "next/link";
import NextImage from "next/image";
import {useGameSound} from '@/lib/audio/game-preference';
import {GameSounds} from "@/lib/audio/game-sounds";
import {BookOpen, Image, Volume2, Pencil, Keyboard, ArrowLeft, ArrowRight, Star, Check, Lightbulb, SkipForward, Trophy, Mic, Blocks} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {DatabaseLoading} from '@/components/app/database-boundary';
import {OperationStatus} from "@/components/ui/operation-status";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Artwork, EmptyState } from "@/components/app/shared";
import { AudioControl } from "@/components/app/audio-control";
import { useApp } from "@/components/app/provider";
import { PracticeRepository, type Mode, type Session } from "@/data/local/practice";
import { type Rating } from "@/lib/learning/srs";
const modes:[Mode,string,string][]=[["flashcard","Thẻ ôn","Flashcards"],["picture-word","Nhìn hình chọn từ","Picture to word"],["word-picture","Nghe từ chọn hình","Word to picture"],["letters","Điền chữ thiếu","Missing letters"],["spelling","Gõ cả từ","Spell the word"],["grammar","Xếp câu","Build sentences"]];
const modeArt={flashcard:"book","picture-word":"apple","word-picture":"cat",letters:"pencil",spelling:"bag",grammar:"notebook"};
const modePrompts={flashcard:["Lật thẻ, nhớ từ","Flip and remember"],"picture-word":["Nhìn thật kỹ nhé!","Look closely!"],"word-picture":["Lắng nghe rồi chọn","Listen and choose"],letters:["Tìm chữ còn thiếu","Find the missing letter"],spelling:["Thử tài đánh vần","Try spelling"],grammar:["Luyện cấu trúc ngữ pháp","Practise grammar"]};
const modeIcons={flashcard:BookOpen,"picture-word":Image,"word-picture":Volume2,letters:Pencil,spelling:Keyboard,grammar:Blocks};
export function PracticePreview(){
  const {repository,t,preferences}=useApp();const gameSound=useGameSound();const soundEnabled=useRef(gameSound.enabled);const sounds=useRef<GameSounds|null>(null);const params=useSearchParams(),router=useRouter();
  useEffect(()=>{soundEnabled.current=gameSound.enabled;if(!gameSound.enabled)sounds.current?.stop();},[gameSound.enabled]);
  useEffect(()=>{const stop=()=>sounds.current?.stop();const hidden=()=>{if(document.hidden)stop();};window.addEventListener('wfk-audio-stop',stop);document.addEventListener('visibilitychange',hidden);return()=>{sounds.current?.close();window.removeEventListener('wfk-audio-stop',stop);document.removeEventListener('visibilitychange',hidden);};},[]);
  const practice=useMemo(()=>repository?new PracticeRepository(repository):null,[repository]);
  const snapshot=useLiveQuery(async()=>practice?{scope:practice.repository.scope.id,sessions:await practice.sessions()}:null,[practice]);
  const [session,setSession]=useState<Session|null>(null);
  const pictureValidity=useLiveQuery(async()=>practice&&session?{id:session.id,valid:await practice.pictureSessionLoaded(session)}:null,[practice,session]);
  const [failedPictureSession,setFailedPictureSession]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);const [error,setError]=useState("");const lock=useRef(false);
  const [deck,setDeck]=useState(params.get("deck")??"");
  const decks=useLiveQuery(async()=>repository?{scope:repository.scope.id,rows:await repository.db.table<ScopedDocument>("decks").where("[scopeId+id]").between([repository.scope.id,""],[repository.scope.id,"\uffff"]).toArray()}:null,[repository]);
  const reviewText=useMemo(()=>(vi:string,en:string)=>preferences.locale==="vi"?vi:en,[preferences.locale]);
  const review=params.get("review"),savedSession=params.get("session");const opened=useRef("");
  const [due,setDue]=useState(review==="due");const [weak,setWeak]=useState(false);const [lesson,setLesson]=useState(params.get("lesson")??"");const [direction,setDirection]=useState<"en-vi"|"vi-en">("en-vi");
  const lessons=useLiveQuery(async()=>repository?{scope:repository.scope.id,rows:await repository.db.lessons.where("[scopeId+learnedOn]").between([repository.scope.id,""],[repository.scope.id,"\uffff"]).toArray()}:null,[repository]);
  useEffect(()=>{
    if(!practice||(review!=="due"&&review!=="group"&&params.get("mode")!=="grammar"))return;let active=true;
    const key=`${practice.repository.scope.id}:${savedSession??"new"}`;
    void Promise.resolve().then(async()=>{
      if(!active||opened.current===key)return;opened.current=key;lock.current=true;setBusy(true);setError("");
      try{
        const next=savedSession?(await practice.sessions()).find(s=>s.id===savedSession):await practice.start(params.get("mode")==="grammar"?"grammar":"flashcard",{due:review==="due",deck:deck||undefined});
        if(!next)throw new Error("missing");
        if(active){setSession(next);opened.current=`${practice.repository.scope.id}:${next.id}`;if(!savedSession)router.replace(`/practice?review=${review??"group"}${deck?`&deck=${encodeURIComponent(deck)}`:""}&session=${encodeURIComponent(next.id)}`,{scroll:false});}
      }catch{if(active)setError(reviewText(savedSession?"Buổi ôn này không còn dùng được. Về Hôm nay để mở các từ đến hạn mới nhất.":"Hiện chưa có từ đến hạn để ôn, hoặc chưa mở được thư viện. Về Hôm nay kiểm tra lại; có thể chọn Thẻ ôn để thử lại.","No eligible review session could be opened. Return to Today to check the latest due words or retry flashcards."));}
      finally{lock.current=false;if(active)setBusy(false);}
    });return()=>{active=false;};
  },[practice,review,savedSession,router,reviewText,deck,params]);
  async function start(mode:Mode){if(!practice||lock.current)return;sounds.current?.stop();lock.current=true;setBusy(true);setError("");try{const next=await practice.start(mode,{word:params.get("word")??undefined,due,weak,lesson:lesson||undefined,deck:deck||undefined,direction});setSession(next);if(review==="due"){opened.current=`${practice!.repository.scope.id}:${next.id}`;router.replace(`/practice?review=${review??"group"}${deck?`&deck=${encodeURIComponent(deck)}`:""}&session=${encodeURIComponent(next.id)}`,{scroll:false});}}
    catch{setError(mode==="grammar"?t("Chưa có cấu trúc đã lưu để xếp câu. Thêm bài có ngữ pháp hoặc chọn nhóm khác nhé.","No saved grammar to practise. Add grammar or choose another group."):t("Chưa đủ từ phù hợp cho kiểu học này. Thêm/duyệt từ hoặc chọn Thẻ ôn; game hình chỉ dùng từ đã có hình và cần 3 hình khác nhau.","Not enough eligible words. Add approved words or choose flashcards; picture games only use words with ready pictures and need three distinct pictures."));}finally{lock.current=false;setBusy(false);}}
  async function change(action:"reveal"|"hint"|"answer"|"check",input:{answer?:string;rating?:Rating;skipped?:boolean}={}){
    if(!practice||!session||lock.current)return;window.dispatchEvent(new Event("wfk-audio-stop"));sounds.current??=new GameSounds();sounds.current.unlock(soundEnabled.current);lock.current=true;setBusy(true);setError("");
    try{const next=action==="check"?await practice.check(session.id,session.version,input.answer??""):action==="answer"?await practice.answer(session.id,session.version,input):await practice.reveal(session.id,session.version,action==="hint");setSession(next);if(action==="check")sounds.current.play(next.checkedCorrect?"correct":"again",soundEnabled.current);else if(next.completedAt)sounds.current.play("complete",soundEnabled.current);else if(action==="reveal")sounds.current.play("reveal",soundEnabled.current);}
    catch{setError(t("Phiên chưa lưu được hoặc nội dung đã đổi. Phần đang học vẫn còn; mở lại phiên mới nhất hoặc thử lại.","Could not save or the content changed. Resume the latest session or retry."));}
    finally{lock.current=false;setBusy(false);}
  }
  const sessions=snapshot?.scope===repository?.scope.id?snapshot?.sessions??[]:[];
  if(session&&!session.completedAt&&(session.mode==='picture-word'||session.mode==='word-picture')){
    if(pictureValidity?.id!==session.id)return <DatabaseLoading/>;
    if(!pictureValidity.valid||failedPictureSession===session.id)return <div className="reading-page page-flow"><EmptyState title={t('Hình trong lượt chơi đã đổi','Pictures changed')} description={t('Cùng chọn trò chơi để bắt đầu lượt mới nhé.','Choose a game to start a new round.')}><Button onClick={()=>setSession(null)}>{t('Chọn trò chơi','Choose a game')}</Button></EmptyState></div>;
  }
  if(session && session.scopeId===repository?.scope.id){
    if(session.completedAt){const correct=session.answers.filter(a=>a.correct&&!a.skipped).length,wrong=session.answers.filter(a=>!a.correct&&!a.skipped).length;
      return <div className="reading-page page-flow game-result"><div className="game-celebration"><NextImage src="/illustrations/fox.svg" alt="" width={130} height={130}/><Trophy aria-hidden="true"/></div><h1>{t("Con đã hoàn thành!","Session complete!")}</h1><div className="practice-results"><p><Check aria-hidden="true"/> {correct} {t("đúng / nhớ rồi","correct / remembered")}</p><p><BookOpen aria-hidden="true"/> {wrong} {t("cần ôn thêm","need review")}</p><p>{session.answers.filter(a=>a.skipped).length} {t("bỏ qua","skipped")} · {session.answers.filter(a=>a.hint).length} {t("dùng gợi ý","hints")}</p></div><p>{t("Điểm trò chơi không thay lịch ôn. Con có thể ôn thẻ để tự đánh giá trí nhớ.","Game scores do not change review dates. Use flashcards to rate your recall.")}</p>{wrong>0&&<Button variant="outline" onClick={()=>{setWeak(true);setSession(null);}}>{t("Ôn thẻ các từ cần luyện","Review words needing practice")}</Button>}<Button onClick={()=>setSession(null)}>{t("Chọn buổi học khác","Choose another session")}</Button><Button asChild variant="outline"><Link href="/today"><ArrowLeft data-icon="inline-start" aria-hidden="true"/>{t("Về Hôm nay","Back to Today")}</Link></Button></div>;
    }
    return <div className="reading-page page-flow game-session"><div className="section-heading"><h1>{t(modes.find(m=>m[0]===session.mode)![1],modes.find(m=>m[0]===session.mode)![2])}</h1><Button variant="outline" onClick={()=>{window.dispatchEvent(new Event("wfk-audio-stop"));setSession(null);}}>{t("Tạm dừng","Pause")}</Button></div>
      <div className="game-progress"><span>{session.position+1} / {session.questions.length}</span><div role="progressbar" aria-label={t('Tiến độ buổi học','Session progress')} aria-valuenow={session.position} aria-valuemin={0} aria-valuemax={session.questions.length}><span style={{transform:`scaleX(${session.position/session.questions.length})`}}/></div></div>
      <QuestionView key={`${session.id}:${session.position}`} session={session} busy={busy} action={change} onPictureUnavailable={art=>{practice?.pictureFailed(art);setFailedPictureSession(session.id);}}/>
      {error&&<p role="alert">{error}</p>}
      {error&&practice&&<Button variant="outline" onClick={async()=>{const next=await practice.get(session.id);if(next){setSession(next);setError("");}}}>{t("Mở lại phiên đã lưu","Reload saved session")}</Button>}
    </div>;
  }
  return <div className="reading-page page-flow play-hub"><header className="play-welcome"><div><h1>{t("Chơi & học","Play & learn")}</h1><p>{t("Cùng Cáo chơi với từ nhé!","Let's play with words!")}</p></div><NextImage src="/illustrations/fox.svg" alt="" width={110} height={110}/></header>
    <OperationStatus key="open-review" busy={busy} title={t("Đang mở buổi học…","Opening your session…")}/>
    {sessions.filter(s=>!s.completedAt).length>0&&<section className="page-flow"><h2>{t("Buổi học đang dở","Resume learning")}</h2><div className="session-history">{sessions.filter(s=>!s.completedAt).slice(0,5).map(s=><SessionCard key={s.id} session={s} open={()=>setSession(s)}/>)}</div></section>}
    {!sessions.some(s=>!s.completedAt)&&<p className="play-suggestion">{t('Bắt đầu với Thẻ ôn:','Start with Flashcards:')} {t('lật thẻ rồi chọn Nhớ rồi hoặc Chưa nhớ.','flip a card, then choose Remembered or Again.')}</p>}
    <div className="practice-modes"><Button asChild className="play-tile play-tile-speaking" size="lg" variant="secondary"><Link prefetch={false} href="/practice/speaking"><span className="play-tile-art"><NextImage src="/illustrations/fox.svg" width={84} height={84} alt=""/><Mic aria-hidden="true"/></span><span className="play-tile-copy"><strong>{t("Nói cùng Cáo","Speak with Fox")}</strong><small>{t("Nghe và nói các từ đã học","Listen and say your words")}</small></span><ArrowRight className="play-tile-arrow" aria-hidden="true"/></Link></Button>{modes.map(([mode,vi,en])=>{const Icon=modeIcons[mode];return <Button key={mode} className={`play-tile play-tile-${mode}`} aria-label={t(vi,en)} size="lg" variant="secondary" disabled={busy||!repository} onClick={()=>void start(mode)}><span className="play-tile-art"><Artwork art={modeArt[mode]} word="" size={84}/><Icon aria-hidden="true"/></span><span className="play-tile-copy"><strong>{t(vi,en)}</strong><small>{t(modePrompts[mode][0],modePrompts[mode][1])}</small></span><ArrowRight className="play-tile-arrow" aria-hidden="true"/></Button>;})}</div>
    <details className="practice-options"><summary>{t("Tùy chọn chơi","Play options")}</summary><div className="practice-filter-form">
    <div className="form-field"><label htmlFor="practice-words">{t('Từ để chơi','Words to play')}</label><select id="practice-words" value={due?'due':weak?'weak':'all'} onChange={e=>{setDue(e.target.value==='due');setWeak(e.target.value==='weak');}}><option value="all">{t('Tất cả từ','All words')}</option><option value="due">{t('Từ đến hạn ôn','Due for review')}</option><option value="weak">{t('Từ cần luyện thêm','Words to practise')}</option></select></div>
    <div className="form-field"><label htmlFor="practice-lesson">{t("Chọn bài học","Choose lesson")}</label><select id="practice-lesson" value={lesson} onChange={e=>setLesson(e.target.value)}><option value="">{t("Tất cả bài học","All lessons")}</option>{lessons&&lessons.scope===repository?.scope.id&&lessons.rows.filter(l=>!l.deletedAt).map(l=><option key={l.id} value={l.id}>{l.learnedOn} · {l.title}</option>)}</select></div>
    <div className="form-field"><label htmlFor="card-direction">{t("Chiều ôn thẻ","Flashcard direction")}</label><select id="card-direction" value={direction} onChange={e=>setDirection(e.target.value as typeof direction)}><option value="en-vi">English → tiếng Việt</option><option value="vi-en">Tiếng Việt → English</option></select></div>
    <div className="form-field"><label htmlFor="practice-deck">{t("Bộ thẻ riêng","Custom deck")}</label><select id="practice-deck" value={deck} onChange={e=>{setDeck(e.target.value);const row=decks?.rows.find(r=>r.id===e.target.value);if(row)setDirection((row.payload.deck as Deck).direction);}}><option value="">{t("Tất cả bộ thẻ","Any deck")}</option>{decks&&decks.scope===repository?.scope.id&&decks.rows.filter(r=>!r.deletedAt&&((r.payload.deck as Deck).group?.wordIds??(r.payload.deck as Deck).senseIds).length).map(row=><option key={row.id} value={row.id}>{(row.payload.deck as Deck).name}</option>)}</select></div><ActionLink href="/practice/decks"><Button variant="link">{t("Tạo bộ thẻ","Create a deck")}</Button></ActionLink>
    </div></details>
    {error&&<><p role="alert">{error}</p><Button asChild variant="outline"><Link href="/today"><ArrowLeft data-icon="inline-start" aria-hidden="true"/>{t("Về Hôm nay","Back to Today")}</Link></Button></>}
    {!repository&&<EmptyState title={t("Đang mở thư viện","Opening library")} description={t("Đợi một chút nhé.","Just a moment.")}/>}
    {sessions.some(s=>s.completedAt)&&<section className="page-flow"><h2>{t("Buổi học gần đây","Recent sessions")}</h2><div className="session-history">{sessions.filter(s=>s.completedAt).slice(0,5).map(s=><SessionCard key={s.id} session={s} open={()=>setSession(s)}/>)}</div></section>}

  </div>;
}
function SessionCard({session,open}:{session:Session;open:()=>void}){const {t}=useApp(),mode=modes.find(mode=>mode[0]===session.mode),correct=session.answers.filter(answer=>answer.correct).length;return <button className="session-history-card" onClick={open}><span className="session-history-art"><Artwork art={modeArt[session.mode]} word="" size={54}/></span><span className="session-history-copy"><strong>{mode?t(mode[1],mode[2]):t('Buổi học','Learning session')}</strong><small>{new Date(session.completedAt??session.createdAt).toLocaleDateString('vi-VN',{day:'numeric',month:'numeric'})} · {session.questions.length} {t('câu','questions')}</small><span>{session.completedAt?t(session.mode==='flashcard'?`Nhớ rồi ${correct}/${session.questions.length}`:`Đúng ${correct}/${session.questions.length}`,`${correct}/${session.questions.length} correct`):t(`Tiếp tục · ${session.position}/${session.questions.length}`,`Resume · ${session.position}/${session.questions.length}`)}</span></span>{session.completedAt?<Trophy className="session-history-mark" aria-hidden="true"/>:<ArrowRight className="session-history-mark" aria-hidden="true"/>}</button>;}
function QuestionView({session,busy,action,onPictureUnavailable}:{session:Session;busy:boolean;onPictureUnavailable:(art:string)=>void;action:(action:"reveal"|"hint"|"answer"|"check",input?:{answer?:string;rating?:Rating;skipped?:boolean})=>Promise<void>}){
  const {t,preferences}=useApp();const q=session.questions[session.position],word=q.word;const [answer,setAnswer]=useState("");const feedback=session.checkedAnswer!=null?(session.checkedCorrect?t("Đúng rồi!","Correct!"):t(`Đáp án là ${word.word}. Mình cùng xem lại nhé.`,`The answer is ${word.word}. Let's review it.`)):null;const [detailed,setDetailed]=useState(false);const pending=useRef<string|null>(null);
  const prompt=useRef<HTMLHeadingElement>(null);useEffect(()=>{prompt.current?.focus({preventScroll:true});},[session.revealed,session.checkedAnswer]);
  const choices=session.mode==="picture-word"||session.mode==="word-picture";
  const mask=[...word.word].map((letter,i)=>i===q.missingIndex?"_":letter).join(" ");
  function check(value:string){if(busy||feedback!==null)return;pending.current=value;void action("check",{answer:value});}
  if(session.mode==="grammar")return <GrammarQuestion session={session} busy={busy} action={action}/>;
  return <section className={`practice-question page-flow game-board ${feedback?(session.checkedCorrect?"is-correct":"try-again"):""}`} data-revealed={session.revealed}>
    {session.mode==="flashcard"?<><Artwork art={word.art} word={word.word} size={180}/><h2 ref={prompt} tabIndex={-1} lang={session.direction==="vi-en"?"vi":"en"}>{session.direction==="vi-en"?word.vi:word.word}</h2>{session.direction!=="vi-en"&&<AudioControl text={word.word}/>}
      {session.revealed?<><h3>{session.direction==="vi-en"?word.word:word.vi}</h3>{session.direction==="vi-en"&&<AudioControl text={word.word}/>}      <div className="row-wrap">{(["Again","Good",...(detailed||!preferences.childFriendly?["Hard","Easy"]:[])] as Rating[]).map(rating=><Button key={rating} disabled={busy} onClick={()=>void action("answer",{rating})}>{t({Again:"Chưa nhớ",Good:"Nhớ rồi",Hard:"Nhớ khó",Easy:"Rất dễ"}[rating],rating)}</Button>)}</div><Button variant="link" onClick={()=>setDetailed(v=>!v)}>{t("Đánh giá chi tiết","Detailed ratings")}</Button><details className="flashcard-details"><summary>{t("Ví dụ và cách đọc","Examples and pronunciation")}</summary><div className="page-flow"><p lang="en">{word.en}</p><p lang="en">{word.example}</p><SentencePronunciation text={word.example} pronunciations={word.examplePronunciations}/>{word.pronunciations.map((p,i)=><p key={i}>{p.verified?p.ipa:null} {p.readingHintVi&&`· ${p.readingHintVi}`}</p>)}
</div></details></>:<Button size="lg" disabled={busy} onClick={()=>void action("reveal")}>{t("Xem đáp án","Show answer")}</Button>}</>:
      <><h2 ref={prompt} tabIndex={-1} className="game-prompt">{session.mode==="picture-word"?t("Từ nào đúng với hình?","Which word matches?"):session.mode==="word-picture"?word.word:word.vi}</h2>
      {session.mode==="picture-word"&&<div className="game-picture-stage"><Artwork art={word.art} word={word.word} onUnavailable={onPictureUnavailable} size={180}/></div>}
      {session.mode==="word-picture"&&<AudioControl text={word.word}/>}
      {(session.mode==="letters"||session.mode==="spelling")&&word.art&&<div className="game-picture-stage game-picture-small"><Artwork art={word.art} word="" size={120}/></div>}
      {session.mode==="letters"&&<p className="letter-mask" lang="en">{mask}</p>}
      {choices?<div className="game-answers">{q.choices.map(choice=><button key={choice.id} data-result={feedback?(choice.word===word.word?"correct":choice.word===session.checkedAnswer?"incorrect":"idle"):"idle"} disabled={busy||feedback!==null} aria-label={session.mode==="word-picture"?`${t("Hình","Picture")} ${q.choices.indexOf(choice)+1}`:choice.word} onClick={()=>check(choice.word)}>
        {session.mode==="word-picture"?<Artwork art={choice.art} word={choice.word} onUnavailable={onPictureUnavailable} size={90}/>:choice.word}{feedback&&choice.word===word.word&&<Check className="answer-check" aria-hidden="true"/>}</button>)}</div>:
      <form onSubmit={e=>{e.preventDefault();check(session.mode==="letters"?[...word.word].map((letter,i)=>i===q.missingIndex?answer:letter).join(""):answer);}}><label htmlFor="practice-answer">{session.mode==="letters"?t("Gõ chữ còn thiếu","Enter the missing letter"):t("Gõ từ tiếng Anh","Type the English word")}</label><Input id="practice-answer" value={answer} maxLength={session.mode==="letters"?2:200} autoComplete="off" disabled={busy||feedback!==null} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&e.nativeEvent.isComposing)e.preventDefault();}}/><Button type="submit" disabled={busy||feedback!==null||!answer.trim()}><Check data-icon="inline-start" aria-hidden="true"/>{t("Kiểm tra","Check")}</Button></form>}
      {session.hint&&<p>{t("Gợi ý: bắt đầu bằng ","Hint: starts with ")}{word.word[0]}</p>}
      {feedback?<><div className="game-feedback"><NextImage src="/illustrations/fox.svg" alt="" width={64} height={64}/><p role="status">{feedback}</p>{session.checkedCorrect&&<span className="feedback-stars" aria-hidden="true"><Star/><Star/><Star/></span>}</div><p>{word.vi} · {word.example}</p><Button disabled={busy} onClick={()=>void action("answer",{answer:pending.current??""})}>{t("Câu tiếp theo","Next question")}<ArrowRight aria-hidden="true"/></Button></>:<div className="row-wrap"><Button variant="outline" disabled={busy} onClick={()=>void action("hint")}><Lightbulb aria-hidden="true"/>{t("Gợi ý","Hint")}</Button><Button variant="ghost" disabled={busy} onClick={()=>void action("answer",{skipped:true})}><SkipForward aria-hidden="true"/>{t("Bỏ qua","Skip")}</Button></div>}</>}
  </section>;
}
