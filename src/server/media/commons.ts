import 'server-only';
import {illustrationWord} from '@/lib/media/dictionary-art';
import {openMojiById} from './openmoji';
import sharp from 'sharp';
import {freePicturesForSource,freePictureById} from './free-sources';
import type {PictureAttempt} from '@/lib/media/search-report';
import {mediaCandidate,type MediaCandidate} from '@/lib/media/contracts';
const api='https://commons.wikimedia.org/w/api.php';
export class MediaFetchError extends Error{constructor(public code:'http'|'timeout'|'network'|'invalid-response'|'provider-error'|'too-large'|'busy',public httpStatus?:number){super(code);}}
export async function boundedFetch(url:string,limit:number,fetcher:typeof fetch=fetch){try{const response=await fetcher(url,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000),headers:{'User-Agent':'WordsForKids/0.1 (parent-curated educational illustrations)'}});if(!response.ok)throw new MediaFetchError('http',response.status);if(!response.body)throw new MediaFetchError('invalid-response');const chunks:Uint8Array[]=[];let size=0;const reader=response.body.getReader();try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit)throw new MediaFetchError('too-large');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}return Buffer.concat(chunks);}catch(error){if(error instanceof MediaFetchError)throw error;throw new MediaFetchError(error instanceof Error&&['TimeoutError','AbortError'].includes(error.name)?'timeout':'network');}}
const plain=(value:unknown)=>typeof value==='string'?value.replace(/<[^>]*>/g,'').replace(/&[a-z0-9#]+;/gi,' ').trim():'';
export function candidateFromPage(page:Record<string,unknown>):MediaCandidate|null{try{const info=(page.imageinfo as Record<string,unknown>[])[0],metadata=info.extmetadata as Record<string,{value:string}>;const license=plain(metadata.LicenseShortName?.value),creator=plain(metadata.Artist?.value)||plain(metadata.Credit?.value);if(!['CC0','Public domain','CC BY 4.0','CC BY 3.0','CC BY-SA 4.0','CC BY-SA 3.0'].includes(license)||metadata.Restrictions?.value||info.badfile||!['image/jpeg','image/png','image/webp'].includes(String(info.thumbmime??info.mime)))return null;const sourceUrl=String(info.descriptionurl),imageUrl=String(info.thumburl??info.url);if(!/^https:\/\/(upload|thumb)\.wikimedia\.org\//.test(imageUrl)||!sourceUrl.startsWith('https://commons.wikimedia.org/wiki/'))return null;return mediaCandidate.parse({id:`${page.pageid}:${info.sha1}`,title:page.title,sourceUrl,imageUrl,creator,license,licenseUrl:license==='CC BY 4.0'?'https://creativecommons.org/licenses/by/4.0/':license==='CC BY 3.0'?'https://creativecommons.org/licenses/by/3.0/':license==='CC BY-SA 4.0'?'https://creativecommons.org/licenses/by-sa/4.0/':license==='CC BY-SA 3.0'?'https://creativecommons.org/licenses/by-sa/3.0/':license==='Public domain'?'https://creativecommons.org/publicdomain/mark/1.0/':'https://creativecommons.org/publicdomain/zero/1.0/',credit:`${plain(page.title)} — ${creator} — ${license}`});}catch{return null;}}
async function query(parameters:Record<string,string>,fetcher:typeof fetch=fetch){const url=new URL(api);url.search=new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url|mime|thumbmime|sha1|extmetadata|badfile',iiurlwidth:'512',...parameters}).toString();const bytes=await boundedFetch(url.href,1_000_000,fetcher);let data;try{data=JSON.parse(bytes.toString());}catch{throw new MediaFetchError('invalid-response');}if(!data||typeof data!=='object')throw new MediaFetchError('invalid-response');if(data.error)throw new MediaFetchError('provider-error');if(data.query?.pages!==undefined&&(typeof data.query.pages!=='object'||data.query.pages===null))throw new MediaFetchError('invalid-response');return Object.values(data.query?.pages??{}) as Record<string,unknown>[];}
function pictureSubject(word:string){
 const normalized=illustrationWord(word.trim().toLowerCase());
 const family:Record<string,string>={sister:'girl',brother:'boy',mother:'woman',mom:'woman',father:'man',dad:'man',grandmother:'grandmother',grandma:'grandmother',grandfather:'grandfather',grandpa:'grandfather'};
 return family[normalized]??normalized;
}
export function pictureQueries(word:string,sense:string) {
 const subject=pictureSubject(word);
 // Prefer drawings, then broaden to photographs without another provider/key.
 void sense;
 return [`${subject} cartoon -chromatid -chromosome -republic`,`${subject} -chromatid -chromosome -republic`];
}
export function relevantPicture(page:Record<string,unknown>,word:string,allowPhotographs=false){
 const info=(page.imageinfo as Record<string,unknown>[]|undefined)?.[0],metadata=info?.extmetadata as Record<string,{value:string}>|undefined;
 const title=plain(page.title).toLowerCase(),description=plain(metadata?.ImageDescription?.value).toLowerCase();
 const bad=/caricature|political|editorial|newspaper|engraving|lithograph|woodcut|chromosome|chromatid|frankenstein|war|propaganda|darling|davenport|parliament|porn|nude|nudity|sexual|gore|corpse/;
 if(bad.test(title+' '+description))return false;
 const subject=pictureSubject(word),matches=title.includes(subject);
 return matches&&(allowPhotographs||/illustration|clip.?art|icon|vector|drawing|cartoon|emoji/.test(title+' '+description));
}
export type PictureSearchReport={candidates:MediaCandidate[];sources:PictureAttempt[];status:'found'|'empty'|'unavailable'};
async function search(word:string,sense:string):Promise<PictureSearchReport>{
 const sources:PictureAttempt[]=[],candidates:MediaCandidate[]=[];
 for(const source of ['noto','twemoji','fluent'] as const){try{const items=freePicturesForSource(word,sense,source);sources.push({source,kind:'catalog',state:items.length?'found':'empty',count:items.length,...(!items.length?{code:'no-match' as const}:{})});candidates.push(...items);}catch{sources.push({source,kind:'catalog',state:'error',count:0,code:'invalid-response'});}}
 return {candidates:candidates.slice(0,5),sources,status:candidates.length?'found':sources.some(row=>row.state==='error')?'unavailable':'empty'};
}
export async function importCommons(id:string,title:string,fetcher:typeof fetch=fetch){const known=openMojiById(id)??freePictureById(id);if(known){if(known.title!==title)throw new Error('invalid');return normalizeImported(known,await boundedFetch(known.imageUrl,500000,fetcher),true);}if(/^(openmoji|noto|twemoji|fluent):/.test(id))throw new Error('invalid');const pages=await query({titles:title},fetcher);const candidate=pages.map(candidateFromPage).find(item=>item?.id===id);if(!candidate)throw new Error('license-changed');return normalizeImported(candidate,await boundedFetch(candidate.imageUrl!,3_000_000,fetcher));}
export async function normalizeImported(candidate:MediaCandidate,bytes:Buffer,trustedSvg=false){if(trustedSvg){const text=bytes.toString('utf8');if(/<!DOCTYPE|<!ENTITY|<script|<foreignObject|\bon\w+\s*=|(?:href|xlink:href)\s*=\s*["'](?!#)|url\(\s*["']?(?!#)/i.test(text))throw new Error('unsafe-svg');}const image=sharp(bytes,{limitInputPixels:12_000_000}),metadata=await image.metadata();if(!['jpeg','png','webp',...(trustedSvg?['svg']:[])].includes(metadata.format??''))throw new Error('type');const output=await image.rotate().resize({width:512,height:512,fit:'inside',withoutEnlargement:true}).flatten({background:'#fff8f8'}).jpeg({quality:85}).toBuffer();if(output.length>500000)throw new Error('too-large');const hash=Buffer.from(await crypto.subtle.digest('SHA-256',output)).toString('hex');return {candidate,base64:output.toString('base64'),sha256:hash};}


const cache=new Map<string,{expires:number;report:PictureSearchReport}>(),pending=new Map<string,Promise<PictureSearchReport>>();
export async function searchPictures(word:string,sense:string,fetcher:typeof fetch=fetch){const key='catalogs:'+`${word.toLowerCase()}\n${sense.toLowerCase()}`;if(fetcher!==fetch)return search(word,sense);const known=cache.get(key);if(known&&known.expires>Date.now())return known.report;const running=pending.get(key);if(running)return running;if(pending.size>=8)return {candidates:[],status:'unavailable',sources:[{source:'noto',state:'error',kind:'catalog',count:0,code:'busy'}]} as PictureSearchReport;const job=search(word,sense).then(report=>{if(report.sources.every(attempt=>attempt.state!=='error')){if(cache.size>=100)cache.delete(cache.keys().next().value!);cache.set(key,{report,expires:Date.now()+(report.candidates.length?300000:30000)});}return report;}).finally(()=>pending.delete(key));pending.set(key,job);return job;}
export async function searchCommons(word:string,sense:string,fetcher:typeof fetch=fetch){return (await searchPictures(word,sense,fetcher)).candidates;}
