import {expect,test} from '@playwright/test';
test.use({serviceWorkers:'block'});
function wav(){const bytes=Buffer.alloc(44+32000);bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(16000,24);bytes.writeUInt32LE(32000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(32000,40);for(let i=0;i<16000;i++)bytes.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*220/16000)*2000),44+i*2);return bytes;}
for(const mode of ['native','pending-prime','blocked-once'] as const)test(`Emma mobile playback: ${mode}`,async({page},info)=>{
 await page.route('**/api/auth/status*',r=>r.fulfill({json:{configured:false,user:null}}));
 await page.route('**/api/audio/word',r=>r.fulfill({json:{sample:null}}));
 let requests=0;await page.route('**/api/audio/tts',r=>{requests++;return r.fulfill({body:wav(),contentType:'audio/mpeg'});});
 await page.addInitScript(mode=>{
  const state=window as typeof window&{played:{rate:number;pitch:boolean}[];blocked:boolean;inTap:boolean};state.played=[];state.blocked=false;state.inTap=false;
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined});
  const Native=window.Audio;
  window.Audio=function(src?:string){const audio=new Native(src),play=audio.play.bind(audio);state.inTap=true;queueMicrotask(()=>{state.inTap=false;});
   audio.addEventListener('playing',()=>{if(audio.src.startsWith('blob:'))state.played.push({rate:audio.playbackRate,pitch:audio.preservesPitch});});
   audio.play=()=>{
    if(mode==='pending-prime'&&audio.src.startsWith('data:'))return new Promise<void>(()=>{});
    if(mode==='blocked-once'&&audio.src.startsWith('blob:')){if(!state.blocked){state.blocked=true;return Promise.reject(new DOMException('User gesture required','NotAllowedError'));}if(!state.inTap)return Promise.reject(new DOMException('Gesture lost','NotAllowedError'));}
    return play();
   };return audio;
  } as unknown as typeof Audio;
 },mode);
 await page.goto('/library/words/apple');const hero=page.locator('.word-detail-hero');
 await hero.getByRole('button',{name:'Nghe: apple',exact:true}).click();
 if(mode==='blocked-once'){
  await expect(hero.getByRole('button',{name:'Nghe: apple',exact:true})).toBeVisible();
  await expect(hero.getByText('Bấm Nghe để bắt đầu phát giọng Emma.',{exact:true})).toBeVisible();
  // A cached retry must call play within this new tap, not after another await.
  await hero.getByRole('button',{name:'Nghe: apple',exact:true}).click();
 }
 await expect.poll(()=>page.evaluate(()=>(window as typeof window&{played:unknown[]}).played.length),{timeout:5000}).toBe(1);
 await expect(hero.getByRole('button',{name:'Nghe: apple',exact:true})).toBeVisible();
 await hero.getByRole('button',{name:'Nghe chậm: apple',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as typeof window&{played:unknown[]}).played.length),{timeout:5000}).toBe(2);
 const plays=await page.evaluate(()=>(window as typeof window&{played:{rate:number;pitch:boolean}[]}).played);expect(plays[1]).toEqual({rate:.6,pitch:true});expect(requests).toBe(1);
 await page.screenshot({path:info.outputPath('emma-mobile.png'),fullPage:true});
 await page.locator('.main-nav a[href="/library"]').click();await expect(page.locator('.library-list li').first()).toBeVisible();
});
