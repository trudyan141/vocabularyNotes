import 'fake-indexeddb/auto';
import {afterEach,it,expect,vi} from 'vitest';
import {Dexie} from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {PracticeRepository} from '@/data/local/practice';
import {catalog} from '@/lib/learning/catalog';
import {missingLetters,validMissingPositions} from '@/lib/learning/missing-letters';
import {exportArchive,parseArchive} from '@/data/local/archive';
import {parseCloudRow} from '@/lib/cloud/contracts';
const dbs:LibraryDatabase[]=[];
afterEach(async()=>{vi.restoreAllMocks();for(const db of dbs.splice(0)){db.close();await Dexie.delete(db.name);}});
async function setup(){const db=new LibraryDatabase(`missing-game-${crypto.randomUUID()}`);dbs.push(db);const repo=new LocalRepository(db,{kind:'guest',id:'guest:missing'});await repo.saveLesson({operationId:'missing-seed',title:'Short spelling',learnedOn:'2026-10-13',sourceType:'manual',items:[{...catalog[0],id:'baby',word:'baby',sense:'infant',vi:'em bé',en:'A very young child.',example:'The baby is happy.',exampleVi:'Em bé vui vẻ.',art:null,approved:true},{...catalog[0],id:'phrase',word:'teddy bear',sense:'toy',vi:'gấu bông',en:'A soft toy shaped like a bear.',example:'I have a teddy bear.',exampleVi:'Con có một con gấu bông.',art:null,approved:true},{...catalog[0],id:'one',word:'a',sense:'article',approved:true},{...catalog[0],id:'pending',word:'pending',sense:'pending',approved:false}]});return {repo,practice:new PracticeRepository(repo)};}
it('uses approved words and phrases, persists masks, checks only missing characters and never rates SRS',async()=>{
 const {repo,practice}=await setup();vi.spyOn(Math,'random').mockReturnValue(0.999);const session=await practice.start('missing-letters');expect(session.questions.map(q=>q.word.id).sort()).toEqual(['baby','phrase']);expect(session.questions.every(q=>validMissingPositions(q.word.word,q.missingIndices!))).toBe(true);
 const resumed=await new PracticeRepository(repo).get(session.id);expect(resumed?.questions.map(q=>q.missingIndices)).toEqual(session.questions.map(q=>q.missingIndices));
 const q=session.questions[0],typed=missingLetters(q.word.word,q.missingIndices!);const checked=await practice.check(session.id,session.version,typed.toUpperCase());expect(checked.checkedCorrect).toBe(true);await expect(practice.check(session.id,session.version,typed)).rejects.toThrow('conflict');await practice.answer(session.id,checked.version,{});
 expect(await repo.db.table('gameAttempts').count()).toBe(1);expect(await repo.db.table('reviewStates').count()).toBe(0);expect(await repo.db.table('reviewEvents').count()).toBe(0);
 const archive=await parseArchive(JSON.stringify(await exportArchive(repo)));expect(archive.records.practiceSessions[0].payload.session.questions[0].missingIndices).toEqual(q.missingIndices);expect(parseCloudRow('practiceSessions',archive.records.practiceSessions[0])).toBeTruthy();
});
it('full word submission is incorrect and changed content stops the old game',async()=>{
 const {repo,practice}=await setup();const session=await practice.start('missing-letters',{word:'baby'});const checked=await practice.check(session.id,session.version,'baby');expect(checked.checkedCorrect).toBe(false);
 const next=await practice.start('missing-letters',{word:'baby'}),word=next.questions[0].word;await repo.editWord(word.id,word.revision,{word:word.word,vi:'đã thay đổi',en:word.en});await expect(practice.check(next.id,next.version,missingLetters(word.word,next.questions[0].missingIndices!))).rejects.toThrow('conflict');
});
it('cloud and backup reject a missing-letter session that hides the whole word or duplicates positions',async()=>{
 const {repo,practice}=await setup();const session=await practice.start('missing-letters',{word:'baby'}),row=(await repo.db.table('practiceSessions').get([repo.scope.id,session.id]))!;
 for(const indices of [[0,1,2,3],[1,1],[],[99]]){const bad=structuredClone(row);bad.payload.session.questions[0].missingIndices=indices;expect(()=>parseCloudRow('practiceSessions',bad)).toThrow();}
 await expect(practice.start('missing-letters',{word:'one'})).rejects.toThrow('not-ready');
});
