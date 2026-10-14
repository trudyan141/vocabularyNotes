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

async function addGrammar(r:LocalRepository,id:string,senseId='apple',lessonId='first',analysis='They là chủ ngữ; are đi với they.'){
 const {saveContent}=await import('@/data/local/content');const word=(await r.word(senseId))!;
 await saveContent(r,id,null,{senseId,targetRevision:word.revision,lessonId,example:'They are a family.',exampleVi:'Họ là một gia đình.',exampleIpa:'/ðeɪ ɑɹ ə ˈfæməli/',readingHintVi:'',pattern:'',patternExplanation:'',grammarTitle:'Hỏi về nhiều người',conditions:'Hỏi nhiều người là ai.',formula:'Who + are + they?',analysis,commonError:'Who is they?',correction:'Who are they?',approved:true,origin:'user'});
}
it('adds grammar with exact deduplication across senses, retains different explanations and partitions dated sets',async()=>{
 const r=repo();await seed(r);await addGrammar(r,'grammar-apple');await addGrammar(r,'grammar-book','book');await addGrammar(r,'grammar-different','apple','first','Một cách giải thích khác.');
 const {grammarKey}=await import('@/data/local/groups');const c=await groupCatalog(r);expect(c.grammar).toHaveLength(2);
 const saved=await saveStudyGroup(r,{id:'grammar-group',version:null,name:'Ngữ pháp Family',members:{wordIds:[],sentences:[],grammar:c.allGrammar.map(item=>({senseId:item.senseId,key:grammarKey(item)}))},days:['2026-10-10']});
 expect(saved.row.payload.deck.group.grammar).toHaveLength(2);expect(saved.duplicates).toBeGreaterThan(0);const content=await groupContents(r,saved.row);expect(content.grammar).toHaveLength(2);
 const sets=saved.row.payload.deck.group.sets!;expect(sets.flatMap(set=>set.grammarKeys)).toHaveLength(2);expect(new Set(sets.flatMap(set=>set.wordIds)).size).toBe(content.words.length);expect(new Set(sets.flatMap(set=>set.sentenceKeys)).size).toBe(content.sentences.length);
 const again=await saveStudyGroup(r,{id:saved.row.id,version:saved.row.version,name:'Ngữ pháp Family',members:saved.row.payload.deck.group,days:['2026-10-10']});expect(again.added).toBe(0);expect(again.row.payload.deck.group.sets).toEqual(sets);
});
it('keeps the original photo title/date and does not create a new dated item for duplicate-only additions',async()=>{
 const r=repo();await seed(r);const first=await saveStudyGroup(r,{id:'dated',version:null,name:'Dates',members:{wordIds:[],sentences:[]},lessonIds:['first']});
 expect(first.row.payload.deck.group.sets).toHaveLength(1);expect(first.row.payload.deck.group.sets![0]).toMatchObject({title:'Family',learnedOn:'2026-10-10',sourceType:'image',lessonId:'first'});
 await r.saveLesson({operationId:'later-repeat',lessonId:'later-repeat',title:'Later photo',learnedOn:'2026-10-11',sourceType:'image',items:[{...catalog.find(word=>word.word==='apple')!,id:'apple',approved:true}]});
 const next=await saveStudyGroup(r,{id:'dated',version:first.row.version,name:'Dates',members:first.row.payload.deck.group,lessonIds:['later-repeat']});expect(next.added).toBe(0);expect(next.row.payload.deck.group.sets).toEqual(first.row.payload.deck.group.sets);
});
async function expectFailure(promise:Promise<unknown>,message:string){const error=await promise.then(()=>null,error=>error);expect(error).toBeInstanceOf(Error);expect((error as Error).message).toContain(message);}
it('allows grammar-only groups, hides stale grammar and rejects stale, invented or foreign selections atomically',async()=>{
 const r=repo();await seed(r);await addGrammar(r,'grammar');const {grammarKey}=await import('@/data/local/groups'),c=await groupCatalog(r),ref={senseId:c.grammar[0].senseId,key:grammarKey(c.grammar[0])};
 const saved=await saveStudyGroup(r,{id:'only-grammar',version:null,name:'Grammar only',members:{wordIds:[],sentences:[],grammar:[ref]}});expect((await groupContents(r,saved.row)).grammar).toHaveLength(1);await expect(new PracticeRepository(r).start('flashcard',{deck:saved.row.id})).rejects.toThrow();
 await expectFailure(saveStudyGroup(r,{id:saved.row.id,version:null,name:'Stale',members:saved.row.payload.deck.group}),'conflict');
 await expectFailure(saveStudyGroup(r,{id:'invented',version:null,name:'Invented',members:{wordIds:[],sentences:[],grammar:[{...ref,key:'made up'}]}}),'conflict');expect((await studyGroups(r)).map(row=>row.id)).toEqual(['only-grammar']);
 const other=repo('guest:other-grammar',r.db);await expectFailure(saveStudyGroup(other,{id:'foreign',version:null,name:'Foreign',members:{wordIds:[],sentences:[],grammar:[ref]}}),'conflict');
 const sense=(await r.word('apple'))!;await r.editWord('apple',sense.revision,{word:'apple',vi:'Táo mới',en:sense.en});const content=await groupContents(r,saved.row);expect(content.grammar).toHaveLength(0);expect(content.missing).toBe(1);
});
it('round-trips grammar/date membership in archives and cloud DTOs without approving restored content',async()=>{
 const r=repo();await seed(r);await addGrammar(r,'grammar');const c=await groupCatalog(r),{grammarKey}=await import('@/data/local/groups');const saved=await saveStudyGroup(r,{id:'archive-grammar',version:null,name:'Grammar archive',members:{wordIds:['apple'],sentences:[],grammar:c.grammar.map(item=>({senseId:item.senseId,key:grammarKey(item)}))}});
 expect(parseCloudRow('decks',saved.row)).toEqual(saved.row);const archive=await parseArchive(JSON.stringify(await exportArchive(r))),restored=repo('guest:grammar-restore');await importArchive(restored,archive);const row=(await studyGroups(restored))[0];expect(row.payload.deck.group).toEqual(saved.row.payload.deck.group);expect((await groupContents(restored,row)).grammar).toHaveLength(0);
 const {deckSchema}=await import('@/data/local/decks');const invalid=structuredClone(saved.row.payload.deck);invalid.group.sets![0].grammarKeys.push('not a group member');expect(deckSchema.safeParse(invalid).success).toBe(false);
});
it('transfers all supplemental grammar rows and remaps parent/source references with dated membership',async()=>{
 const source=repo();await seed(source);await addGrammar(source,'grammar-one');await addGrammar(source,'grammar-two','apple','first','Một giải thích khác.');const c=await groupCatalog(source),{grammarKey}=await import('@/data/local/groups');await saveStudyGroup(source,{id:'transfer-grammar',version:null,name:'Transferred grammar',members:{wordIds:['apple'],sentences:[],grammar:c.grammar.map(item=>({senseId:item.senseId,key:grammarKey(item)}))}});
 const target=repo('account:60000000-0000-4000-8000-000000000006:70000000-0000-4000-8000-000000000007',source.db);
 await target.saveLesson({operationId:'first',lessonId:'first',title:'Target original',learnedOn:'2026-10-09',sourceType:'manual',items:[{...catalog.find(word=>word.word==='pen')!,id:'pen',approved:true}]});
 await commitTransfer(target,await prepareTransfer(source,target));const group=(await studyGroups(target))[0];const content=await groupContents(target,group);expect(content.grammar).toHaveLength(2);expect(group.payload.deck.group.sets![0].title).toBe('Family');expect(group.payload.deck.group.sets![0].lessonId).not.toBe('first');
 const rows=await target.db.table('sentences').where('[scopeId+id]').between([target.scope.id,''],[target.scope.id,'\uffff']).toArray();expect(rows).toHaveLength(2);expect(new Set(rows.map(row=>row.id)).size).toBe(2);expect(rows.every(row=>row.payload.content.lessonId===group.payload.deck.group.sets![0].lessonId)).toBe(true);
 const {remapGroup,deckSchema}=await import('@/data/local/decks');const mapped=remapGroup(group.payload.deck.group,id=>id==='apple'?'new-apple':id);expect(mapped.grammar?.every(ref=>ref.senseId==='new-apple')).toBe(true);expect(mapped.sets?.flatMap(set=>set.wordIds)).toContain('new-apple');expect(deckSchema.safeParse({...group.payload.deck,senseIds:group.payload.deck.senseIds.map(id=>id==='apple'?'new-apple':id),group:mapped}).success).toBe(true);
});

