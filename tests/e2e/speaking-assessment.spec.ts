import {test,expect,type Page} from '@playwright/test';

function microphoneFixture(){
 Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>{
  const context=new AudioContext();await context.resume();const oscillator=context.createOscillator(),gain=context.createGain(),destination=context.createMediaStreamDestination();
  oscillator.connect(gain);gain.connect(destination);gain.gain.setValueAtTime(.2,context.currentTime);gain.gain.setValueAtTime(0,context.currentTime+(location.search.includes('quietMic=1')?.05:1));oscillator.start();
  const track=destination.stream.getAudioTracks()[0],stop=track.stop.bind(track);track.stop=()=>{oscillator.stop();void context.close();stop();};return destination.stream;
 }}});
}
type Mode='match'|'insertion'|'missing'|'incorrect'|'uncertain'|'invalid';
function assessment(target:{variants:string[][]},mode:Mode){
 const heard=[...target.variants[0]];
 if(mode==='missing')heard.pop();
 if(mode==='incorrect')heard[0]='k';
 if(mode==='uncertain')heard.splice(0,heard.length);
 if(mode==='insertion')heard.push('ə');
 const result={schemaVersion:3,words:[{index:0,audibility:mode==='uncertain'?'unclear':'clear',heard}]};
 return mode==='invalid'?{...result,score:100}:result;
}
async function speak(page:Page){await page.getByRole('button',{name:'Nói',exact:true}).click();}
test.beforeEach(async({page})=>{
 await page.route('**/api/auth/status*',route=>route.fulfill({json:{configured:false,user:null}}));
 await page.route('**/api/audio/word',route=>route.fulfill({json:{word:route.request().postDataJSON().word,sample:null}}));
 await page.addInitScript(()=>{localStorage.setItem('wfk-parent-ai-v1',JSON.stringify({key:'AIza-speaking-fixture-key-only-123',model:'gemini-3.5-flash-lite'}));});
 await page.addInitScript(microphoneFixture);
});

test('v2 insertion stays visible with correct letters, exact replay, and an unclear retry earns zero',async({page},info)=>{
 let mode:Mode='insertion',sent='';
 await page.route('https://generativelanguage.googleapis.com/**',route=>{
  const body=route.request().postDataJSON();sent=body.contents[0].parts.find((part:{inlineData?:unknown})=>part.inlineData).inlineData.data;
  return route.fulfill({json:{candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(assessment({variants:[['æ','p','ə','l']]},mode))}]}}]}});
 });
 await page.goto('/practice/speaking?word=apple');await speak(page);
 await expect(page.locator('.speaking-title-row .speaking-score')).toHaveText('80%',{timeout:15000});
 await expect(page.locator('.speaking-score')).toHaveClass(/retry/);await expect(page.locator('.speaking-target .speaking-insertion')).toHaveText('+/ə/');
 expect(await page.locator('.speaking-target .speaking-letter.match').count()).toBeGreaterThan(0);
 const replay=await page.locator('audio').evaluate(async element=>{const bytes=new Uint8Array(await(await fetch((element as HTMLAudioElement).src)).arrayBuffer());let result='';for(const byte of bytes)result+=String.fromCharCode(byte);return btoa(result);});expect(replay).toBe(sent);
 await page.locator('.speaking-target button').click();await expect(page.locator('.speaking-insertion-row')).toContainText('Âm thêm');await expect(page.locator('.speaking-insertion-row')).toContainText('Sau âm 4 /l/');
 await expect(page.getByRole('dialog')).toHaveCSS('opacity','1');await page.locator('.speaking-insertion-row').scrollIntoViewIfNeeded();await page.getByRole('dialog').screenshot({path:info.outputPath('insertion-sheet.png')});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Đóng / Close'}).click();mode='uncertain';await speak(page);
 await expect(page.locator('.speaking-feedback')).toContainText('Chưa nghe rõ',{timeout:15000});await expect(page.locator('.speaking-score')).toHaveText('0%');await expect(page.locator('.speaking-target .missing,.speaking-target .incorrect')).toHaveCount(0);
 await page.getByRole('button',{name:'Hoàn thành',exact:true}).click();await expect(page.getByRole('heading',{name:'Con đã hoàn thành!'})).toBeVisible();await expect(page.locator('.speaking-score')).toHaveText('0%');await expect(page.getByText('1 / 1 lượt có điểm',{exact:true})).toBeVisible();
});

test('v2 omission and gross substitution use specific red feedback and one curated correction',async({page},info)=>{
 let mode:Mode='missing';
 await page.route('https://generativelanguage.googleapis.com/**',route=>{const target={variants:[['æ','p','ə','l']]};return route.fulfill({json:{candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(assessment(target,mode))}]}}]}});});
 await page.goto('/library/words/apple');await speak(page);await expect(page.locator('.speaking-title-row .speaking-score')).toHaveText('75%',{timeout:15000});await expect(page.locator('.speaking-title-row .speaking-score')).toHaveClass(/missing/);await expect(page.locator('.speaking-feedback')).toContainText('/l/');
 await page.locator('.speaking-target button').click();await expect(page.locator('.speaking-sound-table')).toContainText('Chưa nhận ra âm');await expect(page.getByRole('dialog')).toHaveCSS('opacity','1');await page.getByRole('dialog').screenshot({path:info.outputPath('omission-sheet.png')});await page.getByRole('button',{name:'Đóng / Close'}).click();
 mode='incorrect';await speak(page);await expect(page.locator('.speaking-feedback')).toContainText('Âm nghe khác',{timeout:15000});await expect(page.locator('.speaking-title-row .speaking-score')).toHaveClass(/incorrect/);await expect(page.locator('.speaking-target .speaking-letter.incorrect')).toHaveText('a');await expect(page.locator('.speaking-feedback')).toContainText('/æ/');
});

