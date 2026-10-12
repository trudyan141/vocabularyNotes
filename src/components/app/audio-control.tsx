"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, useHydrated } from "./provider";
import { englishVoice, waitForEnglishVoice } from "@/lib/audio/voices";
export function AudioControl({
  text,
  slow = false,
}: {
  text: string;
  slow?: boolean;
}) {
  const { t, preferences } = useApp();
  const hydrated = useHydrated();
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    const counter = generation;
    const request = pending;
    if ("speechSynthesis" in window) speechSynthesis.getVoices();
    const stop = () => {
      counter.current++;
      request.current?.abort();
      request.current = null;
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
      request.current?.abort();
      request.current = null;
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      window.removeEventListener("wfk-audio-stop", stop);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [text, preferences.sound]);
  function play() {
    const wasSpeaking = speaking;
    window.dispatchEvent(new Event("wfk-audio-stop"));
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setMessage(
        t(
          "Máy này chưa hỗ trợ đọc. Con vẫn có thể xem từ và ví dụ.",
          "Speech is unavailable here. You can still read the word and example.",
        ),
      );
      return;
    }
    speechSynthesis.cancel();
    if (wasSpeaking) {
      setSpeaking(false);
      return;
    }
    const current = generation.current;
    const controller = new AbortController();
    pending.current = controller;
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
      utterance.rate = slow ? 0.7 : 0.9;
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
  }
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
      <p role="status" className="audio-status">
        {message}
      </p>
    </div>
  );
}