it('adds 30 new selections out of 100 while naming 70 existing words; repeat is a no-op',async()=>{const r=repo();const items=Array.from({length:100},(_,index)=>({...catalog[0],id:`item-${index}`,word:`sample ${String.fromCharCode(97+Math.floor(index/26))}${String.fromCharCode(97+index%26)}`,approved:true,art:null}));await r.saveLesson({operationId:'hundred',title:'Words',learnedOn:'2026-10-12',sourceType:'manual',items});const first=await saveStudyGroup(r,{id:'hundred-group',version:null,name:'Hundred',members:{wordIds:items.slice(0,70).map(item=>item.id),sentences:[]}});const mixed=await saveStudyGroup(r,{id:'hundred-group',version:first.row.version,name:'Hundred',members:{wordIds:items.map(item=>item.id),sentences:[]}});expect(mixed.added).toBe(30);expect(mixed.addedItems).toHaveLength(30);expect(mixed.addedItems.map(item=>item.label)).toEqual(items.slice(70).map(item=>item.word));expect(mixed.duplicateItems.filter(item=>item.kind==='word')).toHaveLength(70);expect(mixed.row.payload.deck.group.wordIds).toHaveLength(100);const repeat=await saveStudyGroup(r,{id:'hundred-group',version:mixed.row.version,name:'Hundred',members:{wordIds:items.map(item=>item.id),sentences:[]}});expect(repeat.unchanged).toBe(true);expect(repeat.added).toBe(0);expect(repeat.addedItems).toEqual([]);expect(repeat.row.version).toBe(mixed.row.version);expect(repeat.duplicateItems).toHaveLength(100);});

