'use client';
import {useEffect,useRef} from 'react';
import {Check,RotateCcw,Lightbulb} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {SentencePronunciation} from '@/components/app/sentence-pronunciation';
import {GrammarSteps} from './grammar-steps';
import type {Session} from '@/data/local/practice';
export function GrammarCard({session,busy,action}:{session:Session;busy:boolean;action:(action:'reveal'|'answer',input?:{understood?:boolean})=>Promise<void>}){
 const {t}=useApp(),grammar=session.questions[session.position].grammar!;
 const heading=useRef<HTMLHeadingElement>(null);useEffect(()=>{heading.current?.focus({preventScroll:true});},[]);
 return <section className="page-flow grammar-study"><h2 ref={heading} tabIndex={-1}>{t('Nghe câu, hiểu cách dùng','Listen and understand')}</h2><p>{t('Con nghe câu rồi thử nghĩ xem câu nói gì nhé.','Listen and think about what the sentence means.')}</p><p className="grammar-english" lang="en">{grammar.example}</p><SentencePronunciation text={grammar.example} ipa={grammar.exampleIpa}/>
 {!session.revealed?<Button size="lg" disabled={busy} onClick={()=>void action('reveal')}><Lightbulb aria-hidden="true"/>{t('Xem nghĩa & giải thích','Show meaning & explanation')}</Button>:<><div className="grammar-study-meaning"><h3>{t('Câu này nói gì?','What does it mean?')}</h3><p lang="vi">{grammar.exampleVi}</p>{grammar.conditions&&<p lang="vi">{grammar.conditions}</p>}{grammar.analysis&&grammar.analysis!==grammar.conditions&&<p lang="vi">{grammar.analysis}</p>}{!grammar.conditions&&!grammar.analysis&&<p>{t('Bài này chưa có giải thích thêm. Con có thể xem nghĩa câu và cách ghép bên dưới.','This lesson has no extra explanation yet. Read the meaning and explore the sentence below.')}</p>}</div>
 <GrammarSteps pattern={grammar.formula} conditions={grammar.conditions} analysis={grammar.analysis} examples={[{textEn:grammar.example,textVi:grammar.exampleVi,ipa:grammar.exampleIpa,formula:grammar.formula,analysis:grammar.analysis}]}/>
 <p>{t('Con tự chọn nhé. Câu cần xem lại sẽ được gom để luyện lại cuối lượt.','Choose how you feel. Sentences needing review will be collected to practise again at the end.')}</p><div className="row-wrap"><Button disabled={busy} onClick={()=>void action('answer',{understood:true})}><Check aria-hidden="true"/>{t('Con hiểu rồi','I understand')}</Button><Button variant="secondary" disabled={busy} onClick={()=>void action('answer',{understood:false})}><RotateCcw aria-hidden="true"/>{t('Cần xem lại','Review again')}</Button></div></>}
 </section>;
}
