import {afterEach,it,expect,vi} from 'vitest';
vi.mock('server-only',()=>({}));
import {searchPictures} from '@/server/media/commons';
import * as freeSources from '@/server/media/free-sources';
afterEach(()=>vi.restoreAllMocks());
it('checks only three preferred catalogs and never queries removed providers',async()=>{
 const fetcher=vi.fn();const report=await searchPictures('they','used to refer to two or more people or things',fetcher as unknown as typeof fetch);
 expect(report.candidates.map(row=>row.id.split(':')[0])).toEqual(['noto','twemoji']);expect(report.sources.map(row=>row.source)).toEqual(['noto','twemoji','fluent']);expect(fetcher).not.toHaveBeenCalled();
});
it('one broken catalog does not prevent the other two sources from returning pictures',async()=>{
 const original=freeSources.freePicturesForSource;vi.spyOn(freeSources,'freePicturesForSource').mockImplementation((word,sense,source)=>{if(source==='noto')throw Error('broken catalog');return original(word,sense,source);});
 const report=await searchPictures('apple','a fruit',vi.fn() as unknown as typeof fetch);expect(report.status).toBe('found');expect(report.sources[0]).toMatchObject({source:'noto',state:'error'});expect(report.candidates.map(row=>row.id.split(':')[0])).toEqual(['twemoji','fluent']);
});
it('no match stays empty and does not fetch irrelevant web images for rulers',async()=>{
 const fetcher=vi.fn();const report=await searchPictures('rulers','school measuring tools',fetcher as unknown as typeof fetch);expect(report.status).toBe('empty');expect(report.candidates).toEqual([]);expect(report.sources).toHaveLength(3);expect(report.sources.every(row=>row.state==='empty')).toBe(true);expect(fetcher).not.toHaveBeenCalled();
});
it('catalog errors remain distinct from empty without leaking raw diagnostics',async()=>{
 vi.spyOn(freeSources,'freePicturesForSource').mockImplementation(()=>{throw Error('private provider data');});const report=await searchPictures('abstractness','an abstract concept',vi.fn() as unknown as typeof fetch);expect(report.status).toBe('unavailable');expect(report.sources.every(row=>row.code==='invalid-response')).toBe(true);expect(JSON.stringify(report)).not.toContain('private provider data');
});
