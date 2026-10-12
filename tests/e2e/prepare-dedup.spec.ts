import {test,expect} from '@playwright/test';
test('picture preparation groups are/they before paging and keeps meaning-specific actions',async({page},info)=>{
 await page.route('**/api/auth/status',route=>route.fulfill({json:{configured:false,user:null}}));
 await page.goto('/library');await expect(page.locator('.word-list')).toBeVisible();
 await page.evaluate(async()=>{
  const db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open('words-for-kids.local');r.onsuccess=()=>resolve(r.result);});
  await new Promise<void>((resolve,reject)=>{const tx=db.transaction(['senses','entries','searchIndex'],'readwrite');tx.objectStore('searchIndex').clear();const r=tx.objectStore('senses').getAll();r.onsuccess=()=>{const sense=r.result.find(row=>row.id==='apple');const e=tx.objectStore('entries').get([sense.scopeId,sense.entryId]);e.onsuccess=()=>{
   const rows=[['are','là','verb'],['ARE','đang','auxiliary'],['they','họ','pronoun'],['they','chúng','pronoun'],...Array.from({length:11},(_,i)=>[`testword${i}`,'từ thử','noun'])];
   rows.forEach(([text,vi,pos],i)=>{const id=`prepare-${i}`,entryId=`prepare-entry-${i===1?0:i===3?2:i}`,at=`2026-01-01T00:00:${String(i).padStart(2,'0')}.000Z`;
    tx.objectStore('entries').put({...e.result,id:entryId,displayText:text,canonicalKey:text.toLowerCase(),activeKey:text.toLowerCase(),caseMode:'fold'});
    tx.objectStore('senses').put({...sense,id,entryId,identity:`prepare-sense-${i}`,art:null,meaningVi:vi,definitionEn:`meaning ${i}`,pos,createdAt:at,updatedAt:at});
    tx.objectStore('searchIndex').put({scopeId:sense.scopeId,id,terms:text.toLowerCase(),lessonIds:[],art:null,ordinal:at+id,approval:true});
   });
  };};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
 });
 let searched='';await page.route('**/api/media/search',route=>{searched=route.request().postDataJSON().sense;return route.fulfill({status:503,json:{error:'unavailable'}});});
 await page.goto('/library/prepare');const are=page.locator('.picture-prepare-item').filter({has:page.getByRole('heading',{name:/^are$/i})});const they=page.locator('.picture-prepare-item').filter({has:page.getByRole('heading',{name:'they',exact:true})});
 await expect(are).toHaveCount(1);await expect(they).toHaveCount(1);await expect(page.locator('.picture-prepare-item')).toHaveCount(12);await expect(page.locator('.picker-pagination')).toContainText('1 / 2');
 await are.getByLabel('Nghĩa cần hình').selectOption('prepare-1');await are.getByRole('button',{name:'Tìm hình',exact:true}).click();await expect(are.getByRole('alert')).toContainText('Chưa tải được hình');expect(searched).toBe('meaning 1');
 await page.screenshot({path:`docs/evaluations/prepare-dedup-${info.project.name}.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await are.getByRole('button',{name:'Không bổ sung',exact:true}).click();await expect(are).toHaveCount(1);await expect(are).toContainText('là');await page.reload();await expect(are).toHaveCount(1);await expect(they).toHaveCount(1);
 await page.getByRole('button',{name:'Sau',exact:true}).click();await expect(page.locator('.picture-prepare-item')).toHaveCount(1);await expect(page.locator('.picker-pagination')).toContainText('2 / 2');
});
