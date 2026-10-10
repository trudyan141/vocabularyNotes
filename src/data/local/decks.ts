import {z} from 'zod';
import type {LocalRepository} from './repository';
import {RepositoryError} from './repository';
import type {ScopedDocument} from './types';
export const groupMembersSchema=z.object({wordIds:z.array(z.string().min(1).max(100)),sentences:z.array(z.object({senseId:z.string().min(1).max(100),key:z.string().min(1).max(10000)}).strict())}).strict();
export const deckSchema=z.object({name:z.string().trim().min(1).max(100),senseIds:z.array(z.string().min(1).max(100)),direction:z.enum(['en-vi','vi-en']),group:groupMembersSchema.optional()}).strict().superRefine((deck,ctx)=>{
 if(!deck.group&&!deck.senseIds.length)ctx.addIssue({code:'custom',message:'empty-deck'});
 if(new Set(deck.senseIds).size!==deck.senseIds.length)ctx.addIssue({code:'custom',message:'duplicate-member'});
 if(deck.group){const ids=new Set(deck.senseIds),words=deck.group.wordIds,sentences=deck.group.sentences;
  if(new Set(words).size!==words.length||new Set(sentences.map(s=>s.key)).size!==sentences.length||[...words,...sentences.map(s=>s.senseId)].some(id=>!ids.has(id))||deck.senseIds.some(id=>!words.includes(id)&&!sentences.some(s=>s.senseId===id)))ctx.addIssue({code:'custom',message:'invalid-group-members'});
 }
});
export type Deck=z.infer<typeof deckSchema>;
export async function saveDeck(repo:LocalRepository,id:string,version:number|null,deck:Deck){const parsed=deckSchema.parse(deck);if(new Set(parsed.senseIds).size!==parsed.senseIds.length)throw new RepositoryError('invalid');return repo.db.transaction('rw',repo.db.tables,async()=>{const words=await repo.words(parsed.senseIds);if(words.length!==parsed.senseIds.length||words.some(w=>!w.approved))throw new RepositoryError('invalid');const table=repo.db.table<ScopedDocument>('decks'),old=await table.get([repo.scope.id,id]);if((old?.version??null)!==version)throw new RepositoryError('conflict');const at=new Date().toISOString(),row={scopeId:repo.scope.id,id,createdAt:old?.createdAt??at,updatedAt:at,deletedAt:null,version:(old?.version??0)+1,payload:{deck:parsed}};await table.put(row);return row;});}
