import 'server-only';
import sources from '@/lib/media/free-picture-sources.json';
import {openMojiPicture} from './openmoji';
import {onlineIllustration} from '@/lib/media/online-search';
import {mediaCandidate,type MediaCandidate} from '@/lib/media/contracts';
/** Pinned upstream files only. A caller-supplied URL can never become an import URL. */
export function freePictureById(id:string):MediaCandidate|null{
 const [provider,code,...extra]=id.split(':');if(extra.length)return null;
 const source=sources.find(source=>source.id===provider),item=source?.entries.find(item=>item.code===code);if(!source||!item)return null;
 const path=item.path.split('/').map(encodeURIComponent).join('/');
 return mediaCandidate.parse({id,title:`File:${item.word} ${source.id} illustration.svg`,sourceUrl:`https://github.com/${source.repo}/blob/${source.revision}/${path}`,imageUrl:`https://raw.githubusercontent.com/${source.repo}/${source.revision}/${path}`,creator:source.creator,license:source.license,licenseUrl:source.id==='noto'?'https://www.apache.org/licenses/LICENSE-2.0':source.id==='twemoji'?'https://creativecommons.org/licenses/by/4.0/':`https://github.com/${source.repo}/blob/${source.revision}/LICENSE`,credit:`${item.word} — ${source.creator} — ${source.name} — ${source.license} — resized and converted to JPEG`});
}
function pictureCode(word:string,sense:string){
 const concept=pictureConcept(word,sense),known=openMojiPicture(concept),online=onlineIllustration(concept,'noun',sense);
 return known?.id.split(':')[1]??online?.art.replace('online-openmoji-','');
}
export function freePicturesForSource(word:string,sense:string,source:string){const code=pictureCode(word,sense);if(!code)return [];const candidate=freePictureById(`${source}:${code}`);return candidate?[candidate]:[];}
export function freePictures(word:string,sense:string){return sources.flatMap(source=>freePicturesForSource(word,sense,source.id));}
/** A reviewed symbolic concept for plural people; never pretend it is a literal noun. */
export function pictureConcept(word:string,sense:string){return word.trim().toLowerCase()==='they'&&/\bpeople\b/i.test(sense)?'people holding hands':word;}
