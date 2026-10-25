import 'fake-indexeddb/auto';
import {afterEach,expect,it} from 'vitest';
import {Dexie} from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {PracticeRepository,type Session} from '@/data/local/practice';
import {catalog} from '@/lib/learning/catalog';
import {gameTiles,memoryCards,gameAnswer} from '@/lib/learning/game-engine';
import {saveContent,type LearningContent} from '@/data/local/content';
import {exportArchive,parseArchive,importArchive} from '@/data/local/archive';
import {parseCloudRow} from '@/lib/cloud/contracts';
const dbs:LibraryDatabase[]=[];
afterEach(async()=>{for(const db of dbs.splice(0)){db.close();await Dexie.delete(db.name);}});
async function setup(count=12){const db=new LibraryDatabase(`expansion-${crypto.randomUUID()}`);dbs.push(db);const repo=new LocalRepository(db,{kind:'guest',id:'guest:expansion'});await repo.saveLesson({operationId:crypto.randomUUID(),title:'Game lesson',learnedOn:'2026-10-24',sourceType:'manual',items:catalog.slice(0,count).map(w=>({...w,id:w.word,approved:true}))});return {repo,practice:new PracticeRepository(repo,async()=>true)};}
const base=(senseId:string,revision:string):LearningContent=>({senseId,targetRevision:revision,example:'She is happy.',exampleVi:'Bạn ấy vui.',readingHintVi:'',pattern:'She + is',patternExplanation:'She đi với is',grammarTitle:'To be',conditions:'Nói trạng thái',formula:'She + is + adjective',analysis:'She đi với is.',commonError:'She are happy.',correction:'She is happy.',approved:true,origin:'user'});
it('tap letters persist, duplicates stay independent, CAS prevents overwrites, and check does not change SRS',async()=>{
 const {repo,practice}=await setup();let s=await practice.start('word-builder',{word:'apple'});const q=s.questions[0],tiles=gameTiles(q);for(const letter of [...q.word.word]){const tile=tiles.find(t=>t.text===letter&&!s.gameState?.chosen.includes(t.id))!;s=await practice.move(s.id,s.version,{kind:'pick',index:tile.id});}
 expect(gameAnswer(s)).toBe('apple');const loaded=await new PracticeRepository(repo,async()=>true).loadSession(s.id);expect(loaded?.gameState).toEqual(s.gameState);
 await expect(practice.move(s.id,s.version-1,{kind:'reset'})).rejects.toThrow('conflict');
 s=await practice.move(s.id,s.version,{kind:'remove',index:1});expect(gameAnswer(s)).toBeNull();s=await practice.move(s.id,s.version,{kind:'reset'});
 for(const letter of [...q.word.word])s=await practice.move(s.id,s.version,{kind:'pick',index:tiles.find(t=>t.text===letter&&!s.gameState?.chosen.includes(t.id))!.id});
 await expect(practice.check(s.id,s.version,'forged')).rejects.toThrow('invalid');s=await practice.check(s.id,s.version,gameAnswer(s)!);expect(s.checkedCorrect).toBe(true);await expect(practice.check(s.id,s.version,'apple')).rejects.toThrow('conflict');s=await practice.answer(s.id,s.version,{});expect(s.completedAt).toBeTruthy();expect(await repo.db.table('gameAttempts').count()).toBe(1);expect(await repo.db.table('reviewStates').count()).toBe(0);
});
async function solveBoard(practice:PracticeRepository,s:Session){const q=s.questions[s.position];if(s.mode==='match-pairs'){for(let i=0;i<q.choices.length;i++){s=await practice.move(s.id,s.version,{kind:'left',index:i});s=await practice.move(s.id,s.version,{kind:'right',index:i});}}else{const cards=memoryCards(q);for(let pair=0;pair<q.choices.length;pair++){const indices=cards.flatMap((card,i)=>card.pair===pair?[i]:[]);for(const index of indices)s=await practice.move(s.id,s.version,{kind:'flip',index});expect(s.gameState?.open).toEqual([]);}}return s;}
it.each(['match-pairs','memory-pairs'] as const)('%s records every board member, resumes, covers the whole selected pool and roundtrips backup',async mode=>{
 const {repo,practice}=await setup();let s=await practice.start(mode);const cycle=s.cycleId!;expect(s.questions.every(q=>q.boardKeys?.length===q.choices.length)).toBe(true);const total=(await practice.progress(cycle))!.total;
 const first=s.questions[0];s=await solveBoard(practice,s);expect((await practice.progress(cycle))?.done).toBe(0);s=await practice.check(s.id,s.version,gameAnswer(s)!);expect(s.checkedCorrect).toBe(true);s=await practice.answer(s.id,s.version,{});expect((await practice.progress(cycle))?.done).toBe(first.choices.length);
 const backup=await parseArchive(JSON.stringify(await exportArchive(repo)));const stored=backup.records.practiceSessions[0];expect(parseCloudRow('practiceSessions',stored)).toBeTruthy();
 const targetDb=new LibraryDatabase(`restore-${crypto.randomUUID()}`);dbs.push(targetDb);const target=new LocalRepository(targetDb,{kind:'guest',id:'guest:restore'});await importArchive(target,backup);expect((await new PracticeRepository(target,async()=>true).get(s.id))?.answers).toEqual(s.answers);
 let guard=0;while(guard++<20){if(s.completedAt){const p=(await practice.progress(cycle))!;if(p.complete)break;s=await practice.start(mode);}s=await solveBoard(practice,s);s=await practice.check(s.id,s.version,gameAnswer(s)!);s=await practice.answer(s.id,s.version,{});}
 expect((await practice.progress(cycle))?.done).toBe(total);expect(await repo.db.table('gameAttempts').count()).toBe(total);expect(await repo.db.table('reviewEvents').count()).toBe(0);
});
it('pair errors belong to the affected words and skip defers the board without marking unseen words done',async()=>{
 const {repo,practice}=await setup();let s=await practice.start('match-pairs');s=await practice.move(s.id,s.version,{kind:'left',index:0});s=await practice.move(s.id,s.version,{kind:'right',index:1});s=await solveBoard(practice,s);s=await practice.check(s.id,s.version,'complete');expect(s.checkedCorrect).toBe(false);const attempts=await repo.db.table('gameAttempts').toArray();expect(attempts.filter(a=>!a.payload.correct)).toHaveLength(2);s=await practice.answer(s.id,s.version,{});const done=(await practice.progress(s.cycleId!))!.done;s=await practice.answer(s.id,s.version,{skipped:true});expect((await practice.progress(s.cycleId!))?.done).toBe(done);expect((await practice.progress(s.cycleId!))?.skipped).toBeGreaterThan(0);
});
it.each(['grammar-cloze','grammar-repair','grammar-dialogue'] as const)('%s requires reviewed annotations and stops on source changes',async kind=>{
 const {repo,practice}=await setup();await expect(practice.start(kind)).rejects.toThrow('not-ready');const word=(await repo.word('apple'))!;const activity={version:1 as const,kind,prompt:kind==='grammar-cloze'?'She ___ happy.':kind==='grammar-repair'?'She are happy.':'Is she happy?',solution:kind==='grammar-dialogue'?'Yes, she is.':'She is happy.',translation:'Bạn ấy vui.',explanation:'She đi với is.',options:kind==='grammar-dialogue'?['Yes, she is.','No, she is not.']:['is','am','are'],answer:kind==='grammar-dialogue'?'Yes, she is.':'is',context:'Trong câu chuyện, bạn ấy đang vui.',...(kind==='grammar-repair'?{slot:1}:{})};const content={...base(word.id,word.revision),gameActivities:[activity]};await saveContent(repo,'test-grammar',null,content);
 let s=await practice.start(kind);if(kind==='grammar-repair')s=await practice.move(s.id,s.version,{kind:'error',index:1});s=await practice.move(s.id,s.version,{kind:'pick',index:0});s=await practice.check(s.id,s.version,gameAnswer(s)!);expect(s.checkedCorrect).toBe(true);s=await practice.answer(s.id,s.version,{});const replay=await practice.replay(s.id);expect(replay.gameState).toBeUndefined();
 await saveContent(repo,'test-grammar',1,{...content,example:'She is sad.'});expect(await practice.loadSession(replay.id)).toBeUndefined();await expect(practice.start(kind,{},true)).rejects.toThrow('not-ready');
});
it('rejects out of range and repeated tile use and checks all picture peers on resume',async()=>{const {repo,practice}=await setup();let s=await practice.start('word-builder',{word:'apple'});s=await practice.move(s.id,s.version,{kind:'pick',index:0});await expect(practice.move(s.id,s.version,{kind:'pick',index:0})).rejects.toThrow('invalid');await expect(practice.move(s.id,s.version,{kind:'pick',index:39})).rejects.toThrow('invalid');s=await practice.start('match-pairs');const peer=s.questions[0].choices[1];await repo.editWord(peer.id,peer.revision,{word:peer.word,vi:'Nghĩa đã đổi',en:peer.en});expect(await practice.loadSession(s.id)).toBeUndefined();});
it('reapproving one game after editing the source does not approve the other games again',async()=>{
 const {repo,practice}=await setup(),word=(await repo.word('apple'))!;
 const activities=[{version:1 as const,kind:'grammar-cloze' as const,prompt:'She ___ happy.',answer:'is',solution:'She is happy.',translation:'Bạn ấy vui.',explanation:'She đi với is.',options:['is','are']},{version:1 as const,kind:'grammar-dialogue' as const,prompt:'Is she happy?',answer:'Yes, she is.',solution:'Yes, she is.',translation:'Đúng, bạn ấy vui.',explanation:'Bạn ấy đang vui trong câu chuyện.',options:['Yes, she is.',"No, she isn't."],context:'Trong câu chuyện, bạn ấy đang vui.'}];
 const original={...base(word.id,word.revision),gameActivities:activities};await saveContent(repo,'review-one',null,original);
 const row=(await repo.db.table('sentences').get([repo.scope.id,'review-one']))!;const saved=row.payload.content as LearningContent;
 await saveContent(repo,'review-one',1,{...saved,analysis:'Giải thích đã được sửa.'});
 const updated=(await repo.db.table('sentences').get([repo.scope.id,'review-one']))!.payload.content as LearningContent;
 const {activitySource}=await import('@/data/local/content');const sourceHash=await activitySource(updated);
 await saveContent(repo,'review-one',2,{...updated,gameActivities:updated.gameActivities!.map(a=>a.kind==='grammar-cloze'?{...a,sourceHash}:a)});
 const cloze=await practice.start('grammar-cloze');expect(cloze.questions[0].activity?.sourceHash).toMatch(/^[a-f0-9]{64}$/);await expect(practice.start('grammar-dialogue')).rejects.toThrow('not-ready');
});
it('cloud restore rejects invalid board keys and unsafe tile indices instead of rendering them',async()=>{
 const {repo,practice}=await setup();let s=await practice.start('word-builder',{word:'apple'});s=await practice.move(s.id,s.version,{kind:'pick',index:0});const row=(await repo.db.table('practiceSessions').get([repo.scope.id,s.id]))!;
 for(const chosen of [[99],[0,0]]){const bad=structuredClone(row);bad.payload.session.gameState.chosen=chosen;expect(()=>parseCloudRow('practiceSessions',bad)).toThrow();}
 s=await practice.start('match-pairs');const board=(await repo.db.table('practiceSessions').get([repo.scope.id,s.id]))!;const bad=structuredClone(board);bad.payload.session.questions[0].boardKeys[1]=bad.payload.session.questions[0].boardKeys[0];expect(()=>parseCloudRow('practiceSessions',bad)).toThrow();
});

