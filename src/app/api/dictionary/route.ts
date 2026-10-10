import {NextRequest,NextResponse} from 'next/server';
import {lookupWord,suggestWords} from '@/server/dictionary';
export async function GET(request:NextRequest){
  const word=request.nextUrl.searchParams.get('word')?.trim().toLowerCase()??'';
  if(!/^[a-z][a-z '-]{0,79}$/.test(word))return NextResponse.json({error:'invalid'},{status:400});
  try{
    const suggest=request.nextUrl.searchParams.get('mode')==='suggest';
    const results=suggest?await suggestWords(word):await lookupWord(word);
    return NextResponse.json({results},{headers:{'Cache-Control':'no-store'}});
  }catch(error){const busy=error instanceof Error&&error.message==='busy';return NextResponse.json({error:busy?'busy':'unavailable'},{status:busy?429:503,headers:{'Cache-Control':'no-store','Retry-After':'5'}});}
}
