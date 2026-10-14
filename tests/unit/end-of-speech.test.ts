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
