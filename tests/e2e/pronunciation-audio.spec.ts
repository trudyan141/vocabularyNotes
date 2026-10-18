import {test,expect,type Page} from '@playwright/test';
test.use({serviceWorkers:'block'});
const sample={word:'apple',accent:'US',ipa:'/ˈæpəl/',audioUrl:'https://upload.wikimedia.org/wikipedia/commons/test/en-us-apple.mp3',sourceUrl:'https://commons.wikimedia.org/wiki/File:En-us-apple.ogg',dictionaryUrl:'https://en.wiktionary.org/wiki/apple',creator:'Fixture speaker',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'};
function wav(){const length=16000,bytes=Buffer.alloc(44+length*2);bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(16000,24);bytes.writeUInt32LE(32000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(length*2,40);for(let i=0;i<length;i++)bytes.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*220/16000)*2000),44+i*2);return bytes;}
async function fixture(page:Page){
 await page.route('**/api/auth/status*',route=>route.fulfill({json:{configured:false,user:null}}));
 await page.route('**/api/audio/tts',route=>route.fulfill({body:wav(),contentType:'audio/mpeg'}));
 await page.addInitScript(()=>{
  const state=window as typeof window&{samplePlays:{rate:number;pitch:boolean;ended:number|null;start:number}[];spoken:{text:string;rate:number}[];sampleElements:HTMLAudioElement[]};state.samplePlays=[];state.spoken=[];state.sampleElements=[];
  const NativeAudio=window.Audio;
  window.Audio=function(src?:string){const audio=new NativeAudio(src);state.sampleElements.push(audio);audio.addEventListener('playing',()=>{if(!audio.src.startsWith('blob:'))return;const entry={rate:audio.playbackRate,pitch:audio.preservesPitch,ended:null as number|null,start:performance.now()};state.samplePlays.push(entry);audio.addEventListener('ended',()=>{entry.ended=performance.now()-entry.start;},{once:true});});return audio;} as unknown as typeof Audio;
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{constructor(public text:string){}}});
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{lang:'en-US',localService:true}],cancel:()=>{},paused:false,resume:()=>{},addEventListener:()=>{},removeEventListener:()=>{},speak:(u:{text:string;rate:number;onend?:()=>void;onstart?:()=>void})=>{state.spoken.push({text:u.text,rate:u.rate});queueMicrotask(()=>{u.onstart?.();u.onend?.();});}}});
 });
}
const state=(page:Page)=>page.evaluate(()=>{const state=window as typeof window&{samplePlays:{rate:number;pitch:boolean;ended:number|null}[];spoken:{text:string;rate:number}[];sampleElements:HTMLAudioElement[]};return {plays:state.samplePlays,spoken:state.spoken,paused:state.sampleElements.every(audio=>audio.paused)};});
test('word and Fox show reading aids and Emma source; audio lasts longer at 60% with pitch preserved',async({page},info)=>{
 await fixture(page);await page.route('**/api/audio/word',route=>route.fulfill({json:{word:'apple',sample}}));await page.route(sample.audioUrl,route=>route.fulfill({body:wav(),contentType:'audio/wav'}));
 let ttsRequests=0;await page.route('**/api/audio/tts',route=>{ttsRequests++;return route.fulfill({body:wav(),contentType:'audio/mpeg'});});
 await page.goto('/library/words/apple');const hero=page.locator('.word-detail-hero');await expect(hero.getByLabel('Phiên âm của từ')).toContainText('/');await expect(hero.getByText(/Cách đọc gần đúng/)).toBeVisible();
 await hero.getByRole('button',{name:'Nghe: apple',exact:true}).click();await expect.poll(async()=>(await state(page)).plays[0]?.ended).toBeGreaterThan(0);const credit=hero.getByText(/Microsoft Edge · Emma US Natural/);await expect(credit).toBeHidden();await hero.locator('.audio-source summary').click();await expect(credit).toBeVisible();await hero.locator('.audio-source summary').click();await expect(credit).toBeHidden();
 await hero.getByRole('button',{name:'Nghe chậm: apple',exact:true}).click();await expect.poll(async()=>(await state(page)).plays[1]?.ended).toBeGreaterThan(0);
 const result=await state(page);await test.info().attach('playback-measurements',{body:JSON.stringify(result,null,2),contentType:'application/json'});expect(result.plays[0].rate).toBe(1);expect(result.plays[1].rate).toBe(.6);expect(result.plays[1].pitch).toBe(true);expect(result.plays[1].ended!).toBeGreaterThan(result.plays[0].ended!*1.4);expect(result.spoken).toHaveLength(0);expect(ttsRequests).toBe(1);
 await page.screenshot({path:info.outputPath('word-reading-source.png'),fullPage:true});
 await page.goto('/practice/speaking?word=apple');const stage=page.locator('.speaking-stage');await expect(stage.getByLabel('Phiên âm của từ')).toBeVisible();await expect(stage.getByText(/Cách đọc gần đúng/)).toBeVisible();await expect(stage.getByRole('button',{name:'Nghe chậm: apple',exact:true})).toBeVisible();
 await expect.poll(async()=>(await state(page)).plays.length).toBeGreaterThan(0);await page.getByRole('button',{name:'Dừng đọc: apple',exact:true}).click();expect((await state(page)).paused).toBe(true);await page.screenshot({path:info.outputPath('fox-reading-source.png'),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Emma starts without waiting for a stalled dictionary lookup and leaving the route stops it',async({page})=>{
 await fixture(page);let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/api/audio/word',async route=>{await gate;await route.fulfill({json:{word:'apple',sample:null}}).catch(()=>{});});
 try{
  await page.goto('/library/words/apple');await page.getByRole('button',{name:'Nghe: apple',exact:true}).click();
  await expect.poll(async()=>(await state(page)).plays.length).toBe(1);
  await page.locator('.main-nav a[href="/library"]').click();await expect(page.locator('.library-list li').first()).toBeVisible();
  expect((await state(page)).paused).toBe(true);
 }finally{release();}
});
test('Edge unavailable falls back at a distinct slow rate and pending stop blocks late playback',async({page},info)=>{
 await fixture(page);await page.route('**/api/audio/word',route=>route.fulfill({json:{word:'apple',sample}}));await page.route('**/api/audio/tts',route=>route.fulfill({status:503,json:{error:'unavailable'}}));
 await page.goto('/library/words/apple');await page.getByRole('button',{name:'Nghe chậm: apple',exact:true}).click();await expect.poll(async()=>(await state(page)).spoken.length).toBe(1);expect((await state(page)).spoken[0]).toEqual({text:'apple',rate:.6});await expect(page.getByText('Đang dùng giọng của máy.',{exact:true})).toBeVisible();await page.screenshot({path:info.outputPath('sample-error.png'),fullPage:true});
 await page.goto('/practice/speaking?word=apple');await expect.poll(async()=>(await state(page)).spoken.length).toBe(1);
 await page.reload();let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});await page.route('**/api/audio/tts',async route=>{await gate;await route.fulfill({body:wav(),contentType:'audio/mpeg'}).catch(()=>{});});
 await page.goto('/library/words/apple');await page.getByRole('button',{name:'Nghe: apple',exact:true}).click();await expect(page.getByRole('button',{name:'Dừng đọc: apple',exact:true})).toBeVisible();await page.getByRole('button',{name:'Dừng đọc: apple',exact:true}).click();release();await expect(page.getByRole('button',{name:'Nghe: apple',exact:true})).toBeVisible();expect((await state(page)).spoken).toHaveLength(0);expect((await state(page)).plays).toHaveLength(0);
});

