import {describe,expect,it,vi} from 'vitest';
import {validateAudioAssessment} from '@/lib/speaking/contract';
import {pronunciationScore,roundScore,type TargetWord} from '@/lib/speaking/assessment';
import {canonicalPhone} from '@/lib/speaking/feedback';
import {soundGroups} from '@/lib/speaking/graphemes';
vi.mock('server-only',()=>({}));
import {POST} from '@/app/api/speaking/target/route';
import {NextRequest} from 'next/server';

const cat=[{text:'cat',variants:[['k','æ','t']]}];
const response=(targets:TargetWord[]=cat)=>({schemaVersion:2,words:targets.map((target,index)=>({index,variantIndex:0,audibility:'clear',insertions:[] as {afterIndex:number;heard:string}[],phones:target.variants[0].map(expected=>({expected,heard:expected as string|null,status:'match'}))}))});
const score=(value:ReturnType<typeof response>,targets=cat)=>pronunciationScore(validateAudioAssessment(value,targets));

describe('v2 deterministic pronunciation feedback',()=>{
 it('scores evidence rather than provider fields and distinguishes omission, near and gross substitution',()=>{
  expect(score(response())).toBe(100);
  const missing=response();Object.assign(missing.words[0].phones[2],{heard:null,status:'missing'});expect(score(missing)).toBe(67);
  const near=response();Object.assign(near.words[0].phones[1],{heard:'ɛ',status:'substitution'});expect(score(near)).toBe(83);
  const gross=response();Object.assign(gross.words[0].phones[2],{heard:'m',status:'substitution'});const row=validateAudioAssessment(gross,cat)[0];expect(row.status).toBe('incorrect');expect(row.phones?.[2].status).toBe('incorrect');expect(pronunciationScore([row])).toBe(67);
  expect(()=>validateAudioAssessment({...response(),score:100},cat)).toThrow('evidence');
  const injected={...row,score:100};expect(pronunciationScore([injected])).toBe(67);
 });
 it.each([-1,0,1,2])('represents an insertion at %i without replacing a correctly produced sound',afterIndex=>{
  const value=response();value.words[0].insertions=[{afterIndex,heard:'ə'}];const row=validateAudioAssessment(value,cat)[0];
  expect(pronunciationScore([row])).toBe(75);expect(row.status).toBe('retry');expect(row.phones?.every(phone=>phone.status==='match')).toBe(true);
  expect(row.heard).toEqual([...cat[0].variants[0].slice(0,afterIndex+1),'ə',...cat[0].variants[0].slice(afterIndex+1)]);
  expect(soundGroups(row).every(group=>group.status==='match')).toBe(true);expect(row.advice).toContain('không thêm');
 });
 it('preserves repeated insertions, full variants and symbol aliases',()=>{
  const value=response();value.words[0].insertions=[{afterIndex:2,heard:'ə'},{afterIndex:2,heard:'ə'}];expect(score(value)).toBe(60);
  const targets=[{text:'apple',variants:[['æ','p','ə','l'],['æ','p','l']]}];const alternate=response([{text:'apple',variants:[targets[0].variants[1]]}]);alternate.words[0].variantIndex=1;expect(score(alternate,targets)).toBe(100);
  const alias=response([{text:'go',variants:[['g','oʊ']]}]);alias.words[0].phones[0].heard='ɡ';expect(score(alias,[{text:'go',variants:[['g','oʊ']]}])).toBe(100);
 });
 it('uses the same formula for apple, and one severe error before any easier coaching',()=>{
  const targets=[{text:'apple',variants:[['æ','p','ə','l']]}];const value=response(targets);Object.assign(value.words[0].phones[0],{heard:'ɛ',status:'substitution'});expect(score(value,targets)).toBe(88);
  Object.assign(value.words[0].phones[3],{heard:null,status:'missing'});expect(score(value,targets)).toBe(63);const row=validateAudioAssessment(value,targets)[0];expect(row.advice).toContain('/l/');expect(row.advice).not.toContain('/æ/');
 });
 it('prioritizes insertion before near substitution and never teaches an uncertain diagnosis',()=>{
  const value=response();Object.assign(value.words[0].phones[1],{heard:'ɛ',status:'substitution'});value.words[0].insertions=[{afterIndex:2,heard:'ə'}];expect(validateAudioAssessment(value,cat)[0].advice).toContain('không thêm');
  Object.assign(value.words[0].phones[2],{heard:null,status:'uncertain'});expect(score(value)).toBe(38);expect(validateAudioAssessment(value,cat)[0].advice).toContain('chưa nghe rõ');
  const unclear=response();unclear.words[0].audibility='unclear';expect(score(unclear)).toBe(0);
 });
 it('does not erase distinct vowels and only gives a final-stop practice cue when a sound needs work',()=>{
  expect(canonicalPhone('ʌ')).not.toBe(canonicalPhone('ə'));expect(canonicalPhone('ɚ')).not.toBe(canonicalPhone('ɝ'));
  const targets=[{text:'cup',variants:[['k','ʌ','p']]}];const value=response(targets);Object.assign(value.words[0].phones[1],{heard:'ə',status:'substitution'});expect(score(value,targets)).toBe(83);
  const missing=response();Object.assign(missing.words[0].phones[2],{heard:null,status:'missing'});const row=validateAudioAssessment(missing,cat)[0];expect(row.advice).toContain('Không cần bật mạnh');expect(row.advice).toContain('đừng thêm');
 });
 it('caps rounded word and round scores and refuses to average away skipped or unclear words',()=>{
  const targets=[{text:'long',variants:[Array(80).fill('æ')]}];const value=response(targets);value.words[0].phones[0].heard='ɛ';value.words[0].phones[0].status='substitution';expect(score(value,targets)).toBe(99);
  expect(roundScore([100,100,99])).toBe(99);expect(roundScore([100,null])).toBeNull();expect(roundScore([100,undefined])).toBeNull();expect(roundScore([])).toBeNull();expect(roundScore([100,100])).toBe(100);
 });
});

