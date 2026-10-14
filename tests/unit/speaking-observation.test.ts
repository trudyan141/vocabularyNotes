import {expect,it} from 'vitest';
import {validateObservation,observationProviderSchema} from '@/lib/speaking/observation';
import {pronunciationScore} from '@/lib/speaking/assessment';
const target=[{text:'cat',variants:[['k','æ','t']]}];
const observed=(heard:string[],audibility='clear')=>({schemaVersion:3,words:[{index:0,audibility,heard}]});
it('aligns only observed phones locally, preserving omission, substitution and every insertion',()=>{
 expect(pronunciationScore(validateObservation(observed(['k','æ','t']),target))).toBe(100);
 expect(pronunciationScore(validateObservation(observed(['k','æ']),target))).toBe(67);
 const wrong=validateObservation(observed(['k','æ','p']),target);expect(wrong[0].phones?.[2]).toMatchObject({status:'incorrect',heard:'p'});expect(pronunciationScore(wrong)).toBe(67);
 const extras=validateObservation(observed(['ə','k','æ','t','ə','ə']),target);expect(extras[0].insertions?.map(x=>x.afterIndex)).toEqual([-1,2,2]);expect(pronunciationScore(extras)).toBe(50);
});
it('gives zero for no recognisable speech, while partial unknown sounds earn no credit',()=>{
 expect(pronunciationScore(validateObservation(observed([],'unclear'),target))).toBe(0);
 expect(pronunciationScore(validateObservation(observed(['?']),target))).toBe(0);
});
it('accepts complete reference variants and symbol aliases, rejects invented fields and out-of-range variants',()=>{
 const g=[{text:'go',variants:[['g','oʊ']]}];expect(pronunciationScore(validateObservation(observed(['ɡ','oʊ']),g))).toBe(100);
 expect(()=>validateObservation({...observed(['k']),score:100},target)).toThrow();
 const multiple=[{text:'apple',variants:[['æ','p','ə','l'],['æ','p','l']]}];expect(pronunciationScore(validateObservation(observed(['æ','p','l']),multiple))).toBe(100);
 expect(()=>validateObservation(observed(['arbitrary words']),target)).toThrow();
 expect(observationProviderSchema(target)).toHaveProperty('properties.words');
});