for (const mode of ['missing','empty','error','silent'] as const) test(`Emma plays MP3 immediately when browser speech is ${mode}`,async({page},info)=>{
 await fixture(page);
 await page.addInitScript(mode=>{
  const synth=window.speechSynthesis;
  if(mode==='missing')Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined});
  else if(mode==='empty')synth.getVoices=()=>[];
  else synth.speak=u=>{if(mode==='error')queueMicrotask(()=>u.onerror?.({error:'synthesis-failed'} as SpeechSynthesisErrorEvent));};
 },mode);
 await page.route('**/api/audio/word',route=>route.fulfill({json:{word:'apple',sample:null}}));
 let requests=0;
 await page.route('**/api/audio/tts',route=>{requests++;expect(route.request().postDataJSON()).toEqual({text:'apple'});return route.fulfill({body:wav(),contentType:'audio/mpeg'});});
 await page.goto('/library/words/apple');await page.getByRole('button',{name:'Nghe chậm: apple',exact:true}).click();
 await expect.poll(async()=>(await state(page)).plays[0]?.ended,{timeout:15000}).toBeGreaterThan(0);
 expect(requests).toBe(1);expect((await state(page)).plays[0].rate).toBe(.6);
 const hero=page.locator('.word-detail-hero');await hero.locator('.audio-source summary').click();await expect(hero.getByText(/Microsoft Edge · Emma/)).toBeVisible();
 await page.screenshot({path:info.outputPath(`edge-${mode}.png`),fullPage:true});
});

test('Edge failure allows retry and stopped request cannot play late',async({page})=>{
 await fixture(page);await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined});});
 await page.route('**/api/audio/word',route=>route.fulfill({json:{word:'apple',sample:null}}));
 await page.route('**/api/audio/tts',route=>route.fulfill({status:503,json:{error:'unavailable'}}));
 await page.goto('/library/words/apple');const button=page.getByRole('button',{name:'Nghe: apple',exact:true});await button.click();await expect(page.getByText('Chưa phát được giọng đọc. Bấm Nghe để thử lại.',{exact:true})).toBeVisible();
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});let requested=false;
 await page.route('**/api/audio/tts',async route=>{requested=true;await gate;await route.fulfill({body:wav(),contentType:'audio/mpeg'}).catch(()=>{});});
 await button.click();await expect.poll(()=>requested).toBe(true);await page.getByRole('button',{name:'Dừng đọc: apple',exact:true}).click();release();await expect(button).toBeVisible();expect((await state(page)).plays).toHaveLength(0);
});
