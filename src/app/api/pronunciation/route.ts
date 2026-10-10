import {NextRequest,NextResponse} from 'next/server';
import {dictionary} from 'cmu-pronouncing-dictionary';
import {z} from 'zod';
import {sentenceFromLexicon} from '@/lib/pronunciation/sentence';
const input=z.object({texts:z.array(z.string().min(1).max(2000)).min(1).max(16)}).strict();
export async function POST(request:NextRequest){
 const headers={'Cache-Control':'private, no-store'};
 if(request.headers.get('origin')&&request.headers.get('origin')!==request.nextUrl.origin)return NextResponse.json({error:'forbidden'},{status:403,headers});
 try{const raw=await request.text();if(raw.length>33000)return NextResponse.json({error:'invalid'},{status:400,headers});const {texts}=input.parse(JSON.parse(raw));return NextResponse.json({results:texts.map(text=>sentenceFromLexicon(text,dictionary))},{headers});}
 catch{return NextResponse.json({error:'invalid'},{status:400,headers});}
}
