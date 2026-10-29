import {authenticated,failure,privateHeaders} from '@/server/cloud/auth';
import {parseCloudRow} from '@/lib/cloud/contracts';
export const dynamic='force-dynamic';
/** Owner-only paged snapshot; recovers prepared material independently of the general sync cursor. */
export async function GET(request:Request){try{
 const session=await authenticated();if(!session)return failure(401,'signed-out');
 const params=new URL(request.url).searchParams,library=params.get('library'),after=params.get('after');
 if(!library||!/^[a-f0-9-]{36}$/i.test(library)||after&&!/^[a-f0-9-]{36}$/i.test(after))return failure(400,'invalid-cursor');
 let query=session.client.from('shadowing_content').select('id,version,client_payload').eq('owner_id',session.user.id).eq('library_id',library).order('id').limit(100);
 if(after)query=query.gt('id',after);
 const {data,error}=await query;if(error||!data)return failure(503,'pull-unavailable');
 const scope=`account:${session.user.id}:${library}`;
 const rows=data.map(item=>{const row=parseCloudRow('shadowingContent',item.client_payload);if(row.scopeId!==scope)throw Error('scope');return {version:item.version,row};});
 return Response.json({rows,next:data.length===100?data.at(-1)!.id:null},{headers:privateHeaders});
 }catch{return failure(503,'pull-unavailable');}}
