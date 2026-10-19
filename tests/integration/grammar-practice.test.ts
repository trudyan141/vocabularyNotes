import 'fake-indexeddb/auto';
import {parseCloudRow} from '@/lib/cloud/contracts';
import {afterEach,it,expect,vi} from 'vitest';
import {Dexie} from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {catalog} from '@/lib/learning/catalog';
import {saveContent} from '@/data/local/content';
import {PracticeRepository} from '@/data/local/practice';
import {saveStudyGroup,grammarKey} from '@/data/local/groups';
import {learningItems} from '@/data/local/learning-library';
import {exportArchive,importArchive} from '@/data/local/archive';
import {shuffledTiles} from '@/lib/learning/grammar-game';
const dbs:LibraryDatabase[]=[];
afterEach(async()=>{for(const db of dbs.splice(0)){db.close();await Dexie.delete(db.name);}});
async function setup(){const db=new LibraryDatabase(`grammar-${crypto.randomUUID()}`);dbs.push(db);const repo=new LocalRepository(db,{kind:'guest',id:'guest:grammar'});await repo.saveLesson({operationId:crypto.randomUUID(),title:'Grammar',learnedOn:'2026-10-12',sourceType:'manual',items:[{...catalog[0],approved:true}]});const word=(await repo.search("",{approvedOnly:true})).words[0];await saveContent(repo,'structure',null,{senseId:word.id,targetRevision:word.revision,example:'It is an apple.',exampleVi:'Đó là quả táo.',exampleIpa:'/ɪt ɪz ən æpəl/',readingHintVi:'',pattern:'It is + noun.',patternExplanation:'Dùng gọi tên.',grammarTitle:'',conditions:'',formula:'',analysis:'',commonError:'',correction:'',approved:true,origin:'user'});return {repo,word,practice:new PracticeRepository(repo)};}
it('uses approved stored grammar, records once, preserves SRS and portable snapshot',async()=>{const {repo,practice}=await setup();const session=await practice.start('grammar');expect(session.questions[0].grammar?.formula).toBe('It is + noun.');const checked=await practice.check(session.id,session.version,'It is an apple.');expect(checked.checkedCorrect).toBe(true);await expect(practice.check(session.id,session.version,'It is an apple.')).rejects.toThrow();const done=await practice.answer(session.id,checked.version,{answer:'It is an apple.'});expect(done.completedAt).toBeTruthy();expect(await repo.db.table('gameAttempts').count()).toBe(1);expect(await repo.db.table('reviewStates').count()).toBe(0);const archive=await exportArchive(repo);expect(archive.records.practiceSessions[0].payload.session.questions[0].grammar?.example).toBe('It is an apple.');expect(shuffledTiles('It is an apple.',session.id)).toEqual(shuffledTiles('It is an apple.',session.id));});
it('limits to selected group grammar and rejects edited content during play',async()=>{const {repo,practice}=await setup();const item=(await learningItems(repo,'grammar','')).items[0];const group=await saveStudyGroup(repo,{id:'group',version:null,name:'My grammar',members:{wordIds:[],sentences:[],grammar:[{senseId:item.senseId,key:grammarKey(item)}]}});const session=await practice.start('grammar',{deck:group.row.id});await repo.db.table('sentences').update([repo.scope.id,'structure'],{version:2});await expect(practice.check(session.id,session.version,'It is an apple.')).rejects.toThrow();expect(await practice.sessions()).toHaveLength(0);});

it('samples the complete grammar pool before limiting a round',async()=>{
 const {repo,word,practice}=await setup();
 const base=(await repo.db.table('sentences').get([repo.scope.id,'structure']))!;
 for(let i=0;i<25;i++)await saveContent(repo,`extra-${i}`,null,{...(base.payload.content as import('@/data/local/content').LearningContent),senseId:word.id,example:`I see item ${i}.`,exampleVi:`Con thấy mục ${i}.`,pattern:`I see item ${i}.`});
 const random=vi.spyOn(Math,'random').mockReturnValue(0.5);
 try{const session=await practice.start('grammar');expect(session.questions).toHaveLength(10);random.mockReturnValue(0.999);const next=await practice.start('grammar');expect(next.id).toBe(session.id);expect((await practice.progress(session.cycleId!))?.total).toBe(26);}finally{random.mockRestore();}
});