it('lists new words, sentences, grammar and backdated lessons first without changing dedup representatives',async()=>{
 const r=repo();await seed(r);await addGrammar(r,'older-guide','apple','first','Older explanation');await addGrammar(r,'newer-guide','book','first','Newer explanation');
 const old='2026-10-10T01:00:00.000Z',fresh='2026-10-12T08:01:02.000Z';
 await r.db.transaction('rw',r.db.tables,async()=>{
  for(const row of await r.db.searchIndex.toArray())await r.db.searchIndex.put({...row,ordinal:(row.id==='book'?fresh:old)+row.id});
  for(const row of await r.db.examples.toArray())await r.db.examples.put({...row,createdAt:row.senseId==='book'?fresh:old});
  for(const row of await r.db.table('sentences').toArray())await r.db.table('sentences').put({...row,createdAt:row.id==='newer-guide'?fresh:old});
  for(const row of await r.db.lessons.toArray())await r.db.lessons.put({...row,title:row.id==='repeat'?'New backdated lesson':'Older lesson',learnedOn:row.id==='repeat'?'2026-10-01':'2026-10-12',createdAt:row.id==='repeat'?fresh:old});
 });
 const c=await groupCatalog(r);expect(c.words.map(word=>word.id)).toEqual(['book','apple']);expect(c.sentences[0].senseId).toBe('book');expect(c.grammar.map(item=>item.id)).toEqual(['newer-guide','older-guide']);expect(c.lessons.map(row=>row.id)).toEqual(['repeat','first']);
 // Editing a saved item never changes its creation order.
 await r.db.lessons.update([r.scope.id,'first'],{updatedAt:'2026-10-13T00:00:00.000Z'});expect((await groupCatalog(r)).lessons[0].id).toBe('repeat');
});

