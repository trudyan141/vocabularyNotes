import {NextRequest,NextResponse} from 'next/server';
import {sameOrigin} from '@/server/cloud/auth';
import {audioWord} from '@/lib/audio/word-audio';
import {lookupWordAudio} from '@/server/word-audio';
export async function POST(request:NextRequest){
 const headers={'Cache-Control':'private, no-store'};
 if(!sameOrigin(request))return NextResponse.json({error:'forbidden'},{status:403,headers});
 let word:string|null;
 try{const raw=await request.text();if(raw.length>200)throw new Error();const data=JSON.parse(raw);if(Object.keys(data).join()!=='word'||typeof data.word!=='string')throw new Error();word=audioWord(data.word);if(!word)throw new Error();}
 catch{return NextResponse.json({error:'invalid'},{status:400,headers});}
 try{return NextResponse.json({word,sample:await lookupWordAudio(word)},{headers});}
 catch{return NextResponse.json({error:'unavailable'},{status:503,headers});}
}
