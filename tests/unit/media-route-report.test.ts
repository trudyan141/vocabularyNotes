import {beforeEach,it,expect,vi} from 'vitest';
const mocks=vi.hoisted(()=>({search:vi.fn(),origin:vi.fn(()=>true)}));
vi.mock('server-only',()=>({}));
vi.mock('@/server/cloud/auth',()=>({authenticated:async()=>null,sameOrigin:mocks.origin,privateHeaders:{'Cache-Control':'private, no-store'},failure:(status:number,error:string)=>Response.json({error},{status})}));
vi.mock('@/server/env',()=>({getServerEnv:()=>({MEDIA_IMPORT_SIGNING_SECRET:'fixture-secret'})}));
vi.mock('@/server/media/commons',async importOriginal=>({...await importOriginal<typeof import('@/server/media/commons')>(),searchPictures:mocks.search}));
import {mediaRoute} from '@/server/media/route';
const request=()=>new Request('http://localhost/api/media/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({word:'they',sense:'two or more people',consent:true})});
beforeEach(()=>{mocks.search.mockReset();mocks.origin.mockReturnValue(true);});
it('returns source attempts for a valid empty search with HTTP 200',async()=>{
 const report={candidates:[],status:'empty',sources:[{source:'noto',kind:'catalog',state:'empty',count:0,code:'no-match'}]};mocks.search.mockResolvedValue(report);const response=await mediaRoute(request(),'search');expect(response.status).toBe(200);expect(await response.json()).toEqual(report);expect(response.headers.get('Cache-Control')).toContain('no-store');
});
it('returns safe source HTTP diagnostics and HTTP 503 when no source recovers',async()=>{
 mocks.search.mockResolvedValue({candidates:[],status:'unavailable',sources:[{source:'commons',kind:'network',state:'error',count:0,code:'http',httpStatus:503}]});const response=await mediaRoute(request(),'search');expect(response.status).toBe(503);expect(await response.json()).toMatchObject({error:'media-search-unavailable',sources:[{source:'commons',httpStatus:503}]});
});
it('keeps the same-origin boundary and never queries sources when blocked',async()=>{mocks.origin.mockReturnValue(false);expect((await mediaRoute(request(),'search')).status).toBe(403);expect(mocks.search).not.toHaveBeenCalled();});
