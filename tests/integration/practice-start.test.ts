import 'fake-indexeddb/auto';
import {afterEach,expect,it,vi} from 'vitest';
import {Dexie} from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {PracticeRepository} from '@/data/local/practice';
import {catalog} from '@/lib/learning/catalog';
const databases:LibraryDatabase[]=[];
async function seed(){const db=new LibraryDatabase(`launch-${crypto.randomUUID()}`);databases.push(db);const repo=new LocalRepository(db,{kind:'guest',id:'guest:launch'});await repo.saveLesson({operationId:'seed',title:'Launch',learnedOn:'2026-10-18',sourceType:'manual',items:catalog.slice(0,20).map((word,i)=>({...word,id:`word-${i}`,approved:true}))});return repo;}
afterEach(async()=>{for(const db of databases.splice(0)){db.close();await Dexie.delete(db.name);}});
it('decodes only the selected picture and required choices for a one-word round',async()=>{
 const repo=await seed(),loads=vi.fn(async()=>true),practice=new PracticeRepository(repo,loads);
 const session=await practice.start('word-picture',{word:'word-0'});
 expect(session.questions).toHaveLength(1);expect(session.questions[0].word.id).toBe('word-0');expect(session.questions[0].choices).toHaveLength(3);
 expect(loads.mock.calls.length).toBeLessThanOrEqual(3);
});
it('does not inspect pictures from unstarted rounds when finding resume cards or opening another session',async()=>{
 const repo=await seed(),first=new PracticeRepository(repo,async()=>true);await first.start('picture-word');
 const flash=await first.start('flashcard'),loads=vi.fn(async()=>false),practice=new PracticeRepository(repo,loads);
 expect(await practice.resumableSessions()).toEqual([]);expect(loads).not.toHaveBeenCalled();
 expect((await practice.loadSession(flash.id))?.id).toBe(flash.id);expect(loads).not.toHaveBeenCalled();
 const q=flash.questions[0];await repo.db.senses.update([repo.scope.id,q.word.id],{version:999});expect(await practice.loadSession(flash.id)).toBeUndefined();
 const other=new PracticeRepository(new LocalRepository(repo.db,{kind:'guest',id:'guest:other'}),loads);expect(await other.loadSession(flash.id)).toBeUndefined();
});
it('hydrates a small random round rather than the whole large library for non-picture games',async()=>{
 const repo=await seed(),scope=repo.scope.id,sense=(await repo.db.senses.get([scope,'word-0']))!,entry=(await repo.db.entries.get([scope,sense.entryId]))!,index=(await repo.db.searchIndex.get([scope,sense.id]))!;
 await repo.db.transaction('rw',[repo.db.entries,repo.db.senses,repo.db.searchIndex],async()=>{
  for(let i=0;i<300;i++){const id=`extra-${i}`,word=`fixtureword${i}`;await repo.db.entries.put({...entry,id,displayText:word,canonicalKey:word,activeKey:word});await repo.db.senses.put({...sense,id,entryId:id,identity:JSON.stringify(['noun',id]),art:null});await repo.db.searchIndex.put({...index,id,art:null,terms:word,ordinal:`z${id}`});}
 });
 const reads=vi.spyOn(repo,'words'),random=vi.spyOn(Math,'random').mockReturnValue(.37);
 try{const session=await new PracticeRepository(repo).start('flashcard');expect(session.questions).toHaveLength(10);expect(session.questions.some(q=>q.word.id.startsWith('extra-'))).toBe(true);expect(Math.max(...reads.mock.calls.map(([ids])=>ids.length))).toBeLessThanOrEqual(16);}
 finally{random.mockRestore();}
});
