// Synthetic QA07 lab, never a physical-device camera or OCR accuracy claim.
import { chromium, devices } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const origin='http://127.0.0.1:4327', output='docs/evaluations/t04';
mkdirSync(output,{recursive:true});
const files=readdirSync('src',{recursive:true}).filter(f=>/\.(tsx?|json|css)$/.test(f)).sort();
const sourceHash=createHash('sha256').update(files.map(f=>`${f}\n${readFileSync(`src/${f}`)}`).join('\n')).digest('hex');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','4327'],{env:{...process.env,APP_DEMO_MODE:'true',AI_PROVIDER:'none',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
let logs=''; server.stdout.on('data',data=>logs+=data);server.stderr.on('data',data=>logs+=data);
let browser; const runs=[],screens=[],errors=[];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function fixture(page,width,height) {
  const data=await page.evaluate(({width,height})=>{const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,width,height);ctx.fillStyle='#38213d';ctx.font=`${Math.round(width/24)}px sans-serif`;ctx.fillText('Synthetic worksheet',width/12,height/6);ctx.fillText('apple   book   pencil',width/12,height/3);ctx.fillText('I read a book.',width/12,height/2);return c.toDataURL('image/jpeg',.9).split(',')[1];},{width,height});
  return Buffer.from(data,'base64');
}
try {
  for(let i=0;i<100;i++){if(server.exitCode!==null)throw new Error(logs);try{if((await fetch(origin+'/api/health')).ok)break;}catch{}if(i===99)throw new Error('Server timeout');await pause(100);}
  browser=await chromium.launch();
  for(const [label,options] of [['desktop',{viewport:{width:1280,height:1000}}],['mobile',{...devices['Pixel 7'],viewport:{width:360,height:800}}]]) {
    const context=await browser.newContext(options);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/capture');await page.getByLabel('Chọn ảnh từ máy',{exact:true}).waitFor();await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});await page.screenshot({path:`${output}/capture-${label}.png`,fullPage:true});screens.push(`capture-${label}.png`);
    await page.getByLabel('Chọn ảnh từ máy',{exact:true}).setInputFiles({name:'synthetic.jpg',mimeType:'image/jpeg',buffer:await fixture(page,600,400)});
    await page.getByLabel('Tên bài (tùy chọn)').fill('Bài mẫu kiểm tra ảnh');await page.getByRole('button',{name:'Lưu nháp trên máy'}).click();await page.getByText('Đã lưu nháp trên máy',{exact:true}).waitFor();
    await page.locator('.capture-image').evaluate(img=>img.decode());await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});await page.screenshot({path:`${output}/editor-${label}.png`,fullPage:true});screens.push(`editor-${label}.png`);console.log(JSON.stringify({label,skip:await page.locator('.skip-link').evaluate(el=>({transform:getComputedStyle(el).transform,position:getComputedStyle(el).position,top:el.getBoundingClientRect().top,focus:el.matches(':focus')}))}));
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Horizontal overflow');
    await context.close();
  }
  const context=await browser.newContext({...devices['Pixel 7'],viewport:{width:360,height:800}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const client=await context.newCDPSession(page);await client.send('Emulation.setCPUThrottlingRate',{rate:4});
  for(const [width,height] of [[3200,2400],[5000,4000]]) for(let i=0;i<3;i++) {
    await page.goto(origin+'/capture');await page.getByLabel('Chọn ảnh từ máy',{exact:true}).waitFor();const buffer=await fixture(page,width,height);
    await page.evaluate(()=>{window.captureLongTasks=[];window.captureObserver=new PerformanceObserver(list=>window.captureLongTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration}))));window.captureObserver.observe({type:'longtask',buffered:false});window.captureStart=performance.now();});
    await page.getByLabel('Chọn ảnh từ máy',{exact:true}).setInputFiles({name:'synthetic-large.jpg',mimeType:'image/jpeg',buffer});await page.waitForURL(/\/edit$/);await page.locator('.capture-image').evaluate(async img=>{await img.decode();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
    const timing=await page.evaluate(()=>{window.captureObserver.disconnect();return {elapsedMs:performance.now()-window.captureStart,longTasks:window.captureLongTasks};});
    runs.push({width,height,inputBytes:buffer.length,output:await page.locator('.capture-image').evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight})),...timing});
  }
  await context.close();
  const report={measuredAt:new Date().toISOString(),buildId:readFileSync('.next/BUILD_ID','utf8').trim(),sourceHash,browser:browser.version(),profile:'Chromium arm64 macOS; Pixel7 CSS360x800 proxy; CPU4x; local server; synthetic text JPEG; warm client modules after first run; no network throttle',screens,runs,errors,limitation:'No real camera/phone/Safari/field INP/OCR accuracy. Elapsed covers file input through persisted draft and painted preview; longtask observer covers browser main thread only.'};
  writeFileSync(`${output}/capture-lab.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({runs:runs.map(r=>({pixels:r.width*r.height,elapsedMs:r.elapsedMs,maxLongTask:Math.max(0,...r.longTasks.map(t=>t.duration))})),errors}));
  if(errors.length)throw new Error('Browser errors');
} finally {await browser?.close();server.kill('SIGTERM');}