describe('v2 strict acoustic evidence boundaries',()=>{
 const corruptions:Record<string,(value:ReturnType<typeof response>)=>unknown>={
  'missing insertion array':value=>{delete (value.words[0] as {insertions?:unknown}).insertions;},
  'unknown field':value=>Object.assign(value.words[0],{score:100}),
  'forged index':value=>{value.words[0].index=1;},
  'forged variant':value=>{value.words[0].variantIndex=1;},
  'changed expected':value=>{value.words[0].phones[0].expected='s';},
  'truncated phones':value=>value.words[0].phones.pop(),
  'match with no heard sound':value=>{value.words[0].phones[0].heard=null;},
  'match with different heard sound':value=>{value.words[0].phones[0].heard='s';},
  'substitution with same sound':value=>{value.words[0].phones[0].status='substitution';},
  'missing with a heard sound':value=>{value.words[0].phones[0].status='missing';},
  'uncertain with a heard sound':value=>{value.words[0].phones[0].status='uncertain';},
  'unknown phone':value=>{value.words[0].phones[0].heard='zz';},
  'multiple phones in one token':value=>{value.words[0].phones[0].heard='kə';},
  'out of range insertion':value=>value.words[0].insertions.push({afterIndex:3,heard:'ə'}),
  'unordered insertions':value=>{value.words[0].insertions=[{afterIndex:1,heard:'ə'},{afterIndex:0,heard:'ə'}];},
  'too many insertions':value=>{value.words[0].insertions=Array.from({length:21},()=>({afterIndex:2,heard:'ə'}));},
  'legacy shape':value=>{delete (value as {schemaVersion?:number}).schemaVersion;},
 };
 it.each(Object.keys(corruptions))('rejects %s without silently repairing the response',name=>{const value=response();corruptions[name](value);expect(()=>validateAudioAssessment(value,cat)).toThrow('evidence');});
 it('rejects duplicate word indices and mixed or absent reference variants',()=>{
  const targets=[...cat,{text:'dog',variants:[['d','ɔ','g']]}],value=response(targets);value.words[1].index=0;expect(()=>validateAudioAssessment(value,targets)).toThrow('evidence');
  expect(()=>validateAudioAssessment(response(),[{text:'',variants:[]}])).toThrow('evidence');
 });
 it('preserves stress distinctions when deriving CMU references, without changing library content',async()=>{
  const request=new NextRequest('http://127.0.0.1:4320/api/speaking/target',{method:'POST',headers:{host:'127.0.0.1:4320',origin:'http://127.0.0.1:4320'},body:JSON.stringify({text:'cup mother bird'})});
  const result=await POST(request);expect(result.status).toBe(200);const body=await result.json();expect(body.words[0].variants[0]).toEqual(['k','ʌ','p']);expect(body.words[1].variants[0].at(-1)).toBe('ɚ');expect(body.words[2].variants[0]).toContain('ɝ');
 });
});
