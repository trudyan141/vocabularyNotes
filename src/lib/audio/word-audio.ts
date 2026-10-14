import {z} from 'zod';

export const normalRate=1;
export const slowRate=0.6;
export function audioWord(text:string){const word=text.trim().toLowerCase();return /^[a-z]+(?:['-][a-z]+)*$/.test(word)&&word.length<=80?word:null;}
const licenses:Record<string,string>={
 'CC0':'https://creativecommons.org/publicdomain/zero/1.0/',
 'Public domain':'https://creativecommons.org/publicdomain/mark/1.0/',
 ...Object.fromEntries(['3.0','4.0'].flatMap(version=>['by','by-sa'].map(kind=>[`CC ${kind.toUpperCase()} ${version}`,`https://creativecommons.org/licenses/${kind}/${version}/`]))),
};
export const wordAudioSchema=z.object({
 word:z.string().max(80),accent:z.literal('US'),ipa:z.string().max(160).nullable(),
 audioUrl:z.string().url().refine(url=>{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='upload.wikimedia.org'&&!u.username&&!u.password&&u.pathname.startsWith('/wikipedia/commons/');}),
 sourceUrl:z.string().url().startsWith('https://commons.wikimedia.org/wiki/File:'),
 dictionaryUrl:z.string().url().startsWith('https://en.wiktionary.org/wiki/'),
 creator:z.string().min(1).max(240),license:z.string().refine(name=>Object.hasOwn(licenses,name)),
 licenseUrl:z.string().url(),
}).strict().refine(row=>licenses[row.license]===row.licenseUrl);
export type WordAudio=z.infer<typeof wordAudioSchema>;

// Only exact US recordings attached to the English entry. Multiple pronunciation
// sections or US readings require sense selection; do not guess a homograph.
export function englishAudioFile(word:string,raw:string):{file:string;ipa:string|null}|null{
 const section=raw.match(/(?:^|\n)==\s*English\s*==\s*\n([\s\S]*?)(?=\n==[^=]|$)/)?.[1]??'';
 const pronunciations=[...section.matchAll(/(?:^|\n)={3,}\s*Pronunciation\s*={3,}\s*\n([\s\S]*?)(?=\n={3,}[^=]|$)/g)];
 if(pronunciations.length!==1)return null;
 const block=pronunciations[0][1],ipas:{value:string;us:boolean;generic:boolean}[]=[];
 for(const match of block.matchAll(/\{\{IPA\|en\|([^{}]+)\}\}/g)){
  const params=match[1].split('|');const accent=params.find(p=>/^a=/.test(p))?.slice(2);
  for(const value of params.filter(p=>/^\/[^/<>{}|]+\/$/.test(p)))ipas.push({value,us:!!accent&&/(?:^|,)US(?:,|$)|General American/.test(accent),generic:!accent});
 }
 const readings=[...new Set(ipas.filter(p=>p.us).map(p=>p.value))];
 if(readings.length>1)return null;
 const generic=[...new Set(ipas.filter(p=>p.generic).map(p=>p.value))];
 if(!readings.length&&generic.length>1)return null;
 for(const match of block.matchAll(/\{\{audio\|en\|([^|{}\n]+)(?:\|[^{}]*)?\}\}/g)){
  const file=match[1].trim();const stem=file.replace(/\.(ogg|oga|wav|mp3)$/i,'').replace(/^en[-_]us[-_]/i,'');
  if(/^en[-_]us[-_]/i.test(file)&&/\.(ogg|oga|wav|mp3)$/i.test(file)&&stem.toLowerCase()===word)return {file,ipa:readings[0]??generic[0]??null};
 }
 return null;
}
const plain=(value:unknown)=>typeof value==='string'?value.replace(/<[^>]*>/g,'').replace(/&[a-z0-9#]+;/gi,' ').trim():'';
export function commonsWordAudio(word:string,file:string,ipa:string|null,page:unknown):WordAudio|null{
 try{
  const row=page as {title:string;videoinfo:Record<string,unknown>[]};
  if(row.title.toLowerCase()!==`file:${file}`.toLowerCase())return null;
  const info=row.videoinfo[0],metadata=info.extmetadata as Record<string,{value:unknown}>;
  if(info.badfile||plain(metadata.Restrictions?.value)||!['audio/ogg','application/ogg','audio/wav','audio/x-wav','audio/mpeg'].includes(String(info.mime)))return null;
  const license=plain(metadata.LicenseShortName?.value);
  const licenseUrl=plain(metadata.LicenseUrl?.value).replace(/^http:/,'https:').replace(/\/?$/,'/');
  if(licenseUrl!==licenses[license])return null;
  const url=new URL(String(info.url));url.search='';
  // Prefer the provider's MP3 transcode for Safari; never construct a guessed URL.
  const derivatives=Array.isArray(info.derivatives)?info.derivatives as {src?:string;type?:string}[]:[];
  const mp3=derivatives.find(d=>d.type==='audio/mpeg'&&typeof d.src==='string');
  const parsed=wordAudioSchema.safeParse({word,accent:'US',ipa,audioUrl:mp3?.src??url.href,sourceUrl:info.descriptionurl,dictionaryUrl:`https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,creator:plain(metadata.Artist?.value),license,licenseUrl:licenses[license]});
  return parsed.success?parsed.data:null;
 }catch{return null;}
}
