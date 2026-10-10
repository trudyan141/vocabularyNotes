import 'server-only';
import {mediaAsset} from '@/lib/media/contracts';
import {verifyMedia} from '@/server/media/receipt';
import sharp from 'sharp';
import {canonicalKey,exactSenseKey} from '@/domain/identity';
import {catalog} from '@/lib/learning/catalog';
import {cloudEntities,parseCloudRow,type SyncRequest} from '@/lib/cloud/contracts';
export async function remoteId(library:string,entity:string,id:string){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${library}\n${entity}\n${id}`))).slice(0,16);bytes[6]=(bytes[6]&15)|128;bytes[8]=(bytes[8]&63)|128;const h=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
export async function mapOperation(owner:string,library:string,item:SyncRequest['items'][number]){
 const row=parseCloudRow(item.entity,item.row);if(row.scopeId!==`account:${owner}:${library}`||row.origin==='demo'||row.sourceType==='demo')throw new Error('scope');
 const ref=async(entity:string,id:unknown)=>id===null?null:remoteId(library,entity,String(id));
 if(item.entity==='entries')row.canonicalKey=canonicalKey(String(row.displayText),row.caseMode as 'fold'|'exact');
 if(item.entity==='senses')row.identity=exactSenseKey(String(row.pos),String(row.senseLabel));
 if(Array.isArray(row.pronunciations))row.pronunciations=row.pronunciations.map(p=>({...p,verified:!!p.verified&&catalog.some(w=>w.pronunciations?.some(known=>known.verified&&known.text===p.text&&known.ipa===p.ipa&&known.sourceUrl===p.sourceUrl))}));
 let fields:Record<string,unknown>={};const payload=row.payload as Record<string,unknown>|undefined;
 switch(item.entity){
  case 'lessons':fields={title:row.title,learned_on:row.learnedOn,source_type:row.sourceType,source_digest:row.sourceDigest};break;
  case 'entries':fields={display_text:row.displayText,canonical_key:row.canonicalKey,key_version:1,language:'en',case_mode:row.caseMode,kind:row.kind};break;
  case 'senses':fields={entry_id:await ref('entries',row.entryId),pos:row.pos,sense_label:row.senseLabel,identity_key:row.identity,definition_en:row.definitionEn,meaning_vi:row.meaningVi,origin:row.origin,pronunciations:row.pronunciations,content_version:row.contentVersion,learning_approval_status:row.learningApprovalStatus,approved_content_version:row.approvedContentVersion};break;
  case 'evidence':fields={lesson_id:await ref('lessons',row.lessonId),literal_text:row.literalText};break;
  case 'examples':fields={sense_id:await ref('senses',row.senseId),text_en:row.textEn,translation_vi:row.translationVi,origin:row.origin,pronunciations:row.pronunciations};break;
  case 'lessonItems':fields={lesson_id:await ref('lessons',row.lessonId),entry_id:await ref('entries',row.entryId),sense_id:await ref('senses',row.senseId),evidence_id:await ref('evidence',row.evidenceId)};break;
  case 'notes':fields={sense_id:row.targetType==='sense'?await ref('senses',row.targetId):null,lesson_id:row.targetType==='lesson'?await ref('lessons',row.targetId):null,text:row.text,mnemonic_data:row.mnemonicData??null,origin:'user'};break;
  case 'decks':{const deck=payload?.deck as {name:string;direction:string;senseIds:string[]};fields={name:deck.name,direction:deck.direction,query_filters:{senseIds:deck.senseIds}};break;}
  case 'sentences':{const content=payload?.content as {senseId:string};fields={sense_id:await ref('senses',content.senseId),content};break;}
  case 'practiceSessions':{const s=payload?.session as Record<string,unknown>;fields={mode:s.mode,deck_snapshot:s,position:s.position,completed_at:s.completedAt};break;}
  case 'reviewEvents':fields={sense_id:await ref('senses',row.senseId),session_id:await ref('practiceSessions',row.sessionId),rating:row.rating,hints:row.hints,event_time:row.eventTime};break;
  case 'mediaAssets':{const asset=mediaAsset.parse(payload?.asset),bytes=verifyMedia(asset),meta=await sharp(bytes,{limitInputPixels:262144}).metadata();if(meta.format!=='jpeg'||!meta.width||!meta.height||meta.width>512||meta.height>512)throw new Error('invalid-media');fields={sense_id:await ref('senses',asset.senseId),kind:'image',asset_key:row.id,provider:'wikimedia-commons',provider_asset_id:asset.candidate.id,source_page_url:asset.candidate.sourceUrl,creator:asset.candidate.creator,license_code:asset.candidate.license,license_url:asset.candidate.licenseUrl,attribution_text:asset.candidate.credit,verified_at:asset.checkedAt,approval_version:asset.approved?row.version:null,reviewer:asset.approved?owner:null,ready_status:asset.approved&&asset.status==='ready'?'ready':'pending',content_hash:asset.sha256,dimensions:{width:meta.width,height:meta.height},mime:'image/jpeg'};break;}
  case 'gameAttempts':{const a=payload!;fields={sense_id:await ref('senses',a.senseId),session_id:await ref('practiceSessions',a.sessionId),question_id:await ref('question',a.questionId),answer:a.answer,is_correct:a.correct,hints:a.hint};break;}
 }
 return {entity:cloudEntities[item.entity],id:await ref(item.entity,row.id),baseVersion:item.baseVersion,data:{...fields,deleted_at:row.deletedAt??null,client_id:row.id,client_payload:row}};
}
