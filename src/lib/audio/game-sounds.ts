/** Small original game cues; never fetch audio or start a context on page load. */
export class GameSounds {
 private context:AudioContext|null=null;
 private voices=new Set<OscillatorNode>();
 unlock(enabled:boolean){
  if(!enabled||typeof window==='undefined'||!window.AudioContext)return;
  try{this.context??=new AudioContext();if(this.context.state==='suspended')void this.context.resume().catch(()=>{});}catch{/* Visual feedback remains available. */}
 }
 play(cue:'correct'|'again'|'complete'|'reveal',enabled:boolean){
  const context=this.context;
  if(!enabled||!context||context.state!=='running'||document.hidden||document.documentElement?.dataset.motion==='reduced'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  this.stop();
  const notes=cue==='correct'?[523.25,659.25,783.99]:cue==='complete'?[523.25,659.25,783.99,1046.5]:cue==='again'?[392,349.23]:[660];
  const duration=cue==='reveal'?0.07:0.1;
  for(const [i,frequency] of notes.entries()){
   const oscillator=context.createOscillator(),gain=context.createGain(),at=context.currentTime+i*duration;
   oscillator.type='sine';oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(0.045,at+0.008);gain.gain.exponentialRampToValueAtTime(0.0001,at+duration);
   oscillator.connect(gain);gain.connect(context.destination);this.voices.add(oscillator);
   oscillator.onended=()=>{this.voices.delete(oscillator);oscillator.disconnect();gain.disconnect();};
   oscillator.start(at);oscillator.stop(at+duration);
  }
 }
 stop(){for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();}
 close(){this.stop();if(this.context)void this.context.close().catch(()=>{});this.context=null;}
}
