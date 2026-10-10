import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { Dexie } from "dexie";
import { LibraryDatabase } from "../../src/data/local/database";
import { LocalRepository } from "../../src/data/local/repository";
import { PracticeRepository } from "../../src/data/local/practice";
import { catalog } from "../../src/lib/learning/catalog";
import { exportBackup, importBackup, parseBackup } from "../../src/data/local/backup";
import {exportArchive,importArchive,parseArchive} from "../../src/data/local/archive";
import {saveDeck} from "../../src/data/local/decks";
import {saveContent} from "../../src/data/local/content";
import {contentHash} from "../../src/domain/identity";
import {learningItems} from "../../src/data/local/learning-library";
const databases:LibraryDatabase[]=[];
function repo(scope="guest:learning",name=`learning-${crypto.randomUUID()}`){const db=new LibraryDatabase(name);databases.push(db);return new LocalRepository(db,{kind:"guest",id:scope});}
async function seed(repository:LocalRepository,count=4){return repository.saveLesson({operationId:crypto.randomUUID(),title:"My words",learnedOn:"2026-10-09",sourceType:"manual",items:catalog.slice(0,count).map((w,i)=>({...w,id:`word-${i}`,approved:true}))});}
afterEach(async()=>{for(const db of databases.splice(0)){db.close();await Dexie.delete(db.name);}});
describe("complete local learning flows",()=>{
  it("saves and archives a deck beyond 500 words without changing short practice sessions",async()=>{
    const repository=repo();await seed(repository,1);const scope=repository.scope.id;
    const sense=(await repository.db.senses.get([scope,"word-0"]))!,entry=(await repository.db.entries.get([scope,sense.entryId]))!,index=(await repository.db.searchIndex.get([scope,"word-0"]))!;
    const senses=Array.from({length:501},(_,i)=>({...sense,id:`large-${i}`,entryId:`large-${i}`}));
    // Prepare the approved library in bulk; this test exercises decks, not 501 lesson submissions.
    await repository.db.transaction("rw",[repository.db.entries,repository.db.senses,repository.db.searchIndex],async()=>{
      await repository.db.entries.bulkPut(senses.map((s,i)=>({...entry,id:s.entryId,displayText:`word${i}`,canonicalKey:`word${i}`,activeKey:`word${i}`})));
      await repository.db.senses.bulkPut(senses);
      await repository.db.searchIndex.bulkPut(senses.map((s,i)=>({...index,id:s.id,terms:`word${i}`,ordinal:`word${i}`})));
    });
    const saved=await saveDeck(repository,"large-deck",null,{name:"501 words",senseIds:senses.map(s=>s.id),direction:"en-vi"});
    expect((saved.payload.deck as {senseIds:string[]}).senseIds).toHaveLength(501);
    const archive=await parseArchive(JSON.stringify(await exportArchive(repository)));expect(archive.records.decks[0].payload.deck.senseIds).toHaveLength(501);
    const session=await new PracticeRepository(repository).start("flashcard",{deck:"large-deck"});expect(session.questions).toHaveLength(10);
  });
  it("uses the same scoped due selection for Today and a capped review session",async()=>{
    const repository=repo();await seed(repository,4);await repository.saveLesson({operationId:crypto.randomUUID(),title:"Pending",learnedOn:"2026-10-09",sourceType:"manual",items:[{...catalog[4],id:"word-4",approved:false}]});const practice=new PracticeRepository(repository);
    const now=new Date().toISOString(),future=new Date(Date.now()+86400000).toISOString(),past=new Date(Date.now()-86400000).toISOString();
    for(const [id,dueAt,deletedAt] of [["word-0",future,null],["word-1",past,null],["word-2",future,now]] as const){await repository.db.table("reviewStates").put({scopeId:repository.scope.id,id,version:1,createdAt:now,updatedAt:now,deletedAt,payload:{state:{dueAt,intervalDays:1,ease:2.5,streak:1,algorithmVersion:1}}});}
    const foreign=repo("guest:foreign",repository.db.name);await foreign.db.table("reviewStates").put({scopeId:foreign.scope.id,id:"word-3",version:1,createdAt:now,updatedAt:now,deletedAt:null,payload:{state:{dueAt:future}}});
    const ids=await practice.dueIds();expect(ids.sort()).toEqual(["word-1","word-2","word-3"]);
    const session=await practice.start("flashcard",{due:true});expect(session.questions.map(q=>q.word.id).sort()).toEqual(ids);
    expect(await repository.db.reviewEvents.count()).toBe(0);expect(await new PracticeRepository(foreign).dueIds()).toEqual([]);
  });
  it("persists pronunciation, notes and templates without entering another scope",async()=>{
    const repository=repo();await seed(repository);const grape=(await repository.word("word-2"))!;
    expect(grape.pronunciations[0].ipa).toBe("/ɡɹeɪps/");expect(grape.examplePronunciations[0].readingHintVi).toBeTruthy();
    const saved=await repository.saveNote({id:"memory-note",targetId:grape.id,targetType:"sense",text:"Con thích nho.",expectedVersion:null,mnemonicData:{template:"word-association"}});
    await expect(repository.saveNote({id:saved.id,targetId:grape.id,targetType:"sense",text:"stale",expectedVersion:null})).rejects.toThrow("conflict");
    const foreign=repo("guest:other",repository.db.name);expect(await foreign.word(grape.id)).toBeUndefined();
    expect(await foreign.db.notes.get([foreign.scope.id,saved.id])).toBeUndefined();
  });
  it("requires reveal and persists one review/event/state through replay and reopen",async()=>{
    const repository=repo();await seed(repository);const practice=new PracticeRepository(repository);let session=await practice.start("flashcard");
    await expect(practice.answer(session.id,session.version,{rating:"Good"})).rejects.toThrow("invalid");
    session=await practice.reveal(session.id,session.version);const old=session;
    session=await practice.answer(session.id,session.version,{rating:"Good"});
    await expect(practice.answer(old.id,old.version,{rating:"Good"})).rejects.toThrow("conflict");
    expect(await repository.db.reviewEvents.count()).toBe(1);
    const state=await repository.db.table("reviewStates").get([repository.scope.id,old.questions[0].word.id]);expect(state.payload.state.intervalDays).toBe(1);
    repository.db.close();const reopened=repo(repository.scope.id,repository.db.name);const restored=await new PracticeRepository(reopened).get(session.id);
    expect(restored?.position).toBe(1);expect(restored?.answers).toHaveLength(1);
  });
  it("persists game feedback exactly once and never schedules from game scores",async()=>{
    const repository=repo();await seed(repository);const practice=new PracticeRepository(repository);let session=await practice.start("picture-word");
    expect(session.questions.every(q=>q.choices.length===3)).toBe(true);
    const answer=session.questions[0].word.word;session=await practice.check(session.id,session.version,answer);const answered=session;
    expect((await practice.get(session.id))?.checkedCorrect).toBe(true);
    await expect(practice.check(session.id,session.version,answer)).rejects.toThrow("conflict");
    session=await practice.answer(session.id,session.version,{});
    await expect(practice.answer(answered.id,answered.version,{})).rejects.toThrow("conflict");
    expect(await repository.db.table("gameAttempts").count()).toBe(1);expect(await repository.db.reviewEvents.count()).toBe(0);expect(await repository.db.table("reviewStates").count()).toBe(0);
    expect(session.answers[0].correct).toBe(true);
  });
  it("rejects stale questions after a parent edit and insufficient distinct picture choices",async()=>{
    const repository=repo();await seed(repository,2);const practice=new PracticeRepository(repository);
    await expect(practice.start("word-picture")).rejects.toThrow("not-ready");
    const session=await practice.start("spelling");const word=session.questions[0].word;
    await repository.editWord(word.id,word.revision,{word:word.word,vi:"đã sửa",en:word.en});
    await expect(practice.check(session.id,session.version,word.word)).rejects.toThrow("conflict");
    expect(await repository.db.table("gameAttempts").count()).toBe(0);
  });
  it("validates backup checksum and merges words/notes without overwriting existing edits",async()=>{
    const source=repo();await seed(source,3);await source.saveNote({id:"note-a",targetId:"word-0",targetType:"sense",text:"a note",expectedVersion:null});
    const backup=await exportBackup(source);expect(backup.words).toHaveLength(3);
    await expect(parseBackup(JSON.stringify({...backup,checksum:"a".repeat(64)}))).rejects.toThrow("invalid");
    const target=repo("guest:target");const first=await importBackup(target,backup);const again=await importBackup(target,backup);
    expect(first).toEqual(again);expect((await target.search("")).total).toBe(3);expect((await target.search("",{approvedOnly:true})).total).toBe(0);
    expect(await target.db.notes.count()).toBe(1);
    const existing=(await target.search("apple")).words[0];await target.editWord(existing.id,existing.revision,{word:existing.word,vi:"user edit",en:existing.en});
    await importBackup(target,backup);expect((await target.word(existing.id))?.vi).toBe("user edit");
  });
  it("reviews the complete changed word atomically and rejects stale approval",async()=>{
    const repository=repo();await seed(repository);const original=(await repository.word("word-0"))!;const {revision,pendingEdit,...content}=original;void pendingEdit;
    const updated=await repository.reviewWord(original.id,revision,{...content,word:"pear",vi:"quả lê",en:"A sweet fruit.",sense:"fruit",example:"I eat a pear.",exampleVi:"Con ăn quả lê.",approved:true,pronunciations:[],examplePronunciations:[],art:null});
    expect(updated?.word).toBe("pear");expect(updated?.example).toBe("I eat a pear.");expect(updated?.approved).toBe(true);
    await expect(repository.reviewWord(original.id,revision,{...content,approved:true})).rejects.toThrow("conflict");expect((await repository.search("pear")).total).toBe(1);expect((await repository.word(original.id))?.pronunciations).toEqual([]);
  });
  it("round-trips lessons, sources, notes, review history and sessions into an empty isolated library",async()=>{
    const source=repo();await seed(source,3);const practice=new PracticeRepository(source);let session=await practice.start("flashcard");session=await practice.reveal(session.id,session.version);await practice.answer(session.id,session.version,{rating:"Good"});
    await source.saveNote({id:"note",targetType:"sense",targetId:"word-0",text:"my note",expectedVersion:null});const archive=await exportArchive(source);expect(archive.records.reviewEvents).toHaveLength(1);
    const target=repo("guest:restored");await importArchive(target,archive);expect((await target.search("")).total).toBe(3);expect((await target.search("",{approvedOnly:true})).total).toBe(0);expect(await target.db.reviewEvents.where("[scopeId+id]").between([target.scope.id,""],[target.scope.id,"\uffff"]).count()).toBe(1);
    expect((await target.db.notes.get([target.scope.id,"note"]))?.text).toBe("my note");expect((await new PracticeRepository(target).get(session.id))?.scopeId).toBe(target.scope.id);
    await expect(importArchive(target,archive)).rejects.toThrow("conflict");expect((await source.word("word-0"))?.approved).toBe(true);
    const broken={...archive,records:{...archive.records,senses:archive.records.senses.map(s=>({...s,entryId:"missing"}))}};const {checksum,...data}=broken;void checksum;await expect(parseArchive(JSON.stringify({...data,checksum:await contentHash(data)}))).rejects.toThrow("invalid");
  });
 it("filters explicit due/weak/lesson decks and persists the reverse direction",async()=>{
  const repository=repo();await seed(repository,3);const practice=new PracticeRepository(repository);let game=await practice.start("spelling",{word:"word-2"});game=await practice.check(game.id,game.version,"wrong");await practice.answer(game.id,game.version,{});const weak=await practice.start("flashcard",{weak:true,direction:"vi-en"});expect(weak.questions.map(q=>q.word.id)).toEqual(["word-2"]);expect(weak.direction).toBe("vi-en");const revealed=await practice.reveal(weak.id,weak.version);await practice.answer(revealed.id,revealed.version,{rating:"Good"});const due=await practice.start("flashcard",{due:true});expect(due.questions.map(q=>q.word.id)).not.toContain("word-2");
 });
 it("validates parent-authored extra examples/grammar and rejects stale content writes",async()=>{
  const repository=repo();await seed(repository,1);const word=(await repository.word("word-0"))!;const data={senseId:word.id,targetRevision:word.revision,example:"She eats an apple.",exampleVi:"Bạn ấy ăn một quả táo.",readingHintVi:"",pattern:"She + verb-s + object",patternExplanation:"Câu khẳng định, hiện tại đơn.",grammarTitle:"Hiện tại đơn",conditions:"Thói quen",formula:"She + verb-s",analysis:"She là chủ ngữ; eats là động từ.",commonError:"She eat an apple.",correction:"She eats an apple.",approved:true as const,origin:"user" as const};
    const saved=await saveContent(repository,"extra",null,data);expect(saved.version).toBe(1);await expect(saveContent(repository,"extra",null,data)).rejects.toThrow("conflict");await expect(saveContent(repository,"other",null,{...data,conditions:""})).rejects.toThrow("invalid");expect((await exportArchive(repository)).records.sentences).toHaveLength(1);
    expect((await learningItems(repository,'sentences','')).total).toBe(3);
    expect((await learningItems(repository,'patterns','câu khẳng định')).total).toBe(1);
    expect((await learningItems(repository,'grammar','thói quen')).items[0].analysis).toBe(data.analysis);
    expect((await learningItems(repository,'grammar','','missing-lesson')).total).toBe(0);
    expect((await learningItems(repo('guest:foreign',repository.db.name),'grammar','')).total).toBe(0);
    await repository.editWord(word.id,word.revision,{word:word.word,vi:'nghĩa sửa',en:word.en});
    expect((await learningItems(repository,'grammar','')).total).toBe(0);
 });
 it("saves custom decks with version checks and filters their explicit senses",async()=>{
  const repository=repo();await seed(repository,4);const saved=await saveDeck(repository,"deck-1",null,{name:"My two words",senseIds:["word-0","word-2"],direction:"vi-en"});expect(saved.version).toBe(1);await expect(saveDeck(repository,"deck-1",null,{name:"stale",senseIds:["word-1"],direction:"en-vi"})).rejects.toThrow("conflict");const practice=await new PracticeRepository(repository).start("flashcard",{deck:"deck-1",direction:"vi-en"});expect(practice.questions.map(q=>q.word.id)).toEqual(["word-0","word-2"]);expect((await exportArchive(repository)).records.decks).toHaveLength(1);
 });
});

