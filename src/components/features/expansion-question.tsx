'use client';
import {useEffect,useRef} from 'react';
import {DialoguePrompt} from './dialogue-prompt';
import {DialogueMicrophone} from './dialogue-microphone';
import {Check,RotateCcw,Lightbulb,SkipForward} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Artwork} from '@/components/app/shared';
import {AudioControl} from '@/components/app/audio-control';
import {WordPronunciation} from '@/components/app/word-pronunciation';
import {SentencePronunciation} from '@/components/app/sentence-pronunciation';
import {Button} from '@/components/ui/button';
import {gameRegistry,isPairGame} from '@/lib/learning/game-registry';
import {emptyGameState,type GameMove} from '@/lib/learning/game-activity';
import {gameTiles,memoryCards,gameAnswer} from '@/lib/learning/game-engine';
import type {Session} from '@/data/local/practice';
export type PracticeAction=(action:'reveal'|'hint'|'answer'|'check'|'move',input?:{answer?:string;skipped?:boolean;move?:GameMove})=>Promise<void>;
export function ExpansionQuestion({session,busy,action,onPictureUnavailable}:{session:Session;busy:boolean;action:PracticeAction;onPictureUnavailable:(art:string)=>void}){
 const {t}=useApp(),q=session.questions[session.position],mode=session.mode as keyof typeof gameRegistry,config=gameRegistry[mode],s=session.gameState??emptyGameState(),checked=session.checkedAnswer!==null,locked=busy||checked;
 const move=(kind:GameMove['kind'],index?:number)=>void action('move',{move:{kind,...(index!==undefined?{index}:{})}}),a=q.activity;
 const autoClosed=useRef('');
 useEffect(()=>{
  if(mode!=='memory-pairs'||s.open.length!==2||busy||checked)return;
  const key=`${session.id}:${session.version}`;if(autoClosed.current===key)return;
  const cards=memoryCards(q),matched=cards[s.open[0]].pair===cards[s.open[1]].pair;
  const timer=window.setTimeout(()=>{autoClosed.current=key;void action('move',{move:{kind:'close'}});},matched?0:1000);
  return()=>window.clearTimeout(timer);
 },[mode,s.open,q,busy,checked,session.id,session.version,action]);
 const right=mode==='match-pairs'?memoryCards(q).filter(card=>card.side==='word').map(card=>card.pair):[];
 const picture=(index:number)=><Artwork art={q.choices[index].art} word={q.choices[index].word} hideWord size={80} onUnavailable={onPictureUnavailable}/>;
 return <section className="page-flow game-board expansion-game" aria-busy={busy}>
  <h2>{t(config.vi,config.en)}</h2><p>{t(config.helpVi,config.helpEn)}</p>
  {isPairGame(mode)?<>
   <p role="status">{s.matched.length} / {q.choices.length} {t('cặp đã tìm','pairs found')}{s.mistakes>0&&` · ${t('Cùng thử lại nhé','Let’s try again')}`}</p>
   {mode==='match-pairs'?<div className="pair-columns"><div className="pair-column">{q.choices.map((word,i)=><Button key={word.id} className="pair-tile illustrated-pair-card" variant="outline" disabled={locked||s.matched.includes(i)} aria-pressed={s.left===i} aria-label={t(`Chọn hình ${i+1}`,`Choose picture ${i+1}`)} onClick={()=>move('left',i)}><span className="memory-card-front pair-card-face"><span className="memory-card-content">{picture(i)}</span>{s.matched.includes(i)&&<span className="memory-card-match"><Check aria-label={t('Đã ghép','Matched')}/></span>}</span></Button>)}</div><div className="pair-column">{right.map(i=><Button key={i} className="pair-tile illustrated-pair-card" variant="secondary" disabled={locked||s.matched.includes(i)||s.left===null} onClick={()=>move('right',i)} lang="en"><span className="memory-card-front pair-card-face"><span className="memory-card-content"><span>{q.choices[i].word}</span></span>{s.matched.includes(i)&&<span className="memory-card-match"><Check aria-hidden="true"/></span>}</span></Button>)}</div></div>:<><div className="memory-board" data-pairs={q.choices.length}>{memoryCards(q).map((card,i)=>{const visible=s.open.includes(i)||s.matched.includes(card.pair),matched=s.matched.includes(card.pair);return <Button key={i} className="memory-tile" variant="outline" data-open={visible} data-matched={matched} disabled={locked||matched||s.open.includes(i)||s.open.length===2} aria-label={visible?card.side==='word'?q.choices[card.pair].word:t(`Hình đã mở ${i+1}`,`Revealed picture ${i+1}`):t(`Lật thẻ ${i+1}`,`Turn card ${i+1}`)} onClick={()=>move('flip',i)}><span className="memory-card-inner"><span className="memory-card-back" aria-hidden="true"><span className="memory-card-number">{i+1}</span></span><span className="memory-card-front" aria-hidden={!visible}><span className="memory-card-content">{card.side==='picture'?picture(card.pair):<span lang="en">{q.choices[card.pair].word}</span>}</span>{matched&&<span className="memory-card-match"><Check aria-hidden="true"/></span>}</span></span></Button>;})}</div></>}
   {(mode==='memory-pairs'&&s.open.length>0||mode==='match-pairs'&&s.matched.length>0)&&<AudioControl text={q.choices[mode==='memory-pairs'?memoryCards(q)[s.open.at(-1)!].pair:s.matched.at(-1)!].word} autoPlay/>}
   {s.matched.length>0&&<details className="matched-reading"><summary>{t('Nghe các cặp đã tìm','Listen to matched pairs')}</summary>{s.matched.map(i=><div key={i}><strong lang="en">{q.choices[i].word}</strong><AudioControl text={q.choices[i].word}/><WordPronunciation text={q.choices[i].word} pronunciations={q.choices[i].pronunciations}/></div>)}</details>}
  </>:mode==='word-builder'?<>
   <p>{q.word.vi}</p>{q.word.art&&<Artwork art={q.word.art} word={q.word.word} hideWord size={120}/>}<AudioControl text={q.word.word} autoPlay/>
   <div className="word-workshop-answer" aria-label={t('Từ con đang xếp','Your word')} lang="en">{checked?q.word.word:s.chosen.length?s.chosen.map((id,i)=><Button key={id} variant="outline" disabled={locked} aria-label={t(`Trả chữ ở ô ${i+1}`,`Return letter from slot ${i+1}`)} onClick={()=>move('remove',i)}>{gameTiles(q).find(tile=>tile.id===id)!.text}</Button>):<span>{t('Chạm các chữ bên dưới','Tap the letters below')}</span>}</div>
   {!checked&&<div className="sentence-tiles">{gameTiles(q).map(tile=><Button key={tile.id} disabled={locked||s.chosen.includes(tile.id)} aria-label={t(`Chọn chữ ${tile.text}`,`Pick letter ${tile.text}`)} onClick={()=>move('pick',tile.id)}>{tile.text}</Button>)}</div>}
  </>:a&&<>
   {mode!=='grammar-dialogue'&&a.context&&<p className="grammar-translation">{a.context}</p>}
   {mode==='grammar-dialogue'?<DialoguePrompt key={q.id} activity={a}/>:mode==='grammar-repair'?<div className="sentence-tiles" aria-label={t('Chọn mảnh cần sửa','Choose the piece to fix')}>{a.prompt.split(/\s+/).map((token,i)=><Button key={i} variant="outline" aria-pressed={s.chosen[0]===i} disabled={locked} onClick={()=>move('error',i)} lang="en">{token}</Button>)}</div>:!checked&&<p className="grammar-english" lang="en">{a.prompt.replace('___',s.chosen.length?a.options[s.chosen[0]]:'___')}</p>}
   {!checked&&<div className="activity-options">{a.options.map((option,i)=><div className="activity-option" key={option}><Button variant="secondary" disabled={locked||(mode==='grammar-repair'&&!s.chosen.length)} aria-pressed={s.chosen[mode==='grammar-repair'?1:0]===i} onClick={()=>{window.dispatchEvent(new Event('wfk-audio-stop'));move('pick',i);}} lang="en">{option}</Button>{mode==='grammar-dialogue'&&<AudioControl text={option} showSource={false}/>}</div>)}</div>}
   {!checked&&mode==='grammar-dialogue'&&<DialogueMicrophone key={q.id} options={a.options} disabled={locked} onSelect={index=>action('move',{move:{kind:'pick',index}})}/>}
  </>}
  {!checked&&<><div className="row-wrap"><Button disabled={busy||gameAnswer(session)===null} onClick={()=>void action('check',{answer:gameAnswer(session)!})}><Check aria-hidden="true"/>{t('Kiểm tra','Check')}</Button>{!isPairGame(mode)&&<Button variant="outline" disabled={busy||!s.chosen.length} onClick={()=>move('reset')}><RotateCcw aria-hidden="true"/>{t('Xếp lại','Start again')}</Button>}</div><div className="row-wrap"><Button variant="outline" disabled={busy} onClick={()=>void action('hint')}><Lightbulb aria-hidden="true"/>{t('Gợi ý','Hint')}</Button><Button variant="ghost" disabled={busy} onClick={()=>void action('answer',{skipped:true})}><SkipForward aria-hidden="true"/>{t('Bỏ qua','Skip')}</Button></div>{session.hint&&<p>{isPairGame(mode)?t('Chọn hình rồi tìm từ cùng nghĩa. Mở lại thẻ để xem nhé.','Choose a picture and find its word. Reveal cards to look again.'):a?t(`Mảnh đúng là ${a.answer}.`,`The correct piece is ${a.answer}.`):t(`Chữ đầu là ${q.word.word[0]}.`,`The first letter is ${q.word.word[0]}.`)}</p>}</>}
  {checked&&<div className="grammar-feedback page-flow"><strong role="status">{session.checkedCorrect?t('Đúng rồi!','Correct!'):isPairGame(mode)?t('Con đã tìm đủ cặp. Cùng ôn lại nhé!','All pairs found. Let’s review!'):t('Mình cùng xem câu trả lời đúng nhé!','Let’s review the correct answer!')}</strong>{a?<><p className="grammar-english" lang="en">{a.solution}</p><SentencePronunciation text={a.solution} ipa={a.solutionIpa}/><p>{a.translation}</p><p>{a.explanation}</p></>:!isPairGame(mode)&&<><p lang="en">{q.word.word}</p><WordPronunciation text={q.word.word} pronunciations={q.word.pronunciations}/></>}<Button disabled={busy} onClick={()=>void action('answer')}>{t('Câu tiếp theo','Next question')}</Button></div>}
 </section>;
}
