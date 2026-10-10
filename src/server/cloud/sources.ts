import 'server-only';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {remoteId} from './map';
import {authenticated,failure,privateHeaders,sameOrigin} from './auth';
const query=z.object({library:z.uuid(),lesson:z.string().min(1).max(100),id:z.uuid().optional()});
export async function handleSources(request:Request){
 if(request.method!=='GET'&&!sameOrigin(request))return failure(403,'origin');
 try{
  const session=await authenticated();if(!session)return failure(401,'signed-out');
  const input=query.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!input.success)return failure(400,'invalid-source');
  const {library,lesson,id}=input.data,{client,user}=session;
  const libraryRow=await client.from('libraries').select('id,deleted_at').eq('id',library).eq('owner_id',user.id).single();if(libraryRow.error||libraryRow.data.deleted_at)return failure(403,'library');
  const lessonId=await remoteId(library,'lessons',lesson);const lessonRow=await client.from('lessons').select('id').eq('id',lessonId).eq('library_id',library).eq('owner_id',user.id).single();if(lessonRow.error)return failure(404,'lesson');
  const bucket=client.storage.from('learning-sources');
  if(request.method==='GET'){
   if(!id){const result=await client.from('source_assets').select('id,mime,width,height,created_at').eq('owner_id',user.id).eq('library_id',library).eq('lesson_id',lessonId).is('deleted_at',null).limit(100);if(result.error)return failure(503,'sources-unavailable');return Response.json({sources:result.data},{headers:privateHeaders});}
   const record=await client.from('source_assets').select('media_key').eq('id',id).eq('owner_id',user.id).eq('library_id',library).eq('lesson_id',lessonId).single();if(record.error)return failure(404,'source');const result=await bucket.download(record.data.media_key);if(result.error)return failure(503,'source-unavailable');return new Response(result.data,{headers:{...privateHeaders,'Content-Type':'image/jpeg','X-Content-Type-Options':'nosniff'}});
  }
  if(request.method==='DELETE'){
   if(!id)return failure(400,'invalid-source');const record=await client.from('source_assets').select('media_key').eq('id',id).eq('owner_id',user.id).eq('library_id',library).eq('lesson_id',lessonId).maybeSingle();if(record.error)return failure(503,'source-unavailable');if(record.data){const removed=await bucket.remove([record.data.media_key]);if(removed.error)return failure(503,'source-delete-failed');const erased=await client.from('source_assets').delete().eq('id',id).eq('owner_id',user.id);if(erased.error)return failure(503,'source-delete-failed');}return Response.json({deleted:true},{headers:privateHeaders});
  }
  if(request.headers.get('x-source-consent')!=='source-cloud-v1')return failure(400,'consent-required');
  if(request.headers.get('content-type')!=='image/jpeg')return failure(415,'jpeg-required');
  const reader=request.body?.getReader();if(!reader)return failure(400,'empty-source');const chunks:Uint8Array[]=[];let bytes=0;try{for(;;){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.length;if(bytes>3_000_000)return failure(413,'source-too-large');chunks.push(chunk.value);}}finally{await reader.cancel().catch(()=>{});}
  const image=sharp(Buffer.concat(chunks),{limitInputPixels:12_000_000});const meta=await image.metadata();if(meta.format!=='jpeg')return failure(415,'jpeg-required');const {data,info}=await image.rotate().resize({width:2200,height:2200,fit:'inside',withoutEnlargement:true}).jpeg({quality:85}).toBuffer({resolveWithObject:true});
  const sourceId=id??crypto.randomUUID(),path=`${user.id}/${library}/${sourceId}.jpg`;const existing=await client.from('source_assets').select('media_key,lesson_id').eq('id',sourceId).eq('owner_id',user.id).eq('library_id',library).maybeSingle();if(existing.error)return failure(503,'source-unavailable');if(existing.data){if(existing.data.lesson_id!==lessonId)return failure(409,'source-conflict');const saved=await bucket.download(existing.data.media_key);if(saved.error)return failure(503,'source-unavailable');if(createHash('sha256').update(Buffer.from(await saved.data.arrayBuffer())).digest('hex')!==createHash('sha256').update(data).digest('hex'))return failure(409,'source-conflict');return Response.json({id:sourceId},{status:201,headers:privateHeaders});}const uploaded=await bucket.upload(path,data,{contentType:'image/jpeg',upsert:false});if(uploaded.error){if(uploaded.error.statusCode!=='409')return failure(503,'upload-failed');const orphan=await bucket.download(path);if(orphan.error||createHash('sha256').update(Buffer.from(await orphan.data.arrayBuffer())).digest('hex')!==createHash('sha256').update(data).digest('hex'))return failure(409,'source-conflict');}
  const record=await client.from('source_assets').insert({id:sourceId,owner_id:user.id,library_id:library,lesson_id:lessonId,storage_mode:'cloud',media_key:path,mime:'image/jpeg',width:info.width,height:info.height});if(record.error){if(record.error.code==='23505')return failure(503,'source-retry');await bucket.remove([path]);return failure(503,'source-record-failed');}
  return Response.json({id:sourceId},{status:201,headers:privateHeaders});
 }catch{return failure(503,'source-unavailable');}
}
