"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, useHydrated } from "./provider";
import { wordAudio } from "@/lib/audio/word-audio-client";
import { audioWord, normalRate, slowRate, type WordAudio } from "@/lib/audio/word-audio";
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
  const { t, preferences } = useApp();
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
    if (!hydrated || !preferences.sound) return;
    const wasSpeaking = speaking;
    window.dispatchEvent(new Event("wfk-audio-stop"));
    if (wasSpeaking) return;
    const current = generation.current;
    const controller = new AbortController();
    pending.current = controller;
    const active = () => !controller.signal.aborted && generation.current === current;
    const online = async () => {
      if (!active()) return;
      setSource({text,sample:null});
      setEdgeSource(true);
      onSource?.(null,slow,true);
      setSpeaking(true);
      setMessage(t("Đang tải giọng đọc online…", "Loading the online voice…"));
      const failed = () => {
        if (!active()) return;
        if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}
        recording.current?.pause();recording.current=null;
        if(objectUrl.current){URL.revokeObjectURL(objectUrl.current);objectUrl.current=null;}
        setSpeaking(false);
        setMessage(t("Chưa tải được giọng đọc online. Kiểm tra mạng rồi thử lại.", "Could not load the online voice. Check your connection and try again."));
      };
      if(loadTimer.current!==null)clearTimeout(loadTimer.current);
      loadTimer.current=setTimeout(()=>{failed();controller.abort();},18000);
      try {
        if (!navigator.onLine) throw new Error('offline');
        const response = await fetch('/api/audio/tts', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text}), cache:'no-store', signal:controller.signal});
        if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/')) throw new Error('unavailable');
        const blob = await response.blob();
        if (!active()) return;
        if (!blob.size || blob.size > 1024*1024) throw new Error('invalid-audio');
        const url=URL.createObjectURL(blob);
        objectUrl.current=url;
        const audio=new Audio(url);
        recording.current=audio;
        audio.playbackRate=slow?slowRate:normalRate;
        audio.preservesPitch=true;
        audio.onplaying=()=>{if(!active())return;setMessage("");if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}};
        audio.onended=()=>{if(!active())return;setSpeaking(false);recording.current=null;URL.revokeObjectURL(url);objectUrl.current=null;};
        audio.onerror=failed;
        await audio.play();
      } catch { failed(); }
    };
    const device = () => {
      if (!active()) return;
      setSource({text,sample:null});
      setEdgeSource(false);
      onSource?.(null,slow);
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        void online();
        return;
      }
      const read = (voice: SpeechSynthesisVoice | null) => {
        if (controller.signal.aborted || generation.current !== current) return;
        if (!voice) { void online(); return; }
        let settled=false;
        const failed = () => {
          if (!active() || settled) return;
          settled=true;
          if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}
          speechSynthesis.cancel();
          void online();
        };
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voice.lang;
        utterance.voice = voice;
        utterance.rate = slow ? slowRate : normalRate;
        utterance.onstart = () => {if(!active() || settled)return;if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}};
        utterance.onend = () => { if (!settled && active()) {settled=true;if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}setSpeaking(false);} };
        utterance.onerror = failed;
        setMessage("");
        setSpeaking(true);
        try {
          if (speechSynthesis.paused) speechSynthesis.resume();
          loadTimer.current=setTimeout(failed,4000);
          speechSynthesis.speak(utterance);
        } catch { failed(); }
      };
      let voice: SpeechSynthesisVoice | null;
      try { voice = englishVoice(speechSynthesis); } catch { void online(); return; }
      if (voice) read(voice);
      else {
        setSpeaking(true);
        setMessage(t("Đang chuẩn bị giọng đọc…", "Getting the voice ready…"));
        void waitForEnglishVoice(speechSynthesis, {signal: controller.signal}).then(read).catch(()=>{if(active())void online();});
      }
    };
    const playSample = async (value:WordAudio|null) => {
      if (!active()) return;
      if (!value) { device(); return; }
      setEdgeSource(false);
      setSource({text,sample:value});
      onSource?.(value,slow);
      const audio = new Audio(value.audioUrl);
      recording.current = audio;
      audio.playbackRate = slow ? slowRate : normalRate;
      audio.preservesPitch = true;
      const fallback = () => {
        if (!active() || recording.current !== audio) return;
        if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}
        audio.pause();recording.current = null;
        device();
        if(window.speechSynthesis && englishVoice(speechSynthesis)) setMessage(t("Bản thu chưa phát được; đang dùng giọng của máy.", "The recording is unavailable; using the device voice."));
      };
      audio.onplaying = () => {if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}};
      loadTimer.current=setTimeout(fallback,10000);
      audio.onended = () => { if (active()) {setSpeaking(false);recording.current=null;} };
      audio.onerror = fallback;
      setSpeaking(true);setMessage("");
      try { await audio.play(); } catch { fallback(); }
    };
    if (!audioWord(text) || !navigator.onLine) {device();return;}
    setSpeaking(true);
    setMessage(t("Đang tìm âm mẫu…", "Finding the recording…"));
    void wordAudio(text).then(playSample);
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
        disabled={!hydrated || !preferences.sound}
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
      {showSource && <AudioSource sample={selected} slow={slow} edge={edgeSource && source?.text===text}/>}
      <p role="status" className="audio-status">
        {message}
      </p>
    </div>
  );
}

export function AudioSource({sample,slow=false,edge=false}:{sample:WordAudio|null;slow?:boolean;edge?:boolean}){
 const {t}=useApp();
 return <details className="audio-source"><summary>{t("Nguồn phát âm","Pronunciation source")}</summary><small>{sample?<><a href={sample.sourceUrl} target="_blank" rel="noreferrer">Wikimedia Commons · US · {sample.creator}</a>{" · "}<a href={sample.licenseUrl} target="_blank" rel="noreferrer">{sample.license}</a>{slow&&` · ${t("Phát chậm 60%","Playback at 60%")}`}</>:edge?`Microsoft Edge · Emma Multilingual · ${t("Giọng nữ online","Online female voice")}${slow?` · ${t("Phát chậm 60%","Playback at 60%")}`:""}`:t("Giọng đọc của thiết bị","Device voice")}</small></details>;
}
