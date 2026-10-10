import {z} from 'zod';
import {canonicalKey,exactSenseKey,searchTerms} from '@/domain/identity';
import {saveDeck,type Deck} from './decks';
import {learningItems,type LearningItem} from './learning-library';
import {RepositoryError,type LocalRepository} from './repository';
import type {ScopedDocument} from './types';
export type GroupMembers=NonNullable<Deck['group']>;
export type StudyGroup=ScopedDocument & {payload:{deck:Deck & {group:GroupMembers}}};
const normalized=(value:string)=>value.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
/** Keep accents, punctuation and different translations; no semantic merging. */
export const sentenceKey=(sentence:Pick<LearningItem,'textEn'|'textVi'>)=>JSON.stringify([normalized(sentence.textEn),normalized(sentence.textVi)]);
export async function groupCatalog(repo:LocalRepository){
 const [words,content,lessons]=await Promise.all([
  repo.db.searchIndex.where('[scopeId+ordinal]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray().then(rows=>repo.words(rows.filter(row=>row.approval).map(row=>row.id))),
  learningItems(repo,'sentences','',null,0,Number.MAX_SAFE_INTEGER),
  repo.db.lessons.where('[scopeId+learnedOn]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).reverse().toArray(),
 ]);
 const seen=new Set<string>();
 return {words:words.filter(word=>word.approved),sentences:content.items.filter(item=>{const key=sentenceKey(item);if(!item.textEn.trim()||seen.has(key))return false;seen.add(key);return true;}),lessons:lessons.filter(row=>!row.deletedAt)};
}
export async function studyGroups(repo:LocalRepository){
 const rows=await repo.db.table<ScopedDocument>('decks').where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray();
 return rows.filter(row=>!row.deletedAt&&(row.payload.deck as Deck)?.group).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||a.id.localeCompare(b.id)) as StudyGroup[];
}
export async function saveStudyGroup(repo:LocalRepository,input:{id:string;version:number|null;name:string;members:GroupMembers;lessonIds?:string[];days?:string[]}){
 z.string().trim().min(1).max(100).parse(input.name);
 return repo.db.transaction('rw',repo.db.tables,async()=>{
  const others=await studyGroups(repo);
  if(others.some(row=>row.id!==input.id&&normalized(row.payload.deck.name)===normalized(input.name)))throw new Error('duplicate');
  const old=await repo.db.table<ScopedDocument>('decks').get([repo.scope.id,input.id]);
  if(old&&(!(old.payload.deck as Deck).group||old.deletedAt))throw new RepositoryError('invalid');
  const catalog=await groupCatalog(repo),approvedWords=new Map(catalog.words.map(word=>[word.id,word]));
  const allSentences=(await learningItems(repo,'sentences','',null,0,Number.MAX_SAFE_INTEGER)).items;
  const wordIds=[...input.members.wordIds],sentences=[...input.members.sentences];
  const lessonIds=new Set(input.lessonIds??[]);
  for(const day of input.days??[])for(const lesson of catalog.lessons)if(lesson.learnedOn===day)lessonIds.add(lesson.id);
  if([...lessonIds].some(id=>!catalog.lessons.some(lesson=>lesson.id===id)))throw new RepositoryError('invalid');
  const links=await repo.db.lessonItems.where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray();
  for(const id of lessonIds){const ids=links.filter(link=>!link.deletedAt&&link.lessonId===id&&approvedWords.has(link.senseId)).map(link=>link.senseId);wordIds.push(...ids);sentences.push(...allSentences.filter(item=>ids.includes(item.senseId)).map(item=>({senseId:item.senseId,key:sentenceKey(item)})));}
  const uniqueWords=new Map<string,string>();
  for(const id of wordIds){const word=approvedWords.get(id);if(!word)throw new RepositoryError('invalid');const identity=JSON.stringify([canonicalKey(word.word,word.caseMode),word.caseMode,exactSenseKey(word.pos,word.sense)]);if(!uniqueWords.has(identity))uniqueWords.set(identity,id);}
  const uniqueSentences=new Map<string,GroupMembers['sentences'][number]>();
  for(const ref of sentences){if(!allSentences.some(item=>item.senseId===ref.senseId&&sentenceKey(item)===ref.key))throw new RepositoryError('conflict');if(!uniqueSentences.has(ref.key))uniqueSentences.set(ref.key,ref);}
  const group={wordIds:[...uniqueWords.values()],sentences:[...uniqueSentences.values()]};
  const row=await saveDeck(repo,input.id,input.version,{name:input.name.trim(),direction:'en-vi',senseIds:[...new Set([...group.wordIds,...group.sentences.map(ref=>ref.senseId)])],group});
  const before=(old?.payload.deck as Deck|undefined)?.group;
  const added=group.wordIds.filter(id=>!before?.wordIds.includes(id)).length+group.sentences.filter(ref=>!before?.sentences.some(s=>s.key===ref.key)).length;
  return {row:row as StudyGroup,added,duplicates:wordIds.length+sentences.length-group.wordIds.length-group.sentences.length};
 });
}
export async function groupContents(repo:LocalRepository,row:StudyGroup,query=''){
 if(row.scopeId!==repo.scope.id||row.deletedAt)throw new RepositoryError('scope');
 const [words,content]=await Promise.all([repo.words(row.payload.deck.group.wordIds),learningItems(repo,'sentences','',null,0,Number.MAX_SAFE_INTEGER)]);
 const refs=new Map(row.payload.deck.group.sentences.map(ref=>[ref.key,ref.senseId]));
 const seen=new Set<string>();
 const sentences=content.items.filter(item=>{const key=sentenceKey(item);if(refs.get(key)!==item.senseId||seen.has(key))return false;seen.add(key);return true;});
 const available=words.filter(word=>word.approved),needle=searchTerms(query);
 return {words:available.filter(word=>searchTerms(`${word.word} ${word.vi} ${word.pos}`).includes(needle)),sentences:sentences.filter(item=>searchTerms(`${item.textEn} ${item.textVi}`).includes(needle)),missing:row.payload.deck.group.wordIds.length+refs.size-available.length-sentences.length};
}
