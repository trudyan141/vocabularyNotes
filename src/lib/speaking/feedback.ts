import type {InsertionFeedback,PhoneFeedback,SoundStatus,WordFeedback} from './assessment';
import {articulation,insertionAdvice,practiceTip} from './articulation';

/** Symbol aliases only. Never erase vowel quality or stress distinctions. */
export const canonicalPhone=(phone:string)=>phone==='ɡ'?'g':phone==='ɹ'?'r':phone;
export const speakingPhoneInventory=['ɑ','æ','ə','ʌ','ɔ','aʊ','aɪ','b','tʃ','d','ð','ɛ','ɝ','ɚ','eɪ','f','g','h','ɪ','i','dʒ','k','l','m','n','ŋ','oʊ','ɔɪ','p','r','s','ʃ','t','θ','ʊ','u','v','w','j','z','ʒ'] as const;
const inventory=new Set<string>(speakingPhoneInventory);
export const isSpeakingPhone=(phone:string)=>inventory.has(canonicalPhone(phone));
const neighbours=new Set(['æ:ɛ','ɛ:ɪ','ɪ:i','ʊ:u','ʌ:ə','ɑ:ɔ','p:b','t:d','k:g','s:z','f:v','θ:s','θ:t','ð:d','ð:z','r:l','r:w','ʃ:s','ʒ:z','tʃ:dʒ'].flatMap(pair=>[pair,pair.split(':').reverse().join(':')]));
export const isNearSubstitution=(expected:string,heard:string)=>neighbours.has(`${canonicalPhone(expected)}:${canonicalPhone(heard)}`);

export function feedbackStatus(phones:PhoneFeedback[],insertions:InsertionFeedback[]=[],unclear=false):SoundStatus{
 if(unclear||phones.some(phone=>phone.status==='uncertain'))return 'uncertain';
 if(phones.some(phone=>phone.status==='incorrect'))return 'incorrect';
 if(phones.some(phone=>phone.status==='missing'))return 'missing';
 return insertions.length||phones.some(phone=>phone.status==='retry')?'retry':'match';
}

export function buildFeedback(index:number,text:string,phones:PhoneFeedback[],insertions:InsertionFeedback[],audibility:'clear'|'unclear'):WordFeedback{
 const status=feedbackStatus(phones,insertions,audibility==='unclear');
 // Stable priority: omission/gross substitution, then insertion, then near substitution.
 const repair=phones.find(phone=>phone.status==='missing'||phone.status==='incorrect');
 const near=phones.find(phone=>phone.status==='retry');
 const selected=repair??(!insertions.length?near:undefined);
 const advice=status==='uncertain'?'Máy chưa nghe rõ. Con thử lại ở chỗ yên tĩnh nhé.':selected?`Âm /${selected.expected}/: ${selected.advice}`:insertions.length?insertionAdvice:status==='match'?'Các âm máy nghe được giống mẫu. Giỏi lắm!':'Con nghe mẫu rồi tập lại chậm nhé.';
 return {index,text,expected:phones.map(phone=>phone.expected),heard:phones.flatMap((phone,i)=>[...insertions.filter(item=>item.afterIndex===i-1).map(item=>item.heard),...(phone.heard?[phone.heard]:[])]).concat(insertions.filter(item=>item.afterIndex===phones.length-1).map(item=>item.heard)),status,advice,phones,insertions,audibility};
}

export function phoneFeedback(expected:string,heard:string|null,status:'match'|'substitution'|'missing'|'uncertain',index:number,reference:string[]):PhoneFeedback{
 const localStatus=status==='substitution'?(isNearSubstitution(expected,heard!)?'retry':'incorrect'):status;
 return {expected,heard,status:localStatus,advice:localStatus==='uncertain'?'Máy chưa nghe rõ âm này. Con nghe mẫu rồi thử lại nhé.':localStatus==='match'?articulation(expected):practiceTip(expected,index,reference,localStatus,heard)};
}
