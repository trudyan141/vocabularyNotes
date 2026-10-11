import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {getServerEnv} from '@/server/env';
export const privateHeaders={'Cache-Control':'private, no-store, max-age=0','Pragma':'no-cache','Vary':'Cookie'};
export function cloudConfig(){const env=getServerEnv();return env.NEXT_PUBLIC_SUPABASE_URL&&env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?{url:env.NEXT_PUBLIC_SUPABASE_URL,key:env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,appUrl:env.NEXT_PUBLIC_APP_URL}:null;}
export async function authClient(){const config=cloudConfig();if(!config)return null;const jar=await cookies();return createServerClient(config.url,config.key,{cookieOptions:{httpOnly:true,sameSite:'lax',secure:new URL(config.appUrl).protocol==='https:',path:'/'},cookies:{getAll:()=>jar.getAll(),setAll:items=>{for(const {name,value,options} of items)jar.set(name,value,options);}},global:{fetch:(url,init)=>fetch(url,{...init,signal:AbortSignal.timeout(10000),cache:'no-store'})}});}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');try{const target=new URL(request.url);target.host=request.headers.get('host')??target.host;return origin===target.origin&&request.headers.get('sec-fetch-site')!=='cross-site';}catch{return false;}}
export function failure(status:number,code:string){return Response.json({error:code},{status,headers:privateHeaders});}
export async function authenticated(){const client=await authClient();if(!client)return null;const {data,error}=await client.auth.getUser();if(error&&(error.status===0||(error.status??0)>=500||error.name==='AuthRetryableFetchError'))throw new Error('auth-unavailable');return !error&&data.user?{client,user:data.user}:null;}
