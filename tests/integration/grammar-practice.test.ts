import 'fake-indexeddb/auto';
import {afterEach,it,expect} from 'vitest';
import {Dexie} from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {catalog} from '@/lib/learning/catalog';
import {saveContent} from '@/data/local/content';
import {PracticeRepository} from '@/data/local/practice';
import {saveStudyGroup,grammarKey} from '@/data/local/groups';
import {learningItems} from '@/data/local/learning-library';
import {exportArchive} from '@/data/local/archive';
import {shuffledTiles} from '@/lib/learning/grammar-game';
const dbs:LibraryDatabase[]=[];
afterEach(async()=>{for(const db of dbs.splice(0)){db.close();await Dexie.delete(db.name);}});
async function setup(){const db=new LibraryDatabase(`grammar-${crypto.randomUUID()}`);dbs.push(db);const repo=new LocalRepository(db,{kind:'guest',id:'guest:grammar'});await repo.saveLesson({operationId:crypto.randomUUID(),title:'Grammar',learnedOn:'2026-10-12',sourceType:'manual',items:[{...catalog[0],approved:true}]});const word=(await repo.search("",{approvedOnly:true})).words[0];await saveContent(repo,'structure',null,{senseId:word.id,targetRevision:word.revision,example:'It is an apple.',exampleVi:'Đó là quả táo.',exampleIpa:'/ɪt ɪz ən æpəl/',readingHintVi:'',pattern:'It is + noun.',patternExplanation:'Dùng gọi tên.',grammarTitle:'',conditions:'',formula:'',analysis:'',commonError:'',correction:'',approved:true,origin:'user'});return {repo,word,practice:new PracticeRepository(repo)};}
it('uses approved stored grammar, records once, preserves SRS and portable snapshot',async()=>{const {repo,practice}=await setup();const session=await practice.start('grammar');expect(session.questions[0].grammar?.formula).toBe('It is + noun.');const checked=await practice.check(session.id,session.version,'It is an apple.');expect(checked.checkedCorrect).toBe(true);await expect(practice.check(session.id,session.version,'It is an apple.')).rejects.toThrow();const done=await practice.answer(session.id,checked.version,{answer:'It is an apple.'});expect(done.completedAt).toBeTruthy();expect(await repo.db.table('gameAttempts').count()).toBe(1);expect(await repo.db.table('reviewStates').count()).toBe(0);const archive=await exportArchive(repo);expect(archive.records.practiceSessions[0].payload.session.questions[0].grammar?.example).toBe('It is an apple.');expect(shuffledTiles('It is an apple.',session.id)).toEqual(shuffledTiles('It is an apple.',session.id));});
it('limits to selected group grammar and rejects edited content during play',async()=>{const {repo,practice}=await setup();const item=(await learningItems(repo,'grammar','')).items[0];const group=await saveStudyGroup(repo,{id:'group',version:null,name:'My grammar',members:{wordIds:[],sentences:[],grammar:[{senseId:item.senseId,key:grammarKey(item)}]}});const session=await practice.start('grammar',{deck:group.row.id});await repo.db.table('sentences').update([repo.scope.id,'structure'],{version:2});await expect(practice.check(session.id,session.version,'It is an apple.')).rejects.toThrow();expect(await practice.sessions()).toHaveLength(0);});
