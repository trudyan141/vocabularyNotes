"use client";
import {useState} from 'react';
import {Button} from '@/components/ui/button';
export function GrammarSteps({pattern}:{pattern:string}){
 const [step,setStep]=useState(0);const what=/What(?: \+)? is(?: \+)? it/i.test(pattern);const yesNo=/Is(?: \+)? it/i.test(pattern);
 if(!what&&!yesNo)return null;
 const stages=what?[{tokens:['What','is','it','?'],vi:'Hỏi “Đó là gì?”: What là “gì”; is đứng trước it.'},{tokens:['It','is','a / an','+ tên vật'],vi:'Trả lời “Đó là…”: đổi thứ tự thành It is, rồi thêm a/an và tên một vật. a book; an apple — chọn theo âm đầu.'},{tokens:["It’s",'a / an','+ tên vật'],vi:'It’s là viết ngắn của It is. It is a book. = It’s a book. Không bỏ a/an.'}]:[{tokens:['Is','it','a / an','+ tên vật','?'],vi:'Hỏi “Đó có phải là… không?”: đưa Is lên trước it.'},{tokens:['Yes,','it','is.'],vi:'Đúng thì trả lời Yes, it is. Trong câu trả lời ngắn này không nói Yes, it’s.'},{tokens:['No,','it','isn’t.'],vi:'Sai thì trả lời No, it isn’t. Isn’t là viết ngắn của is not.'}];
 return <section className="grammar-steps" aria-label="Minh họa thứ tự câu"><div className="grammar-tokens" key={step}>{stages[step].tokens.map((token,i)=><span lang="en" key={i}>{token}</span>)}</div><p aria-live="polite">{step+1}/3 · {stages[step].vi}</p><div className="row-wrap"><Button variant="outline" disabled={step===0} onClick={()=>setStep(s=>s-1)}>Bước trước</Button><Button variant="outline" onClick={()=>setStep(s=>(s+1)%3)}>{step===2?'Xem lại từ đầu':'Xem bước tiếp'}</Button></div></section>;
}