it('keeps the original example first while saving and reapproving a catalog second example',async()=>{const r=repo();await seed(r,1);let word=(await r.word('word-0'))!;expect(word.example).toBe('I eat an apple.');const extras=await r.db.examples.where('[scopeId+senseId]').equals([r.scope.id,word.id]).toArray();expect(extras).toHaveLength(2);const extra=extras.find(e=>e.position===1)!;const {revision:ignored,pendingEdit:ignoredEdit,...input}=word;void ignored;void ignoredEdit;await r.reviewWord(word.id,word.revision,{...input,approved:true,additionalExamples:[{textEn:extra.textEn,translationVi:extra.translationVi,pronunciations:extra.pronunciations}]});word=(await r.word('word-0'))!;expect(word.example).toBe('I eat an apple.');const current=(await r.db.examples.where('[scopeId+senseId]').equals([r.scope.id,word.id]).toArray()).filter(e=>!e.deletedAt);expect(current).toHaveLength(2);expect(current.find(e=>e.position===1)?.pronunciations[0].approvedContentVersion).toBe(2);});

import {objectPatterns} from '@/lib/learning/worksheet-patterns';
import {lessonSets} from '@/data/local/lesson-library';
it('saves worksheet grammar atomically, retains source separation and replays without duplicates',async()=>{const r=repo();const book=catalog.find(w=>w.word==='book')!;const learning=objectPatterns(book).map(item=>({...item,wordId:'book'}));const input={operationId:'grammar-op',lessonId:'photo-one',title:'Worksheet one',learnedOn:'2026-10-10',sourceType:'image' as const,items:[{...book,id:'book',approved:true}],learning};await r.saveLesson(input);await r.saveLesson(input);expect((await learningItems(r,'grammar','',input.lessonId)).total).toBe(2);expect((await learningItems(r,'patterns','')).items[0].source).toContain('Không phải');expect(await r.db.table('sentences').count()).toBe(2);const archive=await exportArchive(r);expect(await parseArchive(JSON.stringify(archive))).toBeTruthy();await expect(r.saveLesson({...input,operationId:'invalid',learning:[{...learning[0],wordId:'foreign'}]})).rejects.toThrow('invalid');expect(await r.db.lessons.count()).toBe(1);});
it('fills only missing pictures with CAS while preserving approved parent grammar',async()=>{const r=repo();const book=catalog.find(w=>w.word==='book')!;await r.saveLesson({operationId:'picture-op',title:'Missing picture',learnedOn:'2026-10-10',sourceType:'manual',items:[{...book,id:'book',art:null,approved:true}]});const word=(await r.word('book'))!;const content={...objectPatterns(book)[0].content,senseId:word.id,targetRevision:word.revision};await saveContent(r,'extra-book',null,content);await r.prepareLearning([{id:word.id,revision:word.revision,art:'book'}],{id:word.id,revision:word.revision,contents:objectPatterns(book)});expect((await r.word('book'))!.art).toBe('book');expect((await learningItems(r,'grammar','')).total).toBe(3);await expect(r.prepareLearning([{id:word.id,revision:word.revision,art:'cat'}],null)).rejects.toThrow('conflict');expect((await r.word('book'))!.art).toBe('book');});
it('groups typed words by local learning day and retains separate imported sets with new/review counts',async()=>{const r=repo();const apple=catalog.find(w=>w.word==='apple')!,book=catalog.find(w=>w.word==='book')!;const add=(operationId:string,word:typeof apple,day:string)=>r.saveLesson({operationId,lessonId:`manual-day-${day}`,title:`Typed ${day}`,learnedOn:day,sourceType:'manual',items:[{...word,id:operationId,approved:true}]});await add('first',apple,'2026-10-09');await add('second',book,'2026-10-09');expect(await r.db.lessons.count()).toBe(1);await r.saveLesson({operationId:'photo',lessonId:'photo',title:'Unit 1',learnedOn:'2026-10-10',sourceType:'image',items:[{...apple,id:'from-photo',approved:true}]});expect(await r.db.senses.count()).toBe(2);const rows=await lessonSets(r,'');expect(rows[0]).toMatchObject({total:1,newCount:0,reviewCount:1});expect(rows[1]).toMatchObject({total:2,newCount:2});expect(await lessonSets(r,'2026-10-09')).toHaveLength(1);expect(await lessonSets(r,'apple')).toHaveLength(2);const old=rows[1].lesson;await r.editLesson(old.id,old.version,'Older words','2026-10-08');await expect(r.editLesson(old.id,old.version,'stale','2026-10-07')).rejects.toThrow('conflict');await add('third',catalog.find(w=>w.word==='cat')!,'2026-10-09');expect(await r.db.lessons.count()).toBe(3);expect((await lessonSets(r,'2026-10-09'))[0].total).toBe(1);const session=await new PracticeRepository(r).start('flashcard',{lesson:'photo'});expect(session.questions).toHaveLength(1);});

it('reimport keeps a single sense and parent wording while filling only missing reviewed art',async()=>{const r=repo(),book=catalog.find(w=>w.word==='book')!;await r.saveLesson({operationId:'old-no-art',lessonId:'old-photo',title:'Old photo',learnedOn:'2026-10-09',sourceType:'image',items:[{...book,id:'original:ai-0',art:null,vi:'nghĩa bố mẹ đã sửa',approved:true}]});const before=(await r.word('original:ai-0'))!;await saveContent(r,'parent-grammar',null,{...objectPatterns(book)[0].content,senseId:before.id,targetRevision:before.revision});const result=await r.saveLesson({operationId:'new-photo',lessonId:'new-photo',title:'New photo',learnedOn:'2026-10-10',sourceType:'image',items:[{...book,id:'new:ai-0',art:'book',approved:true}]});expect(result).toMatchObject({added:0,linked:1});expect(await r.db.senses.count()).toBe(1);expect(await r.db.lessonItems.count()).toBe(2);expect((await r.word(before.id))).toMatchObject({vi:'nghĩa bố mẹ đã sửa',art:'book',approved:true});expect((await learningItems(r,'grammar','')).total).toBe(1);});
