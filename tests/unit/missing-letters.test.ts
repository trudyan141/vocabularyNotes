import {it,expect} from 'vitest';
import {eligibleMissingLetters,missingLetterPositions,missingLetters,validMissingPositions} from '@/lib/learning/missing-letters';
it('randomly hides two to three letters when enough context remains and always leaves a letter visible',()=>{
 for(const random of [()=>0,()=>0.5,()=>0.999]){
  const positions=missingLetterPositions('baby',random);expect(validMissingPositions('baby',positions)).toBe(true);expect(positions.length).toBeGreaterThanOrEqual(2);expect(positions.length).toBeLessThanOrEqual(3);
 }
 expect(missingLetterPositions('baby',()=>0)).toHaveLength(2);expect(missingLetterPositions('baby',()=>0.5)).toHaveLength(3);expect(missingLetterPositions('baby',()=>0.999)).toHaveLength(3);expect(missingLetterPositions('go',()=>0.999)).toHaveLength(1);
});
it('supports phrases and apostrophes without hiding separators or changing the saved word',()=>{
 const text="Teddy bear's toy",positions=missingLetterPositions(text,()=>0.5);expect(positions.every(index=>/^[a-z]$/i.test([...text][index]))).toBe(true);expect(missingLetters('baby',[1,3])).toBe('ay');expect(validMissingPositions(text,positions)).toBe(true);
});
it('rejects malformed masks and words that cannot leave context visible',()=>{
 for(const text of ['a','?!','',Array(81).fill('a').join('')]){expect(eligibleMissingLetters(text)).toBe(false);expect(missingLetterPositions(text)).toEqual([]);}
 for(const positions of [[],[1,1],[3,1],[0,1,2,3],[9],[-1],[0.5]])expect(validMissingPositions('baby',positions)).toBe(false);
 expect(validMissingPositions('a b',[1])).toBe(false);
});

it('keeps a visible clue for short words across random counts',()=>{
 for(const random of [()=>0,()=>0.5,()=>0.999]){expect(missingLetterPositions('cat',random)).toHaveLength(2);expect(missingLetterPositions('go',random)).toHaveLength(1);}
});
