import {it,expect} from 'vitest';
import {EndOfSpeech} from '@/lib/speaking/end-of-speech';
it('ends 550ms after sustained voice, tolerating a short pause inside a word',()=>{
 const detector=new EndOfSpeech(0);for(let time=50;time<=400;time+=50)expect(detector.sample(.1,time)).toBe(false);
 for(let time=450;time<=850;time+=50)expect(detector.sample(.001,time)).toBe(false);
 expect(detector.sample(.1,900)).toBe(false);for(let time=950;time<1450;time+=50)expect(detector.sample(.001,time)).toBe(false);expect(detector.sample(.001,1450)).toBe(true);
});
it('does not trap a short word or click until the ten-second recording limit',()=>{
 const short=new EndOfSpeech(0);short.sample(.1,50);short.sample(.1,100);for(let t=150;t<650;t+=50)expect(short.sample(0,t)).toBe(false);expect(short.sample(0,650)).toBe(true);
 const click=new EndOfSpeech(0);click.sample(.2,50);for(let t=100;t<2500;t+=50)expect(click.sample(0,t)).toBe(false);expect(click.sample(0,2500)).toBe(true);
 const silent=new EndOfSpeech(0);expect(silent.sample(.001,2500)).toBe(true);
 const noisy=new EndOfSpeech(0);for(let t=50;t<10000;t+=50)expect(noisy.sample(.1,t)).toBe(false);expect(noisy.sample(.1,10000)).toBe(true);
});
it('sentence capture preserves pauses between words and waits longer before silence timeout',()=>{
 const sentence=new EndOfSpeech(0,'sentence');for(let t=50;t<=300;t+=50)expect(sentence.sample(.1,t)).toBe(false);for(let t=350;t<=1300;t+=50)expect(sentence.sample(0,t)).toBe(false);for(let t=1350;t<=1650;t+=50)expect(sentence.sample(.1,t)).toBe(false);for(let t=1700;t<3050;t+=50)expect(sentence.sample(0,t)).toBe(false);expect(sentence.sample(0,3050)).toBe(true);
 const silent=new EndOfSpeech(0,'sentence');expect(silent.sample(.001,2500)).toBe(false);expect(silent.sample(.001,6000)).toBe(true);
 const bounded=new EndOfSpeech(0,'sentence');for(let t=50;t<15000;t+=50)expect(bounded.sample(.1,t)).toBe(false);expect(bounded.sample(.1,15000)).toBe(true);
});
