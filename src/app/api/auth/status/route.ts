import {authenticated,cloudConfig,privateHeaders} from '@/server/cloud/auth';
import {profileFor,databaseFailure,type CloudOverview} from '@/lib/account-profile';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!cloudConfig())return Response.json({configured:false,user:null},{headers:privateHeaders});
 try{
  const session=await authenticated();
  if(!session)return Response.json({configured:true,user:null},{headers:privateHeaders});
  const user=profileFor(session.user);let cloud:CloudOverview|undefined;
  // Routine session checks stay cheap; account overview is an explicit read-only query.
  if(new URL(request.url).searchParams.get('profile')==='1'){
   const library=await session.client.from('libraries').select('id').eq('owner_id',user.id).maybeSingle();
   if(library.error)cloud={state:'unavailable',words:0,lessons:0,error:databaseFailure(library.error.code)};
   else if(!library.data)cloud={state:'empty',words:0,lessons:0};
   else{
    const counts=await Promise.all([
     session.client.from('entry_senses').select('id',{count:'exact',head:true}).eq('owner_id',user.id).eq('library_id',library.data.id).is('deleted_at',null),
     session.client.from('lessons').select('id',{count:'exact',head:true}).eq('owner_id',user.id).eq('library_id',library.data.id).is('deleted_at',null)
    ]);
    const error=counts.find(result=>result.error)?.error;
    cloud=error?{state:'unavailable',words:0,lessons:0,error:databaseFailure(error.code)}:{state:'ready',words:counts[0].count??0,lessons:counts[1].count??0};
   }
  }
  return Response.json({configured:true,user,...(cloud?{cloud}:{})},{headers:privateHeaders});
 }catch{return Response.json({configured:true,user:null,error:'unavailable'},{status:503,headers:privateHeaders});}
}
