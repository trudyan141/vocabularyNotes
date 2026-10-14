/** Bounded energy-based endpointing. Detects a sustained utterance, not words/phonemes. */
export class EndOfSpeech {
 private voicedMs=0;
 private lastVoice=0;
 private previous=0;
 private floor=.003;
 constructor(private readonly startedAt:number) {this.previous=startedAt;}
 sample(rms:number,now:number):boolean {
  if(!Number.isFinite(rms)||now<this.previous)return false;
  const elapsed=Math.min(100,now-this.previous);this.previous=now;
  const threshold=Math.max(.012,this.floor*3);
  if(rms>threshold){this.voicedMs+=elapsed;this.lastVoice=now;}
  else if(!this.voicedMs)this.floor=Math.min(.012,this.floor*.95+rms*.05);
  return (this.voicedMs>=100&&now-this.lastVoice>=550)||(now-this.startedAt>=2500&&this.voicedMs<100)||now-this.startedAt>=10000;
 }
}
