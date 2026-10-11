import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';

const fixture=vi.hoisted(()=>({jar:new Map<string,string>(),writes:[] as {name:string;value:string;options:Record<string,unknown>}[]}));
vi.mock('server-only',()=>({}));
vi.mock('next/headers',()=>({cookies:async()=>({getAll:()=>[...fixture.jar].map(([name,value])=>({name,value})),set:(name:string,value:string,options:Record<string,unknown>)=>{fixture.writes.push({name,value,options});if(options.maxAge===0)fixture.jar.delete(name);else fixture.jar.set(name,value);}})}));
vi.mock('@/server/env',()=>({getServerEnv:()=>({NEXT_PUBLIC_SUPABASE_URL:'https://fixture.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'public-session-fixture',NEXT_PUBLIC_APP_URL:'https://words.example.test'})}));
import {authClient,authenticated} from '@/server/cloud/auth';
import {GET} from '@/app/api/auth/status/route';
import {POST as logout} from '@/app/api/auth/logout/route';
const user={id:'8c42f18b-2723-4bb6-9a15-7d67a0602a0d',aud:'authenticated',email:'session@example.test',user_metadata:{name:'Session fixture'},app_metadata:{},created_at:'2026-10-11T00:00:00Z'};
const cookieName='sb-fixture-auth-token';
function session(expired=false){const expires_at=Math.floor(Date.now()/1000)+(expired?-120:3600);const header=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),payload=Buffer.from(JSON.stringify({sub:user.id,aud:'authenticated',exp:expires_at})).toString('base64url');return {access_token:`${header}.${payload}.${Buffer.from('fixture-only-signature').toString('base64url')}`,refresh_token:'refresh-session-fixture',expires_at,expires_in:3600,token_type:'bearer',user};}
function seed(expired=false){fixture.jar.set(cookieName,`base64-${Buffer.from(JSON.stringify(session(expired))).toString('base64url')}`);}
const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
beforeEach(()=>{fixture.jar.clear();fixture.writes.length=0;});
afterEach(()=>vi.unstubAllGlobals());
describe('server cookie login session persistence using the installed Supabase SDK',()=>{
 it('writes persistent HttpOnly cookies and restores the user in a fresh request client',async()=>{
  const network=vi.fn(async(url:RequestInfo|URL)=>{expect(String(url)).toContain('/auth/v1/user');return response(user);});vi.stubGlobal('fetch',network);
  const client=(await authClient())!;const initial=session();const result=await client.auth.setSession({access_token:initial.access_token,refresh_token:initial.refresh_token});expect(result.error).toBeNull();
  const cookie=fixture.writes.find(item=>item.name===cookieName)!;expect(cookie.options).toMatchObject({httpOnly:true,secure:true,sameSite:'lax',path:'/'});expect(cookie.options.maxAge).toBeGreaterThan(86400);
  // Recreate the server client, retaining only the browser's persisted cookie jar.
  const restored=await authenticated();expect(restored?.user.id).toBe(user.id);expect(network.mock.calls.every(call=>String(call[0]).endsWith('/auth/v1/user'))).toBe(true);
 });
 it('refreshes an expired access token, rotates the cookie and restores it on the next request',async()=>{
  seed(true);const refreshed={...session(),refresh_token:'rotated-refresh-fixture'};const network=vi.fn(async(url:RequestInfo|URL)=>String(url).includes('/auth/v1/token')?response(refreshed):response(user));vi.stubGlobal('fetch',network);
  expect((await authenticated())?.user.id).toBe(user.id);expect(network.mock.calls.filter(call=>String(call[0]).includes('/auth/v1/token'))).toHaveLength(1);expect(fixture.writes.some(item=>item.name===cookieName&&Number(item.options.maxAge)>0)).toBe(true);
  const saved=JSON.parse(Buffer.from(fixture.jar.get(cookieName)!.slice(7),'base64url').toString());expect(saved.refresh_token).toBe('rotated-refresh-fixture');
  expect((await authenticated())?.user.id).toBe(user.id);expect(network.mock.calls.filter(call=>String(call[0]).includes('/auth/v1/token'))).toHaveLength(1);
 });
 it('clears a revoked refresh session and returns signed out without exposing token values',async()=>{
  seed(true);vi.stubGlobal('fetch',vi.fn(async()=>response({code:'refresh_token_not_found',msg:'Session revoked'},400)));
  const result=await GET(new Request('https://words.example.test/api/auth/status'));expect(result.status).toBe(200);expect(await result.json()).toEqual({configured:true,user:null});expect(fixture.jar.has(cookieName)).toBe(false);expect(result.headers.get('cache-control')).toContain('no-store');
 });
 it('keeps a saved session during temporary network failure and restores it after reconnect',async()=>{
  seed();const persisted=fixture.jar.get(cookieName);vi.stubGlobal('fetch',vi.fn(async()=>response({message:'Temporarily unavailable'},503)));
  expect(await authenticated()).toBeNull();expect(fixture.jar.get(cookieName)).toBe(persisted);
  vi.stubGlobal('fetch',vi.fn(async()=>response(user)));expect((await authenticated())?.user.id).toBe(user.id);
 });
 it('sign out clears cookies so reopening requires login, and cross-origin logout is rejected',async()=>{
  seed();const network=vi.fn(async(url:RequestInfo|URL)=>String(url).includes('/auth/v1/logout')?new Response(null,{status:204}):response(user));vi.stubGlobal('fetch',network);
  const foreign=await logout(new Request('https://words.example.test/api/auth/logout',{method:'POST',headers:{origin:'https://foreign.example.test'}}));expect(foreign.status).toBe(403);expect(fixture.jar.has(cookieName)).toBe(true);
  const result=await logout(new Request('https://words.example.test/api/auth/logout',{method:'POST',headers:{origin:'https://words.example.test'}}));expect(result.status).toBe(200);expect(fixture.jar.has(cookieName)).toBe(false);expect(await authenticated()).toBeNull();
 });
});
