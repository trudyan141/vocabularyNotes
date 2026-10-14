import 'server-only';
import {boundedFetch} from '@/server/media/commons';
import {audioWord,englishAudioFile,commonsWordAudio,type WordAudio} from '@/lib/audio/word-audio';
const cache=new Map<string,{expires:number;sample:WordAudio|null}>(),pending=new Map<string,Promise<WordAudio|null>>();
async function lookup(word:string,fetcher:typeof fetch){
 const wiki=new URL('https://en.wiktionary.org/w/api.php');wiki.search=new URLSearchParams({action:'parse',page:word,prop:'wikitext',format:'json'}).toString();
 const entry=JSON.parse((await boundedFetch(wiki.href,500000,fetcher)).toString());
 if(entry.error?.code==='missingtitle')return null;
 if(entry.error||typeof entry.parse?.wikitext?.['*']!=='string')throw new Error('unavailable');
 if(entry.parse.title?.toLowerCase()!==word)return null;
 const reference=englishAudioFile(word,entry.parse.wikitext['*']);if(!reference)return null;
 const commons=new URL('https://commons.wikimedia.org/w/api.php');commons.search=new URLSearchParams({action:'query',format:'json',titles:`File:${reference.file}`,prop:'videoinfo',viprop:'url|mime|extmetadata|badfile|derivatives'}).toString();
 const data=JSON.parse((await boundedFetch(commons.href,200000,fetcher)).toString());if(data.error)throw new Error('unavailable');
 return Object.values(data.query?.pages??{}).map(page=>commonsWordAudio(word,reference.file,reference.ipa,page)).find(sample=>sample!==null)??null;
}
export async function lookupWordAudio(text:string,fetcher:typeof fetch=fetch):Promise<WordAudio|null>{
 const word=audioWord(text);if(!word)return null;
 if(fetcher!==fetch)return lookup(word,fetcher);
 const old=cache.get(word);if(old&&old.expires>Date.now())return old.sample;
 const running=pending.get(word);if(running)return running;if(pending.size>=4)throw new Error('busy');
 const job=lookup(word,fetcher).then(sample=>{if(cache.size>=128)cache.delete(cache.keys().next().value!);cache.set(word,{sample,expires:Date.now()+(sample?3600000:30000)});return sample;}).finally(()=>pending.delete(word));pending.set(word,job);return job;
}
