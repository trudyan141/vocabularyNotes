import {describe,it,expect} from 'vitest';
import {explainLevel} from '../../src/lib/learning/level-explanation';
describe('level explanations use the actual sentence without certifying CEFR',()=>{
 it('quotes the active grandfather upgrade and its addition instead of borrowing a different topic',()=>{
  const basic='My grandfather is old.',text='My grandfather is old, but he still tells great stories.';
  const explanation=explainLevel([text],basic);
  expect(explanation.features).toEqual([expect.objectContaining({quote:'but he still tells great stories'})]);
  expect(explanation.addedText).toBe('but he still tells great stories.');
  expect(explanation.features.every(f=>text.includes(f.quote))).toBe(true);
 });
 it('does not invent a structure for a simple sentence or confuse not yet and questions with contrast/relative clauses',()=>{
  for(const text of ['I eat an apple.','He has not yet arrived.','Who is at the door?'])expect(explainLevel([text]).features).toEqual([]);
 });
 it('recomputes evidence from edited examples and leaves sources untouched',()=>{
  const original=['I eat an apple because I am hungry.'];const before=JSON.stringify(original);
  expect(explainLevel(original).features[0].quote).toBe('because I am hungry');
  expect(explainLevel(['I eat an apple.']).features).toEqual([]);
  expect(JSON.stringify(original)).toBe(before);
 });
 it('explains a concession and comparison with exact evidence from the available examples',()=>{
  const texts=['Although the choice is difficult, we prefer walking.','We walk rather than drive.'];
  const result=explainLevel(texts);
  expect(result.features.some(f=>f.quote.startsWith('Although'))).toBe(true);
  expect(result.features.some(f=>f.quote==='rather than drive')).toBe(true);
  expect(result.features.every(f=>texts.some(text=>text.includes(f.quote)))).toBe(true);
 });
});
