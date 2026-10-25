import type {LibraryWord} from '@/data/local/types';
import type {GrammarSnapshot} from './grammar-game';
import {safeArt} from '@/lib/media/catalog';
export const categories={animals:{vi:'Động vật',en:'Animals'},food:{vi:'Đồ ăn',en:'Food'},school:{vi:'Đồ dùng học tập',en:'School things'},clothes:{vi:'Quần áo',en:'Clothes'},vehicles:{vi:'Phương tiện',en:'Vehicles'}} as const;
export type WordCategory=keyof typeof categories;
export type PlayWord={id:string;text:string;vi:string;en:string;example:string;art:string;revision:string;category?:WordCategory;plural?:string;article?:'a'|'an';onset?:string;accent?:string;singleArt:boolean;portable:boolean};
// Reviewed asset facts, not a vocabulary/question list. Unknown/multi-object art is never silently counted.
const singleObjectArt=new Set(['apple','banana','orange','egg','book','bag','pen','pencil','cat','dog','bird','fish','chair','ruler','glue','scissors','eraser','tree','car','sun','shelf','notebook']);
const head=(adjectives:string,nouns:string)=>new RegExp(`^(?:an?\\s+|the\\s+)?(?:(?:${adjectives})\\s+){0,5}(?:${nouns})\\b`,'i');
const categoryEvidence:Record<WordCategory,RegExp>={
 animals:head('small|large|big|little|wild|domestic|domesticated|young|friendly|aquatic|flying|feathered|furry|four-legged|warm-blooded|living|common|tame|very','animal|mammal|pet|bird|fish|insect'),
 food:head('round|sweet|fresh|yellow|small|large|soft|white|green|citrus|edible|ripe|cooked|hard|red|orange|brown|hot|cold|healthy|frozen|liquid|baked','fruit|vegetable|food|drink|beverage|bread|milk'),
 school:/^(?:an? )?(?:set|collection) of (?:paper )?pages\b|\b(?:used|useful) (?:for (?:writing|drawing|reading)|to (?:write|draw|read))\b/i,
 clothes:head('small|large|long|short|warm|outer|waterproof|soft','garment|clothing|clothes|(?:piece|item|article) of clothing'),
 vehicles:head('road|motor|motorized|public|large|small|four-wheeled|two-wheeled|wheeled|powered|electric|long|rail','vehicle'),
};
const indirectDefinition=/\b(?:not|without|unlike|like|shaped|resembles?|costume|toy|picture)\b/i;

const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function approvedOnset(word:LibraryWord){
 const row=word.pronunciations.find(p=>p.text===word.word&&p.ipa&&(p.verified||p.sourceUrl)&&p.approvedContentVersion===p.contentVersion);
 if(!row?.ipa)return null;
 const ipa=row.ipa.replace(/[\/\[\]ˈˌ.\s]/g,'');
 // Use pronunciation evidence, never the first written letter (chair/ship etc.).
 const onset=/^(tʃ|dʒ|[bpkɡgmfnlszʃʒvθðhwrj])/.exec(ipa)?.[1];
 return onset?{onset:onset==='g'?'ɡ':onset,accent:row.accent}:null;
}
export function playWord(word:LibraryWord):PlayWord|null{
 if(!word.approved||!safeArt(word.art)||!word.vi.trim()||!word.en.trim())return null;
 const noun=['noun','danh từ'].includes(word.pos.trim().toLowerCase());
 const examples=[word.example,...word.examplePronunciations.map(p=>p.text)];
 const article=examples.map(s=>new RegExp(`\\b(a|an)\\s+${escape(word.word)}(?=[^a-z]|$)`,'i').exec(s)?.[1].toLowerCase()).find(Boolean) as 'a'|'an'|undefined;
 // A regular plural must actually occur in approved evidence; this does not append s as an answer.
 const forms=[`${word.word}s`,`${word.word}es`,...(/y$/i.test(word.word)?[word.word.slice(0,-1)+'ies']:[])];
 const plural=noun?forms.find(form=>examples.some(s=>new RegExp(`\\b${escape(form)}\\b`,'i').test(s))):undefined;
 const matches=noun&&!indirectDefinition.test(word.en)?Object.entries(categoryEvidence).filter(([,pattern])=>pattern.test(word.en.replace(/,/g,' ').replace(/\s+/g,' ').trim())).map(([key])=>key as WordCategory):[];
 const category=matches.length===1?matches[0]:undefined,onset=approvedOnset(word);
 const portable=noun&&!!article&&!/\b(?:person|people|man|woman|child|idea|feeling|word|sentence|question|vehicle|building|tree|furniture)\b/i.test(word.en)&&(!!category&&['food','school','clothes'].includes(category)||/\b(?:small object|round object|handheld|tool|instrument|shape)\b/i.test(word.en)&&!/\b(not|without|like)\b/i.test(word.en));
 return {id:word.id,text:word.word,vi:word.vi,en:word.en,example:word.example,art:word.art!,revision:word.revision,category,article,plural,onset:onset?.onset,accent:onset?.accent,singleArt:singleObjectArt.has(word.art!),portable};
}
export function grammarFor(grammars:GrammarSnapshot[],mode:string){
 return grammars.find(g=>{
  const unit=`${g.formula} ${g.title??''}`,example=g.example.trim();
  if(mode==='place-object')return !/\b(if|when|because)\b/i.test(example)&&/\b(?:is|are|put)\b.+\b(?:in|on|under)\s+(?:the|a|an)\b/i.test(example);
  if(mode==='one-many')return /\b(these|those|plural|there are)\b|số nhiều|số ít/i.test(`${unit} ${example}`);
  if(mode==='fox-shop')return /^(?:Can I have|I want(?! to\b)|I would like(?! to\b)|I'd like(?! to\b))\s+(?:a|an|one|two|three|\d)\b/i.test(example)||/^(?:One|Two|Three|\d) .+, please[.!?]$/i.test(example);
  return false;
 });
}
