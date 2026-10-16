'use client';
import {PracticeRepository} from '@/data/local/practice';
import {practiceFilter,practiceHref} from '@/lib/learning/practice-filter';
import {useSearchParams} from 'next/navigation';
import {PracticeSelection} from './practice-selection';
import {PracticeScope} from './practice-scope';
import Image from 'next/image';
import {shuffled} from '@/lib/learning/random';
import {uniqueAggregateWords} from '@/lib/learning/library-search';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {Mic,UserRound,ArrowRight,Trophy} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Artwork,Back,EmptyState} from '@/components/app/shared';
import {AudioControl,AudioSource} from '@/components/app/audio-control';
import type {WordAudio} from '@/lib/audio/word-audio';
import {WordPronunciation} from '@/components/app/word-pronunciation';
import {Button} from '@/components/ui/button';
import {Sheet as Dialog,SheetContent as DialogContent,SheetTitle as DialogTitle,SheetDescription as DialogDescription} from '@/components/ui/sheet';
import {VoiceRecorder,decodeRecording,playbackWav,trimRecording} from '@/lib/speaking/client';
import {recordingQuality,pronunciationScore,roundScore,type TargetWord,type WordFeedback} from '@/lib/speaking/assessment';
import {feedbackStatus} from '@/lib/speaking/feedback';
import {SpeakingWordSounds,SpeakingSoundTable,speakingStatusLabel} from './speaking-feedback';
import {approximateReading} from '@/lib/speaking/articulation';
import type {LibraryWord} from '@/data/local/types';
import {assessRecording} from '@/lib/speaking/gemini-assessment';
import {speakingFailureMessage} from '@/lib/speaking/errors';
export function Speaking(){const {repository}=useApp(),params=useSearchParams();return <PracticeSelection><SpeakingGame key={`${repository?.scope.id??'loading'}:${params.toString()}`}/></PracticeSelection>;}
function SpeakingGame(){
 const {repository,t}=useApp(),params=useSearchParams(),filter=practiceFilter(params);
 const data=useLiveQuery(async()=>repository?{scope:repository.scope.id,words:await new PracticeRepository(repository).speakingWords(practiceFilter(params))}:null,[repository,params.toString()]);
 const [position,setPosition]=useState(0),[round,setRound]=useState(0),[busy,setBusy]=useState(false),[results,setResults]=useState<Record<number,number|null>>({});
 const [draw,setDraw]=useState<{round:number;ids:string[]}|null>(null);
 const words=data&&data.scope===repository?.scope.id?data.words:[];
 if(data&&data.scope===repository?.scope.id&&(!draw||draw.round!==round||(!draw.ids.length&&words.length)))setDraw({round,ids:shuffled(uniqueAggregateWords(words)).slice(0,5).map(word=>word.id)});
 const byId=new Map(words.map(word=>[word.id,word]));
 const queue=draw?.round===round?draw.ids.flatMap(id=>{const word=byId.get(id);return word?[word]:[];}):[],word=queue[position];
 const complete=queue.length>0&&position>=queue.length,scored=Object.values(results).filter((n):n is number=>n!==null);
 return <div className="reading-page page-flow speaking-page"><Back href={`${practiceHref(filter)}${filter.due?'&hub=1':''}`}/><PracticeScope filter={filter} count={queue.length||undefined}/>{complete?<section className="game-result page-flow"><div className="game-celebration"><Image src="/illustrations/fox.svg" width={130} height={130} alt=""/><Trophy aria-hidden="true"/></div><h1>{t('Con đã hoàn thành!','Well done!')}</h1><SpeakingScore score={roundScore(queue.map((_,i)=>results[i]))}/><p>{scored.length} / {queue.length} {t('lượt có điểm','attempts scored')}</p><p>{queue.length} {t('từ đã luyện cùng Cáo','words practised with Fox')}</p><Button onClick={()=>{setResults({});setPosition(0);setRound(n=>n+1);setDraw(old=>old?{...old,round:old.round+1}:old);}}>{t('Chơi lại','Play again')}</Button></section>:<><header className="section-heading"><div><h1>{t('Nói cùng Cáo','Speak with Fox')}</h1><p>{t('Nghe mẫu, rồi chạm mic để nói.','Listen, then tap the microphone to speak.')}</p></div><Image src="/illustrations/fox.svg" width={80} height={80} alt=""/></header>{!data?<p role="status">{t('Đang mở bài…','Opening lessons…')}</p>:!word?<EmptyState title={t('Phần đang chọn chưa có từ để tập nói','No words to practise in this selection')} description={t('Lưu và duyệt ít nhất một từ trong thư viện.','Save and approve a library word.')}><Button asChild><a href="/add">{t('Thêm từ mới','Add a word')}</a></Button></EmptyState>:<><div className="game-progress"><span>{position+1} / {queue.length}</span><div role="progressbar" aria-label={t('Tiến độ trò chơi','Game progress')} aria-valuenow={position} aria-valuemin={0} aria-valuemax={queue.length}><span style={{transform:`scaleX(${position/queue.length})`}}/></div></div><WordSpeaking key={`${round}:${word.id}:${word.revision}`} word={word} onBusy={setBusy} onResult={score=>setResults(old=>{const next={...old};if(score===undefined)delete next[position];else next[position]=score;return next;})}/><div className="row-wrap"><Button variant="secondary" disabled={busy||!(position in results)} onClick={()=>setPosition(n=>n+1)}>{t(position===queue.length-1?'Hoàn thành':'Từ tiếp theo',position===queue.length-1?'Finish':'Next word')}<ArrowRight aria-hidden="true"/></Button><Button variant="ghost" disabled={busy} onClick={()=>setPosition(n=>n+1)}>{t('Bỏ qua','Skip')}</Button></div></>}</>}</div>;
}
export function SpeakingScore({score,status}:{score:number|null;status?:WordFeedback['status']}){const {t}=useApp();return score===null?null:<span className={`speaking-score ${status??(score===100?'match':score>=50?'retry':'missing')}`} role="img" aria-label={t(`Điểm phát âm: ${score}%`,`Pronunciation score: ${score}%`)} style={{'--score':`${score}%`} as import('react').CSSProperties}><span>{score}%</span></span>;}
export function WordSpeaking({word,children,embedded=false,onResult,onBusy}:{word:LibraryWord;children?:ReactNode;embedded?:boolean;onResult?:(score:number|null|undefined)=>void;onBusy?:(busy:boolean)=>void}){
 const {t}=useApp();
 const [busy,setBusy]=useState<'mic'|'recording'|'analysis'|null>(null),[url,setUrl]=useState(''),[feedback,setFeedback]=useState<WordFeedback[]|null>(null),[detail,setDetail]=useState<number|null>(null),[message,setMessage]=useState(''),[playing,setPlaying]=useState(false),[zeroReason,setZeroReason]=useState<'unclear'|'service'|null>(null);
 const recorder=useRef<VoiceRecorder|null>(null),generation=useRef(0),controller=useRef<AbortController|null>(null),busyRef=useRef(false),audio=useRef<HTMLAudioElement|null>(null);
 const [sampleSource,setSampleSource]=useState<{sample:WordAudio|null;slow:boolean;edge?:boolean}>({sample:null,slow:false});
 const audioSource=(sample:WordAudio|null,slow:boolean,edge=false)=>setSampleSource({sample,slow,edge});
 const target=word.word,targetVersion=`${target}:${word.revision}`,score=feedback?pronunciationScore(feedback):zeroReason?0:null;
 const tone=feedback?feedbackStatus(feedback.flatMap(item=>item.phones??[]),feedback.flatMap(item=>item.insertions??[]),feedback.some(item=>item.status==='uncertain')):zeroReason?'uncertain':undefined;
 const reference=useRef<Promise<{words:TargetWord[]}>|null>(null);
 useEffect(()=>{const abort=new AbortController();controller.current=abort;generation.current++;recorder.current?.cancel();busyRef.current=false;audio.current?.pause();
  // Revisions invalidate both acoustic feedback and the exact target reference.
  const frame=requestAnimationFrame(()=>{setBusy(null);setFeedback(null);setDetail(null);setUrl('');setMessage('');setPlaying(false);setZeroReason(null);});
  reference.current=target?fetch('/api/speaking/target',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:target}),cache:'no-store',signal:AbortSignal.any([abort.signal,AbortSignal.timeout(3000)])}).then(async response=>{if(!response.ok)throw new Error('unknown');return response.json();}):null;
  void reference.current?.catch(()=>{});
  return()=>{abort.abort();cancelAnimationFrame(frame);};
 },[targetVersion,target]);
 useEffect(()=>{const epoch=generation;
  const stop=()=>{generation.current++;controller.current?.abort();recorder.current?.cancel();busyRef.current=false;audio.current?.pause();setBusy(null);onBusy?.(false);setPlaying(false);};const hidden=()=>{if(document.hidden)stop();};
  document.addEventListener('visibilitychange',hidden);window.addEventListener('wfk-audio-stop',stop);
  return()=>{epoch.current++;controller.current?.abort();recorder.current?.cancel();document.removeEventListener('visibilitychange',hidden);window.removeEventListener('wfk-audio-stop',stop);};
 },[onBusy]);
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url);},[url]);
 async function assess(blob:Blob,g:number){
  if(!reference.current){setZeroReason('service');onResult?.(0);return;}
  setBusy('analysis');try{const expected=await reference.current;if(g!==generation.current)return;const abort=new AbortController();controller.current=abort;const result=await assessRecording(blob,expected.words,abort.signal);if(g!==generation.current)return;setZeroReason(null);setFeedback(result);onResult?.(pronunciationScore(result));

  }catch(error){if(g===generation.current){setMessage(speakingFailureMessage(error,t));setZeroReason('service');onResult?.(0);}}
 }
 async function record(){if(busyRef.current){generation.current++;recorder.current?.cancel();busyRef.current=false;setBusy(null);onBusy?.(false);return;}
  window.dispatchEvent(new Event('wfk-audio-stop'));onResult?.(undefined);busyRef.current=true;onBusy?.(true);const g=++generation.current;controller.current?.abort();setFeedback(null);setDetail(null);setUrl('');setMessage('');setPlaying(false);setZeroReason(null);setBusy('mic');const mic=new VoiceRecorder();recorder.current=mic;
  // The reference may have been aborted by sample playback; fetch a fresh exact reference when needed.
  const abort=new AbortController();controller.current=abort;
  reference.current=fetch('/api/speaking/target',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:target}),cache:'no-store',signal:AbortSignal.any([abort.signal,AbortSignal.timeout(3000)])}).then(async response=>{if(!response.ok)throw new Error('unknown');return response.json();});void reference.current.catch(()=>{});
  try{await mic.start(blob=>{void (async()=>{try{const samples=await decodeRecording(blob);if(g!==generation.current)return;const quality=recordingQuality(samples);const wav=playbackWav(quality?trimRecording(samples):samples);setUrl(URL.createObjectURL(wav));if(!quality){setZeroReason('unclear');setMessage(t('Máy chưa nghe rõ. Con thử lại ở chỗ yên tĩnh nhé.','I could not hear clearly. Try again somewhere quiet.'));onResult?.(0);return;}await assess(wav,g);}catch{if(g===generation.current){setZeroReason('service');onResult?.(0);setMessage(t('Không đọc được bản thu; lượt này tạm 0 điểm. Con thử nói lại nhé.','The recording could not be decoded; this attempt has a temporary zero. Please try again.'));}}finally{if(g===generation.current){setBusy(null);onBusy?.(false);busyRef.current=false;}}})();},()=>{if(g===generation.current){setBusy(null);onBusy?.(false);busyRef.current=false;setMessage(t('Chưa thu được. Con thử lại nhé.','Recording failed. Please retry.'));}});if(g===generation.current)setBusy('recording');}
  catch{mic.cancel();if(g===generation.current){setMessage(t('Chưa mở được mic. Cho phép mic trong trình duyệt rồi thử lại nhé.','Microphone unavailable. Allow microphone access in the browser and retry.'));setBusy(null);onBusy?.(false);busyRef.current=false;}}
 }
 async function replay(){if(!audio.current||busyRef.current)return;const wasPlaying=playing;window.dispatchEvent(new Event('wfk-audio-stop'));if(wasPlaying)return;try{await audio.current.play();setPlaying(true);}catch{setMessage(t('Chưa nghe lại được. Bấm thử lại nhé.','Could not play. Tap again.'));}}
 const row=detail===null?null:feedback?.find(item=>item.index===detail),hint=word?approximateReading(word.word,word.pronunciations.find(p=>p.accent==='US')?.readingHintVi??undefined):null;
 const label=(status:WordFeedback['status'])=>speakingStatusLabel(status,t);
 return <div className={`word-speaking page-flow ${embedded?'speaking-embedded':''}`}>
 <section className={embedded?'page-flow':'speaking-stage page-flow'}>{!embedded&&<Artwork art={word.art} word={target} size={140}/>}<div className="speaking-title-row"><div className="speaking-target" lang="en">{feedback?feedback.map(item=><button type="button" className="speaking-token speaking-coloured-word" key={item.index} aria-label={`${item.text}: ${label(item.status)} · ${t('Xem từng âm','View sounds')}`} onClick={()=>setDetail(item.index)}><SpeakingWordSounds word={item}/><span className="sr-only"> {label(item.status)}</span></button>):embedded?<h1>{target}</h1>:<h2>{target}</h2>}</div><SpeakingScore score={score} status={tone}/></div><WordPronunciation text={target} pronunciations={word.pronunciations} sample={sampleSource.sample}/>{children}<div className="speaking-controls"><div inert={!!busy}><AudioControl text={target} autoPlay={!embedded} showSource={false} onSource={audioSource}/></div><div inert={!!busy}><AudioControl text={target} slow showSource={false} onSource={audioSource}/></div><Button size="lg" className={`speaking-mic ${busy==='recording'?'is-recording':''}`} disabled={busy==='analysis'||busy==='mic'} aria-label={busy==='recording'?t('Hủy lượt nói','Cancel recording'):t('Nói','Speak')} onClick={()=>void record()}><Mic aria-hidden="true"/>{busy==='recording'?t('Đang nghe…','Listening…'):url?t('Nói lại','Try again'):t('Nói','Speak')}</Button>{url&&<><audio ref={audio} src={url} onEnded={()=>setPlaying(false)} onError={()=>setPlaying(false)}/><Button className="speaking-replay" variant="outline" disabled={!!busy} aria-label={playing?t('Dừng nghe lại','Stop replay'):t('Nghe lại giọng của con','Play your recording')} aria-pressed={playing} onClick={()=>void replay()}><UserRound aria-hidden="true"/><span>{playing?t("Dừng nghe","Stop replay"):t("Giọng của con","My voice")}</span></Button></>}</div><AudioSource sample={sampleSource.sample} slow={sampleSource.slow} edge={sampleSource.edge}/></section>
 {busy&&<p className="speaking-listening" role="status">{busy==='mic'?t('Đang mở mic…','Opening microphone…'):busy==='recording'?t('Con nói đi, Cáo đang nghe!','Speak, Fox is listening!'):t('Cáo đang nghe lại…','Fox is listening again…')}</p>}
 {zeroReason==='service'&&<p className="score-note">{t('Lượt này tạm 0 điểm vì lỗi chấm; chưa có kết luận về phát âm của con.','This attempt has a temporary zero because grading failed; your pronunciation has not been assessed.')}</p>}{feedback&&<section className="speaking-feedback page-flow" aria-label={t('Nhận xét từng từ','Word feedback')} aria-live="polite">{feedback.map(item=><article className={`speaking-advice ${item.status}`} key={item.index}><strong>{label(item.status)}</strong><p>{item.advice}</p></article>)}<p className="speaking-detail-cue">{t('Chạm vào từ có màu để xem từng âm.','Tap the coloured word to see each sound.')}</p></section>}
 <Dialog open={!!row} onOpenChange={open=>{if(!open)setDetail(null);}}><DialogContent side="bottom" className="speaking-detail"><span className="speaking-sheet-handle" aria-hidden="true"/><div className="speaking-detail-heading"><DialogTitle><span className="speaking-detail-word" lang="en">{row&&<SpeakingWordSounds word={row}/>}</span></DialogTitle><SpeakingScore score={row?pronunciationScore([row]):null} status={row?.status}/>{row&&<AudioControl text={row.text}/>}<Button variant="outline" className="speaking-replay" disabled={!!busy||!url} aria-label={t('Nghe lại giọng của con','Play your recording')} onClick={()=>void replay()}><UserRound aria-hidden="true"/><span>{playing?t("Dừng nghe","Stop replay"):t("Giọng của con","My voice")}</span></Button></div><DialogDescription className="sr-only">{t('So từng nhóm chữ với âm mẫu và âm máy nghe được.','Compare each spelling group with the reference and recognised sound.')}</DialogDescription>{hint&&<p>{t('Đọc gần đúng','Approximate reading')}: <strong>{hint}</strong></p>}{row&&<SpeakingSoundTable word={row}/>}</DialogContent></Dialog>

 <p role="status">{message}</p>
 </div>;
}
