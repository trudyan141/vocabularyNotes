import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
const credential=z.object({url:z.url(),key:z.string().min(1),ownerId:z.uuid(),libraryId:z.uuid(),accessToken:z.string().min(1),expiresAt:z.number().positive()}).strict();
/** Notifications carry no lesson content. Authenticated cursor pull remains the authority. */
export function watchCloud(ownerId:string,libraryId:string,changed:()=>void){
 let connecting=false;let active=true,client:SupabaseClient|null=null,timer:ReturnType<typeof setTimeout>|undefined;
 const controller=new AbortController();
 async function connect(){if(connecting||!active||document.hidden||!navigator.onLine)return;connecting=true;
  try{const response=await fetch('/api/cloud/realtime',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(10000)])});if(!response.ok)throw new Error('unavailable');
   const auth=credential.parse(await response.json());if(auth.ownerId!==ownerId||auth.libraryId!==libraryId||auth.expiresAt<=Date.now()/1000+30)throw new Error('scope');if(!active)return;
   if(client)await client.removeAllChannels();if(!active)return;
   client=createClient(auth.url,auth.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:5}}});
   await client.realtime.setAuth(auth.accessToken);if(!active){await client.removeAllChannels();return;}
   client.channel(`library:${ownerId}:${libraryId}`,{config:{private:true}}).on('broadcast',{event:'changed'},()=>{if(active)changed();}).subscribe(status=>{if(active&&status==='SUBSCRIBED')changed();});
   timer=setTimeout(()=>void connect(),Math.max(10000,(auth.expiresAt-Date.now()/1000-60)*1000));
  }catch{if(active&&!controller.signal.aborted)timer=setTimeout(()=>void connect(),60000);}finally{connecting=false;}
 }
 const resume=()=>{if(timer)clearTimeout(timer);void connect();};
 const visibility=()=>{if(document.hidden){if(timer)clearTimeout(timer);void client?.removeAllChannels();}else resume();};
 window.addEventListener('online',resume);document.addEventListener('visibilitychange',visibility);void connect();
 return()=>{active=false;controller.abort();if(timer)clearTimeout(timer);void client?.removeAllChannels();window.removeEventListener('online',resume);document.removeEventListener('visibilitychange',visibility);};
}
