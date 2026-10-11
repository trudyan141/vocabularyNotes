import {microphoneCue} from './microphone-cues';
import {EndOfSpeech} from './end-of-speech';
/** Keep the utterance and 120ms margins, not the endpoint's trailing silence. */
export function trimRecording(samples:Float32Array){
 if(!samples.length||samples.length>160000||samples.some(n=>!Number.isFinite(n)))throw new Error('samples');
 const frame=320,pad=1920;let first=-1,last=0;
 for(let start=0;start<samples.length;start+=frame){let energy=0;const end=Math.min(start+frame,samples.length);for(let i=start;i<end;i++)energy+=samples[i]*samples[i];if(Math.sqrt(energy/(end-start))>.006){if(first<0)first=start;last=end;}}
 if(first<0)return samples;
 const start=Math.max(0,first-pad),end=Math.min(samples.length,last+pad);
 return start===0&&end===samples.length?samples:samples.slice(start,end);
}
export class VoiceRecorder{
 private context:AudioContext|null=null;private meter:ReturnType<typeof setInterval>|undefined;
 private stream:MediaStream|null=null;private recorder:MediaRecorder|null=null;private invalid=false;private timer:ReturnType<typeof setTimeout>|undefined;
 async start(done:(blob:Blob)=>void,failed:()=>void=()=>{}){
  this.invalid=false;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('unsupported');
  // Unlock synchronously from the tap, before permission awaits (especially WebKit).
  const context=new AudioContext();this.context=context;const unlock=context.resume().catch(()=>{});
  try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true}});
   if(this.invalid){stream.getTracks().forEach(t=>t.stop());throw new Error('cancelled');}
   this.stream=stream;await unlock;if(context.state==='suspended')await context.resume();
   await microphoneCue(context,'start');
   if(this.invalid){stream.getTracks().forEach(t=>t.stop());throw new Error('cancelled');}
   const analyser=context.createAnalyser();analyser.fftSize=1024;context.createMediaStreamSource(stream).connect(analyser);
   const frames=new Float32Array(analyser.fftSize),endpoint=new EndOfSpeech(performance.now());
   const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(v=>MediaRecorder.isTypeSupported(v));
   const recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);this.recorder=recorder;
   const chunks:Blob[]=[];let size=0;
   recorder.ondataavailable=event=>{if(event.data.size){size+=event.data.size;if(size>5_000_000){this.cancel();failed();return;}chunks.push(event.data);}};
   recorder.onstop=()=>{
    clearTimeout(this.timer);clearInterval(this.meter);stream.getTracks().forEach(t=>t.stop());this.stream=null;this.recorder=null;
    // The stop cue is played only after the recording is final, never in the assessed clip.
    void microphoneCue(context,'stop').finally(()=>context.state!=='closed'?context.close().catch(()=>{}):undefined);
    if(this.context===context)this.context=null;
    if(!this.invalid){if(chunks.length)done(new Blob(chunks,{type:recorder.mimeType}));else failed();}
   };
   recorder.onerror=()=>{this.cancel();failed();};recorder.start();
   this.meter=setInterval(()=>{analyser.getFloatTimeDomainData(frames);let energy=0;for(const n of frames)energy+=n*n;if(endpoint.sample(Math.sqrt(energy/frames.length),performance.now()))this.stop();},50);
   this.timer=setTimeout(()=>this.stop(),10000);
  }catch(error){this.cancel();throw error;}
 }
 stop(){clearTimeout(this.timer);clearInterval(this.meter);if(this.recorder?.state==='recording')this.recorder.stop();}
 cancel(){this.invalid=true;const recording=this.recorder?.state==='recording';this.stop();if(!recording){void this.context?.close().catch(()=>{});this.context=null;}this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;}
}
export async function decodeRecording(blob:Blob){const context=new AudioContext();try{const decoded=await context.decodeAudioData(await blob.arrayBuffer());if(decoded.duration<.25||decoded.duration>20)throw new Error('duration');const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*16000),16000);const source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();return (await offline.startRendering()).getChannelData(0).slice();}finally{await context.close();}}
export function playbackWav(samples:Float32Array){if(!samples.length||samples.length>320000)throw new Error('recording');const data=new ArrayBuffer(44+samples.length*2),view=new DataView(data);const tag=(offset:number,text:string)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};tag(0,'RIFF');view.setUint32(4,36+samples.length*2,true);tag(8,'WAVE');tag(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,16000,true);view.setUint32(28,32000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);tag(36,'data');view.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++){if(!Number.isFinite(samples[i]))throw new Error('recording');const n=Math.max(-1,Math.min(1,samples[i]));view.setInt16(44+i*2,Math.round(n*(n<0?32768:32767)),true);}return new Blob([data],{type:'audio/wav'});}
