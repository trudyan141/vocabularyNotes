"use client";
import {useMemo,useState} from 'react';
import {ArrowRight,RotateCcw,Lightbulb,Check,SkipForward} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {SentencePronunciation} from '@/components/app/sentence-pronunciation';
import {AudioControl} from '@/components/app/audio-control';
import {shuffledTiles} from '@/lib/learning/grammar-game';
import type {Session} from '@/data/local/practice';
export function GrammarQuestion({session,busy,action}:{session:Session;busy:boolean;action:(action:'hint'|'check'|'answer',input?:{answer?:string;skipped?:boolean})=>Promise<void>}){
 const {t}=useApp(),question=session.questions[session.position],grammar=question.grammar!;
 const tiles=useMemo(()=>shuffledTiles(grammar.example,question.id),[grammar.example,question.id]),[chosen,setChosen]=useState<number[]>([]);
 const text=chosen.map(id=>tiles.find(tile=>tile.id===id)!.text).join(' '),checked=session.checkedAnswer!==null;
 return <section className="page-flow grammar-game"><h2>{t('Xếp câu cùng Cáo','Build a sentence with Fox')}</h2><p className="grammar-translation">{grammar.exampleVi}</p>
 <div className="sentence-building" aria-label={t('Câu con đang xếp','Your sentence')} aria-live="polite">{chosen.length?chosen.map((id,index)=><Button key={id} variant="secondary" disabled={busy||checked} onClick={()=>setChosen(ids=>ids.filter((_,i)=>i!==index))}>{tiles.find(tile=>tile.id===id)!.text}</Button>):<span>{t('Chạm các từ bên dưới để xếp câu','Tap the words below to build the sentence')}</span>}</div>
 {!checked&&<><div className="sentence-tiles" aria-label={t('Các từ để xếp câu','Sentence tiles')}>{tiles.map(tile=><Button key={tile.id} variant="outline" disabled={busy||chosen.includes(tile.id)} onClick={()=>setChosen(ids=>[...ids,tile.id])}>{tile.text}</Button>)}</div>
 {session.hint&&<p>{t('Câu bắt đầu bằng: ','Start with: ')}<strong lang="en">{grammar.example.split(/\s+/)[0]}</strong></p>}
 <div className="row-wrap"><Button disabled={busy||chosen.length!==tiles.length} onClick={()=>void action('check',{answer:text})}><Check aria-hidden="true"/>{t('Xong rồi','Done')}</Button><Button variant="ghost" disabled={busy||!chosen.length} onClick={()=>setChosen([])}><RotateCcw aria-hidden="true"/>{t('Xếp lại','Start again')}</Button></div><div className="row-wrap"><Button variant="secondary" disabled={busy} onClick={()=>void action('hint')}><Lightbulb aria-hidden="true"/>{t('Gợi ý','Hint')}</Button><Button variant="ghost" disabled={busy} onClick={()=>void action('answer',{skipped:true})}><SkipForward aria-hidden="true"/>{t('Bỏ qua','Skip')}</Button></div></>}
 {checked&&<div className={`grammar-feedback page-flow ${session.checkedCorrect?'is-correct':''}`}><strong role="status">{session.checkedCorrect?t('Đúng rồi!','Correct!'):t('Mình cùng xem câu đúng nhé!','Let’s see the correct sentence!')}</strong><p lang="en">{grammar.example}</p><SentencePronunciation text={grammar.example} ipa={grammar.exampleIpa}/><p className="grammar-formula">{grammar.formula}</p><Button disabled={busy} onClick={()=>void action('answer',{answer:session.checkedAnswer??''})}>{t('Câu tiếp theo','Next sentence')}<ArrowRight aria-hidden="true"/></Button></div>}
 {!checked&&session.hint&&<AudioControl text={grammar.example}/>}
 </section>;
}
