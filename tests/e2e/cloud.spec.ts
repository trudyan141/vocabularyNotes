import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {createHash,createHmac} from 'node:crypto';
import {stableJson} from '../../src/domain/identity';

async function login(page:Page,actor:'A'|'B'){
 await page.goto('/account');
 await page.getByRole('button',{name:'Đăng nhập bằng Google',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Dịch vụ Google giả lập chỉ cho kiểm tra'})).toBeVisible();
 await page.getByRole('link',{name:`Phụ huynh ${actor} (giả lập)`,exact:true}).click();
 await expect(page).toHaveURL(/4328\/account$/);
 await expect(page.getByText(`parent-${actor.toLowerCase()}@example.test`,{exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:`Phụ huynh ${actor}`,exact:true})).toBeVisible();await expect(page.getByText('Đã đăng nhập bằng Google',{exact:true})).toBeVisible();
}

test('PKCE cookies, explicit guest transfer, SQL sync and owner separation through real routes',async({page,context,browser})=>{
 test.setTimeout(90_000);
 await page.goto('/add');await page.getByRole('combobox').fill('nu');await page.getByRole('option').filter({hasText:'nut'}).getByRole('button').click();
 await page.getByRole('checkbox',{name:'Tôi đã kiểm tra nội dung và đồng ý cho con học'}).check();await page.getByRole('button',{name:'Duyệt và lưu từ',exact:true}).click();await expect(page).toHaveURL(/\/library\/words\//);
 await login(page,'A');
 const overview=await page.request.get('/api/auth/status?profile=1');expect((await overview.json()).cloud).toMatchObject({state:'empty',words:0,lessons:0});
 const cookies=await context.cookies();expect(cookies.some(cookie=>cookie.name.includes('auth-token')&&cookie.httpOnly)).toBe(true);
 expect(await page.evaluate(()=>Object.keys(localStorage).filter(key=>/token|supabase|auth/i.test(key)))).toEqual([]);
 await page.getByRole('button',{name:'Xem trước bài sẽ đưa lên tài khoản',exact:true}).click();
 await expect(page.getByRole('button',{name:'Sao lưu và đưa bài lên tài khoản',exact:true})).toBeVisible();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Sao lưu và đưa bài lên tài khoản',exact:true}).click();expect((await download).suggestedFilename()).toBe('words-for-kids-before-cloud.json');
 await expect(page.getByRole('button',{name:'Đồng bộ bây giờ',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Đồng bộ bây giờ',exact:true}).click();await expect(page.getByText('Đã đồng bộ thư viện.',{exact:true})).toBeVisible();
 const savedOverview=await page.request.get('/api/auth/status?profile=1');expect((await savedOverview.json()).cloud).toMatchObject({state:'ready',words:1,lessons:1});await expect(page.getByText(/Lần gửi thành công:/)).toBeVisible();
 const libraryResponse=await page.request.post('/api/cloud/library',{headers:{Origin:'http://127.0.0.1:4328'}});expect(libraryResponse.status()).toBe(200);const {library}=await libraryResponse.json();
 await page.goto('/library');await expect(page.locator('.library-list')).toContainText('nut');await page.reload();await expect(page.locator('.library-list')).toContainText('nut');
 await page.goto('/practice');await page.getByRole('button',{name:'Thẻ ôn',exact:true}).click();await page.getByRole('button',{name:'Xem đáp án',exact:true}).click();await page.getByRole('button',{name:'Nhớ rồi',exact:true}).click();await expect(page.getByRole('heading',{name:'Con đã hoàn thành!',exact:true})).toBeVisible();
 await page.goto('/account');await page.getByRole('button',{name:'Đồng bộ bây giờ',exact:true}).click();await expect(page.getByText('Đã đồng bộ thư viện.',{exact:true})).toBeVisible();
 const history=await page.request.get(`/api/cloud/sync?library=${library.id}&cursor=0`);expect(history.status()).toBe(200);const changes=(await history.json()).changes;expect(changes.filter((change:{entity:string})=>change.entity==='reviewEvents')).toHaveLength(1);expect(changes.some((change:{entity:string})=>change.entity==='reviewStates')).toBe(true);
 const sense=changes.find((change:{entity:string})=>change.entity==='senses').id;
 const mediaBytes=await sharp({create:{width:64,height:64,channels:3,background:'#de9471'}}).jpeg().toBuffer();
 const candidate={id:`1:${'a'.repeat(40)}`,title:'File:Nut illustration.png',sourceUrl:'https://commons.wikimedia.org/wiki/File:Nut_illustration.png',imageUrl:'https://upload.wikimedia.org/test-nut.jpg',creator:'Fixture artist',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',credit:'Fixture artist — CC BY 4.0'};
 const checkedAt=new Date().toISOString();const sha256=createHash('sha256').update(mediaBytes).digest('hex'),value=Buffer.from(stableJson({candidate,sha256,checkedAt})).toString('base64url'),receipt=`${value}.${createHmac('sha256','test-only-media-receipt-key-32-characters').update(value).digest('base64url')}`;
 // Only Commons network responses are mocked; server receipt/hash/SQL sync are real.
 await page.route('**/api/media/search',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({candidates:[candidate]})}));await page.route('**/api/media/import',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({candidate,base64:mediaBytes.toString('base64'),sha256,checkedAt,receipt})}));
 await page.goto(`/library/words/${sense}/edit`);await page.locator('summary').filter({visible:true,hasText:'Tìm và duyệt hình minh họa'}).click();await page.getByRole('checkbox',{name:'Tôi đồng ý gửi từ và tên nghĩa để tìm hình.'}).check();await page.getByRole('button',{name:'Tìm hình có nguồn',exact:true}).click();await page.getByRole('button',{name:'Tải bản xem trước để duyệt',exact:true}).click();await page.getByRole('checkbox',{name:/Hình đúng nghĩa, rõ nét/}).check();await page.getByRole('button',{name:'Duyệt và dùng hình này',exact:true}).click();await expect(page.getByText(/Đã duyệt hình cho nghĩa này/)).toBeVisible();await page.goto('/account');await page.getByRole('button',{name:'Đồng bộ bây giờ',exact:true}).click();await expect(page.getByText('Đã đồng bộ thư viện.',{exact:true})).toBeVisible();
 const second=await browser.newContext({baseURL:'http://127.0.0.1:4328'});const other=await second.newPage();
 try{
  await login(other,'A');await other.getByRole('button',{name:'Mở thư viện tài khoản',exact:true}).click();await other.getByRole('button',{name:'Đồng bộ bây giờ',exact:true}).click();await expect(other.getByText('Đã đồng bộ thư viện.',{exact:true})).toBeVisible();await other.goto('/library');await expect(other.locator('.library-list')).toContainText('nut');await other.goto(`/library/words/${sense}`);await other.locator('summary').filter({hasText:'Nguồn hình'}).click();await expect(other.getByRole('link',{name:'Fixture artist — CC BY 4.0',exact:true})).toBeVisible();
  await other.goto('/account');await other.getByRole('button',{name:'Đăng xuất / đổi tài khoản',exact:true}).click();await expect(other.getByRole('button',{name:'Đăng nhập bằng Google',exact:true})).toBeVisible();await login(other,'B');await other.getByRole('button',{name:'Mở thư viện tài khoản',exact:true}).click();await other.goto('/library');await expect(other.getByText('Thư viện đang trống',{exact:true})).toBeVisible();
  const forbidden=await other.request.get(`/api/cloud/sync?library=${library.id}&cursor=0`);expect(forbidden.status()).toBe(403);expect(forbidden.headers()['cache-control']).toContain('no-store');
 }finally{await second.close();}
 const lesson=changes.find((change:{entity:string})=>change.entity==='lessons').id;
 const image=await sharp(await readFile('docs/evaluations/t00/images/01-fruit.png')).jpeg().toBuffer();
 const sourceUrl=`/api/cloud/sources?library=${library.id}&lesson=${lesson}`;
 const rejected=await page.request.post(sourceUrl,{headers:{Origin:'http://127.0.0.1:4328','Content-Type':'image/jpeg'},data:image});expect(rejected.status()).toBe(400);
 const requestedSource=`${sourceUrl}&id=92000000-0000-4000-8000-000000000009`;const uploaded=await page.request.post(requestedSource,{headers:{Origin:'http://127.0.0.1:4328','Content-Type':'image/jpeg','X-Source-Consent':'source-cloud-v1'},data:image});expect(uploaded.status()).toBe(201);const sourceId=(await uploaded.json()).id;
 const photo=await page.request.get(`${sourceUrl}&id=${sourceId}`);expect(photo.status()).toBe(200);expect(photo.headers()['cache-control']).toContain('no-store');expect((await photo.body()).length).toBeGreaterThan(100);
 const retry=await page.request.post(requestedSource,{headers:{Origin:'http://127.0.0.1:4328','Content-Type':'image/jpeg','X-Source-Consent':'source-cloud-v1'},data:image});expect(retry.status()).toBe(201);const listed=await page.request.get(sourceUrl);expect((await listed.json()).sources).toHaveLength(1);
 await page.goto('/account');await page.locator('summary').filter({hasText:'Ảnh chụp gốc và tùy chọn tài khoản'}).click();await page.locator('summary').filter({visible:true,hasText:'Xóa tài khoản và dữ liệu cloud'}).click();await expect(page.getByRole('button',{name:'Xác nhận xóa tài khoản',exact:true})).toBeDisabled();await page.getByRole('checkbox',{name:'Tôi hiểu việc xóa không thể hoàn tác và tự chọn tiếp tục không cần bản sao.'}).check();await page.getByLabel('Gõ DELETE MY ACCOUNT để xác nhận').fill('DELETE MY ACCOUNT');await page.getByRole('button',{name:'Xác nhận xóa tài khoản',exact:true}).click();await expect(page.getByRole('button',{name:'Đăng nhập bằng Google',exact:true})).toBeVisible();
 const deleted=await page.request.get('/api/auth/status');expect((await deleted.json()).user).toBeNull();await page.goto('/library');await expect(page.locator('.library-list')).toContainText('nut');
});
