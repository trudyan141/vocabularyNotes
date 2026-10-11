import {speakingModel} from './model';
import type {HeardPhone} from './ctc';
export const speakingCacheName='wfk-speaking-model-'+speakingModel.revision;
export class SpeakingClient{
 private worker:Worker|null=null;private pending:{resolve:(data:Record<string,unknown>)=>void;reject:(error:Error)=>void}|null=null;
 private timer:ReturnType<typeof setTimeout>|undefined;
 async ask(type:'status'|'download'|'run',samples?:Float32Array,onProgress?:(bytes:number)=>void){
  if(this.pending)throw new Error('busy');this.worker??=new Worker('/speaking-worker.js',{type:'module'});
  return new Promise<Record<string,unknown>>((resolve,reject)=>{this.pending={resolve,reject};const finish=(error?:Error,data?:Record<string,unknown>)=>{clearTimeout(this.timer);this.pending=null;if(error)reject(error);else resolve(data!);};this.worker!.onerror=()=>{finish(new Error('unavailable'));this.cancel();};this.worker!.onmessage=({data})=>{if(data.type==='progress'){onProgress?.(data.loaded);return;}if(data.type==='error'){finish(new Error('unavailable'));this.cancel();}else finish(undefined,data);};this.timer=setTimeout(()=>{this.cancel();},type==='download'?300000:type==='run'?60000:5000);this.worker!.postMessage({type,samples},samples?[samples.buffer]:[]);});
 }
 async ready(){return (await this.ask('status')).ready===true;}
 async download(progress:(bytes:number)=>void){await this.ask('download',undefined,progress);}
 async recognize(samples:Float32Array){return (await this.ask('run',samples)).phones as HeardPhone[];}
 cancel(){clearTimeout(this.timer);this.worker?.terminate();this.worker=null;this.pending?.reject(new Error('cancelled'));this.pending=null;}
 async remove(){this.cancel();await caches.delete(speakingCacheName);}
}
export class VoiceRecorder{
 private stream:MediaStream|null=null;private recorder:MediaRecorder|null=null;private invalid=false;private timer:ReturnType<typeof setTimeout>|undefined;
 async start(done:(blob:Blob)=>void){this.invalid=false;if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('unsupported');const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true}});if(this.invalid){stream.getTracks().forEach(t=>t.stop());throw new Error('cancelled');}this.stream=stream;const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(v=>MediaRecorder.isTypeSupported(v));const recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);this.recorder=recorder;const chunks:Blob[]=[];let size=0;recorder.ondataavailable=event=>{if(event.data.size){size+=event.data.size;if(size>5_000_000){this.cancel();return;}chunks.push(event.data);}};recorder.onstop=()=>{clearTimeout(this.timer);stream.getTracks().forEach(t=>t.stop());this.stream=null;this.recorder=null;if(!this.invalid&&chunks.length)done(new Blob(chunks,{type:recorder.mimeType}));};recorder.start();this.timer=setTimeout(()=>this.stop(),10000);}
 stop(){clearTimeout(this.timer);if(this.recorder?.state==='recording')this.recorder.stop();}
 cancel(){this.invalid=true;this.stop();this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;}
}
export async function decodeRecording(blob:Blob){const context=new AudioContext();try{const decoded=await context.decodeAudioData(await blob.arrayBuffer());if(decoded.duration<.25||decoded.duration>20)throw new Error('duration');const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*16000),16000);const source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();return (await offline.startRendering()).getChannelData(0).slice();}finally{await context.close();}}
export function playbackWav(samples:Float32Array){if(!samples.length||samples.length>320000)throw new Error('recording');const data=new ArrayBuffer(44+samples.length*2),view=new DataView(data);const tag=(offset:number,text:string)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};tag(0,'RIFF');view.setUint32(4,36+samples.length*2,true);tag(8,'WAVE');tag(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,16000,true);view.setUint32(28,32000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);tag(36,'data');view.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++){if(!Number.isFinite(samples[i]))throw new Error('recording');const n=Math.max(-1,Math.min(1,samples[i]));view.setInt16(44+i*2,Math.round(n*(n<0?32768:32767)),true);}return new Blob([data],{type:'audio/wav'});}
