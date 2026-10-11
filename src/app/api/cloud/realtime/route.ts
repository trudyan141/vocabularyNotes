import {authenticated,cloudConfig,failure,privateHeaders,sameOrigin} from '@/server/cloud/auth';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(!sameOrigin(request))return failure(403,'origin');
 try{const config=cloudConfig(),identity=await authenticated();if(!config||!identity)return failure(401,'signed-out');
  const library=await identity.client.from('libraries').select('id').eq('owner_id',identity.user.id).is('deleted_at',null).maybeSingle();if(library.error||!library.data)return failure(503,'cloud-unavailable');
  // Validate identity above before exposing this access token; never return a refresh token.
  const {data,error}=await identity.client.auth.getSession();const session=data.session;
  if(error||!session||session.user.id!==identity.user.id||!session.expires_at||session.expires_at<=Date.now()/1000+30)return failure(401,'signed-out');
  return Response.json({url:config.url,key:config.key,ownerId:identity.user.id,libraryId:library.data.id,accessToken:session.access_token,expiresAt:session.expires_at},{headers:privateHeaders});
 }catch{return failure(503,'cloud-unavailable');}
}
