'use client';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {BookOpen,House,Layers,Settings} from 'lucide-react';
export function MainNavigation({labels=['Hôm nay','Từ của con','Chơi & học','Cài đặt'],label='Điều hướng chính'}:{labels?:string[];label?:string}){
 const pathname=usePathname();
 return <nav className="main-nav" aria-label={label}>{([{href:'/today',icon:House},{href:'/library',icon:BookOpen},{href:'/practice',icon:Layers},{href:'/settings',icon:Settings}]).map((item,index)=><Link key={item.href} href={item.href} prefetch={false} aria-current={pathname.startsWith(item.href)?'page':undefined}><item.icon aria-hidden="true"/><span>{labels[index]}</span></Link>)}</nav>;
}
