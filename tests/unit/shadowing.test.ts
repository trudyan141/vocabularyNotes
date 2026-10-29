import {describe,it,expect} from 'vitest';
import {eligibleShadowSentence,shadowSamplePool} from '../../src/lib/learning/shadowing';
describe('shadowing sentence boundaries',()=>{
 it('keeps complete sentences and excludes placeholders or overlong clips',()=>{expect(eligibleShadowSentence('I can jump.')).toBe(true);expect(eligibleShadowSentence('I can [verb].')).toBe(false);expect(eligibleShadowSentence('apple')).toBe(false);expect(eligibleShadowSentence(Array(30).fill('word').join(' '))).toBe(false);});
 it('labels fallback source and keeps levels separate',()=>{for(const level of ['basic','B1','B2'] as const){const pool=shadowSamplePool(level);expect(pool.length).toBeGreaterThan(0);expect(pool.every(s=>s.source==='sample'&&s.level===level&&eligibleShadowSentence(s.text))).toBe(true);}});
});

import {shadowCoverage} from '../../src/lib/speaking/shadowing';
it('alignment penalizes omissions and insertions without losing negation',()=>{expect(shadowCoverage('I can jump','I can jump.')).toBe(100);expect(shadowCoverage('I jump','I can jump')).toBe(67);expect(shadowCoverage('I cannot jump','I can jump')).toBeLessThan(100);expect(shadowCoverage('I can jump now','I can jump')).toBe(75);});

import {vi,afterEach} from 'vitest';
import {assessShadow} from '../../src/lib/speaking/shadowing';
vi.mock('../../src/lib/ai/byok',()=>({parentAi:()=>({key:'fixture-only',model:'gemini-3.5-flash-lite'}),ParentAiError:class extends Error{}}));
vi.mock('../../src/lib/speaking/dialogue-answer',async()=>{const real=await vi.importActual<typeof import('../../src/lib/speaking/dialogue-answer')>('../../src/lib/speaking/dialogue-answer');return {...real,recognizeDialogue:vi.fn(async()=> 'I jump')};});
afterEach(()=>vi.unstubAllGlobals());
it('caps conflicting transcript evidence and rejects malformed criterion ratings without retry',async()=>{
 const fetcher=vi.fn(async()=>new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({quality:'usable',relation:'target-attempt',content:100,pronunciation:100,prosody:100,fluency:100,tip:'Thử nói đủ câu.'})}]}}]})));vi.stubGlobal('fetch',fetcher);
 const result=await assessShadow(new Blob(['fixture'],{type:'audio/wav'}),'I can jump.',new AbortController().signal);expect(result.score).toBe(79);expect(fetcher).toHaveBeenCalledTimes(1);
 fetcher.mockResolvedValueOnce(new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({quality:'usable',relation:'target-attempt',content:100,pronunciation:101,prosody:100,fluency:100,tip:'fixture'})}]}}]})));
 await expect(assessShadow(new Blob(['fixture']),'I can jump.',new AbortController().signal)).rejects.toThrow();expect(fetcher).toHaveBeenCalledTimes(2);
});

import {recognizeDialogue} from '../../src/lib/speaking/dialogue-answer';
it('never displays invented past-tense advice when target and heard use present tense',async()=>{
 const target='I enjoy reading because it helps me discover new ideas.';
 vi.mocked(recognizeDialogue).mockResolvedValueOnce(target);
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({quality:'usable',relation:'target-attempt',content:80,pronunciation:90,prosody:85,fluency:90,tip:"Hãy phát âm thì quá khứ helped thay vì help."})}]}}]}))));
 const result=await assessShadow(new Blob(['fixture'],{type:'audio/wav'}),target,new AbortController().signal);
 expect(result.tip).not.toMatch(/helped|quá khứ/);expect(result.tip).toContain('câu mẫu');
});
it('missing s advice anchors to helps rather than inventing helped',async()=>{
 const target='I enjoy reading because it helps me discover new ideas.';
 vi.mocked(recognizeDialogue).mockResolvedValueOnce('I enjoy reading because it help me discover new ideas.');
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({quality:'usable',relation:'target-attempt',content:90,pronunciation:80,prosody:85,fluency:90,tip:'Hãy dùng helped ở thì quá khứ.'})}]}}]}))));
 const result=await assessShadow(new Blob(['fixture'],{type:'audio/wav'}),target,new AbortController().signal);
 expect(result.tip).toContain('helps');expect(result.tip).toContain('đuôi -s');expect(result.tip).not.toMatch(/helped|quá khứ/);expect(result.score).toBeLessThan(100);
});

import {shadowFeedback,shadowDifferences} from '../../src/lib/speaking/shadow-feedback';
it('anchors endings and missing/extra tokens to the reference across tenses and negation',()=>{
 expect(shadowFeedback('She walk home','She walked home','target-attempt')).toContain('đuôi -ed');
 expect(shadowFeedback('She walked home','She walks home','target-attempt')).not.toContain('thì quá khứ');
 expect(shadowFeedback('I have two apple','I have two apples','target-attempt')).toContain('đuôi -s');
 expect(shadowFeedback('She watch TV','She watches TV','target-attempt')).toContain('đuôi -es');
 expect(shadowDifferences('I can swim','I cannot swim')).toContainEqual({expected:'cannot',heard:'can'});
 expect(shadowFeedback('I can','I can jump','target-attempt')).toContain('Máy chưa nhận được “jump”');
 expect(shadowFeedback('I can jump now','I can jump','target-attempt')).toContain('Máy nghe thêm “now”');
 expect(shadowFeedback('I like cats','I enjoy books','unrelated')).toContain('khác câu mẫu');
 expect(shadowDifferences("I'm here",'I am here')).toEqual([]);
});

import {linkedShadowLines} from '../../src/lib/learning/shadowing';
import type {ShadowRow} from '../../src/data/local/shadowing';
it('advanced levels require the exact base sentence and exclude legacy unrelated bundles',()=>{
 const row={scopeId:'guest:fixture',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),deletedAt:null,id:'shadow:grandpa',version:1,payload:{kind:'sense',targetId:'grandpa',source:{kind:'sense',word:'grandfather',pos:'noun',sense:'relative',definition:'A parent of a parent.',meaningVi:'ông',example:'My grandfather is old.',formula:'',conditions:'',variants:[]},sourceHash:'0'.repeat(64),model:'fixture',edited:false,status:'ready',error:null,senseId:'grandpa',promptVersion:2,decisions:{'B1:0':'approved'},levels:[{level:'B1',reason:'',sentences:[{text:'My grandfather is elderly but still enjoys an active life.',vi:'Ông tôi lớn tuổi nhưng vẫn sống năng động.',baseText:'My grandfather is old.'}]}]}} as ShadowRow;
 expect(linkedShadowLines([row],'B1','My grandfather is old.')).toHaveLength(1);
 expect(linkedShadowLines([row],'B1','I enjoy reading.')).toHaveLength(0);
 expect(linkedShadowLines([{...row,payload:{...row.payload,promptVersion:1}}],'B1','My grandfather is old.')).toHaveLength(0);
});
