import {z} from 'zod';
import type {LocalRepository} from './repository';
import {RepositoryError} from './repository';
import type {ScopedDocument} from './types';
const memberRefSchema=z.object({senseId:z.string().min(1).max(100),key:z.string().min(1).max(14000)}).strict();
export const groupSetSchema=z.object({id:z.string().min(1).max(120),lessonId:z.string().min(1).max(100).optional(),title:z.string().max(200),learnedOn:z.iso.date(),sourceType:z.enum(['image','manual','demo']),wordIds:z.array(z.string().min(1).max(100)),sentenceKeys:z.array(z.string().max(14000)),grammarKeys:z.array(z.string().max(14000))}).strict();
export const groupMembersSchema=z.object({wordIds:z.array(z.string().min(1).max(100)),sentences:z.array(memberRefSchema),grammar:z.array(memberRefSchema).optional(),sets:z.array(groupSetSchema).optional()}).strict();
export type GroupSet=z.infer<typeof groupSetSchema>;
export const deckSchema=z.object({name:z.string().trim().min(1).max(100),senseIds:z.array(z.string().min(1).max(100)),direction:z.enum(['en-vi','vi-en']),group:groupMembersSchema.optional()}).strict().superRefine((deck,ctx)=>{
 if(!deck.group&&!deck.senseIds.length)ctx.addIssue({code:'custom',message:'empty-deck'});
 if(new Set(deck.senseIds).size!==deck.senseIds.length)ctx.addIssue({code:'custom',message:'duplicate-member'});
 if(deck.group){const ids=new Set(deck.senseIds),{wordIds:words,sentences,grammar=[],sets}=deck.group,refs=[...sentences,...grammar];
  if(new Set(words).size!==words.length||new Set(sentences.map(s=>s.key)).size!==sentences.length||new Set(grammar.map(s=>s.key)).size!==grammar.length||[...words,...refs.map(s=>s.senseId)].some(id=>!ids.has(id))||deck.senseIds.some(id=>!words.includes(id)&&!refs.some(s=>s.senseId===id)))ctx.addIssue({code:'custom',message:'invalid-group-members'});
  if(sets){const setWords=sets.flatMap(s=>s.wordIds),setSentences=sets.flatMap(s=>s.sentenceKeys),setGrammar=sets.flatMap(s=>s.grammarKeys);for(const [members,assigned] of [[words,setWords],[sentences.map(s=>s.key),setSentences],[grammar.map(s=>s.key),setGrammar]])if(assigned.length!==members.length||new Set(assigned).size!==assigned.length||assigned.some(id=>!members.includes(id)))ctx.addIssue({code:'custom',message:'invalid-group-sets'});if(new Set(sets.map(s=>s.id)).size!==sets.length)ctx.addIssue({code:'custom',message:'duplicate-group-set'});}
 }

});
export type Deck=z.infer<typeof deckSchema>;
export async function saveDeck(repo:LocalRepository,id:string,version:number|null,deck:Deck){const parsed=deckSchema.parse(deck);if(new Set(parsed.senseIds).size!==parsed.senseIds.length)throw new RepositoryError('invalid');return repo.db.transaction('rw',repo.db.tables,async()=>{const words=await repo.words(parsed.senseIds);if(words.length!==parsed.senseIds.length||words.some(w=>!w.approved))throw new RepositoryError('invalid');const table=repo.db.table<ScopedDocument>('decks'),old=await table.get([repo.scope.id,id]);if((old?.version??null)!==version)throw new RepositoryError('conflict');const at=new Date().toISOString(),row={scopeId:repo.scope.id,id,createdAt:old?.createdAt??at,updatedAt:at,deletedAt:null,version:(old?.version??0)+1,payload:{deck:parsed}};await table.put(row);return row;});}

/** All membership references travel together during cloud identity reconciliation. */
export function remapGroup(group:NonNullable<Deck['group']>,sense:(id:string)=>string,lesson:(id:string)=>string=id=>id):NonNullable<Deck['group']>{
 const refs=(items:typeof group.sentences)=>items.map(item=>({...item,senseId:sense(item.senseId)}));
 const assigned=new Set<string>();
 return {...group,wordIds:[...new Set(group.wordIds.map(sense))],sentences:refs(group.sentences),...(group.grammar?{grammar:refs(group.grammar)}:{}),...(group.sets?{sets:group.sets.map(set=>({...set,...(set.lessonId?{lessonId:lesson(set.lessonId)}:{}),wordIds:[...new Set(set.wordIds.map(sense))].filter(id=>{if(assigned.has(id))return false;assigned.add(id);return true;})})).filter(set=>set.wordIds.length+set.sentenceKeys.length+set.grammarKeys.length)}:{})};
}
