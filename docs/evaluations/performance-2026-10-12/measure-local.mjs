// Isolated localhost production-build investigation. All API/external requests mocked/blocked.
import {chromium,devices} from '../../../node_modules/@playwright/test/index.mjs';
import {spawn,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import os from 'node:os';
const out=new URL('./',import.meta.url),base='http://127.0.0.1:4330';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','4330'],{env:{...process.env,APP_DEMO_MODE:'true',AI_PROVIDER:'none',NEXT_TELEMETRY_DISABLED:'1'},stdio:'pipe'});
let browser,logs='';server.stdout.on('data',b=>logs=(logs+b).slice(-1500));server.stderr.on('data',b=>logs=(logs+b).slice(-1500));
const report={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),build:readFileSync('.next/BUILD_ID','utf8').trim(),timestamp:new Date().toISOString(),host:{os:os.platform(),cpu:os.cpus()[0].model,node:process.version},profile:{viewport:'360x800 Pixel7 emulation, Chromium desktop host',cpu:4,network:{latencyMs:150,downloadBytesPerSecond:200000,uploadBytesPerSecond:93750},cache:'fresh isolated context per cold run, HTTP cache disabled, SW enabled; local server warmed',auth:'mock configured signed-out, response delay100ms; API never reaches real cloud',fixture:'20 demo words; not founder lessons; no real mic or AI'},runs:[],experiments:[]};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const user={id:'60000000-0000-4000-8000-000000000006',email:'performance@example.test',name:'Performance fixture',avatarUrl:null};
const library={id:'70000000-0000-4000-8000-000000000007',ownerId:user.id,name:'Performance fixture'};
async function setup(options={}){
 const context=await browser.newContext({...devices['Pixel 7'],viewport:{width:360,height:800},serviceWorkers:options.sw==='block'?'block':'allow'}),requests=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!==base)return route.abort();if(u.pathname==='/api/auth/status'){await pause(options.authDelay??100);return route.fulfill({json:{configured:true,user:options.signedIn?user:null}});}if(u.pathname==='/api/cloud/library'){await pause(options.cloudDelay??100);return route.fulfill({json:{library}});}if(u.pathname==='/api/cloud/preferences')return route.fulfill({json:{ownerId:user.id,libraryId:library.id,preferences:{}}});if(u.pathname==='/api/cloud/realtime')return route.fulfill({status:503,json:{error:'fixture'}});if(u.pathname.startsWith('/api/'))return route.fulfill({json:{libraryId:library.id,changes:[],cursor:0,more:false}});return route.continue();});
 context.on('request',request=>requests.push({path:new URL(request.url()).pathname,at:Date.now(),method:request.method(),worker:!!request.serviceWorker()}));
 const page=await context.newPage(),cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750,connectionType:'cellular4g'});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.addInitScript(()=>{window.__perf={lcp:0,cls:0,lcpTag:null,longTasks:[]};let first=0,last=0,value=0;new PerformanceObserver(list=>{for(const e of list.getEntries()){window.__perf.lcp=e.startTime;window.__perf.lcpTag=e.element?.tagName;}}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries()){if(e.hadRecentInput)continue;if(e.startTime-last>1000||e.startTime-first>5000){first=e.startTime;value=0;}last=e.startTime;value+=e.value;window.__perf.cls=Math.max(window.__perf.cls,value);}}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())window.__perf.longTasks.push({at:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});});
 return {context,page,cdp,requests};
}
async function measure(route,options={},trace=false){const env=await setup(options),{page,cdp,context,requests}=env;const at=Date.now();try{
 if(trace)await cdp.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing,loading',transferMode:'ReturnAsStream'});
 await page.goto(base+route,{waitUntil:'domcontentloaded'});if(route==='/')await page.waitForURL('**/welcome');await page.waitForLoadState('load');
 const final=new URL(page.url()).pathname;
 if(final==='/today')await page.locator('.recent-lesson').first().waitFor();else if(final==='/practice')await page.locator('.practice-modes button:not([disabled])').first().waitFor();else if(final==='/welcome')await page.getByRole('heading',{name:'Cùng Cáo học tiếng Anh!'}).waitFor();
 const readyMs=Date.now()-at;await page.evaluate(()=>document.fonts.ready);await pause(900);
 const result=await page.evaluate(()=>({vitals:window.__perf,navigation:performance.getEntriesByType('navigation').map(e=>({ttfb:e.responseStart,domContentLoaded:e.domContentLoadedEventEnd,load:e.loadEventEnd,transferSize:e.transferSize,encodedBodySize:e.encodedBodySize})),resources:performance.getEntriesByType('resource').map(e=>({path:new URL(e.name).pathname,initiator:e.initiatorType,start:e.startTime,duration:e.duration,transfer:e.transferSize,encoded:e.encodedBodySize,decoded:e.decodedBodySize})),sw:!!navigator.serviceWorker.controller}));
 const row={route,final,readyMs,...result,requests:requests.map(r=>({...r,at:r.at-at}))};
 if(trace){const done=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const {stream}=await done;let data='';for(;;){const p=await cdp.send('IO.read',{handle:stream});data+=p.data;if(p.eof)break;}await cdp.send('IO.close',{handle:stream});writeFileSync(new URL('today-trace.json.gz',out),gzipSync(data));const events=JSON.parse(data).traceEvents;row.traceTop=Object.entries(events.filter(e=>e.ph==='X'&&e.dur).reduce((m,e)=>(m[e.name]=(m[e.name]??0)+e.dur,m),{})).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,us])=>({name,totalMs:us/1000}));}
 return row;
 }finally{await context.close();}}
try{for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok)break;}catch{}if(server.exitCode!==null)throw new Error(logs);await pause(100);}
 browser=await chromium.launch();report.browser=browser.version();
 for(const route of ['/welcome','/today','/practice'])for(let i=0;i<5;i++){const row=await measure(route,{},false);report.runs.push({...row,run:i+1});console.log(`${route} ${i+1}/5 LCP=${Math.round(row.vitals.lcp)} ready=${row.readyMs} CLS=${row.vitals.cls.toFixed(3)}`);}
 for(const [label,route,options] of [['root redirect','/',{}],['SW blocked','/welcome',{sw:'block'}],['auth slow signed-out','/practice',{authDelay:3000}],['auth then cloud slow','/practice',{authDelay:3000,cloudDelay:3000,signedIn:true}]]){const row=await measure(route,options);report.experiments.push({label,options,...row});console.log(`${label}: ready=${row.readyMs}ms authRequests=${row.requests.filter(r=>r.path==='/api/auth/status').length}`);}
 writeFileSync(new URL('local-after.json',out),JSON.stringify(report,null,2)+'\n');
}finally{await browser?.close();server.kill('SIGTERM');}
