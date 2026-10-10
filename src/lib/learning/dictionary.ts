export type WordSuggestion = { word: string; source: string };
export type DictionarySense = {word:string;vi:string;definition:string;pos:string;ipa:string;examples:{en:string;vi:string;source:string}[];source:string};
// Upstream markup is data: strip it, never execute or render it as HTML.
export function dictionaryText(raw:string):string{
  let text=raw.replace(/<!--[\s\S]*?-->|<ref\b[^>]*>[\s\S]*?<\/ref>/gi,'');
  for(let i=0;i<8;i++)text=text.replace(/\{\{[^{}]*\}\}/g,'');
  return text.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g,'$1').replace(/<[^>]*>/g,'').replace(/'{2,5}/g,'').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim().slice(0,1000);
}
const parts:Record<string,string>={Noun:'noun',Verb:'verb',Adjective:'adjective',Adverb:'adverb',Pronoun:'pronoun',Preposition:'preposition',Conjunction:'conjunction',Interjection:'interjection',Determiner:'determiner',Numeral:'numeral'};
export function bilingualSenses(word:string,raw:string):DictionarySense[]{
  const section=raw.match(/(?:^|\n)==English==\s*\n([\s\S]*?)(?=\n==[^=]|$)/)?.[1]??'',results:DictionarySense[]=[];
  const ipa=section.match(/\{\{IPA\|en\|(\/[^|}]+\/)/)?.[1]??'';
  let pos='unknown',gloss='',translations:string[]=[];
  const flush=()=>{if(gloss&&translations.length)results.push({word,vi:[...new Set(translations)].join('; '),definition:gloss,pos,ipa,examples:[],source:`Wiktionary contributors — https://en.wiktionary.org/wiki/${encodeURIComponent(word)} — CC BY-SA 4.0; English translation gloss and Vietnamese translations (plain-text adaptation).`});gloss='';translations=[];};
  for(const line of section.split('\n')){
    const heading=line.match(/^={3,}\s*([^=]+?)\s*={3,}$/)?.[1];if(heading&&parts[heading]){flush();pos=parts[heading];}
    const top=line.match(/\{\{trans-top(?:-see)?\|([^|}\n]+)/);if(top){flush();gloss=dictionaryText(top[1]);}
    if(gloss&&/^\*\s*Vietnamese:/.test(line))for(const match of line.matchAll(/\{\{t(?:\+|-|t|t\+)?\|vi\|([^|}]+)/g)){const value=dictionaryText(match[1]);if(value)translations.push(value);}
    if(line.includes('{{trans-bottom'))flush();
  }
  flush();return results.slice(0,16);
}
export function vietnameseExamples(raw:string){
  const section=raw.split(/\{\{-(?:eng|en)-\}\}/)[1]?.split(/\{\{-(?:vie|fra|deu|spa|ita|jpn|kor|zho|por|rus|fr|de|es|zh|ja|ko|vi)-\}\}/)[0]??'';
  const results:{pos:string;meaning:string;en:string;vi:string}[]=[];let pos='unknown',meaning='';
  for(const line of section.split('\n')){
    const p=line.match(/^\{\{-(noun|verb|adj|adv|pronoun|prep)-\}\}/)?.[1];if(p){pos=({adj:'adjective',adv:'adverb',prep:'preposition'} as Record<string,string>)[p]??p;meaning='';}
    if(/^#\s+/.test(line))meaning=dictionaryText(line.replace(/^#\s+/,''));
    const example=line.match(/^#:\s*(.*?)\s*[—–]\s*(.+)$/);if(example&&meaning){const en=dictionaryText(example[1]),vi=dictionaryText(example[2]);if(en&&vi)results.push({pos,meaning,en,vi});}
  }
  return results;
}
export function readingHint(ipa:string){
  // Approximation only, not verified phonetics.
  return ipa.replace(/[\/ˈˌː]/g,'').replace(/tʃ/g,'ch').replace(/dʒ/g,'j').replace(/eɪ/g,'ây').replace(/aɪ/g,'ai').replace(/aʊ/g,'ao').replace(/oʊ|əʊ/g,'âu').replace(/æ/g,'e').replace(/ə|ʌ/g,'ơ').replace(/ɪ|i/g,'i').replace(/ɛ|e/g,'e').replace(/ʊ|u/g,'u').replace(/ɒ|ɔ/g,'o').replace(/ɑ/g,'a').replace(/θ/g,'th').replace(/ð/g,'đ').replace(/ʃ/g,'sh').replace(/ʒ/g,'zh').replace(/ŋ/g,'ng').replace(/ɹ/g,'r').replace(/j/g,'y').replace(/\./g,'-');
}
