import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
 await page.route(/^https:\/\//,route=>route.abort());
 await page.route('**/api/auth/status*',route=>route.fulfill({json:{configured:false,user:null}}));
 await page.goto('/library/groups/edit');await expect(page.locator('.group-option-list input').first()).toBeVisible();
 await page.evaluate(async()=>{
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('words-for-kids.local');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction(['senses','decks','lessons','lessonItems'],'readwrite'),request=tx.objectStore('senses').getAll();
   request.onsuccess=()=>{
    const apple=request.result.find(row=>row.id==='apple'),book=request.result.find(row=>row.id==='book'),scopeId=apple.scopeId,at='2026-10-14T03:13:07.000Z';
    const base={scopeId,version:1,createdAt:at,updatedAt:at,deletedAt:null};
    tx.objectStore('decks').put({...base,id:'retained-fixture',payload:{deck:{name:'Family giữ nội dung',direction:'en-vi',senseIds:['apple'],group:{wordIds:['apple'],sentences:[{senseId:'apple',key:'saved sentence no longer available'}],grammar:[{senseId:'apple',key:'saved grammar no longer available'}]}}}});
    tx.objectStore('lessons').put({...base,id:'new-family-fixture',title:'Bài Family vừa thêm',learnedOn:'2026-10-14',sourceType:'image'});
    for(const sense of [apple,book])tx.objectStore('lessonItems').put({...base,id:`new-family-${sense.id}`,lessonId:'new-family-fixture',senseId:sense.id,entryId:sense.entryId,evidenceId:null});
   };
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });db.close();
 });
 await page.goto('/library/groups/edit?id=retained-fixture&lesson=new-family-fixture');
 await expect(page.getByLabel('Tên nhóm',{exact:true})).toHaveValue('Family giữ nội dung');
});

test('adds new lesson members and skips repeats while preserving unavailable saved refs',async({page},info)=>{
 await page.getByRole('button',{name:'Lưu nhóm',exact:true}).click();
 await expect(page.getByRole('button',{name:'Đã lưu nhóm',exact:true})).toBeVisible();
 await expect(page.locator('.group-save-result.is-saved summary')).toContainText('1 mục mới');
 await expect(page.locator('.group-save-result.is-unchanged')).toContainText('apple');
 await expect(page.locator('.group-editor').getByRole('alert')).toHaveCount(0);
 await page.reload();await page.getByRole('button',{name:'Lưu nhóm',exact:true}).click();
 await expect(page.getByRole('button',{name:'Đã có trong nhóm',exact:true})).toBeVisible();
 const group=await page.evaluate(async()=>{
  const db=await new Promise<IDBDatabase>(resolve=>{const request=indexedDB.open('words-for-kids.local');request.onsuccess=()=>resolve(request.result);});
  const row=await new Promise<{version:number;payload:{deck:{group:{wordIds:string[];sentences:unknown[];grammar:unknown[]}}}}>(resolve=>{const request=db.transaction('decks').objectStore('decks').getAll();request.onsuccess=()=>resolve(request.result.find(row=>row.id==='retained-fixture'));});db.close();return row;
 });
 expect(group.version).toBe(2);expect(group.payload.deck.group.wordIds).toEqual(['apple','book']);
 expect(group.payload.deck.group.sentences).toEqual([{senseId:'apple',key:'saved sentence no longer available'}]);
 expect(group.payload.deck.group.grammar).toEqual([{senseId:'apple',key:'saved grammar no longer available'}]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('repeat-saved.png'),fullPage:true});
});

test('still blocks an actual concurrent group edit and retains the selected lesson',async({page},info)=>{
 await page.evaluate(async()=>{
  const db=await new Promise<IDBDatabase>(resolve=>{const request=indexedDB.open('words-for-kids.local');request.onsuccess=()=>resolve(request.result);});
  await new Promise<void>(resolve=>{const tx=db.transaction('decks','readwrite'),store=tx.objectStore('decks'),request=store.getAll();request.onsuccess=()=>{const row=request.result.find(row=>row.id==='retained-fixture');store.put({...row,version:row.version+1});};tx.oncomplete=()=>resolve();});db.close();
 });
 await page.getByRole('button',{name:'Lưu nhóm',exact:true}).click();
 await expect(page.locator('.group-editor').getByRole('alert')).toContainText('Nội dung đã đổi');
 await expect(page.getByRole('checkbox',{name:/^Bài Family vừa thêm/})).toBeChecked();
 await expect(page.getByLabel('Tên nhóm',{exact:true})).toHaveValue('Family giữ nội dung');
 await page.screenshot({path:info.outputPath('concurrent-error.png'),fullPage:true});
});