it('replays exactly the stored round, preserving its filter and clearing progress',async()=>{
 const {repo,practice}=await setup();const lesson=(await repo.db.lessons.toArray())[0];
 const first=await practice.start('grammar',{lesson:lesson.id});
 const checked=await practice.check(first.id,first.version,first.questions[0].grammar!.example);
 const done=await practice.answer(first.id,checked.version,{answer:checked.checkedAnswer!});
 const replay=await practice.replay(done.id);
 expect(replay.id).not.toBe(done.id);expect(replay.filter).toEqual({lesson:lesson.id});
 expect(replay.questions.map(q=>q.grammar)).toEqual(done.questions.map(q=>q.grammar));
 expect(replay.questions[0].id).not.toBe(done.questions[0].id);
 expect(replay.position).toBe(0);expect(replay.answers).toEqual([]);expect(replay.completedAt).toBeNull();
 expect((await practice.get(done.id))?.completedAt).toBeTruthy();
 await repo.db.table('sentences').update([repo.scope.id,'structure'],{version:2});
 await expect(practice.replay(done.id)).rejects.toThrow();
 expect(await repo.db.table('practiceSessions').count()).toBe(2);
});

it('grammar cards require reveal, store self assessment once, and leave word SRS untouched',async()=>{
 const {repo,practice}=await setup();const first=await practice.start('grammar-card');
 expect(first.questions[0].grammar?.conditions).toBe('Dùng gọi tên.');
 await expect(practice.answer(first.id,first.version,{understood:true})).rejects.toThrow();
 const revealed=await practice.reveal(first.id,first.version);
 const done=await practice.answer(first.id,revealed.version,{understood:false});
 expect(done.position).toBe(1);expect(done.completedAt).toBeTruthy();expect(done.answers[0].correct).toBe(false);
 const retry=await practice.replay(done.id,true);expect(retry.questions).toHaveLength(1);expect(retry.answers).toEqual([]);expect(retry.position).toBe(0);
 await expect(practice.answer(first.id,revealed.version,{understood:true})).rejects.toThrow();
 expect(await repo.db.table('gameAttempts').count()).toBe(1);expect(await repo.db.table('reviewStates').count()).toBe(0);
 const archive=await exportArchive(repo);expect(archive.records.practiceSessions[0].payload.session.mode).toBe('grammar-card');expect(parseCloudRow('practiceSessions',archive.records.practiceSessions[0])).toBeTruthy();expect(parseCloudRow('gameAttempts',archive.records.gameAttempts[0])).toBeTruthy();const invalid=structuredClone(archive.records.practiceSessions[0]);delete invalid.payload.session.questions[0].grammar;expect(()=>parseCloudRow('practiceSessions',invalid)).toThrow();
});

it('exact replay keeps ten due words even after they are no longer due',async()=>{
 const {repo,practice}=await setup();await repo.saveLesson({operationId:crypto.randomUUID(),title:'Many',learnedOn:'2026-10-14',sourceType:'manual',items:catalog.slice(0,15).map(w=>({...w,approved:true}))});
 const first=await practice.start('flashcard',{due:true,direction:'vi-en'});expect(first.questions).toHaveLength(10);
 let done=first;for(const question of first.questions){void question;const revealed=await practice.reveal(done.id,done.version);done=await practice.answer(done.id,revealed.version,{rating:'Good'});}
 expect((await practice.dueIds()).some(id=>first.questions.some(q=>q.word.id===id))).toBe(false);
 const replay=await practice.replay(done.id);expect(replay.questions.map(q=>q.word.id).sort()).toEqual(first.questions.map(q=>q.word.id).sort());expect(replay.direction).toBe('vi-en');expect(replay.filter).toEqual({due:true,direction:'vi-en'});
 const events=await repo.db.reviewEvents.count();expect(events).toBe(10);
 const archive=await exportArchive(repo),db=new LibraryDatabase(`grammar-restore-${crypto.randomUUID()}`);dbs.push(db);const restored=new LocalRepository(db,{kind:'guest',id:'guest:restored'});
 await importArchive(restored,archive);const saved=await new PracticeRepository(restored).get(replay.id);expect(saved?.scopeId).toBe(restored.scope.id);expect(saved?.filter).toEqual(replay.filter);expect(saved?.questions.map(q=>q.word.id).sort()).toEqual(first.questions.map(q=>q.word.id).sort());
});

