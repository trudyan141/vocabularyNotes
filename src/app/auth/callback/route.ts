import {NextResponse} from 'next/server';
import {authClient,cloudConfig,privateHeaders} from '@/server/cloud/auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){const config=cloudConfig();const destination=new URL('/account',config?.appUrl??new URL(request.url).origin);const code=new URL(request.url).searchParams.get('code');let success=false;try{const client=await authClient();if(client&&code&&code.length<=4096){const {error}=await client.auth.exchangeCodeForSession(code);success=!error;}}catch{}if(!success)destination.searchParams.set('auth','failed');return NextResponse.redirect(destination,{status:303,headers:privateHeaders});}
