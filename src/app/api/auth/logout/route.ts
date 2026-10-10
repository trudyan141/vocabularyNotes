import {authClient,failure,privateHeaders,sameOrigin} from '@/server/cloud/auth';
export const dynamic='force-dynamic';
export async function POST(request:Request){if(!sameOrigin(request))return failure(403,'origin');try{const client=await authClient();if(client){const {error}=await client.auth.signOut({scope:'local'});if(error)return failure(503,'logout-unavailable');}return Response.json({ok:true},{headers:privateHeaders});}catch{return failure(503,'logout-unavailable');}}
