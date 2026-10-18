import {test,expect} from '@playwright/test';
test.use({serviceWorkers:'block'});
test('local game starts without a server route request, preserves its URL and reloads the selected session only',async({page})=>{
 await page.route('**/api/auth/status*',r=>r.fulfill({json:{configured:false,user:null}}));
 await page.route('**/api/audio/tts',r=>r.fulfill({status:503,json:{error:'fixture'}}));await page.route('**/api/audio/word',r=>r.fulfill({json:{sample:null}}));
 await page.goto('/practice');await expect(page.locator('.practice-modes').first()).toBeVisible();
 let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);let sessionRsc=0;
 await page.route('**/practice?*',async route=>{const url=new URL(route.request().url());if(url.searchParams.has('_rsc')&&url.searchParams.has('session')){sessionRsc++;await gate;}await route.continue().catch(()=>{});});
 try{
  for(const mode of ['flashcard','picture-word','word-picture','letters','spelling','missing-letters']){
   await page.locator(`.play-tile-${mode}`).click();await expect(page.locator('.game-session')).toBeVisible({timeout:2500});await expect(page).toHaveURL(/session=/);
   expect(sessionRsc).toBe(0);
   if(mode!=='missing-letters'){await page.getByRole('button',{name:'Về chọn trò chơi',exact:true}).click();await expect(page.locator('.practice-modes').first()).toBeVisible();}
  }
 }finally{release();}
 const id=new URL(page.url()).searchParams.get('session');await page.reload();await expect(page.locator('.game-session')).toBeVisible();expect(new URL(page.url()).searchParams.get('session')).toBe(id);
 await page.locator('.main-nav a[href="/library"]').click();await expect(page.locator('.library-list li').first()).toBeVisible();await page.goBack();await expect(page.locator('.game-session')).toBeVisible();expect(new URL(page.url()).searchParams.get('session')).toBe(id);
 await page.getByRole('button',{name:'Về chọn trò chơi',exact:true}).click();await expect(page).not.toHaveURL(/session=/);await expect(page.locator('.practice-modes').first()).toBeVisible();
});
