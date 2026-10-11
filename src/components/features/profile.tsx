"use client";
import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {UserRound} from "lucide-react";
import {useApp,useHydrated} from "@/components/app/provider";
import {Button} from "@/components/ui/button";
import {SubmitButton,type SubmitState} from '@/components/ui/submit-button';
import {submitError} from '@/lib/submit-error';
import {Input} from "@/components/ui/input";
import type {AccountProfile} from "@/lib/account-profile";
import type {Preferences} from "@/lib/preferences";
import {useAuthStatus} from '@/lib/auth-state';
const avatars={fox:"/illustrations/fox.svg",cat:"/illustrations/cat.svg",dog:"/illustrations/dog.svg"};
export function ProfileAvatar({user,small=false}:{user?:AccountProfile|null;small?:boolean}){
 const {preferences,repository}=useApp();const [failed,setFailed]=useState<string|null>(null);
 const chosen=user&&(repository?.scope.kind!=='account'||repository.scope.ownerId!==user.id)?'google':preferences.profileAvatar;const src=chosen==='google'?user?.avatarUrl:avatars[chosen];
 return <span className={small?"profile-avatar profile-avatar-small":"account-avatar"}>{src&&failed!==src?<Image unoptimized src={src} width={small?36:72} height={small?36:72} alt="" referrerPolicy="no-referrer" onError={()=>setFailed(src)}/>:user?.name?<span aria-hidden="true">{user.name.trim().slice(0,1).toLocaleUpperCase()}</span>:<UserRound aria-hidden="true"/>}</span>;
}
export function ProfileLink(){
 const {t,preferences,repository}=useApp();const user=useAuthStatus()?.user??null;const profileName=repository?.scope.kind==='account'&&repository.scope.ownerId===user?.id?preferences.profileName:'';
 return <Button asChild variant="outline" className="profile-link"><Link href="/profile" prefetch={false} aria-label={t('Hồ sơ và đăng nhập','Profile and sign in')}><ProfileAvatar key={`${user?.id}:${preferences.profileAvatar}`} user={user} small/><span>{user?(profileName||user.name||t('Hồ sơ','Profile')):t('Đăng nhập','Sign in')}</span></Link></Button>;
}
export function ProfileSettings(){
 const {t,preferences,setPreferences,storageError,repository}=useApp();const hydrated=useHydrated();const [editedName,setName]=useState<string|null>(null),[saved,setSaved]=useState(false),[state,setState]=useState<SubmitState>('idle'),[error,setError]=useState('');const name=editedName??preferences.profileName;const ready=hydrated&&!!repository;
 return <section className="page-flow profile-settings"><h2>{t('Tên và avatar của bạn','Your name and avatar')}</h2><p>{repository?.scope.kind==='account'?t('Tên và avatar được lưu cùng tài khoản.','Your name and avatar are saved with your account.'):t('Lựa chọn này dùng trên máy hiện tại.','These choices are used on this device.')}</p><label htmlFor="profile-name">{t('Tên hiển thị','Display name')}<Input id="profile-name" value={name} maxLength={60} disabled={!ready} onChange={event=>{setName(event.target.value);setSaved(false);setState('idle');setError('');}}/></label><div className="profile-avatars" role="group" aria-label={t('Chọn avatar','Choose avatar')}>{(['google','fox','cat','dog'] as const).map(value=><Button key={value} variant="outline" aria-pressed={preferences.profileAvatar===value} disabled={!ready} onClick={()=>{setPreferences({profileAvatar:value as Preferences['profileAvatar']});setSaved(false);setState('idle');setError('');}}>{value==='google'?<UserRound aria-hidden="true"/>:<Image src={avatars[value]} width={44} height={44} alt=""/>}<span>{value==='google'?t('Tài khoản','Account'):value==='fox'?t('Cáo','Fox'):value==='cat'?t('Mèo','Cat'):t('Cún','Dog')}</span></Button>)}</div><SubmitButton type="button" className="self-start" state={state} error={error} disabled={!ready} onClick={async()=>{setState('pending');setError('');try{if(!await setPreferences({profileName:name.trim()}))throw new Error('storage');setSaved(true);setState('success');}catch(cause){setState('error');setError(submitError(cause,t));}}}>{t('Lưu hồ sơ','Save profile')}</SubmitButton>{saved&&<p role="status">{storageError?t('Hồ sơ dùng được lúc này nhưng chưa lưu trên máy. Thử lưu lại nhé.','Profile works for now but could not be saved on this device. Try saving again.'):t('Đã lưu hồ sơ.','Profile saved.')}</p>}</section>;
}
