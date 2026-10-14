import {parentAi,ParentAiError} from '@/lib/ai/byok';
import type {TargetWord} from './assessment';
import {validTargets} from './contract';
import {validateObservation} from './observation';
import {speakingRequestBody,speakingRequestTimeoutMs} from './request';
import {SpeakingAssessmentError} from './errors';
export {validateAudioAssessment} from './contract';
export const speakingGeminiModel='gemini-3.5-flash-lite';
async function boundedJson(response:Response){
 const reader=response.body?.getReader();if(!reader)throw new SpeakingAssessmentError('response');const decoder=new TextDecoder();let bytes=0,raw='';
 try{while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>50000)throw new SpeakingAssessmentError('response');raw+=decoder.decode(value,{stream:true});}try{return JSON.parse(raw+decoder.decode());}catch{throw new SpeakingAssessmentError('json');}}finally{await reader.cancel().catch(()=>{});}
}
/** One audio request after the user taps Speak; no upload persistence, paid fallback or retry. */
export async function assessRecording(blob:Blob,targets:TargetWord[],signal:AbortSignal,fetcher:typeof fetch=fetch){
 const config=parentAi();if(!config)throw new ParentAiError('missing-key');
 if(blob.type!=='audio/wav'||blob.size<8044||blob.size>320044||!validTargets(targets))throw new SpeakingAssessmentError('recording');
 const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 let response:Response;try{response=await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${speakingGeminiModel}:generateContent`,{
  method:'POST',credentials:'omit',redirect:'error',cache:'no-store',headers:{'Content-Type':'application/json','x-goog-api-key':config.key},signal:AbortSignal.any([signal,AbortSignal.timeout(speakingRequestTimeoutMs)]),
  body:JSON.stringify(speakingRequestBody(targets,btoa(binary))),
 });}catch(error){if(signal.aborted)throw error;throw new SpeakingAssessmentError(error instanceof Error&&error.name==='TimeoutError'?'timeout':'network');}
 if(!response.ok)throw new ParentAiError(response.status===429?'quota':response.status===401||response.status===403?'access':'provider');
 let result;try{result=await boundedJson(response);}catch(error){if(error instanceof SpeakingAssessmentError||signal.aborted)throw error;throw new SpeakingAssessmentError(error instanceof Error&&error.name==='TimeoutError'?'timeout':'network');}
 const candidate=result?.candidates?.[0];
 if(result?.promptFeedback?.blockReason||['SAFETY','PROHIBITED_CONTENT','BLOCKLIST','RECITATION'].includes(candidate?.finishReason))throw new SpeakingAssessmentError('blocked');
 if(candidate?.finishReason==='MAX_TOKENS')throw new SpeakingAssessmentError('incomplete');
 if(candidate?.finishReason!=='STOP')throw new SpeakingAssessmentError('response');
 const parts=candidate.content?.parts;if(!Array.isArray(parts))throw new SpeakingAssessmentError('response');
 const content=parts.filter((p:{thought?:boolean;text?:string}|null)=>p&&!p.thought&&typeof p.text==='string').map((p:{text:string})=>p.text).join('');if(!content)throw new SpeakingAssessmentError('response');
 let evidence;try{evidence=JSON.parse(content);}catch{throw new SpeakingAssessmentError('json');}
 try{return validateObservation(evidence,targets);}catch{throw new SpeakingAssessmentError('schema');}
}