test('v2 invalid provider evidence uses an explicit temporary zero and a late response cannot restore a departed attempt',async({page},info)=>{
 let requests=0,release:(()=>void)|undefined;
 await page.route('https://generativelanguage.googleapis.com/**',async route=>{
  requests++;const target={variants:[['æ','p','ə','l']]};
  if(requests===2)await new Promise<void>(resolve=>{release=resolve;});
  await route.fulfill({json:{candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(assessment(target,requests===1?'invalid':'match'))}]}}]}}).catch(()=>{});
 });
 await page.goto('/practice/speaking?word=apple');await speak(page);await expect(page.getByText(/SP-SCHEMA/)).toBeVisible({timeout:15000});expect(requests).toBe(1);await expect(page.locator('.speaking-score')).toHaveText('0%');await expect(page.getByRole('button',{name:'Nghe lại giọng của con',exact:true})).toBeEnabled();await page.getByText(/SP-SCHEMA/).scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('grading-schema-error.png')});
 await speak(page);await expect.poll(()=>requests,{timeout:15000}).toBe(2);await page.goto('/practice');release?.();await expect(page.locator('.speaking-score')).toHaveCount(0);await expect(page.getByRole('link',{name:/Nói cùng Cáo/})).toBeVisible();
});

test('v2 starting and cancelling another recording clears the previous accepted score',async({page})=>{
 let requests=0;await page.route('https://generativelanguage.googleapis.com/**',route=>{requests++;const target={variants:[['æ','p','ə','l']]};return route.fulfill({json:{candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(assessment(target,'match'))}]}}]}});});
 await page.goto('/practice/speaking?word=apple');await speak(page);await expect(page.locator('.speaking-score')).toHaveText('100%',{timeout:15000});
 await speak(page);await page.getByRole('button',{name:'Hủy lượt nói',exact:true}).click();await expect(page.locator('.speaking-score')).toHaveCount(0);await expect(page.getByRole('button',{name:'Hoàn thành',exact:true})).toBeDisabled();expect(requests).toBe(1);
});


test('v2 grading failures identify incomplete and unreadable provider output while replay remains available',async({page})=>{
 let mode='incomplete',requests=0;
 await page.route('https://generativelanguage.googleapis.com/**',route=>{
  requests++;
  return route.fulfill({json:mode==='incomplete'?{candidates:[{finishReason:'MAX_TOKENS'}]}:{candidates:[{finishReason:'STOP',content:{parts:[{text:'not JSON'}]}}]}});
 });
 await page.goto('/practice/speaking?word=apple');await speak(page);
 await expect(page.getByText(/SP-INCOMPLETE/)).toBeVisible({timeout:15000});await expect(page.locator('.speaking-score')).toHaveText('0%');
 await expect(page.getByRole('button',{name:'Nghe lại giọng của con',exact:true})).toBeEnabled();expect(requests).toBe(1);
 mode='json';await speak(page);await expect(page.getByText(/SP-JSON/)).toBeVisible({timeout:15000});
 await expect(page.getByText(/không phải con đọc sai/)).toBeVisible();expect(requests).toBe(2);await expect(page.locator('.speaking-score')).toHaveText('0%');
 await page.getByRole('button',{name:'Hoàn thành',exact:true}).click();await expect(page.getByText('1 / 1 lượt có điểm',{exact:true})).toBeVisible();
});

test('v3 silence and a tiny click get zero promptly without contacting the provider',async({page},info)=>{

 let requests=0;await page.route('https://generativelanguage.googleapis.com/**',route=>{requests++;return route.abort();});
 await page.goto('/practice/speaking?word=apple&quietMic=1');const started=Date.now();await speak(page);
 await expect(page.locator('.speaking-score')).toHaveText('0%',{timeout:4500});expect(Date.now()-started).toBeLessThan(4500);expect(requests).toBe(0);
 await expect(page.getByText(/Máy chưa nghe rõ/)).toBeVisible();await expect(page.getByRole('button',{name:'Nghe lại giọng của con',exact:true})).toBeEnabled();
 await page.screenshot({path:info.outputPath('quiet-zero.png')});
});

test('v3 slow service is bounded to six seconds, shows zero and preserves replay',async({page})=>{
 let requests=0;await page.route('https://generativelanguage.googleapis.com/**',async route=>{requests++;await new Promise(resolve=>setTimeout(resolve,7500));await route.abort().catch(()=>{});});
 await page.goto('/practice/speaking?word=apple');const started=Date.now();await speak(page);
 await expect(page.getByText(/SP-TIMEOUT/)).toBeVisible({timeout:9000});expect(Date.now()-started).toBeLessThan(9000);expect(requests).toBe(1);
 await expect(page.locator('.speaking-score')).toHaveText('0%');await expect(page.getByRole('button',{name:'Nghe lại giọng của con',exact:true})).toBeEnabled();
 await expect(page.getByText(/tạm 0 điểm vì lỗi chấm/)).toBeVisible();
});