it('adds only words and grammar from a lesson while keeping embedded examples and legacy sentence refs',async()=>{
 const r=repo(),before=await seed(r);await addGrammar(r,'attached-grammar');const exampleRows=await r.db.examples.toArray();
 const legacy={senseId:before.sentences[0].senseId,key:sentenceKey(before.sentences[0])};
 const original=await saveStudyGroup(r,{id:'two-types',version:null,name:'Two types',members:{wordIds:[],sentences:[legacy]}});
 const result=await saveStudyGroup(r,{id:'two-types',version:original.row.version,name:'Two types',members:original.row.payload.deck.group,lessonIds:['first'],includeSentences:false});
 expect(result.row.payload.deck.group.wordIds).toHaveLength(2);expect(result.row.payload.deck.group.grammar).toHaveLength(1);expect(result.row.payload.deck.group.sentences).toEqual([legacy]);expect(result.added).toBe(3);expect(result.addedItems.map(item=>item.kind)).not.toContain('sentence');expect(await r.db.examples.toArray()).toEqual(exampleRows);expect((await r.word('apple'))!.example).toBeTruthy();
 const fresh=await saveStudyGroup(r,{id:'two-types-new',version:null,name:'Two new types',members:{wordIds:[],sentences:[]},days:['2026-10-10'],includeSentences:false});expect(fresh.row.payload.deck.group.sentences).toEqual([]);expect((await groupContents(r,fresh.row)).grammar).toHaveLength(1);
});
it('add-only edits preserve saved membership and source sets even if submitted selection omits them',async()=>{
 const r=repo(),c=await seed(r),ref={senseId:c.sentences[0].senseId,key:sentenceKey(c.sentences[0])};
 const first=await saveStudyGroup(r,{id:'add-only',version:null,name:'Keep saved',members:{wordIds:['apple'],sentences:[ref]}});
 const initialSet=first.row.payload.deck.group.sets?.find(set=>set.wordIds.includes('apple'));
 const next=await saveStudyGroup(r,{id:'add-only',version:first.row.version,name:'Keep saved',members:{wordIds:['book'],sentences:[]},preserveExisting:true});
 expect(next.row.payload.deck.group.wordIds).toEqual(['apple','book']);expect(next.row.payload.deck.group.sentences).toContainEqual(ref);
 expect(next.row.payload.deck.group.sets?.find(set=>set.wordIds.includes('apple'))?.id).toBe(initialSet?.id);
 const untouched=await saveStudyGroup(r,{id:'add-only',version:next.row.version,name:'Keep saved',members:{wordIds:[],sentences:[]},preserveExisting:true});
 expect(untouched.unchanged).toBe(true);expect(untouched.row).toEqual(next.row);
 await expect(saveStudyGroup(r,{id:'add-only',version:first.row.version,name:'Keep saved',members:{wordIds:[],sentences:[]},preserveExisting:true})).rejects.toThrow('conflict');
});

it('add-only transaction never deduplicates away existing legacy sense IDs',async()=>{
 const r=repo();await seed(r);
 const original=(await r.db.senses.get([r.scope.id,'apple']))!,index=(await r.db.searchIndex.get([r.scope.id,'apple']))!;
 const entry=(await r.db.entries.get([r.scope.id,original.entryId]))!;await r.db.entries.put({...entry,id:'legacy-entry',activeKey:'legacy-fixture-apple'});
 await r.db.senses.put({...original,id:'legacy-apple',entryId:'legacy-entry'});await r.db.searchIndex.put({...index,id:'legacy-apple'});
 const {saveDeck}=await import('@/data/local/decks');
 const first=await saveDeck(r,'legacy',null,{name:'Legacy members',direction:'en-vi',senseIds:['apple','legacy-apple'],group:{wordIds:['apple','legacy-apple'],sentences:[]}});
 const next=await saveStudyGroup(r,{id:'legacy',version:first.version,name:'Legacy members',members:{wordIds:['book'],sentences:[]},preserveExisting:true});
 expect(next.row.payload.deck.group.wordIds).toEqual(['apple','legacy-apple','book']);
 expect(await r.db.senses.count()).toBe(3);
});

