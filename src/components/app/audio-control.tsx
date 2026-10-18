"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, useHydrated } from "./provider";
import {edgeAudio} from "@/lib/audio/edge-audio-client";
import { normalRate, slowRate, type WordAudio } from "@/lib/audio/word-audio";
import { englishVoice, waitForEnglishVoice } from "@/lib/audio/voices";
export function AudioControl({
  text,
  slow = false,
  autoPlay = false,
  showSource = true,
  onSource,
}: {
  text: string;
  slow?: boolean;
  autoPlay?: boolean;
  showSource?: boolean;
  onSource?: (sample:WordAudio|null,slow:boolean,edge?:boolean)=>void;
}) {
  const { t, preferences, repository } = useApp();
  const hydrated = useHydrated();
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  const objectUrl = useRef<string | null>(null);
  const [edgeSource, setEdgeSource] = useState(false);
  const recording = useRef<HTMLAudioElement | null>(null);
  const [source, setSource] = useState<{text:string;sample:WordAudio|null}|null>(null);
  const loadTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const autoTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    const counter = generation;
    const request = pending;
    try { window.speechSynthesis?.getVoices(); } catch { /* Some TV engines expose an unusable speech API. */ }
    const stop = () => {
      counter.current++;
      if(autoTimer.current!==null){clearTimeout(autoTimer.current);autoTimer.current=null;}
      request.current?.abort();
      request.current = null;
      if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}
      recording.current?.pause();
      recording.current = null;
      if(objectUrl.current){URL.revokeObjectURL(objectUrl.current);objectUrl.current=null;}
      setSpeaking(false);
      setMessage("");
      if (window.speechSynthesis) speechSynthesis.cancel();
    };
    const hidden = () => {
      if (document.hidden) stop();
    };
    window.addEventListener("wfk-audio-stop", stop);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      counter.current++;
      setSpeaking(false);setMessage("");
      if(autoTimer.current!==null){clearTimeout(autoTimer.current);autoTimer.current=null;}
      request.current?.abort();
      request.current = null;
      if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}
      recording.current?.pause();
      recording.current = null;
      if(objectUrl.current){URL.revokeObjectURL(objectUrl.current);objectUrl.current=null;}
      if (window.speechSynthesis) speechSynthesis.cancel();
      window.removeEventListener("wfk-audio-stop", stop);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [text, preferences.sound]);
  function play() {
    if (!hydrated || !preferences.sound || !repository) return;
    const wasSpeaking = speaking;
    window.dispatchEvent(new Event("wfk-audio-stop"));
    if (wasSpeaking) return;
    const current = generation.current;
    const controller = new AbortController();
    pending.current = controller;
    const active = () => !controller.signal.aborted && generation.current === current;
    const rate=slow?slowRate:normalRate;
    const clearTimer=()=>{if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}};
    const release=()=>{
      clearTimer();recording.current?.pause();recording.current=null;
      if(objectUrl.current){URL.revokeObjectURL(objectUrl.current);objectUrl.current=null;}
    };
    const failed=()=>{if(!active())return;release();setSpeaking(false);setMessage(t("Chưa phát được giọng đọc. Bấm Nghe để thử lại.","Could not play the voice. Tap Listen to retry."));};
    const device=()=>{
      if(!active())return;
      release();setEdgeSource(false);
      if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){failed();return;}
      const read=(voice:SpeechSynthesisVoice|null)=>{
        if(!active())return;
        if(!voice){failed();return;}
        let settled=false;
        const utterance=new SpeechSynthesisUtterance(text);
        utterance.lang=voice.lang;utterance.voice=voice;utterance.rate=rate;
        const error=()=>{if(!active()||settled)return;settled=true;speechSynthesis.cancel();failed();};
        utterance.onstart=()=>{if(!active()||settled)return;clearTimer();setSource({text,sample:null});onSource?.(null,slow,false);setMessage(navigator.onLine?t("Đang dùng giọng của máy.","Using the device voice."):t("Đang ngoại tuyến · giọng của máy.","Offline · device voice."));};
        utterance.onend=()=>{if(!active()||settled)return;settled=true;clearTimer();setSpeaking(false);};
        utterance.onerror=error;
        try{if(speechSynthesis.paused)speechSynthesis.resume();loadTimer.current=setTimeout(error,4000);speechSynthesis.speak(utterance);}catch{error();}
      };
      try{const voice=englishVoice(speechSynthesis);if(voice)read(voice);else{setMessage(t("Đang chuẩn bị giọng của máy…","Getting the device voice ready…"));void waitForEnglishVoice(speechSynthesis,{signal:controller.signal}).then(read).catch(failed);}}catch{failed();}
    };
    setSource(null);setSpeaking(true);setMessage(t("Đang tải giọng Emma…","Loading Emma’s voice…"));
    if(!navigator.onLine){device();return;}
    // Prime this same media element inside the tap. WebKit grants playback per
    // element; the subsequent network result must not create a different player.
    // Automatic playback still respects OS policy and exposes a manual retry.
    let audio:HTMLAudioElement;
    try{audio=new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQIAAAAAAA==');}catch{device();return;}
    recording.current=audio;
    const primed=audio.play().then(()=>{if(!audio.src.startsWith('blob:'))audio.pause();}).catch(()=>{});
    loadTimer.current=setTimeout(()=>{if(active()){failed();controller.abort();}},16000);
    void (async()=>{
      try{
        const blob=await edgeAudio(repository.scope.id,text,controller.signal);
        await primed;
        if(!active())return;
        const url=URL.createObjectURL(blob);objectUrl.current=url;
        audio.src=url;audio.playbackRate=rate;audio.preservesPitch=true;
        audio.onplaying=()=>{if(!active()||audio.src!==url)return;clearTimer();setSource({text,sample:null});setEdgeSource(true);onSource?.(null,slow,true);setMessage("");};
        audio.onended=()=>{if(!active()||audio.src!==url)return;release();setSpeaking(false);};
        audio.onerror=()=>{if(active())device();};
        await audio.play();
      }catch(error){
        if(!active())return;
        if(error instanceof Error&&error.name==='NotAllowedError'){release();setSpeaking(false);setMessage(t("Bấm Nghe để bắt đầu phát giọng Emma.","Tap Listen to start Emma’s voice."));}
        else device();
      }
    })();
  }
  const automaticPlay=useEffectEvent(()=>play());
  useEffect(()=>{
    if(!autoPlay||!hydrated||!preferences.sound||document.hidden)return;
    autoTimer.current=setTimeout(()=>{autoTimer.current=null;automaticPlay();},0);
    return()=>{if(autoTimer.current!==null){clearTimeout(autoTimer.current);autoTimer.current=null;}};
  },[autoPlay,hydrated,preferences.sound,text]);
  const selected = source?.text===text ? source.sample : null;
  return (
    <div className="audio-control">
      {hydrated&&!preferences.sound&&<a className="muted-audio-help" href="/settings">{t("Bật giọng đọc trong Cài đặt","Enable voice in Settings")}</a>}
      <Button
        variant="secondary"
        disabled={!hydrated || !preferences.sound || !repository}
        aria-label={`${speaking ? t("Dừng đọc", "Stop reading") : slow ? t("Nghe chậm", "Listen slowly") : t("Nghe", "Listen")}: ${text}`}
        onClick={play}
      >
        {speaking ? (
          <Square data-icon="inline-start" />
        ) : (
          <Volume2 data-icon="inline-start" />
        )}
        {speaking
          ? t("Dừng", "Stop")
          : slow
            ? t("Nghe chậm", "Slow")
            : t("Nghe", "Listen")}
      </Button>
      {!preferences.sound && (
        <small>{t("Âm thanh đang tắt", "Sound is off")}</small>
      )}
      {showSource && source?.text===text && <AudioSource sample={selected} slow={slow} edge={edgeSource && source?.text===text}/>}
      <p role="status" className="audio-status">
        {message}
      </p>
    </div>
  );
}

export function AudioSource({sample,slow=false,edge=false}:{sample:WordAudio|null;slow?:boolean;edge?:boolean}){
 const {t}=useApp();
 return <details className="audio-source"><summary>{t("Nguồn phát âm","Pronunciation source")}</summary><small>{sample?<><a href={sample.sourceUrl} target="_blank" rel="noreferrer">Wikimedia Commons · US · {sample.creator}</a>{" · "}<a href={sample.licenseUrl} target="_blank" rel="noreferrer">{sample.license}</a>{slow&&` · ${t("Phát chậm 60%","Playback at 60%")}`}</>:edge?`Microsoft Edge · Emma US Natural · ${t("Giọng nữ online","Online female voice")}${slow?` · ${t("Phát chậm 60%","Playback at 60%")}`:""}`:t("Giọng đọc của thiết bị","Device voice")}</small></details>;
}
