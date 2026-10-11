"use client";
import {CheckCircle2,LoaderCircle,TriangleAlert} from 'lucide-react';
import {Button} from './button';
import {useApp} from '@/components/app/provider';
import type {ComponentProps} from 'react';
export type SubmitState='idle'|'pending'|'success'|'error';
/** Result stays beside its action. Changing input resets the result. */
export function SubmitButton({state,error,children,successLabel,...props}:ComponentProps<typeof Button>&{state:SubmitState;error?:string;successLabel?:string}){
 const {t}=useApp();
 return <div className="submit-feedback">{error&&<p className="submit-error" role="alert">{error}</p>}<Button {...props} type={props.type??'submit'} data-submit-state={state} aria-busy={state==='pending'} disabled={props.disabled||state==='pending'}>{state==='pending'?<><LoaderCircle aria-hidden="true"/>{t('Đang xử lý…','Working…')}</>:state==='success'?<><CheckCircle2 aria-hidden="true"/>{successLabel??t('Đã lưu','Saved')}</>:state==='error'?<><TriangleAlert aria-hidden="true"/>{children}</>:children}</Button></div>;
}