it('adds a repeated-word lesson despite unavailable saved grammar and sentences without losing old refs',async()=>{
 const r=repo(),c=await seed(r);await addGrammar(r,'saved-guide');
 const {grammarKey}=await import('@/data/local/groups'),withGrammar=await groupCatalog(r);
 const sentence={senseId:'apple',key:sentenceKey(c.sentences.find(item=>item.senseId==='apple')!)};
 const first=await saveStudyGroup(r,{id:'stale-members',version:null,name:'Family retained',members:{wordIds:['apple'],sentences:[sentence],grammar:withGrammar.grammar.map(item=>({senseId:item.senseId,key:grammarKey(item)}))}});
 const word=(await r.word('apple'))!;
 await r.reviewWord('apple',word.revision,{...catalog.find(item=>item.word==='apple')!,id:'apple',approved:true,example:'A fresh apple.',exampleVi:'Một quả táo tươi.'});
 await r.saveLesson({operationId:'new-family',lessonId:'new-family',title:'New Family',learnedOn:'2026-10-14',sourceType:'image',items:['apple','book'].map(id=>({...catalog.find(word=>word.word===id)!,id,approved:true}))});
 expect((await groupCatalog(r)).allGrammar).toHaveLength(0);
 const next=await saveStudyGroup(r,{id:first.row.id,version:first.row.version,name:'Family retained',members:first.row.payload.deck.group,lessonIds:['new-family'],includeSentences:false,preserveExisting:true});
 expect(next.added).toBe(1);expect(next.duplicateItems).toContainEqual({kind:'word',label:'apple'});
 expect(next.row.payload.deck.group.wordIds).toEqual(['apple','book']);
 expect(next.row.payload.deck.group.sentences).toEqual(first.row.payload.deck.group.sentences);
 expect(next.row.payload.deck.group.grammar).toEqual(first.row.payload.deck.group.grammar);
 expect(next.row.payload.deck.group.sets?.find(set=>set.grammarKeys.length)).toEqual(first.row.payload.deck.group.sets?.find(set=>set.grammarKeys.length));
 const repeat=await saveStudyGroup(r,{id:first.row.id,version:next.row.version,name:'Family retained',members:{wordIds:[],sentences:[]},lessonIds:['new-family'],includeSentences:false,preserveExisting:true});
 expect(repeat.unchanged).toBe(true);expect(repeat.added).toBe(0);expect(repeat.row.version).toBe(next.row.version);
 await expectFailure(saveStudyGroup(r,{id:first.row.id,version:next.row.version,name:'Family retained',members:{wordIds:[],sentences:[],grammar:[{senseId:'book',key:'invented'}]},preserveExisting:true}),'conflict');
 expect((await studyGroups(r))[0]).toEqual(next.row);
});

it('add-only reports duplicates only from incoming selections, not retained members',async()=>{
 const r=repo();await seed(r);const first=await saveStudyGroup(r,{id:'new-only',version:null,name:'New only',members:{wordIds:['apple'],sentences:[]}});
 const next=await saveStudyGroup(r,{id:first.row.id,version:first.row.version,name:'New only',members:{wordIds:['book'],sentences:[]},preserveExisting:true});expect(next.added).toBe(1);expect(next.duplicateItems).toEqual([]);
 const retry=await saveStudyGroup(r,{id:first.row.id,version:next.row.version,name:'New only',members:{wordIds:[],sentences:[]},lessonIds:['repeat'],preserveExisting:true});expect(retry.duplicateItems).toEqual([{kind:'word',label:'apple'}]);
});

it('games and speaking in a group lesson use only that assigned set and preserve replay scope',async()=>{
 const r=repo();await seed(r);const first=await saveStudyGroup(r,{id:'sets-scope',version:null,name:'Scoped lessons',members:{wordIds:[],sentences:[]},lessonIds:['first'],includeSentences:false});
 const group=first.row;const sets=group.payload.deck.group.sets!;const set=sets[0];
 // Create a subset that is smaller than the full group, without changing library content.
 await r.db.table('decks').put({...group,payload:{deck:{...group.payload.deck,group:{...group.payload.deck.group,sets:[{...set,wordIds:['apple']},{...set,id:'book-set',wordIds:['book']}]}}}});
 const p=new PracticeRepository(r),filter={deck:group.id,set:set.id};const session=await p.start('flashcard',filter);expect(session.questions.map(q=>q.word.id)).toEqual(['apple']);expect((await p.speakingWords(filter)).map(w=>w.id)).toEqual(['apple']);
 const revealed=await p.reveal(session.id,session.version);const done=await p.answer(session.id,revealed.version,{rating:'Again'});expect((await p.replay(done.id,true)).filter).toEqual(filter);
 await expect(p.start('flashcard',{deck:group.id,set:'missing'})).rejects.toThrow('not-ready');
});

it('legacy groups without sets keep old members assigned to their original lesson on an add-only save',async()=>{
 const r=repo();await seed(r);const first=await saveStudyGroup(r,{id:'legacy-set',version:null,name:'Legacy set',members:{wordIds:['apple'],sentences:[]}});
 const group={...first.row.payload.deck.group};delete group.sets;await r.db.table('decks').put({...first.row,payload:{deck:{...first.row.payload.deck,group}}});
 const next=await saveStudyGroup(r,{id:first.row.id,version:first.row.version,name:'Legacy set',members:{wordIds:[],sentences:[]},lessonIds:['repeat'],preserveExisting:true,includeSentences:false});expect(next.row.payload.deck.group.sets?.find(set=>set.wordIds.includes('apple'))?.lessonId).toBe('first');
});
