import type {PhoneFeedback,WordFeedback} from './assessment';
export type SoundGroup={letters:string;phones:PhoneFeedback[];status:WordFeedback['status'];silentTail?:string};
// Spelling-to-sound correspondences used only when they cover the entire exact reference.
// One sound may have two letters (pp), several sounds may have two letters (le).
const spellings:Record<string,string[][]>={
 a:[['æ'],['eɪ'],['ɑ'],['ɔ'],['ə']],e:[['ɛ'],['i'],['ə'],['ɪ']],i:[['ɪ'],['aɪ'],['i'],['ə']],o:[['ɑ'],['ɔ'],['oʊ'],['ə']],u:[['ə'],['u'],['ʊ'],['j','u']],y:[['j'],['i'],['aɪ'],['ɪ']],
 b:[['b']],c:[['k'],['s']],d:[['d']],f:[['f']],g:[['g'],['dʒ']],h:[['h']],j:[['dʒ']],k:[['k']],l:[['l']],m:[['m']],n:[['n']],p:[['p']],q:[['k']],r:[['r']],s:[['s'],['z']],t:[['t']],v:[['v']],w:[['w']],x:[['k','s'],['g','z']],z:[['z']],
 pp:[['p']],bb:[['b']],tt:[['t']],dd:[['d']],gg:[['g']],ff:[['f']],ll:[['l']],mm:[['m']],nn:[['n']],ss:[['s']],zz:[['z']],ck:[['k']],ch:[['tʃ'],['k']],sh:[['ʃ']],th:[['θ'],['ð']],ph:[['f']],ng:[['ŋ']],qu:[['k','w']],wh:[['w'],['h']],wr:[['r']],kn:[['n']],
 le:[['ə','l'],['l']],tion:[['ʃ','ə','n']],dge:[['dʒ']],tch:[['tʃ']],
 oo:[['ʊ'],['u']],ee:[['i']],ea:[['i'],['ɛ']],ai:[['eɪ']],ay:[['eɪ']],oa:[['oʊ']],oe:[['oʊ']],ow:[['oʊ'],['aʊ']],ou:[['aʊ'],['ə'],['u']],oi:[['ɔɪ']],oy:[['ɔɪ']],au:[['ɔ']],aw:[['ɔ']],er:[['ɝ'],['ə','r']],ir:[['ɝ']],ur:[['ɝ']],ar:[['ɑ','r']],or:[['ɔ','r']],igh:[['aɪ']],
};
const normal=(p:string)=>p.replace('ɡ','g').replace('ɹ','r').replace('ʌ','ə').replace('ɚ','ɝ');
export function groupStatus(phones:PhoneFeedback[],fallback:WordFeedback['status']):WordFeedback['status']{
 if(!phones.length)return fallback;
 return phones.some(p=>p.status==='uncertain')?'uncertain':phones.every(p=>p.status==='match')?'match':phones.some(p=>p.status==='missing')?'missing':'retry';
}
export function soundGroups(word:WordFeedback):SoundGroup[]{
 const details=word.phones??word.expected.map(expected=>({expected,heard:null,status:word.status,advice:''}));
 const text=word.text.toLowerCase(),failed=new Set<string>();
 function align(letter:number,phone:number):SoundGroup[]|null{
  if(letter===text.length)return phone===details.length?[]:null;
  const key=`${letter}:${phone}`;if(failed.has(key))return null;
  for(let size=Math.min(4,text.length-letter);size>=1;size--){const letters=text.slice(letter,letter+size);for(const sounds of spellings[letters]??[]){
   if(sounds.some((sound,i)=>normal(details[phone+i]?.expected??'')!==sound))continue;
   const rest=align(letter+size,phone+sounds.length);if(rest){const phones=details.slice(phone,phone+sounds.length);return [{letters:word.text.slice(letter,letter+size),phones,status:groupStatus(phones,word.status)},...rest];}
  }}
  // A final silent e belongs visually to the preceding spelling group, not a fictional phone.
  if(text.slice(letter)==='e'&&phone===details.length)return [{letters:word.text.slice(letter),phones:[],status:word.status,silentTail:'e'}];
  failed.add(key);return null;
 }
 const groups=align(0,0);
 if(!groups)return [{letters:word.text,phones:details,status:word.status}];
 if(groups.at(-1)?.silentTail&&groups.length>1){const tail=groups.pop()!,last=groups[groups.length-1];last.letters+=tail.letters;last.silentTail=tail.letters;}
 return groups;
}
