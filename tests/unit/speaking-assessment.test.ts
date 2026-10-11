import {it,expect,vi,afterEach,describe} from 'vitest';
import {assessPhones,pronunciationScore,recordingQuality} from '@/lib/speaking/assessment';
import {speakingAdvice} from '@/lib/speaking/coaching';
import {configureParentAi} from '@/lib/ai/byok';
import {VoiceRecorder,playbackWav} from '@/lib/speaking/client';
vi.mock('server-only',()=>({}));
import {POST} from '@/app/api/speaking/target/route';
import {NextRequest} from 'next/server';
const phones=(value:string[])=>value.map((phone,i)=>({phone,confidence:.9,startMs:i*40,endMs:(i+1)*40}));
afterEach(()=>vi.unstubAllGlobals());
it('aligns unprompted phones to each word and accepts complete alternate variants',()=>{const words=[{text:'cat',variants:[['k','æ','t']]},{text:'book',variants:[['b','ʊ','k']]}];expect(assessPhones(words,phones(['k','æ','t','b','ʊ','k'])).map(w=>w.status)).toEqual(['match','match']);expect(assessPhones(words,phones(['k','æ','t'])).map(w=>w.status)).toEqual(['match','missing']);expect(assessPhones([{text:'apple',variants:[['æ','p','ə','l'],['æ','p','l']]}],phones(['æ','p','l']))[0].status).toBe('match');});
it('abstains on silence, weak evidence, clipped recordings and missing targets',()=>{expect(assessPhones([{text:'cat',variants:[['k','æ','t']]}],[])[0].status).toBe('uncertain');expect(assessPhones([{text:'cat',variants:[['k','æ','t']]}],phones(['k','æ','t']).map(p=>({...p,confidence:.1})))[0].status).toBe('uncertain');expect(recordingQuality(new Float32Array(16000))).toBe(false);expect(recordingQuality(new Float32Array(16000).fill(1))).toBe(false);expect(recordingQuality(Float32Array.from({length:16000},(_,i)=>Math.sin(i/8)*.2))).toBe(true);});
it('reference lookup rejects cross-origin, ambiguous and unknown words without guessing',async()=>{const request=(text:string,origin='http://127.0.0.1:4320')=>new NextRequest('http://localhost:4320/api/speaking/target',{method:'POST',headers:{Host:'127.0.0.1:4320',Origin:origin},body:JSON.stringify({text})});expect((await POST(request('cat book'))).status).toBe(200);expect((await POST(request('read'))).status).toBe(400);expect((await POST(request('zzunknown'))).status).toBe(400);expect((await POST(request('cat','https://other.test'))).status).toBe(403);});
it('coaching sends bounded evidence only, rejects invented indices and never retries quota failures',async()=>{vi.stubGlobal('window',{dispatchEvent:vi.fn()});vi.stubGlobal('localStorage',{removeItem:vi.fn(),setItem:vi.fn()});configureParentAi({key:'AIza-speaking-fixture-key-only-123',model:'gemini-3.5-flash-lite'});const feedback=assessPhones([{text:'cat',variants:[['k','æ','t']]}],phones(['k','ɛ','t']));const mock=vi.fn(async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({items:[{index:0,advice:'Con nghe âm æ rồi tập lại nhé.'}]})}]}}]}));expect(await speakingAdvice('cat',feedback,new AbortController().signal,mock as typeof fetch)).toHaveLength(1);const init=mock.mock.calls[0] as unknown as [string,RequestInit];expect(init[0]).not.toContain('AIza');expect(init[1].body).not.toContain('inlineData');expect(init[1].body).not.toContain('audio');expect(JSON.parse(String(init[1].body))).not.toHaveProperty('tools');const fail=vi.fn(async()=>new Response('{}',{status:429}));await expect(speakingAdvice('cat',feedback,new AbortController().signal,fail)).rejects.toThrow();expect(fail).toHaveBeenCalledTimes(1);const invented=vi.fn(async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:'{"items":[{"index":9,"advice":"test"}]}'}]}}]}));await expect(speakingAdvice('cat',feedback,new AbortController().signal,invented)).rejects.toThrow('evidence');configureParentAi(null);});
it('late microphone permission is stopped after cancel and cannot start recording',async()=>{let resolve:(stream:MediaStream)=>void=()=>{};const stop=vi.fn();vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:()=>new Promise<MediaStream>(r=>resolve=r)}});vi.stubGlobal('MediaRecorder',class{});vi.stubGlobal('AudioContext',class{resume=async()=>{};close=async()=>{};});const recorder=new VoiceRecorder();const promise=recorder.start(vi.fn());recorder.cancel();resolve({getTracks:()=>[{stop}]} as unknown as MediaStream);await expect(promise).rejects.toThrow('cancelled');expect(stop).toHaveBeenCalledTimes(1);});

