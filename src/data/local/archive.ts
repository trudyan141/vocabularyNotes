import {z} from 'zod';
import {worksheetLearning} from '@/lib/ai/worksheet-learning';
import {Dexie} from 'dexie';
import {imageHeader,validateDimensions} from '@/lib/capture/image';
import type {LocalRepository} from './repository';
import {RepositoryError,candidateSchema} from './repository';
import {contentHash,stableJson,canonicalKey,exactSenseKey} from '@/domain/identity';
import {deckSchema} from './decks';
import {contentSchema} from './content';
import {wordSchema} from './backup';
import {mediaAsset} from '@/lib/media/contracts';
import {validateMedia} from './media';
import {safeArt} from '@/lib/media/catalog';
import {rebuildSearch} from './database';
const id=z.string().min(1).max(200),date=z.iso.datetime(),text=z.string().max(10000);
const base={scopeId:id,id,version:z.number().int().positive(),createdAt:date,updatedAt:date,deletedAt:date.nullable()};
const pronunciation=wordSchema.shape.pronunciations;
const session=z.object({id,scopeId:id,mode:z.enum(['flashcard','picture-word','word-picture','letters','spelling','grammar']),direction:z.enum(['en-vi','vi-en']).optional(),questions:z.array(z.object({id,word:wordSchema,choices:z.array(wordSchema).max(3),missingIndex:z.number().int().nonnegative(),grammar:z.object({id,version:z.number().int().positive(),formula:text,example:z.string().min(1).max(200),exampleVi:text,exampleIpa:text.optional()}).strict().optional()}).strict()).max(10),position:z.number().int().nonnegative().max(10),revealed:z.boolean(),hint:z.boolean(),checkedAnswer:text.nullable(),checkedCorrect:z.boolean().nullable(),answers:z.array(z.object({questionId:id,correct:z.boolean(),skipped:z.boolean(),hint:z.boolean(),rating:z.enum(['Again','Hard','Good','Easy']).nullable()}).strict()).max(10),completedAt:date.nullable(),version:z.number().int().positive(),createdAt:date}).strict();
const state=z.object({intervalDays:z.number().int().min(0).max(365),ease:z.number().min(1.3).max(3),streak:z.number().int().nonnegative(),dueAt:date,algorithmVersion:z.literal(1)}).strict();
const form=z.object({word:z.string().max(200),vi:z.string().max(1000),en:z.string().max(1000),pos:z.string().max(60),sense:z.string().max(200),example:z.string().max(1000),exampleVi:z.string().max(1000),ipa:z.string().max(1000),hint:z.string().max(1000),exampleHint:z.string().max(1000),exampleIpa:z.string().max(2000).optional(),secondExample:z.string().max(2000).optional(),secondExampleVi:z.string().max(2000).optional(),secondHint:z.string().max(1000).optional(),secondIpa:z.string().max(2000).optional(),art:z.string().max(100).nullable(),source:z.string().max(2000),evidence:z.string().max(1000),ipaSource:z.string().max(2000).nullable().optional(),ipaVerified:z.boolean().optional(),origin:z.enum(["demo","user","source","ai_generated"]).optional()}).strict();
const ocrItem=z.object({id,literal:z.string().max(200),word:z.string().max(200),vi:z.string().max(1000),en:z.string().max(1000),pos:z.string().max(60),sense:z.string().max(200),example:z.string().max(1000),exampleVi:z.string().max(1000),exampleIpa:z.string().max(2000).nullable().optional(),selected:z.boolean(),art:z.string().max(100).nullable(),origin:z.enum(['ai_generated','user','source']).optional()}).strict();
export const archiveRecordsSchema=z.object({
 mediaAssets:z.array(z.object({...base,payload:z.object({asset:mediaAsset}).strict()}).strict()).default([]),
 decks:z.array(z.object({...base,payload:z.object({deck:deckSchema}).strict()}).strict()),
 sentences:z.array(z.object({...base,payload:z.object({content:contentSchema}).strict()}).strict()),
 learningDrafts:z.array(z.object({...base,payload:z.union([z.object({form}).strict(),z.object({data:z.object({text,items:z.array(ocrItem).max(100),mode:z.enum(['listed','all']),operation:id,origin:z.literal('ai_generated').optional(),model:z.string().max(100).optional(),learning:z.array(worksheetLearning).max(20).optional()}).strict()}).strict()])}).strict()),
 drafts:z.array(z.object({...base,candidates:z.array(candidateSchema).max(100),saveOperationId:id,phase:z.enum(['review','saved']),lastReceiptId:id.nullable()}).strict()),
 receipts:z.array(z.object({scopeId:id,id,payloadHash:z.string().regex(/^[a-f0-9]{64}$/),result:z.object({added:z.number().int().nonnegative(),linked:z.number().int().nonnegative(),addedSenses:z.number().int().nonnegative(),lessonId:id,operationId:id}).strict()}).strict()),
 entries:z.array(z.object({...base,displayText:z.string().max(200),language:z.literal('en'),canonicalKey:z.string().max(300),keyVersion:z.literal(1),caseMode:z.enum(['fold','exact']),activeKey:z.string().max(300).optional(),kind:z.enum(['word','phrase'])}).strict()),
 senses:z.array(z.object({...base,pendingEdit:wordSchema.shape.pendingEdit,entryId:id,identity:text,pos:z.string().max(60),senseLabel:z.string().max(200),definitionEn:z.string().max(1000),meaningVi:z.string().max(1000),art:z.string().max(100).nullable(),source:z.string().max(2000),origin:z.enum(['demo','user','source','ai_generated']),contentStatus:z.enum(['complete','needs_enrichment']),learningApprovalStatus:z.enum(['pending','approved','rejected']),contentVersion:z.number().int().positive(),approvedContentVersion:z.number().int().positive().nullable(),pronunciations:pronunciation,tags:z.array(z.string().max(100)).max(30)}).strict()),
 examples:z.array(z.object({...base,senseId:id,position:z.number().int().min(0).max(1).optional(),textEn:z.string().max(2000),translationVi:z.string().max(2000),origin:z.enum(['demo','user','source','ai_generated']),pronunciations:pronunciation}).strict()),
 lessons:z.array(z.object({...base,title:z.string().max(200),learnedOn:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),sourceType:z.enum(['demo','manual','image']),sourceDigest:text.nullable()}).strict()),
 lessonItems:z.array(z.object({...base,lessonId:id,senseId:id,entryId:id,evidenceId:id.nullable()}).strict()),
 evidence:z.array(z.object({...base,lessonId:id,literalText:z.string().max(2500),origin:z.enum(['demo','source'])}).strict()),
 notes:z.array(z.object({...base,targetType:z.enum(['sense','lesson']),targetId:id,text,mnemonicData:z.object({template:z.enum(['word-association','sentence-chunks','grammar-transform'])}).strict().nullable().optional(),origin:z.literal('user')}).strict()),
 reviewEvents:z.array(z.object({scopeId:id,id,senseId:id,sessionId:id,rating:z.enum(['Again','Hard','Good','Easy']),eventTime:date,hints:z.boolean()}).strict()),
 reviewStates:z.array(z.object({...base,payload:z.object({state}).strict()}).strict()),
 practiceSessions:z.array(z.object({...base,payload:z.object({session}).strict()}).strict()),
 gameAttempts:z.array(z.object({...base,payload:z.object({senseId:id,questionId:id,sessionId:id,answer:z.string().max(200),correct:z.boolean(),skipped:z.boolean(),hint:z.boolean()}).strict()}).strict()),
 captureDrafts:z.array(z.object({...base,title:z.string().max(200),learnedOn:z.string().max(10),tags:z.string().max(500),consent:z.boolean(),sourceKey:id,preparedKey:id,transform:z.object({rotation:z.union([z.literal(0),z.literal(90),z.literal(180),z.literal(270)]),crop:z.object({left:z.number().min(0).max(100),right:z.number().min(0).max(100),top:z.number().min(0).max(100),bottom:z.number().min(0).max(100)}).strict()}).strict(),width:z.number().int().positive().max(2200),height:z.number().int().positive().max(2200),byteSize:z.number().int().positive().max(10_485_760),phase:z.literal('editing'),consentVersion:z.literal('image-upload-v1').nullable()}).strict()),
 localMedia:z.array(z.object({...base,mime:z.literal('image/jpeg'),byteSize:z.number().int().positive().max(10_485_760),base64:z.string().max(14_000_000)}).strict()),
}).strict();
const schema=z.object({formatVersion:z.literal('words-for-kids.archive.v1'),exportedAt:date,records:archiveRecordsSchema,checksum:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export type Archive=z.infer<typeof schema>;
const names=Object.keys(archiveRecordsSchema.shape);
const limit=50_000_000;
function encode(bytes:Uint8Array){let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(value);}
function decode(value:string){return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}
export async function exportArchive(repo:LocalRepository,options:{includeDrafts?:boolean}={}):Promise<Archive>{
 const data:Record<string,unknown[]>=await repo.db.transaction('r',names.map(n=>repo.db.table(n)),async()=>{const output:Record<string,unknown[]>={};for(const name of names)output[name]=options.includeDrafts===false&&['captureDrafts','localMedia','learningDrafts','drafts'].includes(name)?[]:await repo.db.table(name).where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray();return output;});
 const images=data.localMedia as {blob:Blob;byteSize:number}[];if(images.reduce((total,row)=>total+row.byteSize,0)>30_000_000)throw new RepositoryError('invalid');
 data.localMedia=await Promise.all(images.map(async row=>{const {blob,...metadata}=row;return {...metadata,base64:encode(new Uint8Array(await blob.arrayBuffer()))};}));
 const payload={formatVersion:'words-for-kids.archive.v1' as const,exportedAt:new Date().toISOString(),records:data};
 return parseArchive(stableJson({...payload,checksum:await contentHash(payload)}));
}
export async function parseArchive(raw:string):Promise<Archive>{
 if(new TextEncoder().encode(raw).length>limit)throw new RepositoryError('invalid');const value=JSON.parse(raw),{checksum,...data}=value;if(await contentHash(data)!==checksum)throw new RepositoryError('invalid');const archive=schema.parse(value);
 const r=archive.records,scopes=new Set<string>();for(const rows of Object.values(r)){if(rows.length>10000||new Set(rows.map(row=>row.id)).size!==rows.length)throw new RepositoryError('invalid');for(const row of rows)scopes.add(row.scopeId);}if(scopes.size>1)throw new RepositoryError('scope');
 const entries=new Map(r.entries.map(e=>[e.id,e])),senses=new Map(r.senses.map(s=>[s.id,s])),lessons=new Set(r.lessons.map(l=>l.id)),evidence=new Set(r.evidence.map(e=>e.id)),media=new Map(r.localMedia.map(m=>[m.id,m]));
 for(const e of r.entries)if(e.canonicalKey!==canonicalKey(e.displayText,e.caseMode)||e.activeKey!==undefined&&e.activeKey!==e.canonicalKey)throw new RepositoryError('invalid');
 for(const s of r.senses)if(!entries.has(s.entryId)||s.identity!==exactSenseKey(s.pos,s.senseLabel))throw new RepositoryError('invalid');
 for(const row of r.mediaAssets){const asset=await validateMedia(row.payload.asset);if(!senses.has(asset.senseId))throw new RepositoryError('invalid');}
 for(const row of r.decks)if(row.payload.deck.senseIds.some(id=>!senses.has(id)))throw new RepositoryError('invalid');
 for(const row of r.sentences)if(!senses.has(row.payload.content.senseId))throw new RepositoryError('invalid');
 for(const e of r.examples)if(!senses.has(e.senseId))throw new RepositoryError('invalid');
 for(const link of r.lessonItems)if(!lessons.has(link.lessonId)||!senses.has(link.senseId)||senses.get(link.senseId)?.entryId!==link.entryId||link.evidenceId&&!evidence.has(link.evidenceId))throw new RepositoryError('invalid');
 for(const e of r.evidence)if(!lessons.has(e.lessonId))throw new RepositoryError('invalid');
 for(const n of r.notes)if(!(n.targetType==='sense'?senses.has(n.targetId):lessons.has(n.targetId)))throw new RepositoryError('invalid');
 for(const event of r.reviewEvents)if(!senses.has(event.senseId))throw new RepositoryError('invalid');
 for(const row of r.reviewStates)if(!senses.has(row.id))throw new RepositoryError('invalid');
 for(const row of r.gameAttempts)if(!senses.has(row.payload.senseId))throw new RepositoryError('invalid');
 for(const row of r.practiceSessions){const s=row.payload.session;if(s.id!==row.id||s.scopeId!==row.scopeId||s.position>s.questions.length||s.answers.length!==s.position||s.questions.some(q=>!senses.has(q.word.id)))throw new RepositoryError('invalid');}
 for(const m of r.localMedia){const bytes=decode(m.base64);if(bytes.length!==m.byteSize)throw new RepositoryError('invalid');const header=imageHeader(bytes);if(header.mime!=='image/jpeg')throw new RepositoryError('invalid');validateDimensions(header.width,header.height);}
 for(const d of r.captureDrafts)if(!media.has(d.sourceKey)||!media.has(d.preparedKey)||d.transform.crop.left>=d.transform.crop.right||d.transform.crop.top>=d.transform.crop.bottom)throw new RepositoryError('invalid');
 if(!value.records.mediaAssets){const {checksum:oldChecksum,...normalized}=archive;void oldChecksum;archive.checksum=await contentHash(normalized);}
 return archive;
}
export async function importArchive(repo:LocalRepository,archive:Archive){
 const checked=await parseArchive(stableJson(archive));const rows=checked.records;
 // Complete snapshot restore is for an empty local library. Existing content is never replaced.
 await repo.db.transaction('rw',repo.db.tables,async()=>{
   for(const name of names)if(await repo.db.table(name).where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).count())throw new RepositoryError('conflict');
   for(const name of names){const imported=rows[name as keyof typeof rows].map(raw=>{const row={...raw,scopeId:repo.scope.id} as Record<string,unknown>;
     if(name==='senses'){const sense=raw as Archive['records']['senses'][number];row.learningApprovalStatus='pending';row.approvedContentVersion=null;row.art=safeArt(sense.art);row.pronunciations=sense.pronunciations.map(p=>({...p,verified:false}));}
     if(name==='mediaAssets'){const asset=(raw as Archive['records']['mediaAssets'][number]).payload.asset;row.payload={asset:{...asset,approved:false,status:'pending'}};}
     if(name==='examples')row.pronunciations=(raw as Archive['records']['examples'][number]).pronunciations.map(p=>({...p,verified:false}));
     if(name==='captureDrafts'){row.consent=false;row.consentVersion=null;}
     if(name==='learningDrafts'){const payload=(raw as Archive['records']['learningDrafts'][number]).payload;if('form' in payload)row.payload={form:{...payload.form,art:safeArt(payload.form.art),ipaVerified:false}};else row.payload={data:{...payload.data,items:payload.data.items.map(i=>({...i,art:safeArt(i.art)}))}};}
     if(name==='drafts')row.candidates=(raw as Archive['records']['drafts'][number]).candidates.map(c=>({...c,art:safeArt(c.art)}));
     if(name==='localMedia'){const {base64,...meta}=row;return {...meta,blob:new Blob([decode(base64 as string)],{type:'image/jpeg'})};}
     if(name==='practiceSessions'){const s=(raw as Archive['records']['practiceSessions'][number]).payload.session;row.payload={session:{...s,scopeId:repo.scope.id}};}
     return row;});if(imported.length)await repo.db.table(name).bulkAdd(imported);
   }
   if(!Dexie.currentTransaction)throw new RepositoryError('invalid');await rebuildSearch(Dexie.currentTransaction);
 });
 return {words:rows.senses.length,images:rows.localMedia.length,reviews:rows.reviewEvents.length};
}
