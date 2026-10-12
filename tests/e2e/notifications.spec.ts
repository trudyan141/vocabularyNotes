import {test, expect} from '@playwright/test';
const owner='60000000-0000-4000-8000-000000000006', library='70000000-0000-4000-8000-000000000007';
async function seed(page: import('@playwright/test').Page) {
 await page.route('**/api/**', route => {
  const path = new URL(route.request().url()).pathname;
  if(path==='/api/auth/status') return route.fulfill({json:{configured:true,user:{id:owner,name:'Notification tester',email:'fixture@example.test',avatarUrl:null},cloud:{state:'ready',words:0,lessons:0}}});
  if(path==='/api/cloud/library') return route.fulfill({json:{library:{id:library,ownerId:owner,name:'Fixture'}}});
  if(path==='/api/cloud/preferences') return route.fulfill({json:{ownerId:owner,libraryId:library,preferences:{}}});
  if(path==='/api/cloud/sync') return route.fulfill({json:{libraryId:library,cursor:0,changes:[],more:false}});
  return route.abort();
 });
 await page.goto('/today'); await expect(page.getByRole('button',{name:'Thông báo',exact:true})).toBeVisible();
 await page.evaluate(async () => {
  const db = await new Promise<IDBDatabase>((resolve,reject) => {const r=indexedDB.open('words-for-kids.local'); r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const tx = db.transaction(['metadata','libraries','senses'],'readwrite'); const at=new Date().toISOString();
  tx.objectStore('metadata').put({key:'active-guest',value:'guest:notice-fixture'});
  tx.objectStore('libraries').put({id:'guest:notice-fixture',scopeId:'guest:notice-fixture',scope:{kind:'guest',id:'guest:notice-fixture'},seeded:true});
  tx.objectStore('senses').put({scopeId:'guest:notice-fixture',id:'notice-apple',entryId:'apple',deletedAt:null,createdAt:at,updatedAt:at});
  await new Promise<void>((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
 });
}
test('bell toggles, opens detail, persists read and declines without losing source', async ({page}, info) => {
 await seed(page);
 const bell=page.getByRole('button',{name:'Thông báo, 1 chưa đọc'});
 await expect(bell).toBeVisible(); await expect(page.locator('.guest-copy-prompt')).toHaveCount(0);
 await bell.click(); await expect(page.getByRole('link',{name:/Mang bài học sang tài khoản/})).toBeVisible();
 await bell.click(); await expect(page.locator('.notification-popup')).toHaveCount(0);
 await bell.click(); await page.keyboard.press('Escape'); await expect(page.locator('.notification-popup')).toHaveCount(0); await expect(bell).toBeFocused();
 await bell.click(); await page.screenshot({path:`docs/evaluations/notifications-${info.project.name}.png`});
 await page.getByRole('link',{name:/Mang bài học sang tài khoản/}).click();
 await expect(page).toHaveURL(/notifications\/device-lessons/);
 await expect(page.getByRole('button',{name:'Xem trước bài sẽ đưa lên tài khoản'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Thông báo',exact:true})).toBeVisible();
 await page.reload(); await expect(page.getByRole('button',{name:'Thông báo',exact:true})).toBeVisible();
 await page.screenshot({path:`docs/evaluations/notification-detail-${info.project.name}.png`});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Giữ bài trên máy, không sao chép'}).click(); await expect(page.getByText('Đã xong rồi!',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Thông báo',exact:true}).click(); await expect(page.getByText('Chưa có thông báo',{exact:true})).toBeVisible();
});
test('empty inbox, outside click, reduced motion and invalid detail', async ({page}) => {
 await page.route('**/api/auth/status',route=>route.fulfill({json:{configured:false,user:null}}));
 await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/today');
 const bell=page.getByRole('button',{name:'Thông báo',exact:true}); await bell.click(); await expect(page.getByText('Chưa có thông báo',{exact:true})).toBeVisible();
 expect(await page.locator('.notification-popup').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 await page.locator('main h1').click(); await expect(page.locator('.notification-popup')).toHaveCount(0);
 await page.goto('/notifications/device-lessons'); await expect(page.getByText('Đã xong rồi!',{exact:true})).toBeVisible();
 const response=await page.goto('/notifications/unknown'); expect(response?.status()).toBe(404);
});
test('sync failure stays actionable in detail and reduced motion stops the bell', async ({page}) => {
 await seed(page); await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/api/cloud/sync*', route=>route.fulfill({status:503,json:{error:'unavailable'}}));
 await page.evaluate(async ({owner,library}) => {
  const db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open('words-for-kids.local');r.onsuccess=()=>resolve(r.result);});
  const tx=db.transaction(['metadata','transferCheckpoints'],'readwrite');const at=new Date().toISOString();
  tx.objectStore('metadata').put({key:`guest-copy-choice:${owner}`,value:'no'});
  tx.objectStore('transferCheckpoints').put({scopeId:`account:${owner}:${library}`,id:'cloud-status',version:1,createdAt:at,updatedAt:at,deletedAt:null,payload:{status:'unavailable'}});
  await new Promise<void>(resolve=>{tx.oncomplete=()=>resolve();});db.close();
 },{owner,library});
 await page.getByRole('button',{name:'Thông báo, 1 chưa đọc'}).click();
 expect(await page.locator('.notification-bell svg').evaluate(el=>el.getAnimations().length)).toBe(0);
 await page.getByRole('link',{name:/Bài học cần được đồng bộ/}).click();
 await page.getByRole('button',{name:'Đồng bộ bây giờ',exact:true}).click();
 await expect(page.locator('[data-submit-state="error"]')).toBeVisible();
 await expect(page.getByRole('button',{name:'Thông báo',exact:true})).toBeVisible();
});
test('unfinished photo moves from Today into a notification and resumes the real draft', async ({page}, info) => {
 await page.route('**/api/auth/status',route=>route.fulfill({json:{configured:false,user:null}}));
 await page.goto('/capture');
 const data=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=200;canvas.height=120;const ctx=canvas.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,200,120);ctx.fillStyle='black';ctx.fillText('apple',30,50);return canvas.toDataURL('image/png').split(',')[1];});
 const input=page.getByRole('tabpanel',{name:'Chọn ảnh',exact:true}).getByLabel('Chọn ảnh từ máy',{exact:true});await expect(input).toBeEnabled();
 await input.setInputFiles({name:'notification-draft.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});
 await expect(page).toHaveURL(/capture\/[^/]+\/edit/);const draftUrl=page.url();
 await page.goto('/today');await expect(page.locator('.draft-resume')).toHaveCount(0);
 const bell=page.getByRole('button',{name:'Thông báo, 1 chưa đọc'});await bell.click();
 await page.getByRole('link',{name:/Tiếp tục bài từ ảnh/}).click();
 await expect(page.getByRole('heading',{name:'Tiếp tục bài từ ảnh'})).toBeVisible();
 await page.screenshot({path:`docs/evaluations/notification-draft-${info.project.name}.png`});
 await page.reload();await expect(page.getByRole('button',{name:'Thông báo',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Tiếp tục nháp ảnh'}).click();await expect(page).toHaveURL(draftUrl);
 await page.goto('/capture');const remove=page.getByRole('button',{name:/Xóa nháp/});await remove.click();await expect(remove).toHaveText('Xác nhận xóa');await remove.click();await expect(remove).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Thông báo',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Thông báo',exact:true}).click();await expect(page.getByText('Chưa có thông báo',{exact:true})).toBeVisible();
});

test('trash dismisses an item without opening detail, persists and leaves source intact', async ({page},info) => {
 await seed(page);await page.getByRole('button',{name:'Thông báo, 1 chưa đọc'}).click();
 const remove=page.getByRole('button',{name:'Xóa thông báo: Mang bài học sang tài khoản'});
 await expect(remove).toBeVisible();const bounds=await remove.boundingBox();expect(bounds!.width).toBeGreaterThanOrEqual(44);expect(bounds!.height).toBeGreaterThanOrEqual(44);
 await page.screenshot({path:`docs/evaluations/notifications-trash-${info.project.name}.png`});await remove.click();
 await expect(page).toHaveURL(/today$/);await expect(page.getByText('Chưa có thông báo',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Đóng thông báo'})).toBeFocused();
 await expect(page.getByRole('button',{name:'Thông báo',exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Thông báo',exact:true}).click();await expect(page.getByText('Chưa có thông báo',{exact:true})).toBeVisible();
 expect(await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>(resolve=>{const request=indexedDB.open('words-for-kids.local');request.onsuccess=()=>resolve(request.result);});const count=await new Promise<number>(resolve=>{const request=db.transaction('senses').objectStore('senses').count();request.onsuccess=()=>resolve(request.result);});db.close();return count;})).toBe(1);
});