it('grammar self assessment does not turn its supporting word into a weak spelling word',async()=>{
 const {practice}=await setup();const first=await practice.start('grammar-card'),revealed=await practice.reveal(first.id,first.version);await practice.answer(first.id,revealed.version,{understood:false});
 await expect(practice.start('spelling',{weak:true})).rejects.toThrow('not-ready');
});

it('deletes only the selected session with CAS, retaining learning and other scopes',async()=>{
 const {repo,practice}=await setup();const first=await practice.start('flashcard');
 const revealed=await practice.reveal(first.id,first.version);const done=await practice.answer(first.id,revealed.version,{rating:'Good'});
 const pending=await practice.start('flashcard',{},true);const other=new LocalRepository(repo.db,{kind:'guest',id:'guest:other'});
 await expect(new PracticeRepository(other).remove(pending.id,pending.version)).rejects.toThrow('missing');
 await expect(practice.remove(pending.id,pending.version+1)).rejects.toThrow('conflict');
 await practice.remove(pending.id,pending.version);
 expect(await practice.get(pending.id)).toBeUndefined();expect((await practice.sessions()).map(s=>s.id)).toEqual([done.id]);
 await expect(practice.replay(pending.id)).rejects.toThrow();
 expect((await repo.db.table('practiceSessions').get([repo.scope.id,pending.id])).deletedAt).toBeTruthy();
 expect(await repo.db.reviewEvents.count()).toBe(1);expect(await repo.db.table('reviewStates').count()).toBe(1);expect(await repo.word(first.questions[0].word.id)).toBeTruthy();
 const archive=await exportArchive(repo);expect(archive.records.practiceSessions).toHaveLength(2);
});

it('history retrieves ten completed sessions per page, newest first and scope isolated',async()=>{
 const {repo,practice}=await setup();
 for(let i=0;i<23;i++){let s=await practice.start('grammar-card',{},i>0);s=await practice.reveal(s.id,s.version);await practice.answer(s.id,s.version,{understood:true});}
 await practice.start('flashcard');const first=await practice.historyPage(0);const second=await practice.historyPage(1);const last=await practice.historyPage(2);
 expect(first.total).toBe(23);expect(first.sessions).toHaveLength(10);expect(second.sessions).toHaveLength(10);expect(last.sessions).toHaveLength(3);expect(new Set([...first.sessions,...second.sessions,...last.sessions].map(s=>s.id)).size).toBe(23);
 const foreign=new PracticeRepository(new LocalRepository(repo.db,{kind:'guest',id:'guest:foreign'}));expect((await foreign.historyPage(0)).total).toBe(0);
});

it('only started rounds are resumable, while unopened snapshots stay reloadable',async()=>{
 const {repo,practice}=await setup();await repo.saveLesson({operationId:'more-words',title:'More',learnedOn:'2026-10-14',sourceType:'manual',items:catalog.slice(1,4).map(w=>({...w,approved:true}))});
 const first=await practice.start('flashcard');expect(await practice.resumableSessions()).toEqual([]);const revealed=await practice.reveal(first.id,first.version);expect(await practice.resumableSessions()).toEqual([]);
 const started=await practice.answer(first.id,revealed.version,{rating:'Good'});expect((await practice.resumableSessions()).map(s=>s.id)).toEqual([first.id]);expect(started.position).toBe(1);
 const resumed=await practice.start('flashcard');expect(resumed.id).toBe(started.id);const opened=await practice.start('flashcard',{direction:'vi-en'});await practice.discardUnstarted(opened.id);expect(await practice.get(opened.id)).toBeUndefined();await practice.discardUnstarted(started.id);expect((await practice.get(started.id))?.position).toBe(1);
 const checked=await practice.start('spelling');await practice.check(checked.id,checked.version,checked.questions[0].word.word);expect((await practice.resumableSessions()).map(s=>s.id)).toContain(checked.id);
});
