'use client';
import {useState} from 'react';
import {Check} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {missingLetters} from '@/lib/learning/missing-letters';
import {shuffled} from '@/lib/learning/random';
export function MissingLettersQuestion({word,positions,busy,checked,onCheck}:{word:string;positions:number[];busy:boolean;checked:boolean;onCheck:(answer:string)=>void}){
 const {t}=useApp();
 const [selected,setSelected]=useState<(number|null)[]>(()=>positions.map(()=>null));
 const [bank]=useState(()=>shuffled([...missingLetters(word,positions)].map((letter,id)=>({letter,id}))));
 const values=selected.map(id=>bank.find(tile=>tile.id===id)?.letter??'');
 const disabled=busy||checked,complete=selected.every(id=>id!==null);
 function pick(id:number){setSelected(current=>{if(current.includes(id))return current;const slot=current.indexOf(null);return slot<0?current:current.map((value,index)=>index===slot?id:value);});}
 function remove(slot:number){setSelected(current=>current.map((value,index)=>index===slot?null:value));}
 if(checked)return <p className="missing-letter-word" lang="en">{word}</p>;
 return <form className="missing-letters-form" onSubmit={event=>{event.preventDefault();if(complete&&!disabled)onCheck(values.join(''));}}>
  <p id="missing-letters-help">{t(`Điền ${positions.length} chữ còn thiếu. Chạm chữ bên dưới để điền. Chạm ô đã điền để trả chữ về.`,`Fill ${positions.length} missing letters. Tap letters below to fill. Tap a filled slot to return its letter.`)}</p>
  <div className="missing-letter-word" aria-label={t('Từ có chữ còn thiếu','Word with missing letters')} lang="en">{[...word].map((letter,index)=>{
   const slot=positions.indexOf(index);
   return slot<0?<span key={index} className={letter===' '?'missing-letter-space':'missing-letter-known'}>{letter}</span>:<button key={index} type="button" className="missing-letter-slot" aria-label={values[slot]?t(`Trả chữ ${values[slot]} từ ô ${slot+1}`,`Return letter ${values[slot]} from slot ${slot+1}`):t(`Ô trống ${slot+1}`,`Empty slot ${slot+1}`)} aria-describedby="missing-letters-help" disabled={disabled||selected[slot]===null} onClick={()=>remove(slot)}>{values[slot]}</button>;
  })}</div>
  <div className="missing-letter-bank" aria-label={t('Chữ để điền','Letters to fill')}>{bank.map(({letter,id})=><Button key={id} type="button" variant="secondary" disabled={disabled||complete||selected.includes(id)} aria-label={t(`Điền chữ ${letter}`,`Fill letter ${letter}`)} onClick={()=>pick(id)}>{letter}</Button>)}</div>
  <Button className="self-center" type="submit" disabled={disabled||!complete}><Check aria-hidden="true"/>{t('Kiểm tra','Check')}</Button>
 </form>;
}
