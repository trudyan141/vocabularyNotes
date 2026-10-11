import { z } from "zod";
import {safeArt} from "@/lib/media/catalog";
import type { LocalRepository } from "./repository";
import { contentHash, stableJson } from "@/domain/identity";
import { RepositoryError } from "./repository";
import type { LibraryWord, Note, ReviewEvent, ScopedDocument } from "./types";
export const wordSchema=z.object({id:z.string().min(1).max(100),word:z.string().min(1).max(200),vi:z.string().max(1000),en:z.string().max(1000),example:z.string().max(2000),exampleVi:z.string().max(2000),art:z.string().max(100).nullable(),lesson:z.string().max(100),pos:z.string().min(1).max(60),sense:z.string().min(1).max(200),ready:z.boolean(),source:z.string().max(2000),origin:z.enum(["demo","user","source","ai_generated"]),revision:z.string(),caseMode:z.enum(["fold","exact"]),approved:z.boolean(),tags:z.array(z.string().max(100)).max(30),
  pronunciations:z.array(z.object({text:z.string().max(2000),contentVersion:z.number().int().positive(),accent:z.enum(["UK","US","other"]),ipa:z.string().max(2000).nullable(),sourceUrl:z.string().max(2000).nullable(),verified:z.boolean(),readingHintVi:z.string().max(2000).nullable(),origin:z.enum(["source","user","ai_generated"]),approvedContentVersion:z.number().int().positive().nullable()}).strict()).max(4),
  examplePronunciations:z.array(z.object({text:z.string().max(2000),contentVersion:z.number().int().positive(),accent:z.enum(["UK","US","other"]),ipa:z.string().max(2000).nullable(),sourceUrl:z.string().max(2000).nullable(),verified:z.boolean(),readingHintVi:z.string().max(2000).nullable(),origin:z.enum(["source","user","ai_generated"]),approvedContentVersion:z.number().int().positive().nullable()}).strict()).max(4),
  pendingEdit:z.object({patch:z.object({word:z.string().max(200),vi:z.string().max(1000),en:z.string().max(1000)}).strict(),contentBaseVersion:z.number().int().positive(),createdAt:z.string().max(50)}).strict().nullable().optional(),}).strict();
const noteSchema=z.object({id:z.string().max(100),targetId:z.string().max(100),text:z.string().max(10000),mnemonicData:z.object({template:z.enum(["word-association","sentence-chunks","grammar-transform"])}).strict().nullable().optional()}).strict();
const backupSchema=z.object({formatVersion:z.literal("words-for-kids.text.v1"),exportedAt:z.string().max(50),words:z.array(wordSchema).max(10000),notes:z.array(noteSchema).max(10000),
  checksum:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export type Backup=z.infer<typeof backupSchema>;
export async function exportBackup(repo:LocalRepository):Promise<Backup>{
  const data=await repo.db.transaction("r",repo.db.tables,async()=>{
    const senses=await repo.db.senses.where("[scopeId+entryId]").between([repo.scope.id,""],[repo.scope.id,"\uffff"]).toArray();
    const words=await repo.words(senses.filter(s=>!s.deletedAt).map(s=>s.id));
    const notes=await repo.db.notes.where("[scopeId+targetType+targetId]").between([repo.scope.id,"sense",""],[repo.scope.id,"sense","\uffff"]).toArray();
    return {formatVersion:"words-for-kids.text.v1" as const,exportedAt:new Date().toISOString(),words,
      notes:notes.filter(n=>!n.deletedAt).map(n=>({id:n.id,targetId:n.targetId,text:n.text,mnemonicData:n.mnemonicData??null}))};
  });
  return {...data,checksum:await contentHash(data)};
}
export async function parseBackup(raw:string):Promise<Backup>{
  if(new TextEncoder().encode(raw).length>20_000_000)throw new RepositoryError("invalid");
  const backup=backupSchema.parse(JSON.parse(raw));const {checksum,...data}=backup;
  if(await contentHash(data)!==checksum)throw new RepositoryError("invalid");
  const ids=new Set(backup.words.map(w=>w.id));if(ids.size!==backup.words.length||backup.notes.some(n=>!ids.has(n.targetId)))throw new RepositoryError("invalid");
  return backup;
}
export async function importBackup(repo:LocalRepository,backup:Backup){
  const validated=await parseBackup(stableJson(backup));
  // Decode/checksum before opening a transaction. Merge preserves existing edits.
  const lessonId=`backup-${validated.checksum.slice(0,24)}`,operationId=`import-${validated.checksum}`;
  if(!validated.words.length)return {added:0,linked:0};
  const input={operationId,lessonId,title:"Từ khôi phục từ bản sao",learnedOn:validated.exportedAt.slice(0,10),sourceType:"manual" as const,
    items:validated.words.map(w=>({id:`restored-${w.id}`.slice(0,100),word:w.word,vi:w.vi,en:w.en,example:w.example,exampleVi:w.exampleVi,art:safeArt(w.art),lesson:lessonId,pos:w.pos,sense:w.sense,ready:w.ready,source:w.source,
      caseMode:w.caseMode,origin:w.origin,approved:false,tags:w.tags,pronunciations:w.pronunciations.map(p=>({...p,verified:false})),examplePronunciations:w.examplePronunciations.map(p=>({...p,verified:false}))}))};
  const result=await repo.saveLesson(input);
  // Restored content is reviewed before child use, even if backup claimed approval.
  for(const old of validated.words){const candidates=(await repo.search(old.word,{lesson:lessonId})).words;
    const restored=candidates.find(w=>w.word===old.word&&w.pos===old.pos&&w.sense===old.sense);if(!restored)continue;
    for(const note of validated.notes.filter(n=>n.targetId===old.id)){
      const id=`restore-${validated.checksum.slice(0,20)}-${note.id}`.slice(0,100);if(await repo.db.notes.get([repo.scope.id,id]))continue;
      await repo.saveNote({id,targetId:restored.id,targetType:"sense",text:note.text,expectedVersion:null,mnemonicData:note.mnemonicData});
    }
  }
  return result;
}
export async function deleteWord(repo:LocalRepository,word:LibraryWord){
  const {deleteItem}=await import('./delete');
  await deleteItem(repo,{table:'senses',id:word.id,version:Number(word.revision.split(':')[1]),revision:word.revision});
}
// Keep exported learning data separate from machine credentials and raw image blobs.
export type SavedLearningRecords={notes:Note[];reviews:ReviewEvent[];states:ScopedDocument[]};
