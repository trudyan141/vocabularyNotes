import {z} from 'zod';
import {canonicalKey,exactSenseKey,searchTerms} from '@/domain/identity';
import {saveDeck,type Deck} from './decks';
import {learningItems,groupGrammarItems,type LearningItem} from './learning-library';
import {RepositoryError,type LocalRepository} from './repository';
import {assignGroupSets} from './group-sets';
import type {ScopedDocument} from './types';
export type GroupMembers=NonNullable<Deck['group']>;
export type StudyGroup=ScopedDocument & {payload:{deck:Deck & {group:GroupMembers}}};
const normalized=(value:string)=>value.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
/** Keep accents, punctuation, translations and different teaching explanations. */
export const sentenceKey=(item:Pick<LearningItem,'textEn'|'textVi'>)=>JSON.stringify([normalized(item.textEn),normalized(item.textVi)]);
export const grammarKey=(item:LearningItem)=>JSON.stringify([item.title,item.textEn,item.textVi,item.analysis??'',item.mistake??'',item.correction??''].map(normalized));
function unique(items:LearningItem[],key:(item:LearningItem)=>string){const seen=new Set<string>();return items.filter(item=>{const id=key(item);if(!item.textEn.trim()||seen.has(id))return false;seen.add(id);return true;});}
const newestLearning=(items:LearningItem[])=>items.slice().sort((a,b)=>{const time=(item:LearningItem)=>[item.createdAt??'',...(item.related??[]).map(row=>row.createdAt??'')].sort().at(-1)!;return time(b).localeCompare(time(a))||b.id.localeCompare(a.id);});
export async function groupCatalog(repo:LocalRepository){
 const [words,sentences,grammar,lessons,links]=await Promise.all([
  repo.db.searchIndex.where('[scopeId+ordinal]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).reverse().toArray().then(rows=>repo.words(rows.filter(row=>row.approval).map(row=>row.id))),
  learningItems(repo,'sentences','',null,0,Number.MAX_SAFE_INTEGER),
  learningItems(repo,'grammar','',null,0,Number.MAX_SAFE_INTEGER,false),
  repo.db.lessons.where('[scopeId+learnedOn]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).reverse().toArray(),
  repo.db.lessonItems.where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray(),
 ]);
 return {words:words.filter(word=>word.approved),sentences:newestLearning(unique(sentences.items,sentenceKey)),grammar:newestLearning(groupGrammarItems(unique(grammar.items,grammarKey))),allSentences:sentences.items,allGrammar:grammar.items,lessons:lessons.filter(row=>!row.deletedAt).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id)),links:links.filter(row=>!row.deletedAt)};
}
export async function studyGroups(repo:LocalRepository){
 const rows=await repo.db.table<ScopedDocument>('decks').where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray();
 return rows.filter(row=>!row.deletedAt&&(row.payload.deck as Deck)?.group).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||a.id.localeCompare(b.id)) as StudyGroup[];
}
export async function saveStudyGroup(repo:LocalRepository,input:{id:string;version:number|null;name:string;members:GroupMembers;lessonIds?:string[];days?:string[];includeSentences?:boolean}){
 z.string().trim().min(1).max(100).parse(input.name);
 return repo.db.transaction('rw',repo.db.tables,async()=>{
  const others=await studyGroups(repo);
  if(others.some(row=>row.id!==input.id&&normalized(row.payload.deck.name)===normalized(input.name)))throw new Error('duplicate');
  const old=await repo.db.table<ScopedDocument>('decks').get([repo.scope.id,input.id]);
  if(old&&(!(old.payload.deck as Deck).group||old.deletedAt))throw new RepositoryError('invalid');
  if((old?.version??null)!==input.version)throw new RepositoryError('conflict');
  const catalog=await groupCatalog(repo),approvedWords=new Map(catalog.words.map(word=>[word.id,word]));
  const wordIds=[...input.members.wordIds],sentences=[...input.members.sentences],grammar=[...(input.members.grammar??[])];
  const lessonIds=new Set(input.lessonIds??[]),preferred=new Map<string,string>();
  for(const day of input.days??[])for(const lesson of catalog.lessons)if(lesson.learnedOn===day)lessonIds.add(lesson.id);
  if([...lessonIds].some(id=>!catalog.lessons.some(lesson=>lesson.id===id)))throw new RepositoryError('invalid');
  for(const id of lessonIds){
   const ids=new Set(catalog.links.filter(link=>link.lessonId===id&&approvedWords.has(link.senseId)).map(link=>link.senseId));wordIds.push(...ids);
   for(const word of ids)if(!preferred.has(`words:${word}`))preferred.set(`words:${word}`,id);
   for(const [type,items,key,refs] of [['sentences',catalog.allSentences,sentenceKey,sentences],['grammar',catalog.allGrammar,grammarKey,grammar]] as const){
    if(type==='sentences'&&input.includeSentences===false)continue;
    for(const item of items.filter(item=>ids.has(item.senseId)&&(!item.lessonId||item.lessonId===id))){const ref={senseId:item.senseId,key:key(item)};refs.push(ref);if(!preferred.has(`${type}:${ref.key}`))preferred.set(`${type}:${ref.key}`,id);}
   }
  }
  const duplicateItems:{kind:"word"|"sentence"|"grammar";label:string}[]=[];const before=(old?.payload.deck as Deck|undefined)?.group;const uniqueWords=new Map<string,string>();
  for(const id of wordIds){const word=approvedWords.get(id);if(!word)throw new RepositoryError('invalid');const identity=JSON.stringify([canonicalKey(word.word,word.caseMode),word.caseMode,exactSenseKey(word.pos,word.sense)]);if(uniqueWords.has(identity)||before?.wordIds.includes(id))duplicateItems.push({kind:"word",label:word.word});if(!uniqueWords.has(identity))uniqueWords.set(identity,id);}
  function uniqueRefs(refs:GroupMembers['sentences'],items:LearningItem[],key:(item:LearningItem)=>string,kind:'sentence'|'grammar'){
   const available=new Map(items.map(item=>[JSON.stringify([item.senseId,key(item)]),item])),result=new Map<string,typeof refs[number]>();
   for(const ref of refs){const item=available.get(JSON.stringify([ref.senseId,ref.key]));if(!item)throw new RepositoryError('conflict');const identity=kind==='grammar'?(item.family??ref.key):ref.key;const existed=(kind==='grammar'?before?.grammar:before?.sentences)?.some(old=>old.key===ref.key);if(result.has(identity)||existed)duplicateItems.push({kind,label:item.example||item.textEn});if(!result.has(identity))result.set(identity,ref);}
   return [...result.values()];
  }
  const group:GroupMembers={wordIds:[...uniqueWords.values()],sentences:uniqueRefs(sentences,catalog.allSentences,sentenceKey,'sentence'),grammar:uniqueRefs(grammar,catalog.allGrammar,grammarKey,'grammar')};
  group.sets=assignGroupSets(group,catalog.lessons,catalog.links,{sentences:catalog.allSentences,grammar:catalog.allGrammar},{sentence:sentenceKey,grammar:grammarKey},before?.sets,preferred);
  const sameMembers=!!before&&JSON.stringify([group.wordIds.slice().sort(),group.sentences.map(ref=>ref.key).sort(),(group.grammar??[]).map(ref=>ref.key).sort()])===JSON.stringify([before.wordIds.slice().sort(),before.sentences.map(ref=>ref.key).sort(),(before.grammar??[]).map(ref=>ref.key).sort()]);
  const unchanged=!!old&&sameMembers&&(old.payload.deck as Deck).name===input.name.trim();
  const row=unchanged?old:await saveDeck(repo,input.id,input.version,{name:input.name.trim(),direction:'en-vi',senseIds:[...new Set([...group.wordIds,...group.sentences.map(ref=>ref.senseId),...(group.grammar??[]).map(ref=>ref.senseId)])],group});
  const added=group.wordIds.filter(id=>!before?.wordIds.includes(id)).length+group.sentences.filter(ref=>!before?.sentences.some(s=>s.key===ref.key)).length+(group.grammar??[]).filter(ref=>!before?.grammar?.some(s=>s.key===ref.key)).length;
  const addedItems=[...group.wordIds.filter(id=>!before?.wordIds.includes(id)).map(id=>({kind:'word',label:approvedWords.get(id)!.word})),...group.sentences.filter(ref=>!before?.sentences.some(s=>s.key===ref.key)).map(ref=>({kind:'sentence',label:catalog.allSentences.find(item=>item.senseId===ref.senseId&&sentenceKey(item)===ref.key)!.textEn})),...(group.grammar??[]).filter(ref=>!before?.grammar?.some(s=>s.key===ref.key)).map(ref=>({kind:'grammar',label:catalog.allGrammar.find(item=>item.senseId===ref.senseId&&grammarKey(item)===ref.key)!.title}))];
  return {row:row as StudyGroup,added,addedItems,unchanged,duplicateItems:[...new Map(duplicateItems.map(item=>[`${item.kind}:${item.label}`,item])).values()],duplicates:duplicateItems.length};
 });
}
export async function groupContents(repo:LocalRepository,row:StudyGroup,query=''){
 if(row.scopeId!==repo.scope.id||row.deletedAt)throw new RepositoryError('scope');
 const catalog=await groupCatalog(repo),members=row.payload.deck.group,wordIds=new Set(members.wordIds),words=catalog.words.filter(word=>wordIds.has(word.id));
 function referenced(refs:GroupMembers['sentences'],items:LearningItem[],key:(item:LearningItem)=>string){const expected=new Map(refs.map(ref=>[ref.key,ref.senseId]));return unique(items.filter(item=>expected.get(key(item))===item.senseId),key);}
 const sentences=referenced(members.sentences,catalog.allSentences,sentenceKey),grammar=referenced(members.grammar??[],catalog.allGrammar,grammarKey),needle=searchTerms(query);
 const sets=assignGroupSets(members,catalog.lessons,catalog.links,{sentences:catalog.allSentences,grammar:catalog.allGrammar},{sentence:sentenceKey,grammar:grammarKey},members.sets,undefined,row.createdAt.slice(0,10));
 const matching=(item:LearningItem)=>searchTerms(`${item.title} ${item.textEn} ${item.textVi} ${item.analysis??''}`).includes(needle);
 return {words:words.filter(word=>searchTerms(`${word.word} ${word.vi} ${word.pos}`).includes(needle)),sentences:sentences.filter(matching),grammar:grammar.filter(matching),sets,missing:members.wordIds.length+members.sentences.length+(members.grammar?.length??0)-words.length-sentences.length-grammar.length};
}
