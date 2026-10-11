/** Original, quiet two-note mic cues. Never fetch audio or play on page load. */
export async function microphoneCue(context:AudioContext,cue:'start'|'stop'){
 if(context.state!=='running'||(typeof document!=='undefined'&&document.hidden))return;
 // These are explicitly requested recording signals, separate from optional game SFX.
 const frequencies=cue==='start'?[660,880]:[880,660];
 await new Promise<void>(resolve=>{
  let remaining=frequencies.length;
  const fallback=setTimeout(resolve,350);
  for(const [i,frequency] of frequencies.entries()){
   const oscillator=context.createOscillator(),gain=context.createGain(),at=context.currentTime+i*.075;
   oscillator.type='sine';oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.055,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+.065);
   oscillator.connect(gain);gain.connect(context.destination);
   oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();if(--remaining===0){clearTimeout(fallback);resolve();}};
   oscillator.start(at);oscillator.stop(at+.07);
  }
 });
}
