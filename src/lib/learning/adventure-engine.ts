import type {GrammarSnapshot} from './grammar-game';
import {shuffled} from './random';
import {categories,grammarFor,type PlayWord,type WordCategory} from './adventure-facts';
import {samplePlayWords,sampleGrammar} from './adventure-samples';
import type {AdventureMode} from './adventure-registry';
export type PlaceZone='on'|'under'|'in';
export type AdventureQuestion={id:string;target:PlayWord;choices:PlayWord[];cue:string;solution:string;explanation:string;answer?:string;categories?:WordCategory[];order?:number[];anchor?:PlayWord;phoneme?:string;count?:number;forms?:string[];relation?:PlaceZone;request?:{id:string;count:number}[]};
export type AdventurePack={mode:AdventureMode;source:'selection'|'sample';questions:AdventureQuestion[];grammar?:GrammarSnapshot;eligible:number;selected:number};
const countWords=['zero','one','two','three'] as const;
// Picture/meaning activities preserve separate senses; a bare spoken Bingo cue cannot disambiguate homonyms.
function distinct(words:PlayWord[],spokenOnly=false){const seen=new Set<string>();return words.filter(w=>{const key=spokenOnly?w.text.toLowerCase():w.id;if(seen.has(key))return false;seen.add(key);return true;});}
function peers(word:PlayWord,pool:PlayWord[]){return pool.filter(other=>other.id!==word.id&&other.text.toLowerCase()!==word.text.toLowerCase()&&other.art!==word.art&&other.vi!==word.vi);}
function pictureChoices(word:PlayWord,pool:PlayWord[],limit=3){return shuffled([word,...shuffled(peers(word,pool)).slice(0,limit-1)]);}
export function boardSizes(total:number){if(total<4)return [];const sizes:number[]=[];let remaining=total;while(remaining){let size=Math.min(9,remaining);if(remaining-size>0&&remaining-size<4)size-=4-(remaining-size);sizes.push(size);remaining-=size;}return sizes;}
function pluralWords(words:PlayWord[]){return words.filter(w=>w.plural&&w.singleArt);}
function classifyGroups(cats:WordCategory[]){return cats.length===4?[cats.slice(0,2),cats.slice(2)]:cats.length>3?[cats.slice(0,3),cats.slice(3)]:[cats];}
export function makeQuestions(mode:AdventureMode,words:PlayWord[],grammars:GrammarSnapshot[]){
 const pool=distinct(words,mode==='listen-bingo'),grammar=grammarFor(grammars,mode),questions:AdventureQuestion[]=[];
 const add=(target:PlayWord,fields:Partial<AdventureQuestion>)=>questions.push({id:`${mode}:${questions.length}:${target.id}`,target,choices:[],cue:target.text,solution:target.text,explanation:target.vi,...fields});
 if(mode==='sort-baskets'){
  const known=pool.filter(w=>w.category),cats=[...new Set(known.map(w=>w.category!))];
  if(cats.length>=2)for(const group of classifyGroups(cats))for(const word of shuffled(known.filter(w=>group.includes(w.category!))))add(word,{categories:group,choices:group.map(category=>known.find(peer=>peer.category===category&&peer.id!==word.id)??known.find(peer=>peer.category===category)!),solution:`${word.text}. ${categories[word.category!].en}.`,answer:word.category,explanation:`${word.vi} thuộc nhóm ${categories[word.category!].vi.toLowerCase()}.`});
 }else if(mode==='listen-bingo'){
  let offset=0;const ordered=shuffled(pool);for(const size of boardSizes(pool.length)){const cards=ordered.slice(offset,offset+size);offset+=size;add(cards[0],{choices:cards,order:shuffled(cards.map((_,i)=>i)),solution:'Bingo!',explanation:'Con đã tìm hết hình trên bảng.'});}
 }else if(mode==='word-detective'){
  const usable=pool.filter(w=>w.en.length>=12&&w.en.length<=160&&!new RegExp(`\\b${w.text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i').test(w.en));
  const signature=(w:PlayWord)=>new Set(w.en.toLowerCase().match(/[a-z]{4,}/g)?.filter(s=>!['with','that','this','have','has','used','from','made','small','large','thing','things','often'].includes(s))??[]);
  for(const word of usable){const terms=signature(word),safe=pool.filter(other=>other.id===word.id||![...signature(other)].some(term=>terms.has(term))&&(!word.category||!other.category||word.category!==other.category));const choices=pictureChoices(word,safe);if(choices.length>=2)add(word,{choices,cue:word.en,answer:word.id,explanation:word.vi});}
 }else if(mode==='sound-hunt'){
  for(const word of pool.filter(w=>w.onset)){const anchor=peers(word,pool).find(w=>w.onset===word.onset&&w.accent===word.accent),different=peers(word,pool).filter(w=>w.onset&&w.onset!==word.onset&&w.accent===word.accent);if(anchor&&different.length)add(word,{anchor,phoneme:word.onset,choices:shuffled([word,...shuffled(different).slice(0,2)]),cue:anchor.text,answer:word.id,explanation:`${anchor.text} và ${word.text} có cùng âm đầu /${word.onset}/.`});}
 }else if(mode==='place-object'&&grammar){
  const evidence=`${grammar.formula} ${grammar.example}`,relations=(['in','on','under'] as PlaceZone[]).filter(p=>new RegExp(`\\b${p}\\b`,'i').test(evidence));
  for(const [i,word] of pool.filter(w=>w.portable).entries()){const relation=relations[i%relations.length];if(!relation)continue;const where=relation==='in'?'in the box':`${relation} the table`,whereVi={in:'trong hộp',on:'trên bàn',under:'dưới bàn'}[relation];add(word,{relation,cue:`Put the ${word.text} ${where}.`,solution:`The ${word.text} is ${where}.`,explanation:`Đặt ${word.vi} ${whereVi}.`,answer:relation});}
 }else if(mode==='one-many'&&grammar){
  for(const [i,word] of pluralWords(pool).entries()){const count=1+i%3,form=count===1?word.text:word.plural!;add(word,{count,forms:shuffled([word.text,word.plural!]),answer:form,cue:'One or many?',solution:`${countWords[count][0].toUpperCase()+countWords[count].slice(1)} ${form}.`,explanation:`Có ${count} ${word.vi}; dùng ${form}.`});}
 }else if(mode==='fox-shop'&&grammar){
  const goods=pluralWords(pool).filter(w=>w.portable);for(const [index,word] of goods.entries()){const count=1+index%3,form=count===1?word.text:word.plural!,request=[{id:word.id,count}],choices=pictureChoices(word,goods,4);if(choices.length<2)continue;let cue=`${countWords[count][0].toUpperCase()+countWords[count].slice(1)} ${form}, please.`;if(/can i have/i.test(grammar.example))cue=`Can I have ${countWords[count]} ${form}, please?`;else if(/i(?: would|’d|'d) like/i.test(grammar.example))cue=`I would like ${countWords[count]} ${form}, please.`;else if(/i want/i.test(grammar.example))cue=`I want ${countWords[count]} ${form}, please.`;add(word,{count,choices,request,cue,solution:`${countWords[count][0].toUpperCase()+countWords[count].slice(1)} ${form}. Thank you!`,explanation:`Cáo cần ${count} ${word.vi}.`});}
 }
 return {questions:mode==='sort-baskets'?questions:shuffled(questions),grammar};
}
export function buildAdventure(mode:AdventureMode,words:PlayWord[],grammars:GrammarSnapshot[]):AdventurePack{
 const primary=makeQuestions(mode,words,grammars),sample=primary.questions.length?null:makeQuestions(mode,samplePlayWords(),sampleGrammar),result=sample??primary;
 return {mode,source:sample?'sample':'selection',questions:result.questions,grammar:result.grammar,selected:words.length,eligible:new Set(result.questions.flatMap(q=>mode==='listen-bingo'?q.choices.map(w=>w.id):[q.target.id])).size};
}
export type AdventureState={picked:number[];selected:number|null;marked:number[];zone:PlaceZone|null;wrong:boolean;checked:boolean;correct:boolean|null;hint:boolean};
export const newAdventureState=():AdventureState=>({picked:[],selected:null,marked:[],zone:null,wrong:false,checked:false,correct:null,hint:false});
export function adventureCorrect(mode:AdventureMode,q:AdventureQuestion,state:AdventureState){
 if(state.picked.some(i=>!Number.isInteger(i)||i<0||i>39)||state.marked.some(i=>!Number.isInteger(i)||i<0||i>=q.choices.length))return false;
 if(mode==='listen-bingo')return state.marked.length===q.choices.length&&new Set(state.marked).size===state.marked.length;
 if(mode==='fox-shop')return q.request!.every(item=>state.picked.filter(index=>q.choices[index]?.id===item.id).length===item.count)&&state.picked.every(index=>q.request!.some(item=>item.id===q.choices[index]?.id));
 if(mode==='place-object')return state.zone===q.relation;
 if(mode==='sort-baskets')return q.categories?.[state.selected??-1]===q.answer;
 if(mode==='one-many')return q.forms?.[state.selected??-1]===q.answer;
 return q.choices[state.selected??-1]?.id===q.answer;
}