it('playback WAV uses actual PCM duration and bounds invalid recordings',async()=>{const blob=playbackWav(new Float32Array(16000).fill(.5));expect(blob.type).toBe('audio/wav');const bytes=await blob.arrayBuffer();const data=new DataView(bytes);expect(bytes.byteLength).toBe(32044);expect(data.getUint32(24,true)).toBe(16000);expect(data.getUint32(40,true)).toBe(32000);expect(()=>playbackWav(new Float32Array([NaN]))).toThrow();});

it('explains each expected apple sound, preserves alternate phones and abstains on weak sounds',()=>{
 const result=assessPhones([{text:'apple',variants:[['æ','p','ə','l'],['æ','p','l']]}],phones(['ɛ','p','ə','l']))[0];
 expect(result.status).toBe('retry');expect(result.phones?.map(p=>p.status)).toEqual(['retry','match','match','match']);expect(result.phones?.[0].advice).toContain('Mở miệng');expect(result.phones?.[1].advice).toContain('hai môi');expect(result.phones?.[3].advice).toContain('Đầu lưỡi');expect(result.advice).toContain('/æ/');expect(result.advice).not.toContain('/p/');
 const missing=assessPhones([{text:'cat',variants:[['k','æ','t']]}],phones(['k','æ']))[0];expect(missing.phones?.[2]).toMatchObject({expected:'t',heard:null,status:'missing'});
 const alternate=assessPhones([{text:'apple',variants:[['æ','p','ə','l'],['æ','p','l']]}],phones(['æ','p','l']))[0];expect(alternate.expected).toEqual(['æ','p','l']);expect(alternate.phones?.every(p=>p.status==='match')).toBe(true);
 const weak=assessPhones([{text:'cat',variants:[['k','æ','t']]}],phones(['k','æ','t']).map(p=>({...p,confidence:.1})))[0];expect(weak.phones?.every(p=>p.status==='uncertain')).toBe(true);
});


describe('pronunciation percentage',()=>{
 it('uses phone agreement, including omissions and additions, rather than acoustic confidence',()=>{
  const words=[{text:'apple',variants:[['æ','p','ə','l']]}];
  const phones=(values:string[])=>values.map((phone,i)=>({phone,confidence:.9,startMs:i*50,endMs:(i+1)*50}));
  expect(pronunciationScore(assessPhones(words,phones(['æ','p','ə','l'])))).toBe(100);
  expect(pronunciationScore(assessPhones(words,phones(['ɛ','p','ə','l'])))).toBe(88);
  expect(pronunciationScore(assessPhones(words,phones(['æ','p','l'])))).toBe(75);
  expect(pronunciationScore(assessPhones(words,phones(['æ','p','ə','l','s'])))).toBeLessThan(100);
  expect(pronunciationScore(assessPhones(words,[]))).toBeNull();
  const different=assessPhones(words,phones(['s','t','k','f']));expect(pronunciationScore(different)).toBe(0);expect(different[0].phones?.every(phone=>phone.status==='missing')).toBe(true);
 });
});
