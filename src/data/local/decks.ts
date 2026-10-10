import {z} from 'zod';
import type {LocalRepository} from './repository';
import {RepositoryError} from './repository';
import type {ScopedDocument} from './types';
export const deckSchema=z.object({name:z.string().trim().min(1).max(100),senseIds:z.array(z.string().min(1).max(100)).min(1).max(500),direction:z.enum(['en-vi','vi-en'])}).strict();
export type Deck=z.infer<typeof deckSchema>;
export async function saveDeck(repo:LocalRepository,id:string,version:number|null,deck:Deck){const parsed=deckSchema.parse(deck);if(new Set(parsed.senseIds).size!==parsed.senseIds.length)throw new RepositoryError('invalid');return repo.db.transaction('rw',repo.db.tables,async()=>{const words=await repo.words(parsed.senseIds);if(words.length!==parsed.senseIds.length||words.some(w=>!w.approved))throw new RepositoryError('invalid');const table=repo.db.table<ScopedDocument>('decks'),old=await table.get([repo.scope.id,id]);if((old?.version??null)!==version)throw new RepositoryError('conflict');const at=new Date().toISOString(),row={scopeId:repo.scope.id,id,createdAt:old?.createdAt??at,updatedAt:at,deletedAt:null,version:(old?.version??0)+1,payload:{deck:parsed}};await table.put(row);return row;});}
