import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {measure,pilotReport,validateManifest} from '../speaking/metrics.mjs';

const event={wordIndex:0,kind:'missing',index:2,heard:null};
const clip=(id,category='omission',ageGroup='child')=>({id,category,ageGroup,quality:category==='unclear'?'unclear':'clear',events:category==='correct'||category==='unclear'?[]:[event]});
const result=(id,events=[],score=100)=>({id,events,score,status:events.length?'missing':'match',priority:events[0]??null,error:null,latencyMs:1500});

test('event accounting penalizes wrong diagnosis and prevents duplicate true positives',()=>{
 const report=measure([clip('a')],[result('a',[event,event],67)]);assert.equal(report.tp,1);assert.equal(report.fp,1);assert.equal(report.precision,.5);
 const wrong=measure([clip('a')],[result('a',[{...event,kind:'substitution',heard:'s'}],67)]);assert.equal(wrong.tp,0);assert.equal(wrong.fp,1);assert.equal(wrong.fn,1);
});
test('uncertain and transport/schema failures cannot hide missed clear errors or count as correct abstention',()=>{
 const report=measure([clip('a'),clip('b','unclear')],[{...result('a',[],null),status:'uncertain'},{...result('b',[],null),error:'quota'}]);
 assert.equal(report.fn,1);assert.equal(report.coverage,0);assert.equal(report.rejected,0);assert.equal(report.requestErrors,1);
 assert.equal(measure([clip('b','unclear')],[{...result('b',[],null),status:'uncertain'}]).rejected,1);
});
test('word false alarms have a word denominator; insertion phones do not create fictional true negatives',()=>{
 const report=measure([clip('a','correct'),clip('b','correct')],[result('a',[{...event,kind:'insertion',heard:'ə'}],75),result('b')]);assert.equal(report.falseAlarmRate,.5);assert.equal(report.fp,1);
});
test('valid symbol aliases match diagnoses but different vowels remain different',()=>{
 const gold={...clip('a','substitution'),events:[{...event,kind:'substitution',heard:'ɡ'}]};assert.equal(measure([gold],[result('a',[{...gold.events[0],heard:'g'}],67)]).tp,1);
 gold.events[0].heard='ʌ';assert.equal(measure([gold],[result('a',[{...gold.events[0],heard:'ə'}],83)]).tp,0);
});
test('missing data, tiny samples and repeated IDs cannot pass pilot gates',()=>{
 assert.equal(pilotReport([],[]).status,'quality_pending_or_failed');assert.equal(pilotReport([clip('a','correct')],[result('a')]).gates.complete,false);
 assert.throws(()=>validateManifest({schemaVersion:1,permissionConfirmed:false,clips:[]}),/permitted dataset/);
 assert.throws(()=>validateManifest({schemaVersion:1,permissionConfirmed:true,labelsReviewed:true,reviewers:['r1','r2'],phoneticsReviewer:'r1',clips:[]}),/100 labeled/);
});
test('invalid scores and unreturned requests cannot appear as scored audio',()=>{
 for(const score of [undefined,NaN,101,-1])assert.equal(measure([clip('a','correct')],[{...result('a'),score}]).coverage,0);
 assert.equal(measure([clip('a','correct')],[]).coverage,0);
});
function dataset(){
 const rows=[];let serial=0;
 for(const split of ['tuning','evaluation'])for(const ageGroup of ['child','adult']){
  const categories=split==='evaluation'?[...Array(10).fill('correct'),...Array(4).fill('omission'),...Array(4).fill('substitution'),...Array(4).fill('insertion'),...Array(3).fill('different_word'),...Array(5).fill('unclear')]:Array.from({length:20},(_,i)=>i%4===0?'correct':'omission');
  categories.forEach((category,i)=>{const id=`clip-${serial++}`,isError=category!=='correct'&&category!=='unclear',labeled=category==='insertion'?{...event,kind:'insertion',heard:'ə'}:category==='substitution'?{...event,kind:'substitution',heard:i%2?'d':'m'}:event;rows.push({id,sourceRecordingId:id,speakerId:`${split}-${ageGroup}-${i%(split==='evaluation'?3:2)}`,ageGroup,split,quality:category==='unclear'?'unclear':'clear',category,unreleased:category==='correct'&&i<4,audioPath:'/private/fixture.wav',sha256:serial.toString(16).padStart(64,'0'),targets:[{text:`word${i}`,variants:[['k','æ','t']]}],events:isError?[labeled]:[],...(category==='substitution'?{substitutionClass:i%2?'near':'gross'}:{})});});
 }
 return {schemaVersion:1,permissionConfirmed:true,labelsReviewed:true,reviewers:['r1','r2'],phoneticsReviewer:'r1',clips:rows};
}
test('manifest distribution guards reject speaker, recording and exact-audio leakage across splits',()=>{
 assert.equal(validateManifest(dataset()).length,100);
 for(const field of ['speakerId','sourceRecordingId','sha256']){const value=dataset(),tuning=value.clips[0],evaluation=value.clips.find(row=>row.split==='evaluation');evaluation[field]=tuning[field];assert.throws(()=>validateManifest(value),/cross split|cross splits|cross split or age/);}
 const unbalanced=dataset();unbalanced.clips[40].ageGroup='adult';assert.throws(()=>validateManifest(unbalanced));
});
test('benchmark entrypoint shows safe help and rejects the unprepared template without provider calls',()=>{
 const help=execFileSync(process.execPath,['scripts/speaking/benchmark.mjs','--help'],{encoding:'utf8'});assert.match(help,/300|authorized existing key|Existing key/);
 const run=spawnSync(process.execPath,['scripts/speaking/benchmark.mjs','--validate','--manifest','docs/fixtures/speaking-benchmark.template.json'],{encoding:'utf8'});assert.equal(run.status,1);assert.match(run.stderr,/permitted dataset/);assert.doesNotMatch(run.stderr,/AIza|AQ\./);
});

test('a numeric zero for unclear speech is a rejection, not acoustic coverage or a system failure',()=>{
 const unclear={...result('quiet',[],0),status:'uncertain'};
 const silent=measure([clip('quiet','unclear')],[unclear]);assert.equal(silent.rejected,1);assert.equal(silent.requestErrors,0);
 const clear=measure([clip('quiet')],[unclear]);assert.equal(clear.covered,0);assert.equal(clear.fn,1);
 const failed=measure([clip('quiet','unclear')],[{...unclear,error:'timeout'}]);assert.equal(failed.rejected,0);assert.equal(failed.requestErrors,1);
});
