'use client';
import {useRef,useState} from 'react';
import {Check} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {missingLetters} from '@/lib/learning/missing-letters';
import {shuffled} from '@/lib/learning/random';
export function MissingLettersQuestion({word,positions,busy,checked,submittedAnswer,onCheck}:{word:string;positions:number[];busy:boolean;checked:boolean;submittedAnswer?:string;onCheck:(answer:string)=>void}){
 const {t}=useApp();
 const [values,setValues]=useState(()=>positions.map((_,index)=>[...(submittedAnswer??'')][index]??''));
 const [bank]=useState(()=>shuffled([...missingLetters(word,positions)].map((letter,id)=>({letter,id}))));
 const inputs=useRef<(HTMLInputElement|null)[]>([]),active=useRef(0);
 const disabled=busy||checked,complete=values.every(value=>/^[a-z]$/i.test(value));
 function fill(index:number,text:string,moveFocus=true){
  const letters=[...text.normalize('NFKC')].filter(letter=>/^[a-z]$/i.test(letter));
  const next=[...values];if(!text)next[index]='';else letters.slice(0,positions.length-index).forEach((letter,offset)=>{next[index+offset]=letter;});setValues(next);
  if(letters.length){const target=Math.min(positions.length-1,index+letters.length);active.current=target;if(moveFocus)inputs.current[target]?.focus();}
 }
 function pick(letter:string){fill(active.current,letter,false);}
 if(checked)return <p className="missing-letter-word" lang="en">{word}</p>;
 return <form className="missing-letters-form" onSubmit={event=>{event.preventDefault();if(complete&&!disabled)onCheck(values.join(''));}}>
  <p id="missing-letters-help">{t(`Điền ${positions.length} chữ còn thiếu. Con có thể gõ hoặc chạm chữ bên dưới.`,`Fill ${positions.length} missing letters. Type or tap the letters below.`)}</p>
  <div className="missing-letter-word" aria-label={t('Từ có chữ còn thiếu','Word with missing letters')} lang="en">{[...word].map((letter,index)=>{
   const slot=positions.indexOf(index);
   return slot<0?<span key={index} className={letter===' '?'missing-letter-space':'missing-letter-known'}>{letter}</span>:<Input key={index} ref={node=>{inputs.current[slot]=node;}} className="missing-letter-slot" value={values[slot]} maxLength={1} aria-label={t(`Chữ thiếu ${slot+1}`,`Missing letter ${slot+1}`)} aria-describedby="missing-letters-help" autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={disabled} onFocus={()=>{active.current=slot;}} onChange={event=>{if(!(event.nativeEvent as InputEvent).isComposing)fill(slot,event.target.value);}} onCompositionEnd={event=>fill(slot,event.currentTarget.value)} onPaste={event=>{event.preventDefault();fill(slot,event.clipboardData.getData('text'));}} onKeyDown={event=>{if(event.nativeEvent.isComposing){if(event.key==='Enter')event.preventDefault();return;}if(event.key==='Backspace'&&!values[slot]&&slot>0){event.preventDefault();fill(slot-1,'');inputs.current[slot-1]?.focus();}}}/>;
  })}</div>
  <div className="missing-letter-bank" aria-label={t('Chữ để điền','Letters to fill')}>{bank.map(({letter,id})=><Button key={id} type="button" variant="secondary" disabled={disabled} aria-label={t(`Điền chữ ${letter}`,`Fill letter ${letter}`)} onClick={()=>pick(letter)}>{letter}</Button>)}</div>
  <Button className="self-center" type="submit" disabled={disabled||!complete}><Check aria-hidden="true"/>{t('Kiểm tra','Check')}</Button>
 </form>;
}
