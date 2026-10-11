import {it,expect,vi,beforeEach} from 'vitest';
const state=vi.hoisted(()=>({signedIn:true,fail:false,owner:'60000000-0000-4000-8000-000000000006',library:'70000000-0000-4000-8000-000000000007',eq:vi.fn(),rpc:vi.fn()}));
vi.mock('@/server/cloud/auth',()=>({privateHeaders:{'Cache-Control':'private, no-store'},sameOrigin:(request:Request)=>request.headers.get('origin')==='https://app.test',failure:(status:number,error:string)=>Response.json({error},{status}),authenticated:async()=>state.signedIn?{user:{id:state.owner},client:{from:()=>({select:()=>({eq:(key:string,value:string)=>{state.eq(key,value);return {is:()=>({single:async()=>({data:{id:state.library,preferences:{profileName:'Bé',secret:'never-serialize'}},error:null})})};}})}),rpc:async(name:string,args:unknown)=>{state.rpc(name,args);return state.fail?{data:null,error:{code:'42501'}}:{data:{profileName:'Bé',secret:'never-serialize'},error:null};}}}:null}));
import {GET,POST} from '@/app/api/cloud/preferences/route';
const request=(body:unknown,origin='https://app.test')=>new Request('https://app.test/api/cloud/preferences',{method:'POST',headers:{origin},body:JSON.stringify(body)});
beforeEach(()=>{state.signedIn=true;state.fail=false;state.rpc.mockClear();state.eq.mockClear();});
it('reads only authenticated owner settings and sends strict atomic patches, without returning unknown fields',async()=>{
 const response=await GET();expect(response.headers.get('cache-control')).toContain('no-store');expect(await response.json()).toEqual({ownerId:state.owner,libraryId:state.library,preferences:{profileName:'Bé'}});expect(state.eq).toHaveBeenCalledWith('owner_id',state.owner);
 const saved=await POST(request({libraryId:state.library,patch:{profileName:'Bé'}}));expect(saved.status).toBe(200);expect(state.rpc).toHaveBeenCalledWith('wfk_update_preferences',{target_library:state.library,changes:{profileName:'Bé'}});expect(JSON.stringify(await saved.json())).not.toContain('never-serialize');
});
it('rejects cross-origin, unauthenticated, owner-forcing, secret-bearing and oversized patches before writes; RPC denial stays private',async()=>{
 const valid={libraryId:state.library,patch:{sound:true}};expect((await POST(request(valid,'https://other.test'))).status).toBe(403);state.signedIn=false;expect((await POST(request(valid))).status).toBe(401);state.signedIn=true;
 expect((await POST(request({...valid,ownerId:state.owner}))).status).toBe(400);expect((await POST(request({...valid,patch:{apiKey:'never-send-key'}}))).status).toBe(400);expect((await POST(request({...valid,patch:{profileName:'x'.repeat(2100)}}))).status).toBe(413);expect(state.rpc).not.toHaveBeenCalled();
 state.fail=true;const denied=await POST(request(valid));expect(denied.status).toBe(503);expect(await denied.json()).toEqual({error:'cloud-unavailable'});
});
