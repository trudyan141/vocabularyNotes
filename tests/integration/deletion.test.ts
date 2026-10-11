import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import {afterEach,it,expect} from 'vitest';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {deleteItem} from '@/data/local/delete';
import {saveDeck} from '@/data/local/decks';
import {saveContent} from '@/data/local/content';
import {learningItems} from '@/data/local/learning-library';
import {exportArchive,parseArchive} from '@/data/local/archive';
import {parseCloudRow} from '@/lib/cloud/contracts';
import {catalog} from '@/lib/learning/catalog';
import {familyWorksheet} from '../fixtures/family-worksheet';
import {reviewedLearning} from '@/lib/ai/worksheet-learning';
const dbs:LibraryDatabase[]=[];
function repo(){const db=new LibraryDatabase(`delete-${crypto.randomUUID()}`);dbs.push(db);return new LocalRepository(db,{id:'guest:delete',kind:'guest'});}
async function seed(r:LocalRepository){await r.saveLesson({operationId:'seed',lessonId:'first',title:'First',learnedOn:'2026-10-11',sourceType:'image',items:catalog.slice(0,2).map((w,i)=>({...w,id:`word-${i}`,approved:true}))});return (await r.search('',{limit:10})).words;}
afterEach(async()=>{for(const db of dbs.splice(0)){db.close();await Dexie.delete(db.name);}});
it('deletes only the selected sense, keeps history, rejects stale/foreign writes and preserves backup tombstones',async()=>{
 const r=repo(),[word]=await seed(r);const target={table:'senses' as const,id:word.id,version:Number(word.revision.split(':')[1]),revision:word.revision};
 const foreign=new LocalRepository(r.db,{id:'guest:other',kind:'guest'});await expect(deleteItem(foreign,target)).rejects.toThrow('conflict');await expect(deleteItem(r,{...target,revision:'0:1'})).rejects.toThrow('conflict');
 const examples=await r.db.examples.count();await deleteItem(r,target);expect(await r.word(word.id)).toBeUndefined();expect((await r.search('',{limit:10})).words).toHaveLength(1);expect(await r.db.examples.count()).toBe(examples);
 await expect(deleteItem(r,target)).rejects.toThrow('conflict');
 const archive=await parseArchive(JSON.stringify(await exportArchive(r)));const sense=archive.records.senses.find(row=>row.id===word.id)!;expect(sense.deletedAt).toBeTruthy();expect(sense.version).toBe(target.version+1);expect(parseCloudRow('senses',sense).deletedAt).toBeTruthy();
});
it('deletes a dated set without deleting shared words or another lesson and removes practice/search membership',async()=>{
 const r=repo(),words=await seed(r);await r.saveLesson({operationId:'repeat',lessonId:'repeat',title:'Repeat',learnedOn:'2026-10-12',sourceType:'image',items:words.map(w=>{const {revision,pendingEdit,...input}=w;void revision;void pendingEdit;return {...input,id:w.id,approved:true};})});
 const first=(await r.db.lessons.get([r.scope.id,'first']))!;await deleteItem(r,{table:'lessons',id:first.id,version:first.version});
 expect((await r.search('',{lesson:'first'})).total).toBe(0);expect((await r.search('',{lesson:'repeat'})).total).toBe(2);expect((await r.search('')).total).toBe(2);
 expect((await r.db.lessonItems.where('[scopeId+lessonId]').equals([r.scope.id,'first']).toArray()).every(row=>row.deletedAt)).toBe(true);
});
it('deletes groups/decks independently and a grammar section without losing its example or pattern',async()=>{
 const r=repo(),[word]=await seed(r);const deck=await saveDeck(r,'deck',null,{name:'My deck',senseIds:[word.id],direction:'en-vi'});await deleteItem(r,{table:'decks',id:deck.id,version:deck.version});expect(await r.word(word.id)).toBeTruthy();
 const content=reviewedLearning(familyWorksheet.learning[2]);const row=await saveContent(r,'grammar',null,{...content,senseId:word.id,targetRevision:word.revision});await deleteItem(r,{table:'sentences',id:row.id,version:row.version,part:'grammar'});
 expect((await learningItems(r,'grammar','')).total).toBe(0);expect((await learningItems(r,'patterns','')).total).toBe(1);expect((await learningItems(r,'sentences','')).items.some(item=>item.id===row.id)).toBe(true);
 const changed=(await r.db.table('sentences').get([r.scope.id,row.id]))!;await expect(deleteItem(r,{table:'sentences',id:row.id,version:row.version})).rejects.toThrow('conflict');await deleteItem(r,{table:'sentences',id:row.id,version:changed.version});expect((await learningItems(r,'patterns','')).total).toBe(0);
});
it('saves source sentences and inferred family grammar atomically, preserves them in archive and confines deletion to its dated set',async()=>{
 const r=repo();await r.saveLesson({operationId:'family',lessonId:'family',title:'Family',learnedOn:'2026-10-11',sourceType:'image',items:[{word:familyWorksheet.words[0].word,vi:familyWorksheet.words[0].vi,en:familyWorksheet.words[0].en,pos:'noun',sense:familyWorksheet.words[0].sense,example:familyWorksheet.words[0].example,exampleVi:familyWorksheet.words[0].exampleVi,id:'family',ready:true,art:null,lesson:'manual',source:'Fixture AI; user-reviewed',sourceEvidenceText:'family',approved:true,origin:'ai_generated'}],learning:familyWorksheet.learning.map((item,i)=>({key:`learn-${i}`,wordId:'family',content:reviewedLearning(item)}))});
 expect((await learningItems(r,'sentences','', 'family')).items.map(item=>item.textEn)).toContain('Who are they?');expect((await learningItems(r,'grammar','')).items[0].textEn).toContain('Who + are + they');
 const archive=await parseArchive(JSON.stringify(await exportArchive(r)));expect(archive.records.sentences).toHaveLength(3);
 await deleteItem(r,{table:'lessons',id:'family',version:1});expect((await learningItems(r,'grammar','')).total).toBe(0);expect(await r.word('family')).toBeTruthy();expect((await r.search('')).total).toBe(1);
});
