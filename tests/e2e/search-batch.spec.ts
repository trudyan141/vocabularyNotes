import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const pear={literal:'pear',word:'pear',vi:'quả lê',en:'A fruit.',pos:'noun',sense:'fruit',example:'I eat a pear.',exampleVi:'Con ăn quả lê.',exampleIpa:'/aɪ it ə pɛɹ/'};
function chunkAnswer(body:{contents:{parts:{text?:string;inlineData?:unknown}[]}[]}){
 if(body.contents[0].parts.some(part=>part.inlineData))return answer({text:'pear',warnings:[],words:[{literal:'pear',word:'pear'}],truncated:false});
 const input=JSON.parse(body.contents[0].parts[0].text!);return answer(input.words[0]?.literal?{words:[pear]}:{learning:[]});
}
function answer(value:unknown){return {candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}]};}
async function inputPhotos(page:Page,extra?:{name:string;mimeType:string;buffer:Buffer}){
 const buffer=await readFile('docs/evaluations/t00/images/01-fruit.png');
 const input=page.getByRole('tabpanel',{name:'Chọn ảnh',exact:true}).getByLabel('Chọn ảnh từ máy',{exact:true});await expect(input).toBeEnabled();await input.setInputFiles([{name:'one.png',mimeType:'image/png',buffer},extra??{name:'two.png',mimeType:'image/png',buffer}]);
}
async function snapshot(page:Page){return page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('words-for-kids.local');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const read=(name:string)=>new Promise<Record<string,unknown>[]>(resolve=>{const r=db.transaction(name).objectStore(name).getAll();r.onsuccess=()=>resolve(r.result);});const images=await read('captureDrafts'),drafts=await read('learningDrafts'),lessons=await read('lessons');db.close();return {images,drafts,lessons};});}
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('wfk-parent-ai-v1',JSON.stringify({key:'AIza-fixture-batch-not-a-real-key-12345',model:'gemini-3.5-flash-lite'})));
 await page.route('**/api/auth/status*',route=>route.fulfill({json:{configured:false,user:null}}));
 await page.route('**/api/illustrations?**',route=>route.fulfill({json:{result:null}}));
 await page.route('https://generativelanguage.googleapis.com/**',route=>route.abort());
});
test('word list groups senses; are matches only the headword and visibly highlights it',async({page},info)=>{
 await page.goto('/library');await expect(page.locator('.library-list li')).toHaveCount(19);
 await page.evaluate(async()=>{
  const db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open('words-for-kids.local');r.onsuccess=()=>resolve(r.result);});
  await new Promise<void>((resolve,reject)=>{const tx=db.transaction(['entries','senses','searchIndex'],'readwrite');const request=tx.objectStore('senses').getAll();request.onsuccess=()=>{const apple=request.result.find(row=>row.id==='apple');const entryRequest=tx.objectStore('entries').get([apple.scopeId,apple.entryId]);entryRequest.onsuccess=()=>{const entry=entryRequest.result;tx.objectStore('senses').put({...apple,id:'apple-other-sense',senseLabel:'company',identity:'["noun","company"]',meaningVi:'công ty Apple',definitionEn:'A company.'});tx.objectStore('searchIndex').put({scopeId:apple.scopeId,id:'apple-other-sense',terms:'apple company are',lessonIds:['food'],art:apple.art,approval:true,ordinal:'z'});tx.objectStore('entries').put({...entry,id:'entry-are',displayText:'are',canonicalKey:'are',activeKey:'are'});tx.objectStore('senses').put({...apple,id:'sense-are',entryId:'entry-are',art:null,meaningVi:'là',definitionEn:'A form of be.',senseLabel:'be',identity:'["verb","be"]',pos:'verb'});tx.objectStore('searchIndex').put({scopeId:apple.scopeId,id:'sense-are',terms:'are là',lessonIds:[],art:null,approval:true,ordinal:'zz'});};};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
 });
 await page.reload();await expect(page.locator('.library-list li')).toHaveCount(20);
 await page.getByRole('searchbox').fill('apple');await expect(page.locator('.library-list li')).toHaveCount(1);await expect(page.locator('.library-senses')).toHaveCount(0);await expect(page.locator('.library-list li')).not.toContainText('2 nghĩa');
 await page.getByRole('searchbox').fill('are');await expect(page.locator('.library-list li')).toHaveCount(1);await expect(page.locator('.library-list strong')).toHaveText('are');await expect(page.locator('.library-list mark')).toHaveText('are');
 await page.screenshot({path:info.outputPath('search.png'),fullPage:true});
 await page.getByRole('searchbox').fill('not-in-library');await expect(page.getByText('Không có từ phù hợp',{exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('all photos precede one analysis button; all scans precede shared meanings, reload and one save',async({page},info)=>{
 let calls=0,active=0,max=0;const stages:string[]=[];await page.route('https://generativelanguage.googleapis.com/**',async route=>{calls++;active++;max=Math.max(max,active);const body=route.request().postDataJSON();stages.push(body.contents[0].parts.some((part:{inlineData?:unknown})=>part.inlineData)?'scan':JSON.parse(body.contents[0].parts[0].text).words[0]?.literal?'meanings':'grammar');await route.fulfill({json:chunkAnswer(body)});active--;});
 await page.goto('/capture');await inputPhotos(page);await expect(page).toHaveURL(/\/capture\/batch\//);await expect(page.locator('.batch-photo-row')).toHaveCount(2);expect(calls).toBe(0);
 await expect(page.getByRole('link',{name:'Duyệt kết quả',exact:true})).toHaveCount(0);
 await page.locator('.batch-photo-row').first().getByRole('link',{name:'Chỉnh ảnh',exact:true}).click();await page.getByRole('button',{name:'Xoay 90°'}).click();await page.getByRole('button',{name:'Giữ ảnh và về đợt ảnh'}).click();await expect(page.locator('.batch-photo-row')).toHaveCount(2);
 const button=page.getByRole('button',{name:'Phân tích 2 ảnh',exact:true});const last=await page.locator('.batch-photo-row').last().boundingBox();const target=await button.boundingBox();expect(target!.y).toBeGreaterThan(last!.y+last!.height);
 await button.click();await expect(page.getByRole('button',{name:'Đã phân tích · thử lại'})).toBeEnabled();await expect(page.locator('.review-word > summary')).toHaveCount(1);expect(calls).toBe(4);expect(max).toBe(1);expect(stages).toEqual(['scan','scan','meanings','grammar']);
 expect((await snapshot(page)).lessons.filter(lesson=>lesson.sourceType==='image')).toHaveLength(0);
 await page.reload();await expect(page.locator('.review-word > summary')).toHaveCount(1);expect(calls).toBe(4);
 await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);});await page.screenshot({path:info.outputPath('merged-photos.png'),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Duyệt và lưu các từ đã chọn'}).click();await expect(page).toHaveURL(/\/library\?lesson=ocr-batch/);expect((await snapshot(page)).lessons.filter(lesson=>lesson.sourceType==='image')).toHaveLength(1);expect(calls).toBe(4);
 await page.getByRole('searchbox').fill('pear');await expect(page.locator('.library-list li')).toHaveCount(1);
});
test('quota during scan keeps raw source and blocks save; reload resumes scans then common enrichment',async({page})=>{
 let pictureCalls=0;await page.route('**/api/media/web-search',route=>{pictureCalls++;return route.fulfill({json:{results:[]}});});await page.route('**/api/media/search',route=>route.fulfill({json:{candidates:[]}}));
 let calls=0;await page.route('https://generativelanguage.googleapis.com/**',async route=>{calls++;if(calls===2)await route.fulfill({status:429,json:{error:{status:'RESOURCE_EXHAUSTED',message:'fixture quota'}}});else await route.fulfill({json:chunkAnswer(route.request().postDataJSON())});});
 await page.goto('/capture');await inputPhotos(page);await page.getByRole('button',{name:'Phân tích 2 ảnh',exact:true}).click();await expect(page.locator('#main').getByRole('alert').first()).toContainText('hết lượt');await expect(page.getByRole('button',{name:'Duyệt và lưu các từ đã chọn'})).toBeDisabled();
 await page.waitForTimeout(600);expect(pictureCalls).toBe(0);await page.reload();await page.getByRole('button',{name:'Tiếp tục phân tích',exact:true}).click();await expect(page.getByRole('button',{name:'Đã phân tích · thử lại'})).toBeEnabled();await expect(page.locator('.review-word > summary')).toHaveCount(1);expect(calls).toBe(5);
});
test('stop during second scan preserves first source and one common review resumes',async({page})=>{
 let calls=0;await page.route('https://generativelanguage.googleapis.com/**',async route=>{calls++;if(calls===2)return;await route.fulfill({json:chunkAnswer(route.request().postDataJSON())});});
 await page.goto('/capture');await inputPhotos(page);await page.getByRole('button',{name:'Phân tích 2 ảnh',exact:true}).click();await expect.poll(()=>calls).toBe(2);await page.getByRole('button',{name:'Dừng',exact:true}).click();await expect(page.getByText('Đã dừng; nháp vẫn còn.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Duyệt và lưu các từ đã chọn'})).toBeDisabled();await page.getByRole('button',{name:'Tiếp tục phân tích',exact:true}).click();await expect(page.getByRole('button',{name:'Đã phân tích · thử lại'})).toBeEnabled();await expect(page.locator('.review-word > summary')).toHaveCount(1);expect(calls).toBe(5);
});
test('invalid photo reports its name and retains valid photos for retry, with no automatic upload',async({page})=>{
 let calls=0;page.on('request',request=>{if(request.url().includes('generativelanguage'))calls++;});await page.goto('/capture');await inputPhotos(page,{name:'broken.png',mimeType:'image/png',buffer:Buffer.from('invalid')});await expect(page.locator('#main').getByRole('alert')).toContainText('broken.png');await page.getByRole('link',{name:'Xem các ảnh đã thêm'}).click();await expect(page.locator('.batch-photo-row')).toHaveCount(1);expect(calls).toBe(0);
 await page.getByRole('button',{name:'Xóa nháp ảnh 1'}).click();await page.getByRole('button',{name:'Xóa nháp ảnh 1'}).click();await expect(page.getByText('Đợt này không còn ảnh',{exact:true})).toBeVisible();expect((await snapshot(page)).images).toHaveLength(0);
});
test('paste repeatedly from single editor into the same batch, preserving crop and title without sending AI',async({page},info)=>{
 let calls=0;page.on('request',request=>{if(request.url().includes('generativelanguage'))calls++;});await page.goto('/capture');await expect(page.getByRole('button',{name:'Chọn ảnh từ máy',exact:true})).toBeEnabled();const bytes=Array.from(await readFile('docs/evaluations/t00/images/01-fruit.png'));
 const pastePhoto=()=>page.evaluate(bytes=>{const data=new DataTransfer();data.items.add(new File([new Uint8Array(bytes)],'pasted.png',{type:'image/png'}));document.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));},bytes);
 await pastePhoto();await expect(page).toHaveURL(/\/edit$/);await page.getByLabel('Tên bài (tùy chọn)').fill('Giữ tên bài này');await page.getByRole('button',{name:'Xoay 90°'}).click();await expect(page.getByRole('button',{name:'Dán thêm ảnh',exact:true})).toBeEnabled();
 await pastePhoto();await expect(page).toHaveURL(/\/capture\/batch\//);await expect(page.locator('.batch-photo-row')).toHaveCount(2);const batchUrl=page.url();
 await pastePhoto();await expect(page.locator('.batch-photo-row')).toHaveCount(3);expect(page.url()).toBe(batchUrl);
 const saved=await snapshot(page);expect(saved.images).toHaveLength(3);expect(new Set(saved.images.map(image=>image.batchId)).size).toBe(1);const original=saved.images.find(image=>image.title==='Giữ tên bài này')!;expect((original.transform as {rotation:number}).rotation).toBe(90);expect(calls).toBe(0);
 await page.reload();await expect(page.locator('.batch-photo-row')).toHaveCount(3);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:info.outputPath('pasted-three-photos.png'),fullPage:true});
});
test('Paste another photo button works in the editor and text paste remains normal',async({page})=>{
 await page.goto('/capture');const bytes=Array.from(await readFile('docs/evaluations/t00/images/01-fruit.png'));const input=page.getByRole('tabpanel',{name:'Chọn ảnh',exact:true}).getByLabel('Chọn ảnh từ máy',{exact:true});await expect(input).toBeEnabled();await input.setInputFiles({name:'first.png',mimeType:'image/png',buffer:Buffer.from(bytes)});await expect(page).toHaveURL(/\/edit$/);
 const prevented=await page.evaluate(()=>{const data=new DataTransfer();data.setData('text/plain','a normal title');const event=new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true});document.getElementById('draft-title')!.dispatchEvent(event);return event.defaultPrevented;});expect(prevented).toBe(false);
 await page.evaluate(bytes=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{read:async()=>[{types:['image/png'],getType:async()=>new Blob([new Uint8Array(bytes)],{type:'image/png'})}]}});},bytes);
 await page.getByRole('button',{name:'Dán thêm ảnh',exact:true}).click();await expect(page).toHaveURL(/\/capture\/batch\//);await expect(page.locator('.batch-photo-row')).toHaveCount(2);await page.getByRole('button',{name:'Dán thêm ảnh',exact:true}).click();await expect(page.locator('.batch-photo-row')).toHaveCount(3);
});
test('body-part photos repair a malformed scan and keep wrapped phrases through one review and save',async({page})=>{
 const labels=[['four fingers','two feet','two legs','one mouth'],['one mouth','two ears','two hands','two legs','two arms','two feet']];
 let scans=0;const stages:string[]=[];
 await page.route('https://generativelanguage.googleapis.com/**',async route=>{
  const body=route.request().postDataJSON();
  if(body.contents[0].parts.some((part:{inlineData?:unknown})=>part.inlineData)){
   stages.push('scan');const index=scans++===0?0:1;
   const value={text:labels[index].join('\n').replace('four fingers','four\nfingers').replace('two feet','two   feet'),warnings:[],words:labels[index].map(word=>({word,literal:word})),truncated:false};
   if(scans===2){const {truncated,...invalid}=value;void truncated;await route.fulfill({json:answer(invalid)});}else await route.fulfill({json:answer(value)});return;
  }
  const input=JSON.parse(body.contents[0].parts[0].text);stages.push(input.words[0]?.literal?'meanings':'grammar');
  await route.fulfill({json:answer(input.words[0]?.literal?{words:input.words.map((item:{word:string})=>({...pear,word:item.word,literal:item.word,example:`I see ${item.word}.`,exampleIpa:null}))}:{learning:[]})});
 });
 await page.goto('/capture');await inputPhotos(page);await page.getByRole('button',{name:'Phân tích 2 ảnh',exact:true}).click();
 await expect(page.getByRole('button',{name:'Đã phân tích · thử lại'})).toBeEnabled();await expect(page.locator('.review-word > summary')).toHaveCount(7);
 expect(stages).toEqual(['scan','scan','scan','meanings','meanings','grammar','grammar']);await expect(page.getByRole('button',{name:'Duyệt và lưu các từ đã chọn'})).toBeEnabled();
 await page.reload();await expect(page.locator('.review-word > summary')).toHaveCount(7);expect(scans).toBe(3);
 await page.getByRole('button',{name:'Duyệt và lưu các từ đã chọn'}).click();await expect(page).toHaveURL(/\/library\?lesson=ocr-batch/);
 expect((await snapshot(page)).lessons.filter(lesson=>lesson.sourceType==='image')).toHaveLength(1);await expect(page.locator('.library-list li')).toHaveCount(7);
});
test('four shape slides accept punctuated phrases and numeric labels, preserve context and save one lesson',async({page},info)=>{
 const pictureBodies:{word:string;sense:string}[]=[];await page.route('**/api/media/web-search',route=>{pictureBodies.push(route.request().postDataJSON());return route.fulfill({json:{results:[]}});});await page.route('**/api/media/search',route=>route.fulfill({json:{candidates:[]}}));
 const slides=[{text:"Let's count the number\nof sides...",words:[{literal:'sides',word:'sides'}]},{text:'It has three sides.',words:[{literal:'sides',word:'sides'}]},{text:"Let's count!\n1\n2\n3",words:[{literal:"Let's count!",word:'count'},...['1','2','3'].map(word=>({literal:word,word}))]},{text:'How many sides does a\ntriangle have?',words:[{literal:'sides',word:'sides'},{literal:'triangle',word:'triangle'}]}];
 let scans=0;const stages:string[]=[];
 await page.route('https://generativelanguage.googleapis.com/**',async route=>{const body=route.request().postDataJSON();if(body.contents[0].parts.some((part:{inlineData?:unknown})=>part.inlineData)){stages.push('scan');await route.fulfill({json:answer({...slides[scans++],warnings:[],truncated:false})});return;}expect(scans).toBe(4);const input=JSON.parse(body.contents[0].parts[0].text);if(input.words[0]?.literal){stages.push('meanings');expect(input.words.find((word:{word:string})=>word.word==='sides').context).toContain('triangle');await route.fulfill({json:answer({words:input.words.map((item:{word:string})=>({...pear,word:item.word,literal:item.word,vi:item.word==='sides'?'các cạnh của hình':'hình và đếm',en:'A part of a shape.',sense:'shape',example:`I see ${item.word}.`,exampleIpa:null}))})});}else{stages.push('grammar');await route.fulfill({json:answer({learning:[]})});}});
 await page.goto('/capture');const buffer=await readFile('docs/evaluations/t00/images/01-fruit.png');const input=page.getByRole('tabpanel',{name:'Chọn ảnh',exact:true}).getByLabel('Chọn ảnh từ máy',{exact:true});await expect(input).toBeEnabled();await input.setInputFiles(Array.from({length:4},(_,i)=>({name:`shape-${i}.png`,mimeType:'image/png',buffer})));
 await page.getByRole('button',{name:'Phân tích 4 ảnh',exact:true}).click();await expect(page.getByRole('button',{name:'Đã phân tích · thử lại'})).toBeEnabled();await expect(page.locator('.review-word > summary')).toHaveCount(3);await expect(page.locator('.review-word > summary').first()).toContainText('các cạnh của hình');expect(stages).toEqual(['scan','scan','scan','scan','meanings','grammar','grammar','grammar','grammar']);
 await expect.poll(()=>pictureBodies.length).toBeGreaterThan(0);expect(pictureBodies.every(body=>body.sense==='A part of a shape.')).toBe(true);await page.getByText('Sửa chữ đọc được',{exact:true}).click();await expect(page.locator('#ocr-text')).toHaveValue(slides.map(slide=>slide.text).join('\n\n'));await page.screenshot({path:info.outputPath('four-shapes-review.png'),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.reload();await expect(page.locator('.review-word > summary')).toHaveCount(3);expect(scans).toBe(4);await page.getByRole('button',{name:'Duyệt và lưu các từ đã chọn'}).click();await expect(page).toHaveURL(/\/library\?lesson=ocr-batch/);expect((await snapshot(page)).lessons.filter(lesson=>lesson.sourceType==='image')).toHaveLength(1);await expect(page.locator('.library-list li')).toHaveCount(3);
});
