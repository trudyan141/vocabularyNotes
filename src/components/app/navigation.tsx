'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import Link,{useLinkStatus} from 'next/link';
import {BookOpen,House,Layers,Settings} from 'lucide-react';
const destinations=[{href:'/today',icon:House},{href:'/library',icon:BookOpen},{href:'/practice',icon:Layers},{href:'/settings',icon:Settings}];
function Label({text}:{text:string}){const {pending}=useLinkStatus();return <span data-pending={pending} aria-busy={pending}>{text}</span>;}
export function MainNavigation({labels=['Hôm nay','Từ của con','Chơi & học','Cài đặt'],label='Điều hướng chính',ready=true}:{labels?:string[];label?:string;ready?:boolean}){
 const pathname=usePathname();const [prefetch,setPrefetch]=useState(false);
 useEffect(()=>{
  if(!ready)return;
  // Protect initial hydration/LCP, then warm only four fixed navigation shells.
  // Next owns invalidation; no word lists or account API responses are prefetched.
  const timer=setTimeout(()=>setPrefetch(true),1500);
  return()=>clearTimeout(timer);
 },[ready]);
 const warm=()=>{if(navigator.onLine)setPrefetch(true);};
 return <nav className="main-nav" aria-label={label}>{destinations.map((item,index)=><Link key={item.href} href={item.href} prefetch={prefetch&&!pathname.startsWith(item.href)} onPointerEnter={warm} onFocus={warm} onTouchStart={warm} aria-current={pathname.startsWith(item.href)?'page':undefined}><item.icon aria-hidden="true"/><Label text={labels[index]}/></Link>)}</nav>;
}
