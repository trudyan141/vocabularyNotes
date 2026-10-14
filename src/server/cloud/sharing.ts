import 'server-only';
import {randomBytes} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
import {authenticated,authClient,cloudConfig,failure,privateHeaders,sameOrigin} from './auth';
import {mapOperation} from './map';
import {parseCloudRow} from '@/lib/cloud/contracts';
import {normalizeShareCode,reScope,shareCommandSchema,shareContextSchema,sharedScopeId} from '@/lib/sharing';
const deviceCookie='wfk_share_device',stagingCookie='wfk_share_pairing';
const credential=/^[a-f0-9]{64}$/;
const ownerActions=new Set(['overview','invite','pair','revoke','cancel','device-revoke','accept','inbox','detail']);
export async function handleSharing(request:Request){
 if(!sameOrigin(request))return failure(403,'origin');
 const config=cloudConfig();if(!config)return failure(503,'not-configured');
 try{
  const reader=request.body?.getReader();if(!reader)return failure(400,'invalid-request');
  const chunks:Uint8Array[]=[];let size=0;
  try{for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>2_100_000)return failure(413,'invalid-batch');chunks.push(chunk.value);}}finally{await reader.cancel().catch(()=>{});}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const input=shareCommandSchema.safeParse(JSON.parse(new TextDecoder().decode(bytes)));if(!input.success)return failure(400,'invalid-request');
  const command=input.data,{action}=command;
  const jar=await cookies();
  const anonymous=createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(url,init)=>fetch(url,{...init,cache:'no-store',signal:AbortSignal.timeout(15000)})}});
  const requiresIdentity=ownerActions.has(action)||('kind' in command&&command.kind==='email')||('notificationId' in command&&!!command.notificationId);
  const identity=requiresIdentity?await authenticated():null;
  if(requiresIdentity&&!identity)return failure(401,'signed-out');
  const client=identity?.client??(action==='list'?await authClient():anonymous);
  if(!client)return failure(503,'not-configured');
  const rpc=async(args:Record<string,unknown>,operation=action)=>client.rpc('wfk_share',{action:operation,args});
  const {action:ignored,...fields}=command;void ignored;
  const args:Record<string,unknown>={...fields};
  const device=jar.get(deviceCookie)?.value;
  if(device&&credential.test(device))args.device=device;
  if('code' in command&&command.code)args.code=normalizeShareCode(command.code);
  if(action==='preview'||action==='claim'){
   const staging=jar.get(stagingCookie)?.value;
   const recovered=action==='claim'&&device&&credential.test(device)?device:null;
   args.binding=staging&&credential.test(staging)?staging:recovered??randomBytes(32).toString('hex');
   if(action==='claim'&&!staging&&!recovered)return failure(400,'preview-required');
  }
  if(action==='progress'){
   const result=await rpc(args,'context');if(result.error)throw result.error;
   const ctx=shareContextSchema.parse(result.data);
   const operations=[];
   for(const item of command.items){
    const row=parseCloudRow(item.entity,item.row);
    if(row.scopeId!==sharedScopeId(ctx))return failure(400,'invalid-scope');
    operations.push(await mapOperation(ctx.ownerId,ctx.libraryId,{...item,row:reScope(row,`account:${ctx.ownerId}:${ctx.libraryId}`)}));
   }
   delete args.items;args.operations=operations;
  }
  const {data,error}=await rpc(args);if(error)throw error;
  if(data?.error)return failure([400,403,409,429].includes(data.status)?data.status:429,data.error);
  const cookieOptions={httpOnly:true,sameSite:'lax' as const,secure:new URL(config.appUrl).protocol==='https:',path:'/'};
  if(action==='preview')jar.set(stagingCookie,String(args.binding),{...cookieOptions,maxAge:900});
  if(action==='claim'){
   const context=shareContextSchema.parse(data);
   const remaining=Math.max(0,Math.floor((Date.parse(context.expiresAt!)-Date.now())/1000));
   jar.set(deviceCookie,String(args.binding),{...cookieOptions,maxAge:Math.min(259200,remaining)});
   jar.set(stagingCookie,'',{...cookieOptions,maxAge:0});
  }
  if(action==='end'){jar.set(deviceCookie,'',{...cookieOptions,maxAge:0});jar.set(stagingCookie,'',{...cookieOptions,maxAge:0});}
  return Response.json(data,{headers:privateHeaders});
 }catch(error){
  const message=typeof error==='object'&&error&&'message' in error?String(error.message):'';
  const code=message.match(/share:([a-z-]+)/)?.[1];
  if(code)return failure(['progress-conflict','content-changed'].includes(code)?409:code.startsWith('invalid')||code==='too-many-emails'?400:403,code);
  if(typeof error==='object'&&error&&'code' in error&&['PGRST202','42883','42P01'].includes(String(error.code)))return failure(503,'feature-not-ready');
  return failure(503,'sharing-unavailable');
 }
}
