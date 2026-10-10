import {authenticated,cloudConfig,privateHeaders} from '@/server/cloud/auth';
export const dynamic='force-dynamic';
export async function GET(){if(!cloudConfig())return Response.json({configured:false,user:null},{headers:privateHeaders});try{const session=await authenticated();return Response.json({configured:true,user:session?{id:session.user.id,email:session.user.email??null}:null},{headers:privateHeaders});}catch{return Response.json({configured:true,user:null,error:'unavailable'},{status:503,headers:privateHeaders});}}
