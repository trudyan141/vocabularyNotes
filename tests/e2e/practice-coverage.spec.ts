import {test,expect,type Page} from '@playwright/test';
test.beforeEach(async({page})=>{
 await page.route('**/api/auth/status*',route=>route.fulfill({json:{configured:false,user:null}}));
 await page.route('**/api/audio/**',route=>route.fulfill({status:503,json:{error:'fixture-no-live-audio'}}));
 await page.route('https://**',route=>route.abort());
});
async function seed(page:Page,count:number){
 await page.goto('/library');await expect(page.locator('.library-list')).toContainText('apple');
 await page.evaluate(async count=>{
  const db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open('words-for-kids.local');r.onsuccess=()=>resolve(r.result);});
  const read=(name:string)=>new Promise<Record<string,unknown>[]>(resolve=>{const r=db.transaction(name).objectStore(name).getAll();r.onsuccess=()=>resolve(r.result);});
  const [entries,senses,index]=await Promise.all(['entries','senses','searchIndex'].map(read));const sense=senses.find(row=>row.id==='apple')!,entry=entries.find(row=>row.id===sense.entryId)!,source=index.find(row=>row.id==='apple')!,scopeId=sense.scopeId,at=new Date().toISOString();
  await new Promise<void>((resolve,reject)=>{const tx=db.transaction(['entries','senses','searchIndex','decks'],'readwrite');
   for(let i=0;i<count;i++){const id=`coverage-${i}`,word=`word${i}`;tx.objectStore('entries').put({...entry,id,displayText:word,canonicalKey:word,activeKey:word});tx.objectStore('senses').put({...sense,id,entryId:id,senseLabel:word,identity:`noun:${word}`,definitionEn:`Definition ${i}`,meaningVi:`Nghĩa ${i}`,tags:[]});tx.objectStore('searchIndex').put({...source,id,terms:word,lessonIds:[],ordinal:`coverage-${String(i).padStart(4,'0')}`});}
   tx.objectStore('decks').put({scopeId,id:'coverage-group',version:1,createdAt:at,updatedAt:at,deletedAt:null,payload:{deck:{name:'Nhóm đang học của con',direction:'en-vi',senseIds:Array.from({length:count},(_,i)=>`coverage-${i}`)}}});
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });db.close();
 },count);
 await page.goto('/practice?deck=coverage-group');await page.getByRole('button',{name:'Gõ cả từ',exact:true}).click();await expect(page).toHaveURL(/session=/);await expect(page.getByRole('progressbar')).toBeVisible();await expect(page.getByLabel('Gõ từ tiếng Anh',{exact:true})).toBeEnabled();
}
async function currentWord(page:Page){return page.evaluate(async()=>{
 const id=new URL(location.href).searchParams.get('session')!,db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open('words-for-kids.local');r.onsuccess=()=>resolve(r.result);});
 const rows=await new Promise<{id:string;payload:{session:{position:number;questions:{word:{word:string}}[]}}}[]>(resolve=>{const r=db.transaction('practiceSessions').objectStore('practiceSessions').getAll();r.onsuccess=()=>resolve(r.result);});db.close();const session=rows.find(row=>row.id===id)!.payload.session;return session.questions[session.position].word.word;
});}
async function answer(page:Page){await expect(page.getByLabel('Gõ từ tiếng Anh',{exact:true})).toBeEnabled();await page.getByLabel('Gõ từ tiếng Anh',{exact:true}).fill(await currentWord(page));await page.getByRole('button',{name:'Kiểm tra',exact:true}).click();await page.getByRole('button',{name:'Câu tiếp theo',exact:true}).click();await expect(page.getByRole('button',{name:'Câu tiếp theo',exact:true})).toHaveCount(0);}
async function noOverflow(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
test('selected group continues new tens and resumes at 23 of 47 after leaving and reload',async({page},info)=>{
 test.setTimeout(90000);await seed(page,47);await expect(page.locator('main')).toContainText('Cả bộ: 0/47 từ đã làm');
 for(let round=0;round<2;round++){for(let i=0;i<10;i++)await answer(page);await expect(page.getByRole('heading',{name:'Con đã hoàn thành!',exact:true})).toBeVisible();await expect(page.locator('main')).toContainText(`Cả bộ: ${(round+1)*10}/47`);if(round===0)await page.screenshot({path:info.outputPath('coverage-result.png'),fullPage:true});await page.getByRole('button',{name:'Tiếp từ mới',exact:true}).click();await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','0');}
 for(let i=0;i<3;i++)await answer(page);
 const word=await currentWord(page);await page.getByLabel('Gõ từ tiếng Anh',{exact:true}).fill(word);await page.getByRole('button',{name:'Kiểm tra',exact:true}).click();
 await expect(page.getByRole('button',{name:'Câu tiếp theo',exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('button',{name:'Câu tiếp theo',exact:true})).toBeVisible();await expect(page.locator('main')).toContainText('Cả bộ: 23/47 từ đã làm');
 await page.getByRole('button',{name:'Về chọn trò chơi',exact:true}).click();await expect(page.getByRole('region',{name:'Phạm vi đang ôn'})).toContainText('Nhóm đang học của con');await expect(page.locator('.pending-session')).toContainText('Cả bộ: 23/47');await noOverflow(page);await page.screenshot({path:info.outputPath('coverage-hub.png'),fullPage:true});
 await page.reload();await page.locator('.pending-session .session-history-open').click();await expect(page.getByRole('button',{name:'Câu tiếp theo',exact:true})).toBeVisible();await page.getByRole('button',{name:'Câu tiếp theo',exact:true}).click();await expect(page.locator('main')).toContainText('Cả bộ: 24/47');await noOverflow(page);
});
test('save failure keeps the current item and final short round requires a deliberate new cycle',async({page},info)=>{
 await seed(page,11);const word=await currentWord(page);
 await page.evaluate(()=>{const original=IDBObjectStore.prototype.put;let fail=true;IDBObjectStore.prototype.put=function(...args:Parameters<IDBObjectStore['put']>){if(this.name==='practiceSessions'&&fail){fail=false;throw new DOMException('Fixture write failure','UnknownError');}return original.apply(this,args);};});
 await page.getByLabel('Gõ từ tiếng Anh',{exact:true}).fill(word);await page.getByRole('button',{name:'Kiểm tra',exact:true}).click();await expect(page.locator('main').getByRole('alert')).toContainText('Phiên chưa lưu được');await expect(page.locator('main')).toContainText('Cả bộ: 0/11');await expect(page.getByLabel('Gõ từ tiếng Anh',{exact:true})).toHaveValue(word);await page.screenshot({path:info.outputPath('coverage-save-error.png'),fullPage:true});
 await page.getByRole('button',{name:'Kiểm tra',exact:true}).click();await page.getByRole('button',{name:'Câu tiếp theo',exact:true}).click();for(let i=1;i<10;i++)await answer(page);
 await page.getByRole('button',{name:'Tiếp từ mới',exact:true}).click();await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax','1');await answer(page);
 await expect(page.locator('main')).toContainText('Cả bộ: 11/11');await expect(page.getByRole('button',{name:'Tiếp từ mới',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Bắt đầu vòng mới',exact:true}).click();await expect(page.locator('main')).toContainText('Cả bộ: 0/11');await noOverflow(page);
});

test('offline fallback continues the selected cycle and main app resumes its saved position',async({page})=>{
 await seed(page,11);const word=await currentWord(page);await page.getByLabel('Gõ từ tiếng Anh',{exact:true}).fill(word);await page.getByRole('button',{name:'Kiểm tra',exact:true}).click();await expect(page.getByRole('button',{name:'Câu tiếp theo',exact:true})).toBeVisible();
 await page.goto('/offline.html');await page.getByRole('button',{name:'Bài mẫu',exact:true}).click();await expect(page.locator('#library-title')).toHaveText('Bài mẫu của Cáo');
 await page.getByRole('button',{name:'Gõ cả từ',exact:true}).click();await expect(page.locator('#game-body')).toContainText('Cả bộ: 0/11');await page.getByRole('button',{name:'Câu tiếp theo',exact:true}).click();await expect(page.locator('#game-body')).toContainText('Cả bộ: 1/11');
 await page.getByRole('button',{name:'Tạm dừng',exact:true}).click();await expect(page.locator('#resume')).toContainText('Cả bộ 1/11');
 await page.goto('/practice?deck=coverage-group');await page.getByRole('button',{name:'Gõ cả từ',exact:true}).click();await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');await expect(page.locator('main')).toContainText('Cả bộ: 1/11');await noOverflow(page);
});

test('progress delete beside Continue removes only that progress and stays removed after reload',async({page},info)=>{
 await seed(page,11);for(let i=0;i<10;i++)await answer(page);await page.getByRole('button',{name:'Chọn trò chơi khác',exact:true}).click();
 const card=page.locator('.progress-cycle').filter({hasText:'Gõ cả từ'});await expect(card).toBeVisible();await expect(card).toContainText('10/11');const next=card.getByRole('button',{name:'Tiếp tục',exact:true}),remove=card.getByRole('button',{name:'Xóa tiến độ Gõ cả từ',exact:true});await expect(remove).toBeVisible();const a=await next.boundingBox(),b=await remove.boundingBox();expect(b!.x).toBeGreaterThan(a!.x);await noOverflow(page);await page.screenshot({path:info.outputPath('progress-delete.png'),fullPage:true});
 await remove.click();await expect(card).toHaveCount(0);await page.reload();await expect(page.locator('.progress-cycle').filter({hasText:'Gõ cả từ'})).toHaveCount(0);await expect(page.getByRole('button',{name:'Tất cả game',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Game mới',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Gõ cả từ',exact:true}).click();await expect(page.locator('main')).toContainText('Cả bộ: 0/11');await noOverflow(page);
});
