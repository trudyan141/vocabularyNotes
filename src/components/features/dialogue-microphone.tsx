'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,X,Volume2,RotateCcw} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {VoiceRecorder,decodeRecording,playbackWav,trimRecording} from '@/lib/speaking/client';
import {recordingQuality} from '@/lib/speaking/assessment';
import {recognizeDialogue,spokenChoice} from '@/lib/speaking/dialogue-answer';
import {ParentAiError} from '@/lib/ai/byok';
import {SpeakingAssessmentError} from '@/lib/speaking/errors';
export function DialogueMicrophone({options,disabled,onSelect}:{options:readonly string[];disabled:boolean;onSelect:(index:number)=>void|Promise<void>}){
 const {t}=useApp(),[phase,setPhase]=useState<'idle'|'mic'|'recording'|'analysis'>('idle'),[heard,setHeard]=useState(''),[message,setMessage]=useState(''),[clipUrl,setClipUrl]=useState(''),[playing,setPlaying]=useState(false),[canRetry,setCanRetry]=useState(false);
 const recorder=useRef<VoiceRecorder|null>(null),controller=useRef<AbortController|null>(null),epoch=useRef(0),active=useRef(false),prepared=useRef<Blob|null>(null),player=useRef<HTMLAudioElement|null>(null);
 const select=useRef(onSelect);useEffect(()=>{select.current=onSelect;},[onSelect]);
 useEffect(()=>{const audio=player.current;return()=>{audio?.pause();if(clipUrl)URL.revokeObjectURL(clipUrl);};},[clipUrl]);
 function cancel(){epoch.current++;active.current=false;recorder.current?.cancel();controller.current?.abort();setPhase('idle');setCanRetry(!!prepared.current);}
 useEffect(()=>{const generation=epoch;const stop=()=>{epoch.current++;active.current=false;recorder.current?.cancel();controller.current?.abort();player.current?.pause();setPlaying(false);setPhase('idle');};const hide=()=>{if(document.hidden)stop();};window.addEventListener('wfk-audio-stop',stop);document.addEventListener('visibilitychange',hide);return()=>{generation.current++;active.current=false;recorder.current?.cancel();controller.current?.abort();window.removeEventListener('wfk-audio-stop',stop);document.removeEventListener('visibilitychange',hide);};},[]);
 function failure(error:unknown,generation:number,stage:'mic'|'processing'|'recognition'){
  if(generation!==epoch.current)return;active.current=false;setPhase('idle');setCanRetry(stage==='recognition'&&!!prepared.current);
  if(error instanceof ParentAiError){setMessage(t(error.code==='missing-key'?'Bật Gemini trong Cài đặt để nhận câu trả lời bằng giọng nói.':error.code==='quota'?'Dịch vụ nhận giọng nói chưa dùng được vì hết lượt. Con nghe lại bản thu hoặc chọn đáp án.':'Dịch vụ nhận giọng nói chưa dùng được. Con nghe lại bản thu, thử nhận lại hoặc chọn đáp án.','Speech recognition is unavailable. Listen to your recording, retry or tap an answer.'));return;}
  if(error instanceof SpeakingAssessmentError){setMessage(error.code==='timeout'?t('Dịch vụ chưa trả kết quả sau 15 giây. Con nghe lại bản thu rồi bấm Thử nhận lại.','No result after 15 seconds. Listen to your recording, then retry.'):error.code==='network'?t('Chưa kết nối được dịch vụ nhận giọng nói. Bản thu vẫn nghe lại được; con thử nhận lại khi có mạng nhé.','Could not connect to speech recognition. Your recording can still be replayed; retry when connected.'):t('Dịch vụ chưa trả được câu nhận dạng hợp lệ. Con nghe lại bản thu rồi thử nhận lại hoặc chọn đáp án.','The service returned no usable transcript. Replay the recording, retry or tap an answer.'));return;}
  setMessage(stage==='mic'?t('Chưa mở được mic. Cho phép mic rồi thử lại, hoặc chạm đáp án.','Microphone unavailable. Allow microphone access or tap an answer.'):t('Chưa xử lý được bản thu. Con nghe lại hoặc thu lại nhé.','Could not process the recording. Listen back or record again.'));
 }
 async function recognize(blob:Blob,generation:number){
  setPhase('analysis');setCanRetry(false);const abort=new AbortController();controller.current=abort;
  try{const text=await recognizeDialogue(blob,abort.signal);if(generation!==epoch.current)return;setHeard(text);const index=spokenChoice(text,options);active.current=false;setPhase('idle');
   if(index===null)setMessage(text?t('Chưa khớp lựa chọn nào. Con nghe lại và nói đầy đủ câu, hoặc chạm đáp án nhé.','No matching choice. Listen back and say the full reply, or tap an answer.'):t('Máy chưa nghe rõ câu nói. Con nghe lại bản thu rồi thử nói lại nhé.','Could not hear the sentence clearly. Listen to your recording, then speak again.'));
   else{setMessage(t('Đã chọn câu máy nghe được. Con bấm Kiểm tra nhé.','Selected the reply heard. Tap Check when ready.'));await select.current(index);}
  }catch(error){failure(error,generation,'recognition');}
 }
 async function start(){
  if(active.current||disabled)return;window.dispatchEvent(new Event('wfk-audio-stop'));const generation=++epoch.current;active.current=true;prepared.current=null;setClipUrl('');setCanRetry(false);setHeard('');setMessage('');setPhase('mic');const mic=new VoiceRecorder('sentence');recorder.current=mic;
  try{await mic.start(blob=>{void(async()=>{try{
   if(generation!==epoch.current)return;setClipUrl(URL.createObjectURL(blob));setPhase('analysis');const samples=await decodeRecording(blob);if(generation!==epoch.current)return;
   if(!recordingQuality(samples)){active.current=false;setPhase('idle');setMessage(t('Bản thu quá nhỏ hoặc quá ngắn. Con nghe lại rồi thử nói rõ hơn nhé.','The recording is too quiet or short. Listen back, then speak clearly again.'));return;}
   const wav=playbackWav(trimRecording(samples,320000));prepared.current=wav;setClipUrl(URL.createObjectURL(wav));await recognize(wav,generation);
  }catch(error){failure(error,generation,'processing');}})();},()=>failure(undefined,generation,'processing'));if(generation===epoch.current&&active.current)setPhase('recording');}catch(error){failure(error,generation,'mic');}
 }
 function replay(){
  if(playing){player.current?.pause();return;}window.dispatchEvent(new Event('wfk-audio-stop'));const audio=player.current;if(!audio)return;audio.currentTime=0;const generation=epoch.current;void audio.play().catch(()=>{if(generation===epoch.current){setPlaying(false);setMessage(t('Chưa phát được bản thu. Bấm nghe lại hoặc thu lại nhé.','Could not play the recording. Retry playback or record again.'));}});
 }
 function retry(){if(active.current||disabled||!prepared.current)return;window.dispatchEvent(new Event('wfk-audio-stop'));active.current=true;setHeard('');setMessage('');void recognize(prepared.current,++epoch.current);}
 return <div className="dialogue-microphone page-flow"><div className="row-wrap"><Button variant="outline" disabled={disabled||phase==='mic'||phase==='analysis'} onClick={()=>phase==='recording'?recorder.current?.stop():void start()}>{phase==='recording'?<Square aria-hidden="true"/>:<Mic aria-hidden="true"/>}{phase==='recording'?t('Dừng và nhận câu trả lời','Stop and recognize'):phase==='mic'?t('Đang mở mic…','Opening microphone…'):phase==='analysis'?t('Đang nghe câu trả lời…','Recognizing reply…'):t('Trả lời bằng mic','Answer with microphone')}</Button>{phase!=='idle'&&<Button variant="ghost" onClick={cancel}><X aria-hidden="true"/>{t('Hủy','Cancel')}</Button>}{clipUrl&&<Button variant="secondary" disabled={disabled||phase!=='idle'} onClick={replay}>{playing?<Square aria-hidden="true"/>:<Volume2 aria-hidden="true"/>}{playing?t('Dừng nghe bản thu','Stop recording playback'):t('Nghe lại bản thu','Listen to recording')}</Button>}{canRetry&&phase==='idle'&&<Button variant="ghost" disabled={disabled} onClick={retry}><RotateCcw aria-hidden="true"/>{t('Thử nhận lại','Retry recognition')}</Button>}</div><p className="muted">{t('Nói đầy đủ câu trả lời. Con có thể nghỉ ngắn giữa câu, rồi bấm Dừng khi nói xong.','Say the complete reply. Short pauses are fine; tap Stop when finished.')}</p>{clipUrl&&<audio ref={player} src={clipUrl} preload="metadata" onPlaying={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)}/>}{heard&&<p>{t('Máy nghe: ','Heard: ')}<span lang="en">{heard}</span></p>}{message&&<p role="status">{message}</p>}</div>;
}
