"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {usePublicLocale} from '@/lib/public-locale';
export function Welcome() {
  const t=usePublicLocale();
  const [wave,setWave]=useState(0);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let seen=true;
    try{seen=sessionStorage.getItem('wfk-welcome-seen')==='1';sessionStorage.setItem('wfk-welcome-seen','1');}catch{/* Storage may be unavailable; keep the static greeting. */}
    if(seen)return;
    const frame=requestAnimationFrame(()=>setWave(1));
    return()=>cancelAnimationFrame(frame);
  },[]);
  return <section className="welcome welcome-world">
    <div className="welcome-copy">
      <h1>{t("Cùng Cáo học tiếng Anh!", "Learn English with Fox!")}</h1>
      <p>{t("Thêm bài của bạn, rồi cùng học và chơi.", "Add your lessons, then learn and play together.")}</p>
      <Button asChild size="lg"><Link prefetch={false} href="/today">{t("Bắt đầu", "Get started")}<ArrowRight data-icon="inline-end"/></Link></Button>
    </div>
    <div className="welcome-playground">
      <span className="welcome-greeting">{t("Chào con! Cùng học nhé!", "Hello! Let’s learn together!")}</span>
      <button type="button" className="welcome-fox" aria-label={t("Chào cáo", "Say hello to the fox")} onClick={()=>setWave(1)}><Image className={wave?'fox-greeting-motion':''} onAnimationEnd={()=>setWave(0)} src="/illustrations/fox.svg" width={280} height={293} priority alt=""/></button>
      <div className="welcome-word welcome-apple"><Image src="/illustrations/apple.svg" width={76} height={76} alt=""/><strong lang="en">apple</strong><span>{t("quả táo","apple")}</span></div>
      <div className="welcome-word welcome-book"><Image src="/illustrations/book.svg" width={76} height={76} alt=""/><strong lang="en">book</strong><span>{t("quyển sách","book")}</span></div>
      <div className="welcome-word welcome-cat"><Image src="/illustrations/cat.svg" width={76} height={76} alt=""/><strong lang="en">cat</strong><span>{t("con mèo","cat")}</span></div>
    </div>
  </section>;
}
