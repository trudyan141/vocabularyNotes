"use client";
import Image from "next/image";
import Link from "next/link";
import {useEffect,useState} from "react";
import {UserRound} from "lucide-react";
import {useApp,useHydrated} from "@/components/app/provider";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import type {AccountProfile,AccountStatus} from "@/lib/account-profile";
import type {Preferences} from "@/lib/preferences";
const avatars={fox:"/illustrations/fox.svg",cat:"/illustrations/cat.svg",dog:"/illustrations/dog.svg"};
export function ProfileAvatar({user,small=false}:{user?:AccountProfile|null;small?:boolean}){
 const {preferences}=useApp();const [failed,setFailed]=useState<string|null>(null);
 const chosen=preferences.profileAvatar;const src=chosen==='google'?user?.avatarUrl:avatars[chosen];
 return <span className={small?"profile-avatar profile-avatar-small":"account-avatar"}>{src&&failed!==src?<Image unoptimized src={src} width={small?36:72} height={small?36:72} alt="" referrerPolicy="no-referrer" onError={()=>setFailed(src)}/>:user?.name?<span aria-hidden="true">{user.name.trim().slice(0,1).toLocaleUpperCase()}</span>:<UserRound aria-hidden="true"/>}</span>;
}
export function ProfileLink(){
 const {t,preferences}=useApp();const [user,setUser]=useState<AccountProfile|null>(null);
 useEffect(()=>{const controller=new AbortController();let generation=0;const check=()=>{const ticket=++generation;void fetch('/api/auth/status',{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])}).then(async response=>{if(response.ok){const result=await response.json() as AccountStatus;if(ticket===generation&&!controller.signal.aborted)setUser(result.user);}}).catch(()=>{});};check();window.addEventListener('wfk-auth-changed',check);return()=>{controller.abort();window.removeEventListener('wfk-auth-changed',check);};},[]);
 return <Button asChild variant="outline" className="profile-link"><Link href="/profile" prefetch={false} aria-label={t('Hồ sơ và đăng nhập','Profile and sign in')}><ProfileAvatar key={`${user?.id}:${preferences.profileAvatar}`} user={user} small/><span>{user?(preferences.profileName||user.name||t('Hồ sơ','Profile')):t('Đăng nhập','Sign in')}</span></Link></Button>;
}
export function ProfileSettings(){
 const {t,preferences,setPreferences,storageError}=useApp();const hydrated=useHydrated();const [editedName,setName]=useState<string|null>(null),[saved,setSaved]=useState(false);const name=editedName??preferences.profileName;
 return <section className="page-flow profile-settings"><h2>{t('Tên và avatar của bạn','Your name and avatar')}</h2><p>{t('Lựa chọn này dùng trên máy hiện tại.','These choices are used on this device.')}</p><label htmlFor="profile-name">{t('Tên hiển thị','Display name')}<Input id="profile-name" value={name} maxLength={60} disabled={!hydrated} onChange={event=>{setName(event.target.value);setSaved(false);}}/></label><div className="profile-avatars" role="group" aria-label={t('Chọn avatar','Choose avatar')}>{(['google','fox','cat','dog'] as const).map(value=><Button key={value} variant="outline" aria-pressed={preferences.profileAvatar===value} disabled={!hydrated} onClick={()=>{setPreferences({profileAvatar:value as Preferences['profileAvatar']});setSaved(false);}}>{value==='google'?<UserRound aria-hidden="true"/>:<Image src={avatars[value]} width={44} height={44} alt=""/>}<span>{value==='google'?t('Tài khoản','Account'):value==='fox'?t('Cáo','Fox'):value==='cat'?t('Mèo','Cat'):t('Cún','Dog')}</span></Button>)}</div><Button className="self-start" disabled={!hydrated} onClick={()=>{setPreferences({profileName:name.trim()});setSaved(true);}}>{t('Lưu hồ sơ','Save profile')}</Button>{saved&&<p role="status">{storageError?t('Hồ sơ dùng được lúc này nhưng chưa lưu trên máy. Thử lưu lại nhé.','Profile works for now but could not be saved on this device. Try saving again.'):t('Đã lưu hồ sơ.','Profile saved.')}</p>}</section>;
}
