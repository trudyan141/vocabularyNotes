import {it,expect} from 'vitest';
import {EndOfSpeech} from '@/lib/speaking/end-of-speech';
it('ends after sustained voice followed by silence, tolerating short word pauses',()=>{
 const detector=new EndOfSpeech(0);for(let time=50;time<=400;time+=50)expect(detector.sample(.1,time)).toBe(false);
 for(let time=450;time<=1000;time+=50)expect(detector.sample(.001,time)).toBe(false);
 expect(detector.sample(.1,1050)).toBe(false);for(let time=1100;time<1950;time+=50)expect(detector.sample(.001,time)).toBe(false);expect(detector.sample(.001,1950)).toBe(true);
});
it('ignores a click and bounds silence/persistent background sound',()=>{
 const click=new EndOfSpeech(0);click.sample(.2,50);for(let t=100;t<=5000;t+=50)expect(click.sample(0,t)).toBe(false);expect(click.sample(0,10000)).toBe(true);
 const silent=new EndOfSpeech(0);expect(silent.sample(.001,6000)).toBe(true);
 const noisy=new EndOfSpeech(0);for(let t=50;t<10000;t+=50)expect(noisy.sample(.1,t)).toBe(false);expect(noisy.sample(.1,10000)).toBe(true);
});
