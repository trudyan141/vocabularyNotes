import 'fake-indexeddb/auto';
import {afterEach,expect,it,vi} from 'vitest';
import {Dexie} from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {PracticeRepository,type Session} from '@/data/local/practice';
import {catalog} from '@/lib/learning/catalog';
import {activityDay,cycleSelection,type PracticeCycle} from '@/lib/learning/coverage';
import {exportArchive,parseArchive,importArchive} from '@/data/local/archive';
import {saveDeck} from '@/data/local/decks';
import {saveContent} from '@/data/local/content';
const dbs:LibraryDatabase[]=[];
afterEach(async()=>{vi.restoreAllMocks();for(const db of dbs.splice(0)){db.close();await Dexie.delete(db.name);}});
async function setup(count=47){
 const db=new LibraryDatabase(`coverage-${crypto.randomUUID()}`);dbs.push(db);
 const repo=new LocalRepository(db,{kind:'guest',id:'guest:coverage'});
 await repo.saveLesson({operationId:crypto.randomUUID(),title:'Many',learnedOn:'2026-10-19',sourceType:'manual',items:Array.from({length:count},(_,i)=>({...catalog[i%catalog.length],id:`item-${i}`,word:`word${i}`,sense:`meaning${i}`,vi:`Nghĩa ${i}`,en:`Definition ${i}`,approved:true}))});
 return {repo,practice:new PracticeRepository(repo,async()=>true)};
}
async function finish(practice:PracticeRepository,session:Session,wrong=false){
 let current=session;
 while(!current.completedAt){
  if(current.mode==='flashcard'){current=await practice.reveal(current.id,current.version);current=await practice.answer(current.id,current.version,{rating:'Good'});}
  else if(current.mode==='grammar-card'){current=await practice.reveal(current.id,current.version);current=await practice.answer(current.id,current.version,{understood:true});}
  else{current=await practice.check(current.id,current.version,wrong?'wrong':current.questions[current.position].grammar?.example??current.questions[current.position].word.word);current=await practice.answer(current.id,current.version,{});}
 }
 return current;
}
it('covers 47 items as 10/10/10/10/7 without overlap and requires an explicit new cycle',async()=>{
 const {practice}=await setup();const seen=new Set<string>(),sizes=[];let cycleId='';
 for(let i=0;i<5;i++){
  const s=await practice.start('spelling');cycleId=s.cycleId!;sizes.push(s.questions.length);
  for(const q of s.questions){expect(seen.has(q.word.id)).toBe(false);seen.add(q.word.id);}
  await finish(practice,s,i===1);
 }
 expect(sizes).toEqual([10,10,10,10,7]);expect(seen.size).toBe(47);
 expect(await practice.progress(cycleId)).toMatchObject({done:47,total:47,complete:true});
 await expect(practice.start('spelling')).rejects.toThrow('complete');
 const next=await practice.start('spelling',{},true);expect(next.cycleId).not.toBe(cycleId);expect((await practice.progress(next.cycleId!))?.done).toBe(0);
});
it.each([1,9,10,11])('keeps the exact pool size %i and short final round',async count=>{
 const {practice}=await setup(count),a=await practice.start('flashcard');expect(a.questions.length).toBe(Math.min(count,10));await finish(practice,a);
 if(count>10){const b=await practice.start('flashcard');expect(b.questions.length).toBe(count-10);expect(b.questions.every(q=>a.questions.every(p=>p.word.id!==q.word.id))).toBe(true);await finish(practice,b);}
 expect((await practice.progress(a.cycleId!))?.done).toBe(count);
});
it('resumes a checked answer after reload, persists daily activity without resetting the cycle, and saves once',async()=>{
 const {repo,practice}=await setup(14);let s=await practice.start('spelling');
 s=await practice.check(s.id,s.version,s.questions[0].word.word);
 const reloaded=new PracticeRepository(repo,async()=>true),same=await reloaded.start('spelling');expect(same.id).toBe(s.id);expect(same.checkedCorrect).toBe(true);
 expect((await reloaded.progress(s.cycleId!))?.done).toBe(0);
 s=await reloaded.answer(s.id,s.version,{});await expect(reloaded.answer(s.id,s.version-1,{})).rejects.toThrow('conflict');
 expect(await repo.db.table('gameAttempts').count()).toBe(1);expect((await reloaded.progress(s.cycleId!))?.today).toBe(1);
 const daySpy=vi.spyOn(Date,'now').mockReturnValue(Date.now()+86400000);const next=await reloaded.start('spelling');daySpy.mockRestore();expect(next.id).toBe(s.id);expect(next.position).toBe(1);
 expect(cycleSelection('flashcard',{})).toBe(cycleSelection('flashcard',{direction:'en-vi',due:false}));
 expect(activityDay(new Date(2026,9,19,0,5))).toBe('2026-10-19');
});
it('defers skips, preserves answered coverage after deletion, and isolates deliberate replay',async()=>{
 const {repo,practice}=await setup(12);let s=await practice.start('spelling');const skipped=s.questions[0].word.id;
 s=await practice.answer(s.id,s.version,{skipped:true});s=await finish(practice,s);
 expect(await practice.progress(s.cycleId!)).toMatchObject({done:9,skipped:1,complete:false});
 const replay=await practice.replay(s.id);expect(replay.cycleId).toBeUndefined();await finish(practice,replay);
 expect((await practice.progress(s.cycleId!))?.done).toBe(9);
 const next=await practice.start('spelling');expect(next.questions).toHaveLength(3);expect(next.questions.at(-1)?.word.id).toBe(skipped);
 const checked=await practice.check(next.id,next.version,next.questions[0].word.word),one=await practice.answer(next.id,checked.version,{});
 await practice.remove(one.id,one.version);expect((await practice.progress(s.cycleId!))?.done).toBe(10);
 const final=await practice.start('spelling');expect(final.questions).toHaveLength(2);await finish(practice,final);
 expect(await practice.progress(s.cycleId!)).toMatchObject({done:12,skipped:0,complete:true});expect(await repo.db.table('reviewStates').count()).toBe(0);
});
it('shares a single reserved round across concurrent starts and releases untouched rounds',async()=>{
 const {repo,practice}=await setup(15);const other=new PracticeRepository(repo,async()=>true);
 const [a,b]=await Promise.all([practice.start('spelling'),other.start('spelling')]);expect(a.id).toBe(b.id);expect(await repo.db.table('practiceCycles').count()).toBe(1);
 expect(await practice.resumableSessions()).toHaveLength(0);await practice.discardUnstarted(a.id);
 const next=await other.start('spelling');expect(next.id).not.toBe(a.id);expect(next.questions.map(q=>q.cycleKey)).toEqual(a.questions.map(q=>q.cycleKey));
});
it('keeps a frozen due pool, distinct modes/directions/groups, and leaves additions to the next cycle',async()=>{
 const {repo,practice}=await setup(12);await saveDeck(repo,'group',null,{name:'My scope',senseIds:Array.from({length:11},(_,i)=>`item-${i}`),direction:'en-vi'});
 const due=await practice.start('flashcard',{deck:'group',due:true});await finish(practice,due);
 const last=await practice.start('flashcard',{deck:'group',due:true});expect(last.questions.length).toBe(1);
 expect((await practice.start('spelling',{deck:'group'})).cycleId).not.toBe(due.cycleId);
 expect((await practice.start('flashcard',{deck:'group',due:true,direction:'vi-en'})).cycleId).not.toBe(due.cycleId);
 await repo.saveLesson({operationId:'new',title:'New',learnedOn:'2026-10-20',sourceType:'manual',items:[{...catalog[0],id:'extra-new',word:'brandnew',approved:true}]});
 expect((await practice.progress(due.cycleId!))?.total).toBe(11);
});
it('keeps exact coverage through backup and re-scopes cycles without claiming restored approval',async()=>{
 const {repo,practice}=await setup(11),s=await finish(practice,await practice.start('spelling'));
 const archive=await parseArchive(JSON.stringify(await exportArchive(repo)));expect(archive.records.practiceCycles).toHaveLength(1);
 const db=new LibraryDatabase(`restore-cycle-${crypto.randomUUID()}`);dbs.push(db);const restored=new LocalRepository(db,{kind:'guest',id:'guest:restored'});await importArchive(restored,archive);
 const cycle=(await db.table('practiceCycles').toArray())[0].payload.cycle as PracticeCycle;expect(cycle.scopeId).toBe(restored.scope.id);
 expect(await new PracticeRepository(restored).progress(s.cycleId!)).toMatchObject({done:10,total:11,unavailable:1});
 const legacy=structuredClone(archive);delete (legacy.records as Partial<typeof legacy.records>).practiceCycles;
 const {checksum,...payload}=legacy;void checksum;const {contentHash}=await import('@/domain/identity');expect((await parseArchive(JSON.stringify({...payload,checksum:await contentHash(payload)}))).records.practiceCycles).toEqual([]);
});
it('retains completed items when remaining content becomes stale and does not silently add replacement words',async()=>{
 const {repo,practice}=await setup(11),s=await finish(practice,await practice.start('spelling'));
 const cycle=(await repo.db.table('practiceCycles').toArray())[0].payload.cycle as PracticeCycle;
 const remaining=cycle.items.find(item=>s.questions.every(q=>q.word.id!==item.senseId))!;
 await repo.db.senses.update([repo.scope.id,remaining.senseId],{deletedAt:new Date().toISOString()});
 expect(await practice.progress(s.cycleId!)).toMatchObject({done:10,total:11,unavailable:1,complete:true});await expect(practice.start('spelling')).rejects.toThrow('complete');
});
it('covers distinct grammar forms rather than treating one source sense as one sentence',async()=>{
 const {repo,practice}=await setup(1),word=(await repo.word('item-0'))!;
 for(let i=0;i<13;i++)await saveContent(repo,`form-${i}`,null,{senseId:word.id,targetRevision:word.revision,example:`I see item ${i}.`,exampleVi:`Con thấy mục ${i}.`,readingHintVi:'',pattern:`I see item ${i}.`,patternExplanation:'Mẫu câu',grammarTitle:'',conditions:'',formula:'',analysis:'',commonError:'',correction:'',approved:true,origin:'user'});
 const first=await finish(practice,await practice.start('grammar')),second=await practice.start('grammar');expect(second.questions.length).toBe(3);
 expect(second.questions.every(q=>first.questions.every(p=>p.grammar?.example!==q.grammar?.example))).toBe(true);await finish(practice,second);
 expect(await practice.progress(first.cycleId!)).toMatchObject({done:13,total:13,complete:true});
});
