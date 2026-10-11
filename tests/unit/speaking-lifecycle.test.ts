import {afterEach,expect,it,vi} from 'vitest';
import {trimRecording,VoiceRecorder} from '@/lib/speaking/client';
import {microphoneCue} from '@/lib/speaking/microphone-cues';
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
it('removes long leading/trailing silence with margins and keeps the original voiced samples',()=>{
 const samples=new Float32Array(80000);samples.fill(.1,32000,48000);const result=trimRecording(samples);
 expect(result.length).toBe(19840);expect(result.subarray(1920,17920)).toEqual(samples.subarray(32000,48000));
 expect(trimRecording(new Float32Array(16000))).toHaveLength(16000);expect(()=>trimRecording(new Float32Array([NaN]))).toThrow('samples');
});
function audioFixture(events:string[]){
 const context={state:'running',currentTime:0,destination:{},resume:vi.fn(async()=>{events.push('unlock');}),close:vi.fn(async()=>{context.state='closed';events.push('close');}),
 createOscillator:()=>{const node={frequency:{value:0},type:'sine',connect:vi.fn(),disconnect:vi.fn(),onended:null as (()=>void)|null,start:()=>events.push('cue'),stop:()=>queueMicrotask(()=>node.onended?.())};return node;},
 createGain:()=>({gain:{setValueAtTime:vi.fn(),linearRampToValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()},connect:vi.fn(),disconnect:vi.fn()}),
 createAnalyser:()=>({fftSize:1024,getFloatTimeDomainData:vi.fn()}),createMediaStreamSource:()=>({connect:vi.fn()})};return context;
}
it('unlocks on tap, plays start before capture and stop after the final data; cues are not in the clip',async()=>{
 vi.useFakeTimers();const events:string[]=[],context=audioFixture(events),trackStop=vi.fn();vi.stubGlobal('AudioContext',class{constructor(){return context;}});
 vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:async()=>{events.push('permission');return {getTracks:()=>[{stop:trackStop}]};}}});
 class RecorderFixture{static isTypeSupported(){return true;}state='inactive';mimeType='audio/mp4';ondataavailable:((e:{data:Blob})=>void)|null=null;onstop:(()=>void)|null=null;start(){this.state='recording';events.push('capture');}stop(){events.push('final');this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'])});this.onstop?.();}}
 vi.stubGlobal('MediaRecorder',RecorderFixture);const recorder=new VoiceRecorder(),done=vi.fn();await recorder.start(done);
 expect(events).toEqual(['unlock','permission','cue','cue','capture']);recorder.stop();await Promise.resolve();await Promise.resolve();
 expect(events.indexOf('final')).toBeLessThan(events.lastIndexOf('cue'));expect(await done.mock.calls[0][0].text()).toBe('voice');expect(trackStop).toHaveBeenCalled();
});
it('does not make cues on a hidden page or suspended audio context',async()=>{
 const events:string[]=[],context=audioFixture(events);context.state='suspended';await microphoneCue(context as unknown as AudioContext,'start');expect(events).toEqual([]);
 context.state='running';vi.stubGlobal('document',{hidden:true});await microphoneCue(context as unknown as AudioContext,'stop');expect(events).toEqual([]);
});
