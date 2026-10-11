import {describe, expect, it} from 'vitest';
import {decodePhones} from '@/lib/speaking/ctc';
import {speakingModel, speakingModelFiles, speakingModelUrl} from '@/lib/speaking/model';
const vocab={0:'<pad>',1:'tʃ',2:'æ',3:'t',4:'<unk>'};
function frames(ids:number[]){return Float32Array.from(ids.flatMap(id=>Array.from({length:5},(_,i)=>i===id?8:-8)));}
describe('local acoustic evidence',()=>{
 it('collapses consecutive CTC labels but preserves repeats separated by blanks and multi-character phones',()=>{
  const result=decodePhones(frames([1,1,0,1,2,3,3]),5,vocab,700);
  expect(result.map(row=>row.phone)).toEqual(['tʃ','tʃ','æ','t']);
  expect(result.map(row=>[row.startMs,row.endMs])).toEqual([[0,200],[300,400],[400,500],[500,700]]);
  expect(result.every(row=>row.confidence>0.99&&row.confidence<=1)).toBe(true);
 });
 it('does not turn silence/blanks or unknown labels into a learner error',()=>{
  expect(decodePhones(frames([0,0,4,0]),5,vocab,400)).toEqual([]);
 });
 it('uses the selected model blank ID and ignores square-bracket special labels and word separators',()=>{
  const labels={0:'|',1:'æ',2:' ',3:'[UNK]',41:'[PAD]'};
  const logits=Float32Array.from([1,1,41,1,0,2,3].flatMap(id=>Array.from({length:42},(_,i)=>i===id?8:-8)));
  expect(decodePhones(logits,42,labels,700,41).map(p=>p.phone)).toEqual(['æ','æ']);
 });
 it('uses the weakest frame confidence in a collapsed run and stable softmax on large logits',()=>{
  const result=decodePhones([1000,1002,998,997,996, 1001,1002,1000,999,998],5,vocab,200);
  expect(result).toHaveLength(1);expect(result[0].confidence).toBeCloseTo(1/(1+Math.exp(-1)+Math.exp(-2)+Math.exp(-3)+Math.exp(-4)));
 });
 it.each([[new Float32Array([0,NaN,0,0,0]),5,100],[frames([1]),0,100],[frames([1]),5,0],[frames([1]),5,21000],[new Float32Array([0,1]),5,100]])('rejects corrupt shapes/non-finite logits/out-of-range duration', (values,width,duration)=>{
  expect(()=>decodePhones(values,width,vocab,duration)).toThrow();
 });
 it('rejects an invalid blank ID rather than silently decoding a different model alphabet',()=>{
  for(const blankId of [-1,5,NaN,1.5])expect(()=>decodePhones(frames([1]),5,vocab,100,blankId)).toThrow();
 });
 it('pins a public file revision and never exposes an inference or paid fallback URL',()=>{
  for(const file of speakingModelFiles) expect(speakingModelUrl(file)).toBe(`https://huggingface.co/${speakingModel.id}/resolve/${speakingModel.revision}/${file}`);
  expect(()=>speakingModelUrl('../api/inference' as typeof speakingModelFiles[number])).toThrow();
  expect(speakingModel.bytes).toBeLessThan(400_000_000);expect(speakingModel.sha256).toMatch(/^[0-9a-f]{64}$/);
 });
});
