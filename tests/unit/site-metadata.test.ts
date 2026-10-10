import {describe,it,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {brandMetadata,publicWelcomeMetadata,siteUrl} from '../../src/lib/site-metadata';
import sitemap from '../../src/app/sitemap';
import robots from '../../src/app/robots';
describe('public SEO and branded assets',()=>{
 it('limits indexing to public welcome and shares only brand content',()=>{
   expect(brandMetadata.robots).toEqual({index:false,follow:false});expect(publicWelcomeMetadata().alternates?.canonical).toBe('/welcome');
   expect(sitemap().map(row=>row.url)).toEqual([`${siteUrl}/welcome`]);expect(JSON.stringify(robots())).toContain('/api/');expect(JSON.stringify(brandMetadata.openGraph)).not.toContain('lesson=');
 });
 it('ships a three-resolution ICO, Apple icon and a 1200×630 preview without opaque black letterboxing',async()=>{
   const ico=await readFile('public/favicon.ico');expect(ico.readUInt16LE(2)).toBe(1);expect(ico.readUInt16LE(4)).toBe(3);expect([6,22,38].map(offset=>ico[offset])).toEqual([16,32,48]);
   const apple=await sharp('public/icons/apple-touch-icon.png').metadata();expect([apple.width,apple.height]).toEqual([180,180]);
   const image=await sharp('public/images/words-for-kids-share.png').metadata();expect([image.width,image.height]).toEqual([1200,630]);
   const pixel=await sharp('public/images/words-for-kids-share.png').extract({left:800,top:125,width:1,height:1}).removeAlpha().raw().toBuffer();expect([...pixel]).toEqual([255,255,255]);
 });
});
