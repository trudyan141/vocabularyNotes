import 'fake-indexeddb/auto';
import {afterEach,it,expect} from 'vitest';
import Dexie from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {saveStudyGroup,groupCatalog,groupContents,sentenceKey,studyGroups} from '@/data/local/groups';
import {exportArchive,parseArchive,importArchive} from '@/data/local/archive';
import {catalog} from '@/lib/learning/catalog';
import {PracticeRepository} from '@/data/local/practice';
import {prepareTransfer,commitTransfer} from '@/data/cloud/transfer';
import {parseCloudRow} from '@/lib/cloud/contracts';
const databases:LibraryDatabase[]=[];
function repo(scope='guest:group',db?:LibraryDatabase){const database=db??new LibraryDatabase(`groups-${crypto.randomUUID()}`);if(!databases.includes(database))databases.push(database);return new LocalRepository(database,scope.startsWith('account:')?{kind:'account',id:scope,ownerId:'60000000-0000-4000-8000-000000000006',libraryId:'70000000-0000-4000-8000-000000000007'}:{kind:'guest',id:scope});}
async function seed(r:LocalRepository){const items=catalog.filter(word=>['apple','book'].includes(word.word)).map(word=>({...word,id:word.word,approved:true}));await r.saveLesson({operationId:'first',lessonId:'first',title:'Family',learnedOn:'2026-10-10',sourceType:'image',items});await r.saveLesson({operationId:'repeat',lessonId:'repeat',title:'School',learnedOn:'2026-10-10',sourceType:'image',items:items.slice(0,1)});return groupCatalog(r);}
afterEach(async()=>{for(const db of databases.splice(0)){db.close();await Dexie.delete(db.name);}});
it('adds a whole day with exact duplicate counts and keeps practice restricted to group words',async()=>{
 const r=repo(),c=await seed(r);const ref={senseId:c.sentences[0].senseId,key:sentenceKey(c.sentences[0])};
 const result=await saveStudyGroup(r,{id:'family',version:null,name:'Anh văn Family',members:{wordIds:['apple','apple'],sentences:[ref,ref]},days:['2026-10-10'],lessonIds:['first']});
 expect(result.duplicates).toBeGreaterThan(0);expect(result.row.payload.deck.group.wordIds).toHaveLength(2);
 const content=await groupContents(r,result.row);expect(content.words).toHaveLength(2);expect(content.sentences).toHaveLength(c.sentences.length);
 expect(new Set(result.row.payload.deck.group.sentences.map(ref=>ref.key)).size).toBe(c.sentences.length);
 const again=await saveStudyGroup(r,{id:'family',version:result.row.version,name:'Anh văn Family',members:result.row.payload.deck.group,days:['2026-10-10']});expect(again.added).toBe(0);expect(again.duplicates).toBeGreaterThan(0);
 const session=await new PracticeRepository(r).start('flashcard',{deck:'family'});expect(session.questions.map(q=>q.word.id).sort()).toEqual(['apple','book']);
 expect(await r.db.senses.count()).toBe(2);expect(await r.db.reviewEvents.count()).toBe(0);
});
it('supports sentence-only and empty groups, scope isolation, duplicate names, CAS and invalid references',async()=>{
 const r=repo(),c=await seed(r),ref={senseId:c.sentences[0].senseId,key:sentenceKey(c.sentences[0])};
 const result=await saveStudyGroup(r,{id:'sentences',version:null,name:'Câu Family',members:{wordIds:[],sentences:[ref]}});
 expect((await groupContents(r,result.row)).words).toHaveLength(0);expect((await groupContents(r,result.row)).sentences).toHaveLength(1);
 await expect(new PracticeRepository(r).start('flashcard',{deck:'sentences'})).rejects.toThrow();
 await expect(saveStudyGroup(r,{id:'other',version:null,name:' CÂU Family ',members:{wordIds:[],sentences:[]}})).rejects.toThrow('duplicate');
 await expect(saveStudyGroup(r,{id:'sentences',version:null,name:'Stale',members:{wordIds:[],sentences:[ref]}})).rejects.toThrow('conflict');
 const empty=await saveStudyGroup(r,{id:'empty',version:null,name:'Empty',members:{wordIds:[],sentences:[]}});expect(empty.row.payload.deck.senseIds).toHaveLength(0);
 const other=repo('guest:other',r.db);expect(await studyGroups(other)).toHaveLength(0);await expect(groupContents(other,result.row)).rejects.toThrow('scope');
 await expect(saveStudyGroup(other,{id:'foreign',version:null,name:'Bad',members:{wordIds:['apple'],sentences:[]}})).rejects.toThrow('invalid');
 await expect(saveStudyGroup(r,{id:'bad',version:null,name:'Bad',members:{wordIds:[],sentences:[{...ref,key:'invented'}]}})).rejects.toThrow('conflict');
 expect(sentenceKey({textEn:' I eat an apple. ',textVi:'  Con ăn táo. '})).toBe(sentenceKey({textEn:'i eat an apple.',textVi:'Con ăn táo.'}));
 expect(sentenceKey({textEn:'apple',textVi:'ma'})).not.toBe(sentenceKey({textEn:'apple',textVi:'má'}));
});
it('retains membership through archives and guest-to-account identity remapping without exposing unapproved sentences',async()=>{
 const guest=repo(),c=await seed(guest),ref={senseId:c.sentences[0].senseId,key:sentenceKey(c.sentences[0])};
 const original=await saveStudyGroup(guest,{id:'group',version:null,name:'Family',members:{wordIds:['apple'],sentences:[ref]}});
 expect(parseCloudRow('decks',original.row)).toEqual(original.row);
 const archive=await parseArchive(JSON.stringify(await exportArchive(guest))),restored=repo('guest:restored');await importArchive(restored,archive);
 const row=(await studyGroups(restored))[0];expect(row.payload.deck.group).toEqual(original.row.payload.deck.group);expect((await groupContents(restored,row)).words).toHaveLength(0);expect((await groupContents(restored,row)).sentences).toHaveLength(0);
 const account=repo('account:60000000-0000-4000-8000-000000000006:70000000-0000-4000-8000-000000000007',guest.db);
 await account.saveLesson({operationId:'account-existing',title:'Existing apple',learnedOn:'2026-10-09',sourceType:'manual',items:[{...catalog.find(word=>word.word==='apple')!,id:'account-apple',approved:true}]});
 await commitTransfer(account,await prepareTransfer(guest,account));const transferred=(await studyGroups(account))[0];expect(transferred.payload.deck.group.wordIds).toEqual(['account-apple']);expect(transferred.payload.deck.senseIds).toContain('account-apple');expect((await groupContents(account,transferred)).words[0].id).toBe('account-apple');
});
it('loads and saves all approved words beyond the search page limit',async()=>{
 const r=repo();await seed(r);const scope=r.scope.id,sense=(await r.db.senses.get([scope,'apple']))!,entry=(await r.db.entries.get([scope,sense.entryId]))!,index=(await r.db.searchIndex.get([scope,'apple']))!;
 await r.db.transaction('rw',[r.db.entries,r.db.senses,r.db.searchIndex],async()=>{
  await r.db.entries.bulkPut(Array.from({length:151},(_,i)=>({...entry,id:`entry-${i}`,displayText:`word${i}`,canonicalKey:`word${i}`,activeKey:`word${i}`})));
  await r.db.senses.bulkPut(Array.from({length:151},(_,i)=>({...sense,id:`sense-${i}`,entryId:`entry-${i}`})));
  await r.db.searchIndex.bulkPut(Array.from({length:151},(_,i)=>({...index,id:`sense-${i}`,ordinal:`word${i}`,terms:`word${i}`})));
 });
 expect(await r.matchingApprovedWordIds('word')).toHaveLength(151);
 expect(await r.matchingApprovedWordIds('word150')).toEqual(['sense-150']);
 expect(await repo('guest:other',r.db).matchingApprovedWordIds('')).toEqual([]);
 await r.db.searchIndex.update([scope,'sense-150'],{approval:false});
 expect(await r.matchingApprovedWordIds('word')).toHaveLength(150);
 await r.db.searchIndex.update([scope,'sense-150'],{approval:true});
 const c=await groupCatalog(r);expect(c.words).toHaveLength(153);
 const result=await saveStudyGroup(r,{id:'large',version:null,name:'Large group',members:{wordIds:c.words.map(word=>word.id),sentences:[]}});expect((await groupContents(r,result.row)).words).toHaveLength(153);
});
