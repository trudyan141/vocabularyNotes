import 'fake-indexeddb/auto';
import {afterEach,it,expect,vi} from 'vitest';
import {Dexie} from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {CaptureRepository} from '@/data/local/capture';
import {analysePhotoBatch,batchPhotos,photoReview,preparePhotoBatch,type WorksheetDraft} from '@/data/local/worksheet-batch';
import {analyseWorksheet,ParentAiError} from '@/lib/ai/byok';
import {fullTransform} from '@/lib/capture/image';
const opened:LibraryDatabase[]=[];
const image={blob:new Blob(['jpeg'],{type:'image/jpeg'}),width:100,height:100};
const result={text:'pear',warnings:[],words:[{word:'pear',literal:'pear',vi:'quả lê',en:'A fruit.',pos:'noun',sense:'fruit',example:'I see a pear.',exampleVi:'Con thấy quả lê.',exampleIpa:null}],learning:[]};
function setup(scope='guest:batch',db=new LibraryDatabase(`batch-${crypto.randomUUID()}`)){if(!opened.includes(db))opened.push(db);const local=new LocalRepository(db,{kind:'guest',id:scope});return {local,capture:new CaptureRepository(local)};}
async function photos(count=3){const env=setup();const batchId=crypto.randomUUID();for(let i=0;i<count;i++)await env.capture.create(image,crypto.randomUUID(),{title:'',learnedOn:'2026-10-12',batchId,batchOrder:i});return {...env,batchId};}
afterEach(async()=>{for(const db of opened.splice(0)){db.close();await Dexie.delete(db.name);}});
it('stores valid uploads independently, reports invalid files, strips through the same normalizer and survives reopen',async()=>{
 const {local,capture}=setup();let active=0,max=0;
 const normalize=vi.fn(async(blob:Blob)=>{active++;max=Math.max(max,active);await Promise.resolve();active--;if(await blob.text()==='bad')throw new Error('format');return image;});
 const files=['one','bad','three'].map(name=>new File([name],name+'.png',{type:'image/png'}));
 const added=await preparePhotoBatch(capture,files,undefined,0,undefined,normalize);
 expect(added.drafts).toHaveLength(2);expect(added.failures[0].name).toBe('bad.png');expect(max).toBe(1);
 expect(await local.db.outbox.count()).toBe(0);
 local.db.close();const reopened=setup('guest:batch',new LibraryDatabase(local.db.name));expect((await batchPhotos(reopened.local,added.batchId)).map(p=>p.batchOrder)).toEqual([0,2]);
 expect(await batchPhotos(setup('guest:other',reopened.local.db).local,added.batchId)).toEqual([]);
});
it('rejects oversized batches without taking or dropping any image',async()=>{
 const {capture}=setup();const normalize=vi.fn(async()=>image);
 await expect(preparePhotoBatch(capture,Array.from({length:11},()=>new File(['x'],'x')),undefined,0,undefined,normalize)).rejects.toThrow('invalid');expect(normalize).not.toHaveBeenCalled();
});
it('analyses sequentially, stops on quota and resumes only unfinished photos after reload',async()=>{
 const {local,batchId}=await photos();let active=0,max=0,count=0;
 const analyse=vi.fn(async()=>{active++;max=Math.max(max,active);await Promise.resolve();active--;if(++count===2)throw new ParentAiError('quota');return result;});
 await expect(analysePhotoBatch(local,batchId,new AbortController().signal,()=>{},analyse)).rejects.toThrow('quota');expect(count).toBe(2);expect(max).toBe(1);
 const rows=await batchPhotos(local,batchId);expect((await photoReview(local,rows[0])).ready).toBe(true);expect((await photoReview(local,rows[2])).ready).toBe(false);expect(await local.db.lessons.count()).toBe(0);
 const next=vi.fn(async()=>result);await analysePhotoBatch(local,batchId,new AbortController().signal,()=>{},next);expect(next).toHaveBeenCalledTimes(2);await analysePhotoBatch(local,batchId,new AbortController().signal,()=>{},next);expect(next).toHaveBeenCalledTimes(2);
});
it('cancellation preserves completed photos and sends no following photo',async()=>{
 const {local,batchId}=await photos(),controller=new AbortController();const analyse=vi.fn(async()=>result);
 await expect(analysePhotoBatch(local,batchId,controller.signal,(index)=>{if(index===2)controller.abort();},analyse)).rejects.toThrow();
 const rows=await batchPhotos(local,batchId);expect((await photoReview(local,rows[0])).ready).toBe(true);expect((await photoReview(local,rows[2])).ready).toBe(false);
});
it('does not overwrite concurrently edited review content or changed pixels',async()=>{
 const {local,batchId,capture}=await photos(1);const photo=(await batchPhotos(local,batchId))[0];
 const analyse:typeof analyseWorksheet=async()=>{await capture.update(photo.id,photo.version,{title:'edited',learnedOn:'2026-10-12',tags:'',consent:false},{...fullTransform,rotation:90},image);return result;};
 await expect(analysePhotoBatch(local,batchId,new AbortController().signal,()=>{},analyse)).rejects.toThrow('conflict');
 expect((await photoReview(local,(await batchPhotos(local,batchId))[0])).data).toBeUndefined();
});
it('review edits stay intact and crop changes make prior results pending without deleting them',async()=>{
 const {local,batchId,capture}=await photos(1);await analysePhotoBatch(local,batchId,new AbortController().signal,()=>{},async()=>result);
 const photo=(await batchPhotos(local,batchId))[0];const before=(await photoReview(local,photo)).data!;
 await capture.update(photo.id,photo.version,{title:'new title',learnedOn:'2026-10-12',tags:'',consent:false},{...fullTransform,rotation:90},image);
 const after=await photoReview(local,(await batchPhotos(local,batchId))[0]);expect(after.ready).toBe(false);expect(after.data).toEqual(before);
});
it('deleting a draft removes its own pixels/review only, leaving other photos intact',async()=>{
 const {local,batchId,capture}=await photos(2);await analysePhotoBatch(local,batchId,new AbortController().signal,()=>{},async()=>result);const rows=await batchPhotos(local,batchId);await capture.remove(rows[0].id,rows[0].version);
 expect(await local.db.table('learningDrafts').get([local.scope.id,`ocr:${rows[0].id}`])).toBeUndefined();expect((await photoReview(local,rows[1])).ready).toBe(true);
});
it('stale review CAS prevents replacing another tab edits',async()=>{
 const {local,batchId}=await photos(1);const row=(await batchPhotos(local,batchId))[0],id=`ocr:${row.id}`;
 const analyse:typeof analyseWorksheet=async()=>{const now=new Date().toISOString();const data:WorksheetDraft={text:'mine',items:[],mode:'listed',operation:'mine'};await local.db.table('learningDrafts').put({scopeId:local.scope.id,id,version:1,createdAt:now,updatedAt:now,deletedAt:null,payload:{data}});return result;};
 await expect(analysePhotoBatch(local,batchId,new AbortController().signal,()=>{},analyse)).rejects.toThrow('conflict');expect((await photoReview(local,row)).data?.text).toBe('mine');
});
it('attaches a single draft to a batch losslessly with CAS and scope isolation',async()=>{
 const {local,capture}=setup();const first=await capture.create(image);const edited=await capture.update(first.id,1,{title:'My edited lesson',learnedOn:'2026-10-12',tags:'keep',consent:false},{...fullTransform,rotation:90},image);const group=crypto.randomUUID();
 await expect(capture.attachBatch(first.id,1,group)).rejects.toThrow('conflict');
 const attached=await capture.attachBatch(first.id,edited.version,group);expect(attached.title).toBe('My edited lesson');expect(attached.tags).toBe('keep');expect(attached.transform.rotation).toBe(90);expect(await(await capture.get(first.id))!.prepared.text()).toBe('jpeg');
 await expect(setup('guest:other',local.db).capture.attachBatch(first.id,attached.version,group)).rejects.toThrow('missing');
 await expect(capture.attachBatch(first.id,attached.version,'different')).rejects.toThrow('conflict');
});
it('common lesson save rejects a changed photo snapshot atomically, then saves once with an idempotent receipt',async()=>{
 const {local,batchId,capture}=await photos(2),rows=await batchPhotos(local,batchId);const signature=JSON.stringify(rows.map(row=>[row.id,row.version]));
 const {literal,exampleIpa,...word}=result.words[0];void exampleIpa;
 const input={operationId:crypto.randomUUID(),lessonId:`ocr-batch:${batchId}`,title:'One common lesson',learnedOn:'2026-10-12',sourceType:'image' as const,items:[{...word,source:'Batch fixture',sourceEvidenceText:literal,id:'common-pear',art:null,lesson:'manual',ready:true,approved:true}],captureBatch:{id:batchId,signature}};
 await capture.update(rows[0].id,rows[0].version,{title:'changed',learnedOn:'2026-10-12',tags:'',consent:false},fullTransform,image);
 await expect(local.saveLesson(input)).rejects.toThrow('conflict');expect(await local.db.lessons.count()).toBe(0);expect(await local.db.senses.count()).toBe(0);expect(await local.db.receipts.count()).toBe(0);
 const current=await batchPhotos(local,batchId);const final={...input,captureBatch:{id:batchId,signature:JSON.stringify(current.map(row=>[row.id,row.version]))}};
 const saved=await local.saveLesson(final);expect(await local.saveLesson(final)).toEqual(saved);expect(await local.db.lessons.count()).toBe(1);expect(await local.db.senses.count()).toBe(1);
});
it('a common image lesson keeps more than twenty learning items in one atomic save',async()=>{
 const {local}=setup();const {literal,exampleIpa,...word}=result.words[0];void exampleIpa;const {familyWorksheet}=await import('../fixtures/family-worksheet');const {reviewedLearning}=await import('@/lib/ai/worksheet-learning');
 await local.saveLesson({operationId:crypto.randomUUID(),title:'Common learning',learnedOn:'2026-10-12',sourceType:'image',items:[{...word,source:'Batch fixture',sourceEvidenceText:literal,id:'target',art:null,lesson:'manual',ready:true,approved:true}],learning:Array.from({length:25},(_,i)=>({key:`source-${i}`,wordId:'target',content:{...reviewedLearning(familyWorksheet.learning[0]),example:`This is sentence ${i}.`,sourceEvidenceText:`This is sentence ${i}.`,exampleIpa:undefined}}))});
 expect(await local.db.lessons.count()).toBe(1);expect(await local.db.table('sentences').count()).toBe(25);
});
