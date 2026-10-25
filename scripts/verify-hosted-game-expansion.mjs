// Production smoke in disposable headless contexts; never touches founder profiles.
import {chromium,expect} from '@playwright/test';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const origin='https://words-for-kids.vercel.app',output=await mkdtemp(join(tmpdir(),'wfk-hosted-games-'));
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const viewport of [{width:1280,height:900},{width:360,height:800}]){
  const context=await browser.newContext({baseURL:origin,viewport,serviceWorkers:'allow'});
  await context.addInitScript(()=>{localStorage.setItem('wfk-parent-ai-disabled-v1','1');Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{throw new DOMException('fixture denied','NotAllowedError');}}});});
  // No provider calls or listening-quality claim in this UI smoke.
  await context.route('**/api/audio/tts',route=>route.fulfill({status:503,json:{error:'smoke'}}));
  await context.route('**/api/audio/word*',route=>route.fulfill({json:{sample:null}}));
  const page=await context.newPage();
  const response=await page.goto('/practice?word=game-smoke-no-library-target');if(!response?.ok())throw Error('Hosted practice HTTP failure');
  await expect(page.getByRole('heading',{name:'Chơi & học',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Xưởng xếp chữ',exact:true})).toHaveCount(0);
  const asset=await context.request.get('/illustrations/game-menu-atlas.webp');if(!asset.ok()||!asset.headers()['content-type']?.includes('image/'))throw Error('Game art missing');
  const faces=await context.request.get('/illustrations/memory-card-faces.webp');if(!faces.ok()||!faces.headers()['content-type']?.includes('image/'))throw Error('Memory card artwork missing');
  await page.screenshot({path:join(output,`hub-${viewport.width}.png`),fullPage:true});
  for(const [label,answer,token] of [['Câu thiếu mảnh','am',null],['Bác sĩ câu','am','is'],['Trả lời Cáo','Yes, it is.',null]]){
   await page.getByRole('button',{name:label,exact:true}).click();await expect(page.locator('.grammar-starter')).toBeVisible();
   if(label==='Trả lời Cáo'){await page.getByRole('button',{name:'Trả lời bằng mic',exact:true}).click();await expect(page.locator('.dialogue-microphone')).toContainText('Chưa mở được mic');results.push({viewport:viewport.width,game:'mic denied/manual fallback',status:'PASS'});}
   if(token)await page.locator('.sentence-tiles').getByRole('button',{name:token,exact:true}).click();
   await page.locator('.activity-option').getByRole('button',{name:answer,exact:true}).click();await page.getByRole('button',{name:'Kiểm tra',exact:true}).click();
   await expect(page.locator('.grammar-feedback').getByRole('status').filter({hasText:'Đúng rồi!'})).toHaveText('Đúng rồi!');
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
   await page.getByRole('button',{name:'Câu tiếp theo',exact:true}).click();await expect(page.locator('.grammar-starter')).toContainText(label==='Câu thiếu mảnh'?'2 / 12':'2 / 8');
   await page.screenshot({path:join(output,`grammar-${viewport.width}-${results.length}.png`),fullPage:true});
   await page.getByRole('button',{name:'Về chọn trò chơi',exact:true}).click();await expect(page.getByRole('heading',{name:'Chơi & học',exact:true})).toBeVisible();
   results.push({viewport:viewport.width,game:label,status:'PASS'});
  }
  const worker=await page.evaluate(async()=>{if(!('serviceWorker' in navigator))return false;const registration=await navigator.serviceWorker.ready;return !!registration.active;});
  results.push({viewport:viewport.width,activeServiceWorker:worker,status:worker?'PASS':'FAIL'});
  await context.close();
 }
 await writeFile(join(output,'result.json'),JSON.stringify({origin,results,limits:'Guest isolated profiles; audio fixture-blocked; no real device/account sync claim'},null,2));
 console.log(JSON.stringify({status:'PASS',cases:results.length,output,origin}));
}finally{await browser.close();}
