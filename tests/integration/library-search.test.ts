import 'fake-indexeddb/auto';
import {afterEach,it,expect} from 'vitest';
import {Dexie} from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {demoEntries} from '@/lib/demo/model';
import type {WordInput} from '@/data/local/types';
const opened:LibraryDatabase[]=[];
function setup(scope='guest:search',db=new LibraryDatabase(`search-${crypto.randomUUID()}`)){if(!opened.includes(db))opened.push(db);return new LocalRepository(db,{kind:'guest',id:scope});}
function word(word:string,overrides:Partial<WordInput>={}):WordInput{return {...demoEntries[0],id:crypto.randomUUID(),word,vi:'nghĩa khác',en:'People are learning.',example:'They are here.',lesson:'manual',origin:'user',approved:true,...overrides};}
function save(repo:LocalRepository,items:WordInput[]){return repo.saveLesson({operationId:crypto.randomUUID(),title:'Words are fun',learnedOn:'2026-10-12',sourceType:'manual',items});}
afterEach(async()=>{for(const db of opened.splice(0)){db.close();await Dexie.delete(db.name);}});
it('library search only matches the visible word or Vietnamese meaning, not lessons or examples',async()=>{
 const repo=setup();await save(repo,[word('are',{vi:'là'}),word('care'),word('share'),word('book',{vi:'quyển sách'})]);
 expect((await repo.search('are',{libraryOnly:true})).words.map(row=>row.word)).toEqual(['are']);
 expect((await repo.search('quyen sach',{libraryOnly:true})).words.map(row=>row.word)).toEqual(['book']);
 expect((await repo.search('boo',{libraryOnly:true})).total).toBe(1);
 expect((await repo.search('are')).total).toBe(4); // Other consumers retain their existing broad search.
});
it('groups repeated headwords before paging while keeping every different sense reachable and stored',async()=>{
 const repo=setup(),items=[word('bank',{sense:'river side',vi:'bờ sông'}),word('BANK',{sense:'money',vi:'ngân hàng'}),word('bank',{pos:'verb',sense:'turn',vi:'nghiêng'}),word('book')];await save(repo,items);
 const result=await repo.search('',{libraryOnly:true,limit:1});expect(result.total).toBe(2);
 const bank=(await repo.search('bank',{libraryOnly:true})).words[0];expect(bank.relatedSenses).toHaveLength(3);
 for(const sense of bank.relatedSenses!)expect(await repo.word(sense.id)).toBeDefined();
 expect(await repo.db.senses.count()).toBe(4);expect((await repo.search('',{libraryOnly:true,offset:1,limit:1})).words).toHaveLength(1);
 const other=setup('guest:other',repo.db);expect((await other.search('',{libraryOnly:true})).total).toBe(0);
});
it('keeps exact case names distinct and obeys lesson and missing-art filters before grouping',async()=>{
 const repo=setup();const first=await save(repo,[word('US',{caseMode:'exact',art:null}),word('us',{art:'apple'})]);
 expect((await repo.search('',{libraryOnly:true})).total).toBe(2);
 expect((await repo.search('',{libraryOnly:true,missingArt:true})).words.map(row=>row.word)).toEqual(['US']);
 expect((await repo.search('',{libraryOnly:true,lesson:first.lessonId})).total).toBe(2);
});
it('picture preparation counts unique words before pagination and retains distinct missing senses and skip boundaries',async()=>{
 const repo=setup();await save(repo,[word('are',{vi:'là',pos:'verb',sense:'be',art:null}),word('ARE',{vi:'đang',pos:'auxiliary',sense:'progressive',art:null}),word('they',{vi:'họ',pos:'pronoun',sense:'people',art:null}),word('they',{vi:'chúng',pos:'pronoun',sense:'things',art:null}),...Array.from({length:11},(_,i)=>word(`missing${i}`,{art:null})),word('ready',{art:'apple'})]);
 const all=await repo.search('',{libraryOnly:true,missingArt:true,limit:12});expect(all.total).toBe(13);expect(all.words).toHaveLength(12);
 expect(all.words.filter(row=>row.word.toLowerCase()==='are')).toHaveLength(1);expect(all.words.filter(row=>row.word==='they')).toHaveLength(1);
 const are=all.words.find(row=>row.word.toLowerCase()==='are')!;expect(are.relatedSenses).toHaveLength(2);
 const remaining=await repo.search('',{libraryOnly:true,missingArt:true,excludeIds:[are.id],limit:12});const next=remaining.words.find(row=>row.word.toLowerCase()==='are')!;expect(next.id).not.toBe(are.id);expect(remaining.total).toBe(13);
 const last=await repo.search('',{libraryOnly:true,missingArt:true,offset:12,limit:12});expect(last.words).toHaveLength(1);expect(new Set([...all.words,...last.words].map(row=>row.word.toLowerCase())).size).toBe(13);expect(await repo.db.senses.count()).toBe(16);
});
