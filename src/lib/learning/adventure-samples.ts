import {catalog} from './catalog';
import {playWord,type PlayWord} from './adventure-facts';
import type {GrammarSnapshot} from './grammar-game';
// Project-authored fallback annotations only. Never consulted for selected library words.
const facts:Record<string,{category:PlayWord['category'];plural?:string;article?:'a'|'an';portable?:boolean}>={apple:{category:'food',plural:'apples',article:'an',portable:true},banana:{category:'food',plural:'bananas',article:'a',portable:true},orange:{category:'food',plural:'oranges',article:'an',portable:true},egg:{category:'food',plural:'eggs',article:'an',portable:true},book:{category:'school',plural:'books',article:'a',portable:true},bag:{category:'school',plural:'bags',article:'a',portable:true},pen:{category:'school',plural:'pens',article:'a',portable:true},cat:{category:'animals',plural:'cats',article:'a'},dog:{category:'animals',plural:'dogs',article:'a'},bird:{category:'animals',plural:'birds',article:'a'},milk:{category:'food'}};
export function samplePlayWords():PlayWord[]{return catalog.flatMap(word=>{const fact=facts[word.word];if(!fact)return [];const base=playWord({...word,approved:true,revision:'project-sample:1',caseMode:word.caseMode??'fold',origin:'user',tags:[],pronunciations:word.pronunciations??[],examplePronunciations:word.examplePronunciations??[]});return base?[{...base,...fact,id:`sample:${word.id}`}]:[];});}
export const sampleGrammar:GrammarSnapshot[]=[
 {id:'sample:position',version:1,formula:'Put + object + in/on/under + place',example:'Put the book under the table.',exampleVi:'Đặt sách dưới bàn.'},
 {id:'sample:quantity',version:1,formula:'Singular / plural',example:'These are books.',exampleVi:'Đây là những quyển sách.'},
 {id:'sample:request',version:1,formula:'Can I have + quantity + noun, please?',example:'Can I have two books, please?',exampleVi:'Cho mình hai quyển sách nhé?'},
];
