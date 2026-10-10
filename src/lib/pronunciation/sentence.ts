export type SentenceIpa={text:string;ipa:string|null;accent:'US';sourceUrl:string;verified:false};
export const sentenceIpaSource='https://github.com/cmusphinx/cmudict';
// Broad phonemic reading aid from a licensed word lexicon, not verified connected speech.
const sounds:Record<string,string>={AA:'ɑ',AE:'æ',AH:'ʌ',AO:'ɔ',AW:'aʊ',AY:'aɪ',B:'b',CH:'tʃ',D:'d',DH:'ð',EH:'ɛ',ER:'ɝ',EY:'eɪ',F:'f',G:'ɡ',HH:'h',IH:'ɪ',IY:'i',JH:'dʒ',K:'k',L:'l',M:'m',N:'n',NG:'ŋ',OW:'oʊ',OY:'ɔɪ',P:'p',R:'ɹ',S:'s',SH:'ʃ',T:'t',TH:'θ',UH:'ʊ',UW:'u',V:'v',W:'w',Y:'j',Z:'z',ZH:'ʒ'};
export function sentenceFromLexicon(text:string,dictionary:Record<string,string>):SentenceIpa{
 const result:SentenceIpa={text,ipa:null,accent:'US',sourceUrl:sentenceIpaSource,verified:false};
 if(!text.trim()||text.length>2000||/[^a-zA-Z\s'’.,!?;:\-]/.test(text))return result;
 const tokens=text.replace(/’/g,"'").toLowerCase().match(/[a-z]+(?:'[a-z]+)*|[.!?;]+/g)??[];
 if(tokens.filter(token=>/[a-z]/.test(token)).length>200)return result;
 const parts:string[]=[];
 for(const token of tokens){
  if(/^[.!?;]+$/.test(token)){if(parts.length&&parts.at(-1)!=='|')parts.push('|');continue;}
  if(['read','lead','live','wind','bow','tear'].includes(token))return result;
  const phones=token==='an'&&dictionary['an(2)']?dictionary['an(2)']:Object.hasOwn(dictionary,token)?dictionary[token]:null;if(!phones)return result;
  const mapped=phones.split(' ').map(phone=>phone==='AH0'?'ə':phone==='ER0'?'ɚ':sounds[phone.replace(/[012]/g,'')]);
  if(mapped.some(sound=>!sound))return result;parts.push(mapped.join(''));
 }
 if(parts.at(-1)==='|')parts.pop();if(parts.length)result.ipa=`/${parts.join(' ')}/`;return result;
}
