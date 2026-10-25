'use client';
import {DialoguePrompt} from './dialogue-prompt';
import {DialogueMicrophone} from './dialogue-microphone';
import {useState} from 'react';
import {ArrowLeft,Check,Lightbulb,RotateCcw} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {AudioControl} from '@/components/app/audio-control';
import {SentencePronunciation} from '@/components/app/sentence-pronunciation';
import {Button} from '@/components/ui/button';
import {clozeExamples,repairExamples} from '@/lib/learning/game-examples';
import {gameRegistry} from '@/lib/learning/game-registry';
import type {DialogueRound} from '@/lib/learning/scoped-dialogue';
import type {GameActivity} from '@/lib/learning/game-activity';
export type StarterMode=GameActivity['kind'];
export const isStarterMode=(mode:string):mode is StarterMode=>mode==='grammar-cloze'||mode==='grammar-repair'||mode==='grammar-dialogue';
const packs={'grammar-cloze':clozeExamples,'grammar-repair':repairExamples};
/** Built-in practice is isolated from library records, coverage and SRS. */
export function GrammarStarter({mode,onLeave,dialogue,sample=false,compact=false}:{mode:StarterMode;onLeave:()=>void;dialogue?:DialogueRound[];sample?:boolean;compact?:boolean}){
 const {t}=useApp(),[round,setRound]=useState(0),[position,setPosition]=useState(0),[choice,setChoice]=useState<number|null>(null),[slot,setSlot]=useState<number|null>(null),[checked,setChecked]=useState(false),[hint,setHint]=useState(false),[correctCount,setCorrectCount]=useState(0);
 const items=dialogue?.map(round=>round.activity)??(mode==='grammar-dialogue'?[]:packs[mode]),a=items[(position+round)%items.length],config=gameRegistry[mode],complete=position===items.length;
 const options=a.options.map((_,i)=>a.options[(i+position+round+1)%a.options.length]);
 const correct=choice!==null&&options[choice]===a.answer&&(mode!=='grammar-repair'||slot===a.slot);
 const stop=()=>window.dispatchEvent(new Event('wfk-audio-stop'));
 function next(){stop();setPosition(p=>p+1);setChoice(null);setSlot(null);setChecked(false);setHint(false);}
 return <div className="reading-page page-flow game-session grammar-starter"><div className="section-heading"><h1 tabIndex={-1}>{t(config.vi,config.en)}</h1><Button variant="outline" onClick={()=>{stop();onLeave();}}><ArrowLeft aria-hidden="true"/>{t('Về chọn trò chơi','Back to games')}</Button></div>
 {!compact&&<p className="practice-scope">{dialogue?(sample?t('Bộ câu mẫu · Chơi ngay cùng Cáo','Sample questions · Play with Fox'):t('Câu hỏi từ cấu trúc và từ đang chọn','Questions from your selected grammar and words')):t('Bộ câu có sẵn · Chơi ngay cùng Cáo','Ready-to-play sentences · Play with Fox')}</p>}
 {complete?<><h2>{t('Con đã hoàn thành!','You finished!')}</h2><p role="status">{correctCount} / {items.length} {t('câu đúng','correct answers')}</p>{!compact&&<p>{t('Điểm trong lượt chơi không thay lịch ôn. Rời trang sẽ bắt đầu lại lượt này.','Round scores do not change review dates. Leaving restarts this round.')}</p>}<Button onClick={()=>{setRound(r=>r+1);setPosition(0);setCorrectCount(0);}}><RotateCcw aria-hidden="true"/>{t('Chơi lại','Play again')}</Button></>:<>
 <p>{position+1} / {items.length}</p><section className="page-flow game-board expansion-game" aria-label={dialogue&&!sample?t('Bài chơi theo phần đang chọn','Activity from your selection'):t('Bài chơi có sẵn','Built-in activity')}><p>{t(config.helpVi,config.helpEn)}</p>
 {mode!=='grammar-dialogue'&&a.context&&<p className="grammar-translation">{a.context}</p>}
 {mode==='grammar-dialogue'?<DialoguePrompt key={`${round}:${position}`} activity={a} scene={dialogue?.[(position+round)%items.length].scene}/>:mode==='grammar-repair'?<div className="sentence-tiles" aria-label={t('Chọn mảnh cần sửa','Choose the piece to fix')}>{a.prompt.split(/\s+/).map((token,i)=><Button key={i} variant="outline" aria-pressed={slot===i} disabled={checked} onClick={()=>{setSlot(i);setChoice(null);}} lang="en">{token}</Button>)}</div>:!checked&&<p lang="en" className="grammar-english">{a.prompt.replace('___',choice===null?'___':options[choice])}</p>}
 {!checked&&<><div className="activity-options">{options.map((option,i)=><div className="activity-option" key={option}><Button variant="secondary" disabled={mode==='grammar-repair'&&slot===null} aria-pressed={choice===i} onClick={()=>{stop();setChoice(i);}} lang="en">{option}</Button>{mode==='grammar-dialogue'&&<AudioControl text={option} showSource={false}/>}</div>)}</div>{mode==='grammar-dialogue'&&<DialogueMicrophone key={`${round}:${position}`} options={options} disabled={checked} onSelect={setChoice}/>}<div className="row-wrap"><Button disabled={choice===null} onClick={()=>{stop();setChecked(true);if(correct)setCorrectCount(n=>n+1);}}><Check aria-hidden="true"/>{t('Kiểm tra','Check')}</Button><Button variant="outline" onClick={()=>setHint(true)}><Lightbulb aria-hidden="true"/>{t('Gợi ý','Hint')}</Button></div>{hint&&<p>{a.explanation}</p>}</>}
 {checked&&<div className="grammar-feedback page-flow"><strong role="status">{correct?t('Đúng rồi!','Correct!'):t('Mình cùng xem câu trả lời đúng nhé!','Let’s review the correct answer!')}</strong><p className="grammar-english" lang="en">{a.solution}</p><SentencePronunciation text={a.solution} ipa={a.solutionIpa}/><p>{a.translation}</p><p>{a.explanation}</p><Button onClick={next}>{t('Câu tiếp theo','Next question')}</Button></div>}
 </section>{!compact&&<p className="muted">{t('Lượt chơi không đổi nội dung hay lịch ôn thư viện. Rời trang sẽ bắt đầu lại lượt này.','This round does not change library content or review dates. Leaving restarts this round.')}</p>}</>}
 </div>;
}
