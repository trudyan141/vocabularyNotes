import {test,expect,type Page} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/api/auth/status',route=>route.fulfill({json:{configured:false,user:null}}));});
async function open(page:Page){await page.goto('/library/words/apple/edit');await page.getByText('Đổi hình',{exact:true}).click();await page.locator('.picture-intake-tools > summary').click();await expect(page.getByRole('button',{name:'Dán ảnh',exact:true})).toBeEnabled();}
async function picture(page:Page){return page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=180;canvas.height=120;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#a8dece';ctx.fillRect(0,0,180,120);return canvas.toDataURL('image/png').split(',')[1];});}
test('drop and keyboard paste use real upload and stage the image until the common Save',async({page},info)=>{
 await open(page);const base64=await picture(page);
 for(const mode of ['drop','paste'] as const){
  if(mode==='paste')await open(page);
  const uploaded=page.waitForResponse(response=>response.url().endsWith('/api/media/upload'));
  await page.evaluate(({mode,base64})=>{const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),file=new File([bytes],'own-picture.png',{type:'image/png'}),data=new DataTransfer();data.items.add(file);const zone=document.querySelector('.picture-image-intake')!;zone.dispatchEvent(mode==='drop'?new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}):new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}));},{mode,base64});
  expect((await uploaded).status()).toBe(200);await expect(page.locator('.staged-picture')).toContainText('Hình đã chọn');
  await expect(page.getByText('Đã chọn hình. Bấm Lưu chỉnh sửa bên dưới để lưu.',{exact:true})).toBeVisible();
 }
 await page.getByRole('button',{name:'Lưu chỉnh sửa',exact:true}).click();await expect(page.getByRole('button',{name:'Đã lưu chỉnh sửa',exact:true})).toBeVisible();
 await page.reload();await expect(page.locator('.staged-picture img')).toHaveAttribute('src',/^data:image\/jpeg;base64,/);
 await page.screenshot({path:info.outputPath('picture-intake-saved.png')});
});
test('mobile paste button reads clipboard image; text paste stays normal and denied clipboard is actionable',async({page},info)=>{
 await open(page);await page.getByText('Dùng ảnh khác',{exact:true}).click();
 const textNotConsumed=await page.getByLabel('Nguồn hình',{exact:true}).evaluate(el=>{const data=new DataTransfer();data.setData('text/plain','https://example.test/image');const event=new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data});el.dispatchEvent(event);return !event.defaultPrevented;});expect(textNotConsumed).toBe(true);
 await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'read',{configurable:true,value:async()=>{throw new DOMException('Denied','NotAllowedError');}}));
 await page.getByRole('button',{name:'Dán ảnh',exact:true}).click();await expect(page.locator('.word-picture-search [role=alert]')).toContainText('Cho phép dán');
 const base64=await picture(page);await page.evaluate(base64=>Object.defineProperty(navigator.clipboard,'read',{configurable:true,value:async()=>[{types:['image/png'],getType:async()=>new Blob([Uint8Array.from(atob(base64),c=>c.charCodeAt(0))],{type:'image/png'})}]}),base64);
 const uploaded=page.waitForResponse(response=>response.url().endsWith('/api/media/upload'));await page.getByRole('button',{name:'Dán ảnh',exact:true}).click();expect((await uploaded).status()).toBe(200);await expect(page.locator('.staged-picture')).toContainText('Hình đã chọn');
 await page.screenshot({path:info.outputPath('picture-intake-paste.png')});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('invalid, multiple and oversized dropped files do not upload; failed upload keeps current image',async({page})=>{
 await open(page);let calls=0;await page.route('**/api/media/upload',route=>{calls++;return route.fulfill({status:503,json:{error:'unavailable'}});});
 const current=await page.locator('.staged-picture img').getAttribute('src');
 for(const mode of ['invalid','multiple','oversize'] as const){
  await page.evaluate(mode=>{const data=new DataTransfer();if(mode==='invalid')data.items.add(new File(['plain text'],'note.txt',{type:'text/plain'}));else if(mode==='oversize')data.items.add(new File([new Uint8Array(4_000_001)],'big.png',{type:'image/png'}));else for(let i=0;i<2;i++)data.items.add(new File(['picture'],'small.png',{type:'image/png'}));document.querySelector('.picture-image-intake')!.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));},mode);
  await expect(page.locator('.word-picture-search [role=alert]')).toContainText(mode==='multiple'?'một ảnh':'4 MB');expect(calls).toBe(0);
 }
 const base64=await picture(page);await page.getByLabel('Chọn hình cho từ',{exact:true}).setInputFiles({name:'own.png',mimeType:'image/png',buffer:Buffer.from(base64,'base64')});await expect(page.locator('.word-picture-search [role=alert]')).toContainText('Chưa lưu được ảnh');expect(calls).toBe(1);await expect(page.locator('.staged-picture img')).toHaveAttribute('src',current!);
});
