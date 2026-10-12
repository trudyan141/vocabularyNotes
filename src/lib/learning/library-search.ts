import {canonicalKey, searchTerms} from '@/domain/identity';
import type {LibraryWord} from '@/data/local/types';

/** Match a sequence from a word boundary, allowing the last typed word to be a prefix. */
export function searchRanges(text:string, query:string):[number,number][] {
 const needle=searchTerms(query);
 if(!needle)return [];
 let normalized='';const starts:number[]=[],ends:number[]=[];
 let offset=0;
 for(const char of text){const folded=searchTerms(char);for(const part of folded){normalized+=part;starts.push(offset);ends.push(offset+char.length);}if(/\s/u.test(char)){normalized+=' ';starts.push(offset);ends.push(offset+char.length);}offset+=char.length;}
 const escaped=needle.split(/\s+/).map(word=>word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s+');
 const pattern=new RegExp(`(?<![\\p{L}\\p{N}])${escaped}`,'gu');
 return [...normalized.matchAll(pattern)].map(match=>[starts[match.index],ends[match.index+match[0].length-1]]);
}
export function matchesLibraryWord(word:Pick<LibraryWord,'word'|'vi'>,query:string){return !query.trim()||searchRanges(word.word,query).length>0||searchRanges(word.vi,query).length>0;}
/** Read projection only. Every sense remains reachable; nothing is merged or deleted. */
export function groupLibraryWords(words:LibraryWord[]):LibraryWord[]{
 const groups=new Map<string,LibraryWord[]>();
 for(const word of words){const key=JSON.stringify([canonicalKey(word.word,word.caseMode),word.caseMode]);const group=groups.get(key)??[];group.push(word);groups.set(key,group);}
 return [...groups.values()].map(senses=>({...senses[0],relatedSenses:senses.length>1?senses:undefined}));
}
/** Avoid duplicate labels in a chooser; retain all stored records and the current route. */
export function visibleSenseChoices(words:LibraryWord[],currentId:string){
 const choices=new Map<string,LibraryWord>();
 for(const word of words){const pos=word.pos.trim().toLowerCase().replace(/\.$/,'');const key=JSON.stringify([pos,searchTerms(word.vi)]);if(!choices.has(key)||word.id===currentId)choices.set(key,word);}
 return [...choices.values()];
}
