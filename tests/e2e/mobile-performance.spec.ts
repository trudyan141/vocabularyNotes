import {expect,test} from '@playwright/test';
test.beforeEach(async({page})=>{
 await page.route('**/api/auth/status*',route=>route.fulfill({json:{configured:false,user:null}}));
});
test('navigation gives pending feedback and keeps the shell interactive while a route is delayed',async({page},info)=>{
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/library?*',async route=>{if(new URL(route.request().url()).searchParams.has('_rsc'))await gate;await route.continue().catch(()=>{});});
 const documents:string[]=[];page.on('request',request=>{if(request.isNavigationRequest()&&request.frame()===page.mainFrame())documents.push(request.url());});
 await page.goto('/today');await expect(page.locator('.today-hero h1')).toBeVisible();
 try{
  await page.locator('.main-nav a[href="/library"]').click();
  await expect(page.locator('.main-nav [aria-busy="true"]')).toHaveText('Từ của con');
  await expect(page.locator('.main-nav a[href="/today"]')).toBeVisible();
  await page.screenshot({path:info.outputPath('pending-navigation.png'),fullPage:true});
 }finally{release();}
 await expect(page.locator('.library-list li').first()).toBeVisible();
 expect(documents).toHaveLength(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goBack();await expect(page.locator('.today-hero h1')).toBeVisible();
});
test('fixed navigation reuses its in-flight or ready prefetch on tap',async({page})=>{
 let libraryRequests=0;
 page.on('request',request=>{const url=new URL(request.url());if(url.pathname==='/library'&&url.searchParams.has('_rsc'))libraryRequests++;});
 const prefetched=page.waitForResponse(response=>{const url=new URL(response.url());const headers=response.request().headers();return url.pathname==='/library'&&url.searchParams.has('_rsc')&&!!headers['next-router-state-tree']&&!headers['next-router-segment-prefetch'];});
 await page.goto('/today');await expect(page.locator('.today-hero h1')).toBeVisible();
 // Next's dynamic RSC stream may intentionally remain open until navigation.
 // Wait for the full-route request, not the preliminary /_tree discovery stream.
 const response=await prefetched;expect(response.ok()).toBe(true);
 const before=libraryRequests;await page.locator('.main-nav a[href="/library"]').click();
 await expect(page.locator('.library-list li').first()).toBeVisible();expect(libraryRequests).toBe(before);
});
