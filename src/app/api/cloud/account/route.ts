import {authenticated,failure,privateHeaders,sameOrigin} from '@/server/cloud/auth';
import {adminClient} from '@/server/cloud/admin';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function DELETE(request:Request){
 if(!sameOrigin(request))return failure(403,'origin');
 try{
  const session=await authenticated();if(!session)return failure(401,'signed-out');
  const admin=adminClient();if(!admin)return failure(503,'admin-not-configured');
  const recent=Date.parse(session.user.last_sign_in_at??'');if(!Number.isFinite(recent)||Date.now()-recent>600000||recent>Date.now()+30000)return failure(403,'reauth-required');
  if(request.headers.get('x-delete-confirmation')!=='DELETE MY ACCOUNT')return failure(400,'confirmation-required');
  const started=await session.client.rpc('begin_account_deletion');if(started.error)return failure(503,'deletion-start-failed');
  // Fixed owner prefix from verified user, never a client path. Delete page0
  // repeatedly so partial failures/retries cannot skip objects after offset shifts.
  const bucket=admin.storage.from('learning-sources');let remaining=false;
  for(let batch=0;batch<10;batch++){
   const folders=await bucket.list(session.user.id,{limit:100,offset:0});if(folders.error)return failure(503,'deletion-retry');if(!folders.data.length){remaining=false;break;}remaining=true;
   for(const folder of folders.data){if(folder.id){const result=await bucket.remove([`${session.user.id}/${folder.name}`]);if(result.error)return failure(503,'deletion-retry');continue;}
    const files=await bucket.list(`${session.user.id}/${folder.name}`,{limit:100,offset:0});if(files.error)return failure(503,'deletion-retry');const paths=files.data.filter(file=>file.id).map(file=>`${session.user.id}/${folder.name}/${file.name}`);if(files.data.some(file=>!file.id))return failure(503,'unexpected-storage-path');if(paths.length){const result=await bucket.remove(paths);if(result.error)return failure(503,'deletion-retry');}
   }
  }
  if(remaining){const check=await bucket.list(session.user.id,{limit:1,offset:0});if(check.error)return failure(503,'deletion-retry');if(check.data.length)return Response.json({status:'deleting'},{status:202,headers:privateHeaders});}
  const deleted=await admin.auth.admin.deleteUser(session.user.id);if(deleted.error)return failure(503,'deletion-retry');
  await session.client.auth.signOut({scope:'local'}).catch(()=>{});
  return Response.json({status:'deleted'},{headers:privateHeaders});
 }catch{return failure(503,'deletion-retry');}
}
