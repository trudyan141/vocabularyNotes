import {afterEach,expect,it,vi} from 'vitest';
import {assessRecording,validateAudioAssessment,speakingGeminiModel} from '@/lib/speaking/gemini-assessment';
import {configureParentAi} from '@/lib/ai/byok';
import {playbackWav} from '@/lib/speaking/client';
import {pronunciationScore} from '@/lib/speaking/assessment';
import {removeRetiredSpeakingPacks} from '@/lib/speaking/cleanup';
const targets=[{text:'apple',variants:[['æ','p','ə','l']]}];
const result=()=>({schemaVersion:2,words:[{index:0,variantIndex:0,audibility:'clear',insertions:[] as {afterIndex:number;heard:string}[],phones:['æ','p','ə','l'].map((expected,i):{expected:string;heard:string|null;status:string}=>({expected,heard:i===0?'ɛ':expected,status:i===0?'substitution':'match'}))}]});
const observation=()=>({schemaVersion:3,words:[{index:0,audibility:'clear',heard:['ɛ','p','ə','l']}]});
afterEach(()=>vi.unstubAllGlobals());
function key(){vi.stubGlobal('window',{dispatchEvent:vi.fn()});vi.stubGlobal('localStorage',{removeItem:vi.fn(),setItem:vi.fn()});configureParentAi({key:'AIza-speaking-fixture-key-only-123',model:'gemini-3.8-flash'});}
it('sends one bounded WAV with fixed model, no tools or identity, and validates score/phones',async()=>{
 key();const fetcher=vi.fn(async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(observation())}]}}]}));
 const rows=await assessRecording(playbackWav(new Float32Array(16000).fill(.1)),targets,new AbortController().signal,fetcher as typeof fetch);
 expect(pronunciationScore(rows)).toBe(88);expect(rows[0].phones?.[0]).toMatchObject({status:'retry',expected:'æ',heard:'ɛ'});
 const [url,init]=fetcher.mock.calls[0] as unknown as [string,RequestInit];expect(url).toContain(speakingGeminiModel);expect(url).not.toContain('AIza');expect(init.credentials).toBe('omit');const body=JSON.parse(String(init.body));expect(body).not.toHaveProperty('tools');expect(body.contents[0].parts.find((part:{inlineData?:unknown})=>part.inlineData).inlineData.mimeType).toBe('audio/wav');expect(atob(body.contents[0].parts.find((part:{inlineData?:unknown})=>part.inlineData).inlineData.data).slice(0,4)).toBe('RIFF');expect(String(init.body)).not.toMatch(/email|ownerId|libraryId|apple|variants/);expect(body.generationConfig).toHaveProperty('responseJsonSchema');expect(body.generationConfig.thinkingConfig.thinkingLevel).toBe('minimal');
});
it('requires key and never retries quota or silently starts a local model',async()=>{
 key();const wav=playbackWav(new Float32Array(16000).fill(.1)),fetcher=vi.fn(async()=>new Response('{}',{status:429}));

 await expect(assessRecording(wav,targets,new AbortController().signal,fetcher as typeof fetch)).rejects.toMatchObject({code:'quota'});expect(fetcher).toHaveBeenCalledOnce();
 configureParentAi(null);await expect(assessRecording(wav,targets,new AbortController().signal,fetcher as typeof fetch)).rejects.toMatchObject({code:'missing-key'});expect(fetcher).toHaveBeenCalledOnce();
});
it('rejects forged indices, changed references, truncated output, oversized JSON and impossible scores',async()=>{
 const invalid=result();invalid.words[0].index=9;expect(()=>validateAudioAssessment(invalid,targets)).toThrow('evidence');
 const reference=result();reference.words[0].phones[0].expected='i';expect(()=>validateAudioAssessment(reference,targets)).toThrow('evidence');
 const score={...result(),score:100};expect(()=>validateAudioAssessment(score,targets)).toThrow('evidence');
 key();const wav=playbackWav(new Float32Array(16000).fill(.1));
 await expect(assessRecording(wav,targets,new AbortController().signal,async()=>Response.json({candidates:[{finishReason:'MAX_TOKENS'}]}))).rejects.toThrow('response');
 await expect(assessRecording(wav,targets,new AbortController().signal,async()=>new Response('x'.repeat(50001)))).rejects.toThrow('response');
});
it('uncertain phones earn no credit and cleanup deletes only retired pack caches',async()=>{
 const value=result();value.words[0].phones[0].heard=null;value.words[0].phones[0].status='uncertain';expect(pronunciationScore(validateAudioAssessment(value,targets))).toBe(75);
 const remove=vi.fn();await removeRetiredSpeakingPacks({keys:async()=>['wfk-speaking-model-old','wfk-public-current','lessons','other'],delete:remove} as unknown as CacheStorage);expect(remove.mock.calls).toEqual([['wfk-speaking-model-old']]);
});

it('distinguishes malformed JSON, cut-off output, invalid evidence and network failures without retrying',async()=>{
 key();const wav=playbackWav(new Float32Array(16000).fill(.1)),signal=new AbortController().signal;
 const cases:[unknown,string][]=[
  [{candidates:[{finishReason:'MAX_TOKENS'}]},'incomplete'],
  [{promptFeedback:{blockReason:'SAFETY'}},'blocked'],
  [{candidates:[{finishReason:'STOP',content:{parts:[{text:'not JSON'}]}}]},'json'],
  [{candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({...observation(),score:100})}]}}]},'schema'],
 ];
 for(const [body,code] of cases){const fetcher=vi.fn(async()=>Response.json(body));await expect(assessRecording(wav,targets,signal,fetcher as typeof fetch)).rejects.toMatchObject({code});expect(fetcher).toHaveBeenCalledOnce();}
 await expect(assessRecording(wav,targets,signal,async()=>{throw new TypeError('private transport message');})).rejects.toMatchObject({code:'network'});
 await expect(assessRecording(wav,targets,signal,async()=>{throw new DOMException('private','TimeoutError');})).rejects.toMatchObject({code:'timeout'});
});

it('shows safe actionable grading reasons without exposing provider content or confusing them with unclear speech',async()=>{
 const {SpeakingAssessmentError,speakingFailureMessage}=await import('@/lib/speaking/errors');
 const t=(vi:string)=>vi;
 for(const code of ['json','schema','incomplete','blocked','network','timeout'] as const){
  expect(speakingFailureMessage(new SpeakingAssessmentError(code),t)).toContain(`SP-${code.toUpperCase()}`);
 }
 expect(speakingFailureMessage(new SpeakingAssessmentError('schema'),t)).toContain('không phải con đọc sai');
 expect(speakingFailureMessage(new Error('private raw response'),t)).not.toContain('private raw response');
});
