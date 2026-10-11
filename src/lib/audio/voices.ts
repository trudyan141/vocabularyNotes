/** Voice lists may be empty until the browser emits voiceschanged. */
export function englishVoice(synth: Pick<SpeechSynthesis, 'getVoices'>, localOnly = false) {
  const voices = synth.getVoices().filter(voice => /^en(?:[-_]|$)/i.test(voice.lang) && (!localOnly || voice.localService));
  return voices.find(voice => /^en[-_]US$/i.test(voice.lang)) ?? voices[0] ?? null;
}

export function waitForEnglishVoice(
  synth: Pick<SpeechSynthesis, 'getVoices' | 'addEventListener' | 'removeEventListener'>,
  {signal, localOnly = false, timeoutMs = 3000}: {signal: AbortSignal; localOnly?: boolean; timeoutMs?: number},
): Promise<SpeechSynthesisVoice | null> {
  if (signal.aborted) return Promise.resolve(null);
  const ready = englishVoice(synth, localOnly);
  if (ready) return Promise.resolve(ready);
  return new Promise(resolve => {
    let finished = false;
    function finish(voice: SpeechSynthesisVoice | null) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      clearInterval(poll);
      synth.removeEventListener('voiceschanged', check);
      signal.removeEventListener('abort', abort);
      resolve(voice);
    }
    function check() { const voice = englishVoice(synth, localOnly); if (voice) finish(voice); }
    function abort() { finish(null); }
    const timer = setTimeout(() => finish(englishVoice(synth, localOnly)), timeoutMs);
    // Some engines update getVoices without emitting the event. Bounded, per tap.
    const poll = setInterval(check, 100);
    synth.addEventListener('voiceschanged', check);
    signal.addEventListener('abort', abort, {once: true});
    check();
  });
}
