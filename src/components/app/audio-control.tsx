"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, useHydrated } from "./provider";
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
  useEffect(() => {
    const counter = generation;
    const stop = () => {
      counter.current++;
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
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      window.removeEventListener("wfk-audio-stop", stop);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [text, preferences.sound]);
  function play() {
    const wasSpeaking = speaking;
    window.dispatchEvent(new Event("wfk-audio-stop"));
    if (!("speechSynthesis" in window)) {
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
    const voices = speechSynthesis.getVoices();
    const voice = voices.find((v) => /^en[-_]/i.test(v.lang));
    if (!voice) {
      setMessage(
        t(
          "Chưa có giọng tiếng Anh trên máy. Bố mẹ có thể thêm giọng trong cài đặt thiết bị.",
          "No English voice is installed. A parent can add one in device settings.",
        ),
      );
      return;
    }
    const current = generation.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.voice = voice;
    utterance.rate = slow ? 0.7 : 0.9;
    utterance.onend = () => {
      if (generation.current === current) setSpeaking(false);
    };
    utterance.onerror = () => {
      if (generation.current === current) {
        setSpeaking(false);
        setMessage(
          t(
            "Chưa đọc được. Thử lại hoặc xem ví dụ bên dưới.",
            "Could not play. Try again or read the example below.",
          ),
        );
      }
    };
    setMessage("");
    setSpeaking(true);
    speechSynthesis.speak(utterance);
  }
  return (
    <div className="audio-control">
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
