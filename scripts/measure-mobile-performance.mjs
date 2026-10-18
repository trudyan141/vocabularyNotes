import {chromium, devices} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {fixtureEnvironment,requireFreePort,assertSource} from './lib/ui-runner.mjs';
const args=Object.fromEntries(process.argv.slice(2).reduce((rows,value,index,all)=>index%2===0?[...rows,[value.replace(/^--/,''),all[index+1]]]:rows,[]));
const output=resolve(args.output??'.local/mobile-performance/baseline');await mkdir(output,{recursive:true});
const port=Number(args.port??4363),snapshot=args.snapshot,base=args.base??`http://127.0.0.1:${port}`,local=!!snapshot;
const runs=Number(args.runs??5),rounds=Number(args.rounds??30);
const report={startedAt:new Date().toISOString(),base,snapshot,node:process.version,harnessHash:createHash('sha256').update(await readFile(import.meta.filename)).digest('hex'),profile:{browser:'Chromium headless, iPhone12 viewport emulation; not iOS',viewport:{width:390,height:844},cpu:4,network:{downloadBps:200000,uploadBps:93750,rttMs:150},server:'warm after health probe, function cold unknown',field:false},loads:[],journeys:[],search:[],errors:[],requests:[]};
let server,browser;
const save=()=>writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
const percentile=(values,p)=>{const a=values.toSorted((a,b)=>a-b);return a[Math.ceil(a.length*p)-1]??null;};
const summary=values=>({n:values.length,median:percentile(values,.5),p95:values.length>=30?percentile(values,.95):null,min:Math.min(...values),max:Math.max(...values)});
async function instrument(page,cache=false){
 await page.addInitScript(()=>{
  window.__perf={lcp:0,cls:0,longtasks:[],idb:[],tap:0,feedback:0};
  for(const [type,callback] of [['largest-contentful-paint',entry=>window.__perf.lcp=entry.startTime],['layout-shift',entry=>{if(!entry.hadRecentInput)window.__perf.cls+=entry.value;}],['longtask',entry=>window.__perf.longtasks.push({start:entry.startTime,duration:entry.duration})]])try{new PerformanceObserver(list=>list.getEntries().forEach(callback)).observe({type,buffered:true});}catch{}
  const transaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){const start=performance.now(),tx=transaction.apply(this,args);tx.addEventListener('complete',()=>window.__perf.idb.push({start,duration:performance.now()-start,stores:[...tx.objectStoreNames],mode:tx.mode}));return tx;};
  document.addEventListener('click',()=>{window.__perf.tap=performance.now();window.__perf.feedback=0;const observer=new MutationObserver(()=>{requestAnimationFrame(()=>requestAnimationFrame(()=>{window.__perf.feedback ||= performance.now()-window.__perf.tap;}));observer.disconnect();});observer.observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true});},{capture:true});
 });
 page.on('pageerror',e=>report.errors.push(e.message));
 const cdp=await page.context().newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:!cache});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 if(local){await page.route('**/api/auth/status*',route=>route.fulfill({json:{configured:false,user:null}}));await page.route('**/api/audio/word',route=>route.fulfill({json:{sample:null}}));await page.route('**/api/pronunciation',route=>route.fulfill({json:{results:[]}}));}
 return cdp;
}
async function ready(page,path){
 if(path.startsWith('/library/words/'))await page.locator('.word-detail-hero').waitFor();
 else if(path==='/library')await page.locator(local?'.library-list li':'#library-search').first().waitFor();
 else if(path==='/today')await page.locator('.today-hero h1').waitFor();
 else if(path==='/practice')await page.locator(local?'.practice-modes':'main h1').first().waitFor();
 else await page.locator('main h1').first().waitFor();
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}
async function seed(page,total){return page.evaluate(async total=>{
 const db=await new Promise((res,rej)=>{const r=indexedDB.open('words-for-kids.local');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
 const getAll=name=>new Promise((res,rej)=>{const r=db.transaction(name).objectStore(name).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
 const [entries,senses,index]=await Promise.all(['entries','senses','searchIndex'].map(getAll));const template=senses.find(x=>x.id==='apple'),entry=entries.find(x=>x.id===template.entryId),search=index.find(x=>x.id===template.id);
 const count=Math.max(0,total-entries.length);await new Promise((res,rej)=>{const tx=db.transaction(['entries','senses','searchIndex'],'readwrite');for(let i=0;i<count;i++){const id=`perf-${i}`,entryId=`perf-entry-${i}`,word=`fixtureword${String(i).padStart(5,'0')}`;tx.objectStore('entries').put({...entry,id:entryId,displayText:word,canonicalKey:word,activeKey:word});tx.objectStore('senses').put({...template,id,entryId,identity:JSON.stringify(['noun',id]),senseLabel:id,definitionEn:`Synthetic benchmark ${i}`,meaningVi:`Dữ liệu thử ${i}`,art:null,pronunciations:[]});tx.objectStore('searchIndex').put({...search,id,terms:`${word} du lieu thu ${i}`,lessonIds:[],art:null,ordinal:`z${id}`});}tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});db.close();return {entries:entries.length+count,senses:senses.length+count,synthetic:count,scope:template.scopeId};
 },total);}
try{
 if(local){await requireFreePort(port);report.manifest=JSON.parse(await readFile(join(snapshot,'.wfk-snapshot.json'),'utf8'));await assertSource(snapshot,report.manifest.snapshotFingerprint);server=spawn(process.execPath,[join(snapshot,'node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(port)],{cwd:snapshot,env:fixtureEnvironment(process.env,{scope:'ui',mode:'production',live:false,port,files:[]}),stdio:'ignore'});for(let i=0;i<150;i++){if(server.exitCode!==null)throw Error('server exited');try{if((await fetch(base+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}}
 browser=await chromium.launch();report.browser=browser.version();
 for(const route of ['/today','/library','/practice']){
  for(let i=0;i<runs;i++){const context=await browser.newContext({...devices['iPhone 12'],defaultBrowserType:'chromium',serviceWorkers:'block'});const page=await context.newPage();await instrument(page);const start=Date.now();const response=await page.goto(base+route);await ready(page,route);await page.waitForTimeout(350);const timing=await page.evaluate(()=>({...window.__perf,readyAt:performance.now(),resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,encoded:r.encodedBodySize,transfer:r.transferSize,duration:r.duration})),navigation:performance.getEntriesByType('navigation')[0]?.toJSON()}));report.loads.push({route,run:i,status:response.status(),elapsedMs:Date.now()-start,...timing});await context.close();await save();}
  console.log('cold',route,summary(report.loads.filter(x=>x.route===route).map(x=>x.lcp)));
 }
 for(const total of local?[20,5000]:[0]){
  const context=await browser.newContext({...devices['iPhone 12'],defaultBrowserType:'chromium',serviceWorkers:'block'});const page=await context.newPage();const cdp=await instrument(page,true);await page.goto(base+'/library');await ready(page,'/library');if(local&&total===5000){report.fixture=await seed(page,5000);await page.reload();await ready(page,'/library');}
  const routes=['/today','/library','/practice','/settings'];
  if(args.trace==='true')await cdp.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing,loading',transferMode:'ReturnAsStream'});
  for(let i=0;i<rounds;i++)for(const route of routes){const requestStart=report.requests.length;let rsc=0;const listener=r=>{if(r.url().includes('_rsc='))rsc++;};page.on('request',listener);const start=Date.now();await page.locator(`.main-nav a[href="${route}"]`).click();await page.waitForURL(base+route);await ready(page,route);const timing=await page.evaluate(()=>({feedback:window.__perf.feedback,idb:window.__perf.idb.slice(-8)}));page.off('request',listener);report.journeys.push({total,route,round:i,readyMs:Date.now()-start,rsc,...timing});await save();}
  if(args.trace==='true'){const done=new Promise(res=>cdp.once('Tracing.tracingComplete',res));await cdp.send('Tracing.end');const {stream}=await done;let trace='';while(true){const chunk=await cdp.send('IO.read',{handle:stream});trace+=chunk.data;if(chunk.eof)break;}await cdp.send('IO.close',{handle:stream});await writeFile(join(output,`trace-${total}.json`),trace);}
  console.log('journeys',total,Object.fromEntries(routes.map(route=>[route,summary(report.journeys.filter(x=>x.total===total&&x.route===route).map(x=>x.readyMs))])));
  if(local&&total===5000){await page.locator('.main-nav a[href="/library"]').click();await ready(page,'/library');for(let i=0;i<50;i++){const query=i%2?`fixtureword${String(i).padStart(5,'0')}`:'apple';const start=Date.now();await page.getByRole('searchbox').fill(query);await page.waitForFunction(q=>document.querySelector('.library-list strong')?.textContent===q,query);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));report.search.push({queryId:i,ms:Date.now()-start});}console.log('search',summary(report.search.map(x=>x.ms)));}
  await page.screenshot({path:join(output,`mobile-${total}.png`),fullPage:true});await context.close();
 }
 if(local)await assertSource(snapshot,report.manifest.snapshotFingerprint);report.finishedAt=new Date().toISOString();report.status='measured';await save();console.log('report',join(output,'report.json'));
}catch(e){report.status='failed';report.error=e.message;await save();throw e;}
finally{await browser?.close();if(server){server.kill('SIGTERM');await new Promise(res=>{if(server.exitCode!==null)res();else server.once('exit',res);});}}
