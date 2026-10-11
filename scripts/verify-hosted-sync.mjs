// Explicitly authorized hosted verification with one disposable account and isolated browsers.
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
import {chromium,expect} from '@playwright/test';
process.loadEnvFile('.env.local');
const origin='https://words-for-kids.vercel.app';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const admin=createClient(url,process.env.SUPABASE_SECRET_KEY??process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const email=`wfk-sync-${crypto.randomUUID()}@example.com`,password=`Wfk!${crypto.randomUUID()}`;
let userId,browser;const contexts=[];
try {
 const created=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:'WFK sync test'}});
 if(created.error)throw Error('Test account creation failed');userId=created.data.user.id;
 browser=await chromium.launch();
 async function device(viewport){
  const cookies=[];const auth=createServerClient(url,key,{cookies:{getAll:()=>[],setAll:rows=>cookies.push(...rows)},cookieOptions:{httpOnly:true,sameSite:'lax',secure:true,path:'/'}});
  const result=await auth.auth.signInWithPassword({email,password});if(result.error)throw Error('Test login failed');
  const context=await browser.newContext({viewport,serviceWorkers:'block',baseURL:origin});contexts.push(context);
  await context.addCookies(cookies.map(({name,value})=>({name,value,url:origin,httpOnly:true,secure:true,sameSite:'Lax'})));
  await context.route('https://generativelanguage.googleapis.com/**',route=>route.abort());
  await context.route('**/api/dictionary?mode=suggest&**',route=>route.fulfill({json:{results:[]}}));return context.newPage();
 }
 const a=await device({width:1280,height:1000}),b=await device({width:360,height:800});
 await Promise.all([a.goto('/add'),b.goto('/library')]);
 await expect(a.getByRole('combobox')).toBeVisible({timeout:20000});
 await a.getByRole('combobox').fill('nu');await a.getByRole('option').filter({hasText:'nut'}).getByRole('button').click();
 // Both UI versions are accepted while the final deployment is being prepared.
 const approval=a.getByRole('checkbox',{name:'Tôi đã kiểm tra nội dung và đồng ý cho con học'});if(await approval.count())await approval.check();
 for(const page of [a,b])page.on('response',async response=>{if((response.url().includes('/api/cloud/preferences')&&response.request().method()==='POST')||(response.url().includes('/api/cloud/sync')&&response.status()>=400))console.log('Cloud request',new URL(response.url()).pathname,response.request().method(),response.status());});
 const start=Date.now();await a.getByRole('button',{name:/^(Lưu từ|Duyệt và lưu từ)$/}).click();await expect(a).toHaveURL(/\/library\/words\//);
 const wordId=decodeURIComponent(new URL(a.url()).pathname.split('/').at(-1));
 await expect(b.locator('.library-list')).toContainText('nut',{timeout:15000});console.log(`PASS hosted automatic add (${Date.now()-start} ms)`);
 await b.goto(`/library/words/${encodeURIComponent(wordId)}`);await a.goto(`/library/words/${encodeURIComponent(wordId)}/edit`);
 await a.getByLabel('Nghĩa tiếng Việt',{exact:true}).fill('hạt đã sửa');await a.getByRole('button',{name:'Lưu chỉnh sửa',exact:true}).click();
 await expect(b.getByRole('heading',{name:'hạt đã sửa',exact:true})).toBeVisible({timeout:15000});console.log('PASS hosted automatic edit');
 await Promise.all([a.goto('/profile'),b.goto('/profile')]);await a.getByLabel('Tên hiển thị',{exact:true}).fill('Bé Sync Test');await expect(a.getByLabel('Tên hiển thị',{exact:true})).toHaveValue('Bé Sync Test');await a.getByRole('button',{name:'Lưu hồ sơ',exact:true}).click();console.log('Profile UI',await a.getByLabel('Tên hiển thị',{exact:true}).inputValue(),await a.locator('.profile-settings [role=status]').allTextContents());console.log('Preference after save',JSON.stringify((await a.request.get(origin+'/api/cloud/preferences')).status()));await expect(b.getByLabel('Tên hiển thị',{exact:true})).toHaveValue('Bé Sync Test',{timeout:15000});console.log('PASS hosted automatic profile');
 await Promise.all([a.goto('/library/groups/edit'),b.goto('/library/groups')]);await a.getByLabel('Tên nhóm',{exact:true}).fill('Nhóm Sync Test');await a.getByRole('button',{name:/Chọn tất cả từ, câu và ngữ pháp/}).click();await a.getByRole('button',{name:'Lưu nhóm',exact:true}).click();await expect(b.getByRole('link',{name:/Nhóm Sync Test/})).toBeVisible({timeout:15000});console.log('PASS hosted automatic group add');
 await b.getByRole('link',{name:/Nhóm Sync Test/}).click();await a.goto('/library/groups');await a.getByRole('link',{name:/Nhóm Sync Test/}).click();await a.getByRole('button',{name:'Xóa nhóm',exact:true}).click();await a.getByRole('button',{name:'Xác nhận xóa',exact:true}).click();await expect(b.getByText('Chưa mở được nhóm này',{exact:true})).toBeVisible({timeout:15000});console.log('PASS hosted automatic group delete');
 await Promise.all([a.goto(`/library/words/${encodeURIComponent(wordId)}`),b.goto(`/library/words/${encodeURIComponent(wordId)}`)]);await a.getByRole('button',{name:'Xóa từ này',exact:true}).click();await a.getByRole('button',{name:'Xác nhận xóa',exact:true}).click();await expect(b.getByText('Không tìm thấy từ này',{exact:true})).toBeVisible({timeout:15000});console.log('PASS hosted automatic word delete');
} catch(error){console.error(error.message.split('\n')[0]);
 for(const context of contexts)for(const page of context.pages())try{console.log('Diagnostic',await page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('words-for-kids.local');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});const rows=await new Promise(resolve=>{const request=db.transaction('metadata').objectStore('metadata').getAll();request.onsuccess=()=>resolve(request.result);});db.close();return rows.filter(row=>row.key.startsWith('account-preferences:')).map(row=>{const state=JSON.parse(row.value);return {pending:state.pending,profile:state.preferences?.profileName};});}));}catch{}
 process.exitCode=1;}

finally {
 await Promise.all(contexts.map(context=>context.close()));await browser?.close();
 if(userId){const result=await admin.auth.admin.deleteUser(userId);if(result.error){console.error('Test-account cleanup failed');process.exitCode=1;}else console.log('PASS disposable-account cleanup');}
}
