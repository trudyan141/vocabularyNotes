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
  onSource?: (sample:WordAudio|null,slow:boolean)=>void;
}) {
  const { t, preferences } = useApp();
  const hydrated = useHydrated();
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  const recording = useRef<HTMLAudioElement | null>(null);
  const [source, setSource] = useState<{text:string;sample:WordAudio|null}|null>(null);
  const loadTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const autoTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    const counter = generation;
    const request = pending;
    if ("speechSynthesis" in window) speechSynthesis.getVoices();
    const stop = () => {
      counter.current++;
      if(autoTimer.current!==null){clearTimeout(autoTimer.current);autoTimer.current=null;}
      request.current?.abort();
      request.current = null;
      if(loadTimer.current!==null){clearTimeout(loadTimer.current);loadTimer.current=null;}
      recording.current?.pause();
      recording.current = null;
      setSpeaking(false);
      setMessage("");
      if ("speechSynthesis" in window) speechSynthesis.cancel();
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
      if ("speechSynthesis" in window) speechSynthesis.cancel();
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
    const device = () => {
      if (!active()) return;
      setSource({text,sample:null});
      onSource?.(null,slow);
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        setSpeaking(false);
        setMessage(t("Máy này chưa hỗ trợ đọc. Con vẫn có thể xem từ và ví dụ.", "Speech is unavailable here. You can still read the word and example."));
        return;
      }
      const read = (voice: SpeechSynthesisVoice | null) => {
        if (controller.signal.aborted || generation.current !== current) return;
        pending.current = null;
        if (!voice) {
          setSpeaking(false);
          setMessage(t(
            "Chưa tải được giọng tiếng Anh. Thử lại hoặc thêm giọng trong cài đặt máy nhé.",
            "The English voice is not ready. Try again or add one in device settings.",
          ));
          return;
        }
        const failed = () => {
          if (generation.current !== current) return;
          setSpeaking(false);
          setMessage(t("Chưa đọc được. Thử lại hoặc xem ví dụ bên dưới.", "Could not play. Try again or read the example below."));
        };
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voice.lang;
        utterance.voice = voice;
        utterance.rate = slow ? slowRate : normalRate;
        utterance.onend = () => { if (generation.current === current) setSpeaking(false); };
        utterance.onerror = failed;
        setMessage("");
        setSpeaking(true);
        try {
          if (speechSynthesis.paused) speechSynthesis.resume();
          speechSynthesis.speak(utterance);
        } catch { failed(); }
      };
      const voice = englishVoice(speechSynthesis);
      if (voice) read(voice);
      else {
        setSpeaking(true);
        setMessage(t("Đang chuẩn bị giọng đọc…", "Getting the voice ready…"));
        void waitForEnglishVoice(speechSynthesis, {signal: controller.signal}).then(read);
      }
    };
    const playSample = async (value:WordAudio|null) => {
      if (!active()) return;
      if (!value) { device(); return; }
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
        setMessage(t("Bản thu chưa phát được; đang dùng giọng của máy.", "The recording is unavailable; using the device voice."));
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
      {showSource && <AudioSource sample={selected} slow={slow}/>}
      <p role="status" className="audio-status">
        {message}
      </p>
    </div>
  );
}

export function AudioSource({sample,slow=false}:{sample:WordAudio|null;slow?:boolean}){
 const {t}=useApp();
 return <details className="audio-source"><summary>{t("Nguồn phát âm","Pronunciation source")}</summary><small>{sample?<><a href={sample.sourceUrl} target="_blank" rel="noreferrer">Wikimedia Commons · US · {sample.creator}</a>{" · "}<a href={sample.licenseUrl} target="_blank" rel="noreferrer">{sample.license}</a>{slow&&` · ${t("Phát chậm 60%","Playback at 60%")}`}</>:t("Giọng đọc của thiết bị","Device voice")}</small></details>;
}
