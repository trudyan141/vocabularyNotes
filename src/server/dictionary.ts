import 'server-only';
import {bilingualSenses,vietnameseExamples,type DictionarySense,type WordSuggestion} from '@/lib/learning/dictionary';
import {boundedFetch} from '@/server/media/commons';
const cache=new Map<string,{until:number;value:unknown}>(),pending=new Map<string,Promise<unknown>>();
async function cached<T>(key:string,job:()=>Promise<T>):Promise<T>{
  const old=cache.get(key);if(old&&old.until>Date.now())return old.value as T;
  if(pending.has(key))return pending.get(key) as Promise<T>;
  if(pending.size>=4)throw new Error('busy');
  const promise=job().then(value=>{if(cache.size>=200)cache.delete(cache.keys().next().value!);cache.set(key,{until:Date.now()+3600000,value});return value;}).finally(()=>pending.delete(key));pending.set(key,promise);return promise;
}
async function json(url:URL,fetcher:typeof fetch){return JSON.parse((await boundedFetch(url.href,700000,fetcher)).toString());}
export async function suggestWords(query:string,fetcher:typeof fetch=fetch):Promise<WordSuggestion[]>{
  const job=async()=>{const url=new URL('https://api.datamuse.com/sug');url.search=new URLSearchParams({s:query,max:'8'}).toString();const data=await json(url,fetcher);if(!Array.isArray(data))throw new Error('invalid');return data.slice(0,8).flatMap(item=>typeof item.word==='string'&&/^[a-z][a-z '-]{0,79}$/i.test(item.word)?[{word:item.word,source:'Datamuse spelling suggestions'}]:[]);};
  return fetcher===fetch?cached(`s:${query}`,job):job();
}
async function wiki(word:string,language:string,fetcher:typeof fetch){const url=new URL(`https://${language}.wiktionary.org/w/api.php`);url.search=new URLSearchParams({action:'parse',page:word,prop:'wikitext',format:'json',redirects:'1'}).toString();const data=await json(url,fetcher);return typeof data.parse?.wikitext?.['*']==='string'?data.parse.wikitext['*']:'';}
export async function lookupWord(word:string,fetcher:typeof fetch=fetch):Promise<DictionarySense[]>{
  const job=async()=>{
    const [en,vi,corpus]=await Promise.allSettled([wiki(word,'en',fetcher),wiki(word,'vi',fetcher),examples(word,fetcher)]);
    const senses=bilingualSenses(word,en.status==='fulfilled'?en.value:''),native=vietnameseExamples(vi.status==='fulfilled'?vi.value:'');
    const normalized=(text:string)=>text.toLowerCase().replace(/[.,;!?]/g,'').trim();
    for(const sense of senses){const terms=sense.vi.split(';').map(normalized);const matches=native.filter(item=>item.pos===sense.pos&&terms.some(term=>normalized(item.meaning).includes(term)||term.includes(normalized(item.meaning))));
      sense.examples=matches.slice(0,2).map(item=>({en:item.en,vi:item.vi,source:`Wiktionary contributors — https://vi.wiktionary.org/wiki/${encodeURIComponent(word)} — CC BY-SA 4.0`}));
      if(corpus.status==='fulfilled')for(const example of corpus.value)if(sense.examples.length<2&&!sense.examples.some(item=>item.en===example.en))sense.examples.push(example);
    }
    if(senses.length)return senses;
    // English-only fallback: never invent a Vietnamese equivalent.
    const url=new URL(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`),data=await json(url,fetcher);if(!Array.isArray(data))return [];
    return data.slice(0,2).flatMap(entry=>(Array.isArray(entry.meanings)?entry.meanings:[]).flatMap((meaning:{partOfSpeech:string;definitions:{definition:string}[]})=>(meaning.definitions??[]).slice(0,2).map(def=>({word,vi:'',definition:String(def.definition).slice(0,1000),pos:meaning.partOfSpeech,ipa:typeof entry.phonetic==='string'?entry.phonetic:'',examples:corpus.status==='fulfilled'?corpus.value:[],source:`Free Dictionary API — https://en.wiktionary.org/wiki/${encodeURIComponent(word)} — ${String(entry.license?.name??'license in source')}`})))).slice(0,16);
  };return fetcher===fetch?cached(`w:${word}`,job):job();
}
async function examples(word:string,fetcher:typeof fetch):Promise<DictionarySense['examples']>{
  const url=new URL('https://api.tatoeba.org/v1/sentences');url.search=new URLSearchParams({lang:'eng',q:word,'trans:lang':'vie','trans:is_direct':'yes','showtrans:lang':'vie',limit:'6',word_count:'-12',is_unapproved:'no',sort:'relevance'}).toString();const data=await json(url,fetcher);if(!Array.isArray(data.data))return [];
  const license=(value:string)=>value==='CC BY 2.0'||value==='CC BY 2.0 FR';
  return data.data.flatMap((item:{id:number;text:string;license:string;owner?:string;translations?:{id:number;text:string;lang:string;license:string;owner?:string}[]})=>{
    const translation=item.translations?.find(t=>t.lang==='vie'&&typeof t.text==='string'&&t.text.length<=300&&license(t.license));
    if(!translation||!license(item.license)||typeof item.text!=='string'||item.text.length>180||!Number.isInteger(item.id)||!Number.isInteger(translation.id)||!item.text.toLowerCase().includes(word))return [];
    return [{en:item.text,vi:translation.text,source:`Tatoeba example suggestion (check sense): ${item.owner??'contributors'} https://tatoeba.org/en/sentences/show/${item.id} — ${item.license}; ${translation.owner??'contributors'} https://tatoeba.org/en/sentences/show/${translation.id} — ${translation.license}`}];
  }).slice(0,2);
}
