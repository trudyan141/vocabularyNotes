import {test,expect} from '@playwright/test';
import sharp from 'sharp';
test('public SSR metadata, social preview, robots and favicon work without accessing private lessons',async({page})=>{
 const response=await page.request.get('/welcome',{headers:{'User-Agent':'facebookexternalhit/1.1'}});expect(response.ok()).toBe(true);const html=await response.text();
 expect(html).toContain('property="og:image" content="https://words-for-kids.vercel.app/images/words-for-kids-share.png"');expect(html).toContain('name="twitter:card" content="summary_large_image"');expect(html).toContain('name="robots" content="index, follow"');expect(html).toContain('rel="canonical" href="https://words-for-kids.vercel.app/welcome"');expect(html).toContain('application/ld+json');
 await page.goto('/today');await expect(page.locator('head meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');await expect(page).toHaveTitle('Hôm nay | Words for Kids');
 const image=await page.request.get('/images/words-for-kids-share.png');expect(image.headers()['content-type']).toContain('image/png');const metadata=await sharp(await image.body()).metadata();expect([metadata.width,metadata.height]).toEqual([1200,630]);
 const favicon=await page.request.get('/favicon.ico');expect(favicon.ok()).toBe(true);expect((await favicon.body()).readUInt16LE(4)).toBe(3);
 const robot=await page.request.get('/robots.txt');expect(await robot.text()).toContain('Disallow: /api/');const map=await page.request.get('/sitemap.xml');const xml=await map.text();expect(xml).toContain('https://words-for-kids.vercel.app/welcome');expect(xml).not.toContain('/library');
});
