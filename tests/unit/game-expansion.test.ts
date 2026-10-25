import {expect,it} from 'vitest';
import {activitySchema,activitiesSchema} from '@/lib/learning/game-activity';
import {gameExamples,clozeExamples,repairExamples,dialogueExamples} from '@/lib/learning/game-examples';
it('review suggestions have consistent prompts, answers and complete-sentence solutions',()=>{
 for(const example of gameExamples)expect(activitySchema.safeParse(example).success).toBe(true);
});
it('rejects ambiguous repeated choices, missing context and inconsistent correction targets',()=>{
 expect(activitySchema.safeParse({...clozeExamples[0],options:['am','AM']}).success).toBe(false);
 expect(activitySchema.safeParse({...clozeExamples[0],solution:'I am sad.'}).success).toBe(false);
 expect(activitySchema.safeParse({...repairExamples[0],slot:0}).success).toBe(false);
 expect(activitySchema.safeParse({...dialogueExamples[0],context:''}).success).toBe(false);
 expect(activitiesSchema.safeParse([clozeExamples[0],clozeExamples[1]]).success).toBe(false);
});

import {spellingHintTiles} from '@/lib/learning/game-engine';
it('spelling hints keep every duplicate letter and avoid the solved order',()=>{
 for(const word of ['apple','banana','aa','cat','red bag'])for(let i=0;i<50;i++){
  const letters=spellingHintTiles(word,String(i)).map(tile=>tile.text),compact=word.replace(/\s/g,'');expect([...letters].sort()).toEqual([...compact].sort());if(new Set(compact).size>1)expect(letters.join('')).not.toBe(compact);
 }
});
