import {afterEach,expect,it,vi} from 'vitest';
import {assessRecording,validateAudioAssessment,speakingGeminiModel} from '@/lib/speaking/gemini-assessment';
import {configureParentAi} from '@/lib/ai/byok';
import {playbackWav} from '@/lib/speaking/client';
import {pronunciationScore} from '@/lib/speaking/assessment';
import {removeRetiredSpeakingPacks} from '@/lib/speaking/cleanup';
const targets=[{text:'apple',variants:[['æ','p','ə','l']]}];
const result=()=>({words:[{index:0,score:82,advice:'Con mở miệng rộng hơn ở âm đầu nhé.',phones:['æ','p','ə','l'].map((expected,i)=>({expected,heard:i===0?'ɛ':expected,status:i===0?'retry':'match',advice:i===0?'Mở miệng rộng, hạ lưỡi xuống.':'Âm này đúng rồi.'}))}]});
afterEach(()=>vi.unstubAllGlobals());
function key(){vi.stubGlobal('window',{dispatchEvent:vi.fn()});vi.stubGlobal('localStorage',{removeItem:vi.fn(),setItem:vi.fn()});configureParentAi({key:'AIza-speaking-fixture-key-only-123',model:'gemini-3.8-flash'});}
it('sends one bounded WAV with fixed model, no tools or identity, and validates score/phones',async()=>{
 key();const fetcher=vi.fn(async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(result())}]}}]}));
 const rows=await assessRecording(playbackWav(new Float32Array(16000).fill(.1)),targets,new AbortController().signal,fetcher as typeof fetch);
 expect(pronunciationScore(rows)).toBe(82);expect(rows[0].phones?.[0]).toMatchObject({status:'retry',expected:'æ',heard:'ɛ'});
 const [url,init]=fetcher.mock.calls[0] as unknown as [string,RequestInit];expect(url).toContain(speakingGeminiModel);expect(url).not.toContain('AIza');expect(init.credentials).toBe('omit');const body=JSON.parse(String(init.body));expect(body).not.toHaveProperty('tools');expect(body.contents[0].parts[1].inlineData.mimeType).toBe('audio/wav');expect(atob(body.contents[0].parts[1].inlineData.data).slice(0,4)).toBe('RIFF');expect(String(init.body)).not.toMatch(/email|ownerId|libraryId/);
});
it('requires key and never retries quota or silently starts a local model',async()=>{
 key();const wav=playbackWav(new Float32Array(16000).fill(.1)),fetcher=vi.fn(async()=>new Response('{}',{status:429}));

 await expect(assessRecording(wav,targets,new AbortController().signal,fetcher as typeof fetch)).rejects.toMatchObject({code:'quota'});expect(fetcher).toHaveBeenCalledOnce();
 configureParentAi(null);await expect(assessRecording(wav,targets,new AbortController().signal,fetcher as typeof fetch)).rejects.toMatchObject({code:'missing-key'});expect(fetcher).toHaveBeenCalledOnce();
});
it('rejects forged indices, changed references, truncated output, oversized JSON and impossible scores',async()=>{
 const invalid=result();invalid.words[0].index=9;expect(()=>validateAudioAssessment(invalid,targets)).toThrow('evidence');
 const reference=result();reference.words[0].phones[0].expected='i';expect(()=>validateAudioAssessment(reference,targets)).toThrow('evidence');
 const score=result();score.words[0].score=101;expect(()=>validateAudioAssessment(score,targets)).toThrow();
 key();const wav=playbackWav(new Float32Array(16000).fill(.1));
 await expect(assessRecording(wav,targets,new AbortController().signal,async()=>Response.json({candidates:[{finishReason:'MAX_TOKENS'}]}))).rejects.toThrow('response');
 await expect(assessRecording(wav,targets,new AbortController().signal,async()=>new Response('x'.repeat(50001)))).rejects.toThrow('response');
});
it('unclear audio stays unscored and cleanup deletes only retired pack caches',async()=>{
 const value=result() as {words:{index:number;score:number|null;advice:string;phones:{expected:string;heard:string|null;status:string;advice:string}[]}[]};value.words[0].score=null;value.words[0].phones[0].heard=null;value.words[0].phones[0].status='uncertain';expect(pronunciationScore(validateAudioAssessment(value,targets))).toBeNull();
 const remove=vi.fn();await removeRetiredSpeakingPacks({keys:async()=>['wfk-speaking-model-old','wfk-public-current','lessons','other'],delete:remove} as unknown as CacheStorage);expect(remove.mock.calls).toEqual([['wfk-speaking-model-old']]);
});
