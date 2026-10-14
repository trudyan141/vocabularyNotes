import {z} from 'zod';
import {Dexie} from 'dexie';
import {archiveRecordsSchema} from './archive';
import {LocalRepository,RepositoryError} from './repository';
import {rebuildSearch} from './database';
import {validateMedia} from './media';
import {canonicalKey,exactSenseKey,contentHash,stableJson} from '@/domain/identity';
import {reScope} from '@/lib/sharing';
import {remapGroup,type Deck} from './decks';
import {parseCloudRow} from '@/lib/cloud/contracts';
import type {ScopedDocument} from './types';
export const contentTables=['entries','senses','lessons','examples','lessonItems','notes','decks','sentences','mediaAssets'] as const;
type Entity=typeof contentTables[number];
const recordsSchema=archiveRecordsSchema.pick({entries:true,senses:true,lessons:true,examples:true,lessonItems:true,notes:true,decks:true,sentences:true,mediaAssets:true});
const copySchema=z.object({formatVersion:z.literal('words-for-kids.content.v1'),exportedAt:z.iso.datetime(),source:z.object({libraryId:z.uuid(),name:z.string().max(200)}).strict(),records:recordsSchema,checksum:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export type ContentCopy=z.infer<typeof copySchema>;
const tables=(repo:LocalRepository)=>contentTables.map(name=>repo.db.table(name));
async function snapshot(repo:LocalRepository){return repo.db.transaction('r',tables(repo),async()=>{const result:Record<string,unknown[]>={};for(const entity of contentTables)result[entity]=await repo.db.table(entity).where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray();return recordsSchema.parse(result);});}
export async function parseContentCopy(raw:string){
 if(new TextEncoder().encode(raw).length>50_000_000)throw new RepositoryError('invalid');
 const copy=copySchema.parse(JSON.parse(raw)),{checksum,...body}=copy;
 if(await contentHash(body)!==checksum)throw new RepositoryError('invalid');
 const r=copy.records,scope=`content:${copy.source.libraryId}`;
 for(const rows of Object.values(r))if(rows.length>10000||new Set(rows.map(row=>row.id)).size!==rows.length||rows.some(row=>row.scopeId!==scope||row.deletedAt))throw new RepositoryError('invalid');
 const entries=new Map(r.entries.map(row=>[row.id,row])),senses=new Map(r.senses.map(row=>[row.id,row])),lessons=new Set(r.lessons.map(row=>row.id));
 for(const e of r.entries)if(e.canonicalKey!==canonicalKey(e.displayText,e.caseMode)||e.activeKey!==undefined&&e.activeKey!==e.canonicalKey)throw new RepositoryError('invalid');
 for(const s of r.senses)if(!entries.has(s.entryId)||s.identity!==exactSenseKey(s.pos,s.senseLabel)||s.pendingEdit||s.learningApprovalStatus!=='approved'||s.approvedContentVersion!==s.contentVersion)throw new RepositoryError('invalid');
 for(const row of r.examples)if(!senses.has(row.senseId))throw new RepositoryError('invalid');
 for(const row of r.lessonItems)if(!lessons.has(row.lessonId)||senses.get(row.senseId)?.entryId!==row.entryId||row.evidenceId!==null)throw new RepositoryError('invalid');
 for(const row of r.notes)if(!(row.targetType==='sense'?senses.has(row.targetId):lessons.has(row.targetId)))throw new RepositoryError('invalid');
 for(const row of r.decks)if(row.payload.deck.senseIds.some(id=>!senses.has(id))||row.payload.deck.group?.sets?.some(set=>set.lessonId&&!lessons.has(set.lessonId)))throw new RepositoryError('invalid');
 for(const row of r.sentences)if(!senses.has(row.payload.content.senseId)||row.payload.content.lessonId&&!lessons.has(row.payload.content.lessonId))throw new RepositoryError('invalid');
 for(const row of r.mediaAssets){const asset=await validateMedia(row.payload.asset);if(!senses.has(asset.senseId)||!asset.approved||asset.status!=='ready')throw new RepositoryError('invalid');}
 return copy;
}
export async function exportSharedContent(repo:LocalRepository){
 if(repo.scope.kind!=='shared'||!repo.canPractice)throw new RepositoryError('scope');
 const r=await snapshot(repo);for(const name of contentTables)r[name]=r[name].filter(row=>!row.deletedAt) as never;const senses=r.senses.filter(row=>row.learningApprovalStatus==='approved'&&row.approvedContentVersion===row.contentVersion),ids=new Set(senses.map(row=>row.id)),entries=new Set(senses.map(row=>row.entryId));
 r.senses=senses.map(row=>{const {pendingEdit,...visible}=row;void pendingEdit;return visible;});r.entries=r.entries.filter(row=>entries.has(row.id));
 for(const name of contentTables)r[name]=r[name].filter(row=>!row.deletedAt) as never;
 r.examples=r.examples.filter(row=>ids.has(row.senseId));r.lessonItems=r.lessonItems.filter(row=>ids.has(row.senseId)&&r.lessons.some(lesson=>lesson.id===row.lessonId)).map(row=>({...row,evidenceId:null}));
 r.lessons=r.lessons.map(row=>({...row,sourceDigest:null}));r.notes=r.notes.filter(row=>row.targetType==='sense'?ids.has(row.targetId):r.lessons.some(lesson=>lesson.id===row.targetId));
 r.sentences=r.sentences.filter(row=>{const sense=r.senses.find(s=>s.id===row.payload.content.senseId),entry=r.entries.find(e=>e.id===sense?.entryId);return !!sense&&row.payload.content.targetRevision===`${entry?.version}:${sense.version}`;}).map(row=>{const {sourceEvidenceText,lessonId,...content}=row.payload.content;void sourceEvidenceText;return {...row,payload:{content:{...content,...(lessonId&&r.lessons.some(l=>l.id===lessonId)?{lessonId}:{}),...(content.grammarVariants?{grammarVariants:content.grammarVariants.map(variant=>{const {sourceEvidenceText,...form}=variant;void sourceEvidenceText;return form;})}:{})}}};});
 r.mediaAssets=r.mediaAssets.filter(row=>{const asset=row.payload.asset,sense=r.senses.find(s=>s.id===asset.senseId),entry=r.entries.find(e=>e.id===sense?.entryId);return !!sense&&sense.art===row.id&&asset.word===entry?.displayText&&asset.revision===`${entry?.version}:${sense.version}`&&asset.approved&&asset.status==='ready';});
 const media=new Set(r.mediaAssets.map(row=>row.id));r.senses=r.senses.map(row=>({...row,art:row.art?.startsWith('media-')&&!media.has(row.art)?null:row.art}));
 r.decks=r.decks.flatMap(row=>{const d=row.payload.deck,senseIds=d.senseIds.filter(id=>ids.has(id));if(!senseIds.length)return [];if(!d.group)return [{...row,payload:{deck:{...d,senseIds}}}];const g=d.group,sentences=g.sentences.filter(ref=>ids.has(ref.senseId)),grammar=g.grammar?.filter(ref=>ids.has(ref.senseId)),sentenceKeys=new Set(sentences.map(ref=>ref.key)),grammarKeys=new Set(grammar?.map(ref=>ref.key));return [{...row,payload:{deck:{...d,senseIds,group:{...g,wordIds:g.wordIds.filter(id=>ids.has(id)),sentences,...(grammar?{grammar}:{}),...(g.sets?{sets:g.sets.map(set=>{const {lessonId,...rest}=set;return {...rest,...(lessonId&&r.lessons.some(l=>l.id===lessonId)?{lessonId}:{}),wordIds:set.wordIds.filter(id=>ids.has(id)),sentenceKeys:set.sentenceKeys.filter(key=>sentenceKeys.has(key)),grammarKeys:set.grammarKeys.filter(key=>grammarKeys.has(key))};}).filter(set=>set.wordIds.length+set.sentenceKeys.length+set.grammarKeys.length)}:{})}}}}];});
 if(!repo.canPractice)throw new RepositoryError('scope');
 const body={formatVersion:'words-for-kids.content.v1' as const,exportedAt:new Date().toISOString(),source:{libraryId:repo.scope.libraryId,name:repo.scope.access.name},records:reScope(r,`content:${repo.scope.libraryId}`)};
 return parseContentCopy(stableJson({...body,checksum:await contentHash(body)}));
}
export type ContentCopyPlan={copy:ContentCopy;targetScope:string;targetHash:string;key:string;reviewed:boolean;added:number;linked:number;grammarAdded:number;grammarSkipped:number;conflicts:string[];alreadyCopied:boolean};
export async function prepareContentCopy(target:LocalRepository,copy:ContentCopy,reviewed=false):Promise<ContentCopyPlan>{
 target.assertContentWritable();if(!['guest','account'].includes(target.scope.kind))throw new RepositoryError('scope');
 const checked=await parseContentCopy(stableJson(copy)),current=await snapshot(target),key=await contentHash({source:checked.source,records:checked.records});
 let added=0,linked=0;const conflicts:string[]=[];
 const incoming=new Map<string,ContentCopy['records']['senses'][number]>(),senseMap=new Map<string,string>();
 for(const s of checked.records.senses){const entry=checked.records.entries.find(row=>row.id===s.entryId)!,key=stableJson([entry.canonicalKey,entry.caseMode,s.identity]),existingEntry=current.entries.find(row=>!row.deletedAt&&row.canonicalKey===entry.canonicalKey&&row.caseMode===entry.caseMode),existing=current.senses.find(row=>!row.deletedAt&&row.entryId===existingEntry?.id&&row.identity===s.identity)??incoming.get(key);if(!existing){added++;incoming.set(key,s);senseMap.set(s.id,s.id);}else{linked++;senseMap.set(s.id,existing.id);if(existing.meaningVi!==s.meaningVi||existing.definitionEn!==s.definitionEn)conflicts.push(`${entry.displayText} (${s.pos}: ${s.senseLabel})`);}}
 const seen=new Set(current.sentences.filter(row=>!row.deletedAt).map(row=>contentIdentity('sentences',row)));let grammarAdded=0,grammarSkipped=0;
 for(const row of checked.records.sentences){const s=checked.records.senses.find(s=>s.id===row.payload.content.senseId)!,entry=checked.records.entries.find(e=>e.id===s.entryId)!,ownSense=current.senses.find(own=>!own.deletedAt&&own.id===senseMap.get(s.id))??incoming.get(stableJson([entry.canonicalKey,entry.caseMode,s.identity]));const signature=contentIdentity('sentences',{payload:{content:{...row.payload.content,senseId:senseMap.get(s.id)}}})!;if(ownSense&&(ownSense.meaningVi!==s.meaningVi||ownSense.definitionEn!==s.definitionEn)||seen.has(signature))grammarSkipped++;else{grammarAdded++;seen.add(signature);}}
 return {copy:checked,targetScope:target.scope.id,targetHash:await contentHash(current),key,reviewed,added,linked,grammarAdded,grammarSkipped,conflicts,alreadyCopied:!!await target.db.table('transferCheckpoints').get([target.scope.id,`content-copy:${key}`])};
}
export async function commitContentCopy(target:LocalRepository,plan:ContentCopyPlan){
 target.assertContentWritable();if(target.scope.id!==plan.targetScope||!['guest','account'].includes(target.scope.kind))throw new RepositoryError('scope');
 const copy=await parseContentCopy(stableJson(plan.copy));if(await contentHash({source:copy.source,records:copy.records})!==plan.key)throw new RepositoryError('invalid');
 return target.db.transaction('rw',target.db.tables,async()=>{
 const receipts=target.db.table<ScopedDocument>('transferCheckpoints'),receipt=await receipts.get([target.scope.id,`content-copy:${plan.key}`]);if(receipt)return receipt.payload.result as {added:number;linked:number};
 const current=await snapshot(target);if(await Dexie.waitFor(contentHash(current))!==plan.targetHash)throw new RepositoryError('conflict');
 const source=copy.records,maps=Object.fromEntries(contentTables.map(entity=>[entity,new Map<string,string>()])) as Record<Entity,Map<string,string>>,skip=new Set<string>(),conflicted=new Set<string>();
 for(const entity of contentTables)for(const row of source[entity])maps[entity].set(row.id,entity==='mediaAssets'?`media-${crypto.randomUUID()}`:crypto.randomUUID());
 const entrySeen=new Map(current.entries.filter(row=>!row.deletedAt).map(e=>[stableJson([e.canonicalKey,e.caseMode]),e.id]));
 for(const e of source.entries){const key=stableJson([e.canonicalKey,e.caseMode]),old=entrySeen.get(key);if(old){maps.entries.set(e.id,old);skip.add(`entries:${e.id}`);}else entrySeen.set(key,maps.entries.get(e.id)!);}
 let added=0,linked=0;
 const senseSeen=new Map(current.senses.filter(row=>!row.deletedAt).map(s=>[stableJson([s.entryId,s.identity]),{id:s.id,content:s}]));
 for(const s of source.senses){const key=stableJson([maps.entries.get(s.entryId),s.identity]),old=senseSeen.get(key);if(old){maps.senses.set(s.id,old.id);skip.add(`senses:${s.id}`);linked++;if(old.content.meaningVi!==s.meaningVi||old.content.definitionEn!==s.definitionEn)conflicted.add(s.id);}else{added++;senseSeen.set(key,{id:maps.senses.get(s.id)!,content:s});}}
 const map=(entity:Entity,id:string)=>maps[entity].get(id)!;
 const revision=(senseId:string)=>{const s=source.senses.find(row=>row.id===senseId)!,old=current.senses.find(row=>row.id===map('senses',senseId)),entry=current.entries.find(row=>row.id===map('entries',s.entryId))??source.entries.find(row=>row.id===s.entryId)!;return `${current.entries.some(e=>e.id===entry.id)?entry.version:1}:${old?.version??1}`;};
 for(const entity of contentTables)for(const original of source[entity]){
  if(skip.has(`${entity}:${original.id}`))continue;
  const at=new Date().toISOString();const row={...original,id:map(entity,original.id),scopeId:target.scope.id,version:1,createdAt:at,updatedAt:at} as Record<string,unknown>;
  if(entity==='entries'&&row.kind==='word')row.activeKey=row.canonicalKey;
  if(entity==='senses'){const s=original as ContentCopy['records']['senses'][number];row.entryId=map('entries',s.entryId);row.tags=s.tags.map(tag=>tag.startsWith('global-word:')&&maps.senses.has(tag.slice(12))?`global-word:${map('senses',tag.slice(12))}`:tag).filter(tag=>!tag.startsWith('global-word:')||[...maps.senses.values()].includes(tag.slice(12)));if(s.art?.startsWith('media-'))row.art=map('mediaAssets',s.art);if(!plan.reviewed){row.learningApprovalStatus='pending';row.approvedContentVersion=null;row.pronunciations=s.pronunciations.map(p=>({...p,verified:false}));}}
  if(entity==='examples'){const e=original as ContentCopy['records']['examples'][number];if(skip.has(`senses:${e.senseId}`))continue;row.senseId=map('senses',e.senseId);if(!plan.reviewed)row.pronunciations=e.pronunciations.map(p=>({...p,verified:false}));}
  if(entity==='lessonItems'){const link=original as ContentCopy['records']['lessonItems'][number];row.entryId=map('entries',link.entryId);row.senseId=map('senses',link.senseId);row.lessonId=map('lessons',link.lessonId);row.evidenceId=null;}
  if(entity==='notes'){const note=original as ContentCopy['records']['notes'][number];if(note.targetType==='sense'&&conflicted.has(note.targetId))continue;row.targetId=map(note.targetType==='sense'?'senses':'lessons',note.targetId);}
  if(entity==='sentences'){const content=(original as ContentCopy['records']['sentences'][number]).payload.content;if(conflicted.has(content.senseId))continue;row.payload={content:{...content,senseId:map('senses',content.senseId),targetRevision:revision(content.senseId),...(content.lessonId?{lessonId:map('lessons',content.lessonId)}:{})}};}
  if(entity==='mediaAssets'){const asset=(original as ContentCopy['records']['mediaAssets'][number]).payload.asset;if(skip.has(`senses:${asset.senseId}`))continue;row.payload={asset:{...asset,senseId:map('senses',asset.senseId),revision:revision(asset.senseId),word:current.entries.find(e=>e.id===map('entries',source.senses.find(s=>s.id===asset.senseId)!.entryId))!.displayText,approved:plan.reviewed,status:plan.reviewed?'ready':'pending'}};}
  if(entity==='decks'){const d=(original as ContentCopy['records']['decks'][number]).payload.deck;row.payload={deck:{...d,senseIds:[...new Set(d.senseIds.map(id=>map('senses',id)))],...(d.group?{group:remapGroup(d.group,id=>map('senses',id),id=>map('lessons',id))}:{})} satisfies Deck};}
  // Compare educational content, never source IDs, timestamps or learning progress.
  const signature=contentIdentity(entity,row),existing=current[entity].find(item=>!item.deletedAt&&contentIdentity(entity,item)===signature);
  if(signature&&existing){maps[entity].set(original.id,existing.id);continue;}
  const parsed=parseCloudRow(entity,row);await target.db.table(entity).add(parsed);
  (current[entity] as unknown[]).push(parsed);

 }
 await rebuildSearch(Dexie.currentTransaction!);const result={added,linked};const at=new Date().toISOString();await receipts.add({scopeId:target.scope.id,id:`content-copy:${plan.key}`,version:1,createdAt:at,updatedAt:at,deletedAt:null,payload:{result,sourceLibraryId:copy.source.libraryId}});return result;
 });
}

function contentIdentity(entity:Entity,input:unknown):string|null{
 const row=input as Record<string,unknown>,payload=row.payload as {content?:Record<string,unknown>;deck?:Record<string,unknown>}|undefined;
 const normalize=(value:unknown):unknown=>typeof value==='string'?value.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase():Array.isArray(value)?value.map(normalize):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,v])=>[key,normalize(v)])):value;
 let value:unknown;
 if(entity==='sentences'){const {targetRevision,lessonId,source,sourceEvidenceText,exampleIpa,readingHintVi,commonErrorIpa,correctionIpa,grammarFamily,grammarVariants,...content}=payload!.content!;void targetRevision;void lessonId;void source;void sourceEvidenceText;void exampleIpa;void readingHintVi;void commonErrorIpa;void correctionIpa;void grammarFamily;value={...content,...(Array.isArray(grammarVariants)&&grammarVariants.length?{grammarVariants:grammarVariants.map(({exampleIpa,commonErrorIpa,correctionIpa,sourceEvidenceText,...form})=>{void exampleIpa;void commonErrorIpa;void correctionIpa;void sourceEvidenceText;return form;})}:{})};}
 else if(entity==='lessons')value=[row.title,row.learnedOn,row.sourceType];
 else if(entity==='lessonItems')value=[row.lessonId,row.entryId,row.senseId];
 else if(entity==='notes')value=[row.targetType,row.targetId,row.text,row.mnemonicData??null];
 else if(entity==='decks'){const d=payload!.deck!;const group=d.group as {sets?:Record<string,unknown>[]} |undefined;value={...d,...(group?{group:{...group,sets:group.sets?.map(set=>{const {id,...rest}=set;void id;return rest;})}}:{})};}
 else return null;
 return stableJson(normalize(value));
}
