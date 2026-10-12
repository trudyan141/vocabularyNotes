import {afterEach,it,expect,vi} from 'vitest';
vi.mock('server-only',()=>({}));
import {searchPictures} from '@/server/media/commons';
import * as freeSources from '@/server/media/free-sources';
afterEach(()=>vi.restoreAllMocks());
const page={pageid:1,title:'File:Violin illustration.png',imageinfo:[{sha1:'a'.repeat(40),descriptionurl:'https://commons.wikimedia.org/wiki/File:Violin_illustration.png',thumburl:'https://upload.wikimedia.org/violin.png',thumbmime:'image/png',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},Artist:{value:'Artist'},ImageDescription:{value:'Violin illustration'}}}]};
it('checks preferred catalogs in order and falls back through empty sources for they as plural people',async()=>{
 const fetcher=vi.fn();const report=await searchPictures('they','used to refer to two or more people or things',fetcher as unknown as typeof fetch);
 expect(report.candidates.map(row=>row.id.split(':')[0])).toEqual(['noto','twemoji']);expect(report.sources.map(row=>row.source)).toEqual(['noto','twemoji','fluent','openmoji']);expect(report.sources.find(row=>row.source==='fluent')?.state).toBe('empty');expect(fetcher).not.toHaveBeenCalled();
});
it('one broken catalog does not prevent trying the other preferred sources',async()=>{
 const original=freeSources.freePicturesForSource;vi.spyOn(freeSources,'freePicturesForSource').mockImplementation((word,sense,source)=>{if(source==='noto')throw Error('broken catalog');return original(word,sense,source);});
 const report=await searchPictures('apple','a fruit',vi.fn() as unknown as typeof fetch);expect(report.status).toBe('found');expect(report.sources[0]).toMatchObject({source:'noto',state:'error'});expect(report.candidates.some(row=>row.id.startsWith('twemoji:'))).toBe(true);expect(report.candidates.some(row=>row.id.startsWith('fluent:'))).toBe(true);
});
it('tries the next search when an earlier Commons query returns empty',async()=>{
 let calls=0;const fetcher=vi.fn(async()=>++calls===1?Response.json({query:{pages:{}}}):Response.json({query:{pages:{1:page}}}));
 const report=await searchPictures('violin','a musical instrument',fetcher as typeof fetch,true);expect(report.status).toBe('found');expect(report.sources.map(row=>row.state)).toEqual(['empty','found']);expect(calls).toBe(2);
});
it('continues after HTTP failure and returns source, safe status and surviving candidates',async()=>{
 let calls=0;const report=await searchPictures('violin','an instrument',async()=>++calls===1?new Response('private provider payload',{status:503}):Response.json({query:{pages:{1:page}}}),true);
 expect(report.status).toBe('found');expect(report.sources[0]).toMatchObject({source:'commons',state:'error',code:'http',httpStatus:503});expect(JSON.stringify(report)).not.toContain('private provider payload');expect(report.candidates).toHaveLength(1);
});
it('separates valid zero matches from upstream errors carried inside HTTP 200',async()=>{
 const empty=await searchPictures('abstractness','an abstract concept',async()=>Response.json({query:{pages:{}}}));expect(empty.status).toBe('empty');expect(empty.sources).toHaveLength(6);expect(empty.sources.every(row=>row.state==='empty')).toBe(true);
 const failed=await searchPictures('abstractness','an abstract concept',async()=>Response.json({error:{code:'internal',info:'secret details'}}));expect(failed.status).toBe('unavailable');expect(failed.sources.slice(-2).every(row=>row.code==='provider-error')).toBe(true);expect(JSON.stringify(failed)).not.toContain('secret details');
});
it('reports filtered licenses and keeps searching instead of accepting an unsafe result',async()=>{
 let calls=0;const bad={...page,imageinfo:[{...page.imageinfo[0],extmetadata:{...page.imageinfo[0].extmetadata,LicenseShortName:{value:'All rights reserved'}}}]};const report=await searchPictures('violin','an instrument',async()=>Response.json({query:{pages:{1:++calls===1?bad:page}}}),true);expect(report.sources[0]).toMatchObject({state:'empty',code:'filtered'});expect(report.candidates[0].license).toBe('CC BY 4.0');
});
it('classifies malformed JSON and network timeout by source without caching false success',async()=>{
 const malformed=await searchPictures('violin','an instrument',async()=>new Response('<html>private error page</html>'),true);expect(malformed.status).toBe('unavailable');expect(malformed.sources.every(row=>row.code==='invalid-response')).toBe(true);
 const timeout=await searchPictures('violin','an instrument',async()=>{throw new DOMException('Timed out','TimeoutError');},true);expect(timeout.sources.every(row=>row.code==='timeout')).toBe(true);
});
