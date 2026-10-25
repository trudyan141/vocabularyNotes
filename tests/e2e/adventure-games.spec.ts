import {test,expect,type Page} from '@playwright/test';
import {adventureGames} from '@/lib/learning/adventure-registry';
import {samplePlayWords} from '@/lib/learning/adventure-samples';
import {categories} from '@/lib/learning/adventure-facts';
const sample=samplePlayWords();
test.use({serviceWorkers:'block'});
test.beforeEach(async({page})=>{await page.route('**/api/auth/status*',r=>r.fulfill({json:{configured:false,user:null}}));await page.route('**/api/audio/tts',r=>r.fulfill({status:503,json:{error:'fixture'}}));await page.route('**/api/audio/word*',r=>r.fulfill({json:{sample:null}}));await page.route('https://**',r=>r.abort());});
const artName=(src:string)=>new URL(src,'http://localhost').pathname.split('/').at(-1)!.replace('.svg','');
async function arts(page:Page,selector:string){return (await page.locator(selector).evaluateAll(images=>images.map(img=>(img as HTMLImageElement).src))).map(artName);}
async function noOverflow(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
async function open(page:Page,label:string){await page.goto('/practice?word=adventure-no-such-word');await page.getByRole('button',{name:label,exact:true}).click();await expect(page.locator('.adventure-board')).toBeVisible();}
test('new games are discoverable on the default hub without opening a filter or disclosure',async({page},info)=>{
 await page.goto('/practice?word=adventure-no-such-word');
 await expect(page.getByRole('button',{name:'Tất cả game',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Game mới',exact:true})).toHaveCount(0);
 await expect(page.locator('.adventure-tile')).toHaveCount(7);
 await expect(page.getByRole('button',{name:'Truyện ba tranh',exact:true})).toHaveCount(0);
 for(const game of adventureGames)await expect(page.getByRole('button',{name:game.vi,exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Thẻ ôn',exact:true})).toBeVisible();
 const firstWordGame=page.locator('section[aria-labelledby="practice-words"] .play-tile').first();
 await expect(firstWordGame).toHaveAttribute('aria-label',adventureGames[0].vi);
 await noOverflow(page);await page.screenshot({path:info.outputPath('default-game-hub.png'),fullPage:true});
 await page.getByRole('button',{name:adventureGames[0].vi,exact:true}).click();
 await expect(page.locator('.adventure-game')).toHaveAttribute('data-game',adventureGames[0].id);
 await page.getByRole('button',{name:'Về chọn trò chơi',exact:true}).click();
 
 await expect(page.locator('.adventure-tile')).toHaveCount(7);


 await expect(page.getByRole('button',{name:'Thẻ ôn',exact:true})).toBeVisible();
});
test('a basket tap grades immediately and a wrong first tap stays wrong after retry',async({page})=>{
 await open(page,'Xếp vào giỏ');
 await expect(page.getByRole('button',{name:'Kiểm tra',exact:true})).toHaveCount(0);
 const [art]=await arts(page,'.adventure-target img.word-art'),word=sample.find(w=>w.art===art)!;
 const baskets=page.locator('.adventure-baskets').getByRole('button'),right=baskets.filter({hasText:categories[word.category!].en}),wrong=baskets.filter({hasNotText:categories[word.category!].en}).first();
 await wrong.click();await expect(page.locator('.grammar-feedback strong[role="status"]')).toHaveText('Mình cùng thử lại nhé!');await expect(right).toBeDisabled();
 await page.getByRole('button',{name:'Thử lại câu này',exact:true}).click();await right.click();await expect(page.locator('.grammar-feedback strong[role="status"]')).toHaveText('Đúng rồi!');await page.getByRole('button',{name:'Câu tiếp theo',exact:true}).click();
 while(await page.getByRole('button',{name:'Bỏ qua',exact:true}).count())await page.getByRole('button',{name:'Bỏ qua',exact:true}).click();
 await expect(page.locator('.adventure-finish p[role="status"]')).toHaveText(/^0 \/ \d+ câu đúng$/);
});
for(const game of adventureGames)test(`${game.id} sample plays by touch, preserves choices and gives accurate feedback`,async({page},info)=>{
 await open(page,game.vi);await expect(page.locator('.dialogue-settings .practice-scope')).toBeHidden();await noOverflow(page);
 if(game.id==='sort-baskets'){
  const [art]=await arts(page,'.adventure-target img.word-art'),word=sample.find(w=>w.art===art)!;await page.locator('.adventure-baskets').getByRole('button').filter({hasText:categories[word.category!].en}).click();
 }else if(game.id==='listen-bingo'){
  const buttons=page.locator('.adventure-bingo>.adventure-picture'),images=await arts(page,'.adventure-bingo img.word-art'),count=await buttons.count();expect(count).toBeGreaterThanOrEqual(4);
  for(let found=0;found<count;found++){const label=await page.locator('.adventure-board>.audio-control>button').getAttribute('aria-label'),text=label!.split(': ').slice(1).join(': '),word=sample.find(w=>w.text===text)!;const index=images.indexOf(word.art);expect(index).toBeGreaterThanOrEqual(0);
   if(found===0){const other=index===0?1:0;await buttons.nth(other).click();await expect(page.locator('.adventure-picture[data-marked="true"]')).toHaveCount(0);}
   await buttons.nth(index).click();await expect(page.locator('.adventure-picture[data-marked="true"]')).toHaveCount(found+1);
  }
 }else if(game.id==='word-detective'){
  const clue=await page.locator('.adventure-clue').innerText(),word=sample.find(w=>w.en===clue)!,images=await arts(page,'.adventure-choices img.word-art');await page.locator('.adventure-choices .adventure-picture').nth(images.indexOf(word.art)).click();
 }else if(game.id==='sound-hunt'){
  const text=await page.locator('.adventure-sound-anchor strong').innerText(),onset=sample.find(w=>w.text===text)!.onset,images=await arts(page,'.adventure-choices img.word-art'),index=images.findIndex(art=>sample.some(w=>w.art===art&&w.onset===onset));expect(index).toBeGreaterThanOrEqual(0);await page.locator('.adventure-choices .adventure-picture').nth(index).click();
 }else if(game.id==='place-object'){
  await expect(page.getByRole('button',{name:'Trên bàn',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Chọn đồ vật',exact:true}).click();const cue=await page.locator('.adventure-board>.audio-control>button').getAttribute('aria-label');await page.getByRole('button',{name:cue!.includes('under the')?'Dưới bàn':cue!.includes('in the')?'Trong hộp':'Trên bàn',exact:true}).click();
 }else if(game.id==='one-many'){
  const count=await page.locator('.adventure-quantity>span').count(),[art]=await arts(page,'.adventure-quantity img.word-art'),word=sample.find(w=>w.art===art)!;await page.locator('.activity-options').getByRole('button',{name:count===1?word.text:word.plural!,exact:true}).click();
 }else if(game.id==='fox-shop'){
  const cue=await page.locator('.adventure-shopkeeper p').innerText(),count=/\bthree\b/i.test(cue)?3:/\btwo\b/i.test(cue)?2:1,word=sample.find(w=>new RegExp(`\\b${w.plural??w.text}\\b|\\b${w.text}\\b`,'i').test(cue))!,images=await arts(page,'.adventure-shop-shelf img.word-art'),button=page.locator('.adventure-shop-shelf>button').nth(images.indexOf(word.art));await button.click();await page.getByRole('button',{name:'Bỏ món 1',exact:true}).click();await expect(page.locator('.adventure-cart-item')).toHaveCount(0);for(let i=0;i<count;i++)await button.click();
 }
 if(game.id==='fox-shop'){
  await page.locator('.dialogue-settings>summary').click();await page.locator('.dialogue-settings>summary').click();await page.getByRole('button',{name:game.id==='fox-shop'?'Giao hàng':'Kiểm tra',exact:true}).click();
 }
 await expect(page.locator('.grammar-feedback strong[role="status"]')).toHaveText('Đúng rồi!');await noOverflow(page);await page.screenshot({path:info.outputPath(`${game.id}.png`),fullPage:true});await page.getByRole('button',{name:'Câu tiếp theo',exact:true}).click();await page.getByRole('button',{name:'Về chọn trò chơi',exact:true}).click();await expect(page.getByRole('heading',{name:'Chơi & học',exact:true})).toBeVisible();
});
test('scene load failure shows retry and recovers without replacing selected content with a sample',async({page})=>{
 let fail=true;await page.route('**/illustrations/adventure-room.webp',r=>fail?r.abort():r.continue());await page.goto('/practice?word=adventure-no-such-word');await page.getByRole('button',{name:'Đặt đúng chỗ',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'Chưa mở được trò chơi'})).toBeVisible();fail=false;await page.getByRole('button',{name:'Thử lại',exact:true}).click();await expect(page.locator('.adventure-place')).toBeVisible();
});

test('Bingo uses exactly the selected deck and keeps sample/progress details out of the child view',async({page},info)=>{
 await page.goto('/library');await expect(page.getByText('apple',{exact:true}).first()).toBeVisible();
 await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open('words-for-kids.local');r.onsuccess=()=>resolve(r.result);});const rows=await new Promise<{scopeId:string;id:string}[]>(resolve=>{const r=db.transaction('senses').objectStore('senses').getAll();r.onsuccess=()=>resolve(r.result);}),scope=rows.find(r=>r.id==='apple')!.scopeId,at=new Date().toISOString();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('decks','readwrite');tx.objectStore('decks').put({scopeId:scope,id:'adventure-selected-four',version:1,createdAt:at,updatedAt:at,deletedAt:null,payload:{deck:{name:'Bốn từ đang chọn',senseIds:['apple','banana','orange','egg']}}});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();});
 await page.goto('/practice?deck=adventure-selected-four');await expect(page.locator('.adventure-tile')).toHaveCount(7);await noOverflow(page);await page.screenshot({path:info.outputPath('adventure-menu.png'),fullPage:true});await page.getByRole('button',{name:'Bingo nghe từ',exact:true}).click();await expect(page.locator('.adventure-bingo>.adventure-picture')).toHaveCount(4);expect((await arts(page,'.adventure-bingo img.word-art')).sort()).toEqual(['apple','banana','egg','orange']);await expect(page.locator('.dialogue-settings .practice-scope')).toBeHidden();await page.locator('.dialogue-settings>summary').click();await expect(page.getByText('Dùng nội dung đã duyệt trong phần đang chọn.',{exact:true})).toBeVisible();
});

test('detective uses the selected edited definitions and pictures instead of its sample clue bank',async({page},info)=>{
 const clues={apple:'A crisp snack picked from an orchard.',book:'An object with printed pages bound together.',cat:'A furry pet that purrs and chases mice.'};
 await page.goto('/library');await expect(page.getByText('apple',{exact:true}).first()).toBeVisible();
 await page.evaluate(async(clues)=>{const db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open('words-for-kids.local');r.onsuccess=()=>resolve(r.result);});const rows=await new Promise<{scopeId:string;id:string;definitionEn:string}[]>(resolve=>{const r=db.transaction('senses').objectStore('senses').getAll();r.onsuccess=()=>resolve(r.result);}),selected=rows.filter(row=>Object.hasOwn(clues,row.id)),scope=selected[0].scopeId,at=new Date().toISOString();if(selected.length!==3)throw Error('Missing isolated fixture words');await new Promise<void>((resolve,reject)=>{const tx=db.transaction(['senses','decks'],'readwrite');for(const row of selected)tx.objectStore('senses').put({...row,definitionEn:clues[row.id as keyof typeof clues]});tx.objectStore('decks').put({scopeId:scope,id:'detective-source-audit',version:1,createdAt:at,updatedAt:at,deletedAt:null,payload:{deck:{name:'Selected source audit',senseIds:selected.map(row=>row.id)}}});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();},clues);
 await page.goto('/practice?deck=detective-source-audit');await page.getByRole('button',{name:'Thám tử từ vựng',exact:true}).click();await expect(page.locator('.adventure-board')).toBeVisible();
 const clue=await page.locator('.adventure-clue').innerText();expect(Object.values(clues)).toContain(clue);const target=Object.entries(clues).find(([,definition])=>definition===clue)![0],pictures=await arts(page,'.adventure-choices img.word-art');expect(pictures.length).toBeGreaterThanOrEqual(2);expect(pictures.every(word=>Object.hasOwn(clues,word))).toBe(true);await expect(page.getByRole('button',{name:'Kiểm tra',exact:true})).toHaveCount(0);
 await page.locator('.adventure-choices .adventure-picture').nth(pictures.indexOf(target)).click();await expect(page.locator('.grammar-feedback strong[role="status"]')).toHaveText('Đúng rồi!');await page.locator('.dialogue-settings>summary').click();await expect(page.getByText('Dùng nội dung đã duyệt trong phần đang chọn.',{exact:true})).toBeVisible();await noOverflow(page);await page.screenshot({path:info.outputPath('detective-selected-source.png'),fullPage:true});
});