it.each([2,4,7,10,11])('memory pool of %i always has at least two pairs and completes coverage exactly once',async count=>{
 const {repo,practice}=await setup(count);let s=await practice.start('memory-pairs'),guard=0;const cycle=s.cycleId!;
 while(guard++<30){expect(s.questions.every(q=>q.choices.length>=2)).toBe(true);if(s.completedAt){if((await practice.progress(cycle))!.complete)break;s=await practice.start('memory-pairs');}s=await solveBoard(practice,s);s=await practice.check(s.id,s.version,'complete');s=await practice.answer(s.id,s.version,{});}
 expect((await practice.progress(cycle))?.done).toBe(count);expect(await repo.db.table('gameAttempts').count()).toBe(count);
});
it('upgrades a legacy singleton tail with a same-cycle companion without inflating coverage',async()=>{
 const {repo,practice}=await setup(10),s=await practice.start('memory-pairs');const singles=s.questions.flatMap(q=>q.choices.map((word,i)=>({id:crypto.randomUUID(),word,choices:[word],missingIndex:0,cycleKey:q.boardKeys![i],boardKeys:[q.boardKeys![i]]})));
 const answers=singles.slice(0,-1).map(q=>({questionId:q.id,correct:true,skipped:false,hint:false,rating:null,coveredKeys:q.boardKeys,answeredAt:s.createdAt}));const legacy={...s,questions:singles,position:singles.length-1,answers};const row=(await repo.db.table('practiceSessions').get([repo.scope.id,s.id]))!;await repo.db.table('practiceSessions').put({...row,payload:{session:legacy}});
 expect((await practice.progress(s.cycleId!))?.done).toBe(9);let upgraded=(await practice.loadSession(s.id))!;expect(upgraded.id).not.toBe(s.id);expect(upgraded.questions[0].choices).toHaveLength(2);expect((await practice.progress(s.cycleId!))?.done).toBe(9);
 upgraded=await solveBoard(practice,upgraded);upgraded=await practice.check(upgraded.id,upgraded.version,'complete');await practice.answer(upgraded.id,upgraded.version,{});expect((await practice.progress(s.cycleId!))?.done).toBe(10);expect((await practice.progress(s.cycleId!))?.total).toBe(10);expect((await parseArchive(JSON.stringify(await exportArchive(repo)))).records.practiceSessions.length).toBeGreaterThan(0);
});
it('replaying legacy one-pair history adds a playable companion and keeps history intact',async()=>{
 const {repo,practice}=await setup(4),s=await practice.start('memory-pairs'),q=s.questions[0],word=q.choices[0],single={...q,word,choices:[word],boardKeys:[q.boardKeys![0]]};const legacy={...s,questions:[single],position:1,completedAt:s.createdAt,answers:[{questionId:q.id,correct:false,skipped:false,hint:false,rating:null,coveredKeys:single.boardKeys,answeredAt:s.createdAt}]};const row=(await repo.db.table('practiceSessions').get([repo.scope.id,s.id]))!;await repo.db.table('practiceSessions').put({...row,payload:{session:legacy}});const replay=await practice.replay(s.id,true);expect(replay.questions[0].choices).toHaveLength(2);expect(replay.cycleId).toBeUndefined();expect((await practice.get(s.id))?.questions[0].choices).toHaveLength(1);
});

it('dialogue inputs preserve the selected vocabulary and grammar scope without writing sessions or SRS',async()=>{
 const {repo,practice}=await setup();const apple=(await repo.word('apple'))!;
 await saveContent(repo,'selected-identity',null,{...base(apple.id,apple.revision),formula:'Is it + a/an + noun?',example:'Is it an apple?',exampleVi:'Đây có phải táo không?'});
 const input=await practice.dialogueInputs({word:'apple'});expect(input.words.map(w=>w.id)).toEqual(['apple']);expect(input.grammars.map(g=>g.id)).toEqual(['selected-identity']);
 const other=await practice.dialogueInputs({word:'cat'});expect(other.words.every(w=>w.id==='cat')).toBe(true);expect(other.grammars).toEqual([]);
 expect(await repo.db.table('practiceSessions').count()).toBe(0);expect(await repo.db.table('reviewStates').count()).toBe(0);
});
