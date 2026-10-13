import {it,expect} from 'vitest';
import {shuffled} from '@/lib/learning/random';
it('shuffles the whole pool without replacement or changing the input',()=>{
 const source=Array.from({length:200},(_,i)=>i),result=shuffled(source,()=>0.5);
 expect(source).toEqual(Array.from({length:200},(_,i)=>i));expect([...result].sort((a,b)=>a-b)).toEqual(source);
 expect(result.slice(0,10).some(n=>n>=100)).toBe(true);expect(shuffled(source,()=>0.999)).toEqual(source);expect(shuffled([])).toEqual([]);expect(shuffled([1])).toEqual([1]);
});
