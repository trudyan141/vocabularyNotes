import {redirect} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<{word?:string}>}){const {word}=await searchParams;redirect(typeof word==='string'&&word.length<=200?`/library/words/${encodeURIComponent(word)}`:'/practice/speaking');}
