 'use client';
import {useSyncExternalStore,useState} from 'react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {SubmitButton,type SubmitState} from '@/components/ui/submit-button';
import {Input} from '@/components/ui/input';
import {KeyRound,Save} from 'lucide-react';
import {parentAi,configureParentAi,parentKeyStorage,defaultParentModel,type AiFailure} from '@/lib/ai/byok';
export function ParentAiSettings(){const hydrated=useSyncExternalStore(()=>()=>{},()=>true,()=>false);return hydrated?<ParentAiForm/>:null;}
function ParentAiForm(){
 const {t}=useApp();const [open,setOpen]=useState(false),[key,setKey]=useState(()=>parentAi()?.key??''),[message,setMessage]=useState(''),[state,setState]=useState<SubmitState>('idle');
 return <section id="parent-ai" className="page-flow ai-settings">
 <Button variant="outline" aria-expanded={open} aria-controls="parent-key-form" onClick={()=>setOpen(value=>!value)}><KeyRound aria-hidden="true"/>{t('Cài đặt key AI','Set AI key')}</Button>
 {open&&<form id="parent-key-form" className="compact-form" onSubmit={event=>{event.preventDefault();try{let remember=false;try{remember=!!localStorage.getItem(parentKeyStorage);}catch{}configureParentAi(key.trim()?{key:key.trim(),model:parentAi()?.model??defaultParentModel}:null,remember);setState('success');setMessage(t('Đã lưu key.','Key saved.'));}catch{setState('error');setMessage(t('Key chưa đúng. Kiểm lại rồi lưu nhé.','Check your key and save again.'));}}}>
 <label htmlFor="parent-api-key">Gemini API key</label><Input id="parent-api-key" type="password" autoComplete="off" spellCheck={false} maxLength={300} value={key} onChange={event=>{setKey(event.target.value);setState('idle');setMessage('');}} placeholder="AIza…"/>
 <SubmitButton type="submit" state={state} error={state==='error'?message:undefined} successLabel={t('Đã lưu key','Key saved')}><Save aria-hidden="true"/>{t('Lưu key','Save key')}</SubmitButton>
 </form>}
 </section>;
}

export function AiFailureDetails({details}:{details:AiFailure}){const {t}=useApp();const message=details.http===429?t('Google đang bận hoặc đã hết lượt đọc. Thử lại sau; có thể chép bài bằng tay.','Google is busy or the reading allowance is used up. Retry later or type the lesson.'):details.http===401||details.http===403?t('Tài khoản Google AI này chưa dùng được. Kiểm lại trong tùy chọn AI của bạn, hoặc chép bài bằng tay.','This Google AI account is unavailable. Check AI options or type the lesson.'):t('Chưa đọc được bài này. Thử ảnh khác hoặc chép bài bằng tay; nháp vẫn còn.','Could not read this lesson. Try another photo or type it; your draft is kept.');return <p className="ai-error-details">{message}</p>;}
