/** Bounded energy-based endpointing. Detects a sustained utterance, not words/phonemes. */
export class EndOfSpeech {
 private voicedMs=0;
 private lastVoice=0;
 private previous=0;
 private floor=.003;
 constructor(private readonly startedAt:number,private readonly profile:'word'|'sentence'='word') {this.previous=startedAt;}
 sample(rms:number,now:number):boolean {
  if(!Number.isFinite(rms)||now<this.previous)return false;
  const elapsed=Math.min(100,now-this.previous);this.previous=now;
  const threshold=Math.max(.012,this.floor*3);
  if(rms>threshold){this.voicedMs+=elapsed;this.lastVoice=now;}
  else if(!this.voicedMs)this.floor=Math.min(.012,this.floor*.95+rms*.05);
  const sentence=this.profile==='sentence';return (this.voicedMs>=(sentence?180:100)&&now-this.lastVoice>=(sentence?1400:550))||(now-this.startedAt>=(sentence?6000:2500)&&this.voicedMs<(sentence?180:100))||now-this.startedAt>=(sentence?15000:10000);
 }
}
