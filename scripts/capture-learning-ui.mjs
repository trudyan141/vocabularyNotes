import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const checks=[];
for(const width of [360,1280]){
 const context=await browser.newContext({viewport:{width,height:width===360?800:1000}});const page=await context.newPage();
 for(const [name,url] of [['today','/today'],['detail','/library/words/grapes'],['add','/add'],['practice','/practice'],['notes','/library/words/grapes/notes']]){
  await page.goto('http://127.0.0.1:4317'+url);await page.locator('h1').waitFor();if(name==='detail')await page.getByRole('heading',{name:'grapes',exact:true}).waitFor();if(name==='add'){await page.getByRole('combobox').fill('grap');await page.getByRole('option').filter({hasText:'grapes'}).getByRole('button').click();}if(name==='notes'){await page.getByLabel('Cách minh hoạ').selectOption('word-association');}
  await page.screenshot({path:`docs/evaluations/local-end-to-end/${name}-${width}.png`,fullPage:true});checks.push({name,width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),url:page.url()});
 }
 await page.goto('http://127.0.0.1:4317/practice');await page.getByRole('button',{name:'Nghe từ chọn hình',exact:true}).click();await page.locator('.game-answers button').first().waitFor();await page.screenshot({path:`docs/evaluations/local-end-to-end/game-${width}.png`,fullPage:true});
 await context.close();
}
await browser.close();await writeFile('docs/evaluations/local-end-to-end/layout.json',JSON.stringify(checks,null,2));console.log(checks);
