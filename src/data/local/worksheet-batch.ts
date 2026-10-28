import {CaptureRepository,type CaptureDraft} from './capture';
import {RepositoryError,type LocalRepository} from './repository';
import type {ScopedDocument} from './types';
import {analyseWorksheet,aiCandidates,parentAi,type AiProgress} from '@/lib/ai/byok';
import {duplicateCandidateWords,type OcrCandidate} from '@/lib/ocr/candidates';
import type {WorksheetLearning} from '@/lib/ai/worksheet-learning';
import type {WorksheetCheckpoint} from '@/lib/ai/worksheet-recovery';
import {normalizeImage} from '@/lib/capture/image';

export const photoBatchLimit=10;
export async function preparePhotoBatch(capture:CaptureRepository,files:File[],batchId=crypto.randomUUID(),offset=0,onProgress?:(index:number,total:number)=>void,normalize=normalizeImage){
 if(!files.length||files.length>photoBatchLimit)throw new RepositoryError('invalid');
 const drafts:CaptureDraft[]=[],failures:{name:string;error:unknown}[]=[];
 for(let i=0;i<files.length;i++){
  onProgress?.(i+1,files.length);
  try{const image=await normalize(files[i]);drafts.push(await capture.create(image,crypto.randomUUID(),{title:'',learnedOn:new Date().toLocaleDateString('en-CA'),batchId,batchOrder:offset+i}));}
  catch(error){failures.push({name:files[i].name,error});}
 }
 return {batchId,drafts,failures};
}
export type WorksheetDraft={
 extensions?:import('@/lib/learning/extensions').ExtensionDraft[];
 pictures?:Record<string,import('@/lib/media/contracts').MediaAsset>;batchRecovery?:import('@/lib/ai/worksheet-multi').MultiCheckpoint;text:string;items:OcrCandidate[];mode:'listed'|'all';operation:string;origin?:'ai_generated';model?:string;learning?:WorksheetLearning[];duplicates?:string[];recovery?:WorksheetCheckpoint;imageSignature?:string};
export function photoSignature(draft:CaptureDraft){return JSON.stringify([draft.transform,draft.width,draft.height,draft.byteSize]);}
export async function batchPhotos(local:LocalRepository,batchId:string){
 return (await new CaptureRepository(local).list()).filter(row=>row.batchId===batchId).sort((a,b)=>(a.batchOrder??0)-(b.batchOrder??0)||a.createdAt.localeCompare(b.createdAt));
}
export async function photoReview(local:LocalRepository,draft:CaptureDraft){
 const [review,lesson]=await Promise.all([local.db.table<ScopedDocument>('learningDrafts').get([local.scope.id,`ocr:${draft.id}`]),local.db.lessons.get([local.scope.id,`ocr-${draft.id}`])]);
 const data=review?.payload.data as WorksheetDraft|undefined;
 return {review,data,saved:!!lesson&&!lesson.deletedAt,ready:!!data?.items.length&&!data.recovery&&(!data.imageSignature||data.imageSignature===photoSignature(draft))};
}

/** One photo at a time. Stop on failure; persisted successes never need another provider call. */
export async function analysePhotoBatch(local:LocalRepository,batchId:string,signal:AbortSignal,onProgress:(index:number,total:number,value?:AiProgress)=>void,analyse:typeof analyseWorksheet=analyseWorksheet){
 const photos=await batchPhotos(local,batchId);if(!photos.length||photos.length>photoBatchLimit)throw new RepositoryError('invalid');
 const capture=new CaptureRepository(local);let completed=0;
 for(let index=0;index<photos.length;index++){
  if(signal.aborted)throw new DOMException('Cancelled','AbortError');
  const photo=photos[index],loaded=await capture.get(photo.id);if(!loaded)throw new RepositoryError('missing');
  const status=await photoReview(local,photo);
  if(status.saved||status.ready){completed++;continue;}
  onProgress(index+1,photos.length);
  if(signal.aborted)throw new DOMException('Cancelled','AbortError');
  let data:WorksheetDraft=status.data??{text:'',items:[],mode:'listed',operation:crypto.randomUUID()};
  if(data.imageSignature&&data.imageSignature!==photoSignature(loaded.draft))data={...data,recovery:undefined};
  data={...data,imageSignature:photoSignature(loaded.draft)};
  let version=status.review?.version??null;
  let writes=Promise.resolve();
  const photoController=new AbortController(),timer=setTimeout(()=>photoController.abort(),300000);
  const persist=(next:WorksheetDraft)=>{
   data=next;
   writes=writes.then(async()=>{
    const table=local.db.table<ScopedDocument>('learningDrafts'),id=`ocr:${photo.id}`,now=new Date().toISOString();
    await local.db.transaction('rw',table,local.db.captureDrafts,async()=>{
     const current=await local.db.captureDrafts.get([local.scope.id,photo.id]);
     if(!current||current.version!==loaded.draft.version)throw new RepositoryError('conflict');
     const old=await table.get([local.scope.id,id]);if((old?.version??null)!==version)throw new RepositoryError('conflict');
     const nextVersion=(old?.version??0)+1;
     await table.put({scopeId:local.scope.id,id,version:nextVersion,createdAt:old?.createdAt??now,updatedAt:now,deletedAt:null,payload:{data:next}});version=nextVersion;
    });
   });
   // Retain the rejected chain for the final await while preventing an unhandled rejection.
   void writes.catch(()=>photoController.abort());
  };
  try{
   const result=await analyse(loaded.prepared,data.mode,AbortSignal.any([signal,photoController.signal]),fetch,value=>onProgress(index+1,photos.length,value),{chunked:true,checkpoint:data.recovery,onCheckpoint:checkpoint=>persist({...data,text:checkpoint.result.text,items:aiCandidates(checkpoint.result),learning:checkpoint.result.learning??[],duplicates:duplicateCandidateWords(checkpoint.result.words),origin:'ai_generated',model:parentAi()?.model,recovery:checkpoint})});
   if(signal.aborted)throw new DOMException('Cancelled','AbortError');
   persist({...data,text:result.text,items:aiCandidates(result),learning:result.learning??[],duplicates:duplicateCandidateWords(result.words),origin:'ai_generated',model:parentAi()?.model,recovery:undefined});
   await writes;completed++;
  }finally{clearTimeout(timer);await writes;}
 }
 return completed;
}
