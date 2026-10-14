/** Offline event evaluation. No audio, provider calls or estimated ground truth. */
const ratio=(a,b)=>b?a/b:null;
const canonical=phone=>phone==='ɡ'?'g':phone==='ɹ'?'r':phone;
const same=(a,b)=>a.wordIndex===b.wordIndex&&a.kind===b.kind&&a.index===b.index&&canonical(a.heard)===canonical(b.heard);
export function measure(clips,results){
 let tp=0,fp=0,fn=0,correct=0,falseAlarm=0,clear=0,covered=0,unclear=0,rejected=0,unreleased=0,unreleasedAlarm=0,wrongWord100=0,requestErrors=0;
 const latency=[],groups={};
 for(const clip of clips){
  const result=results.find(row=>row.id===clip.id),scored=Number.isInteger(result?.score)&&result.score>=0&&result.score<=100&&!result.error&&result.status!=='uncertain',events=scored?(result.events??[]):[],remaining=[...(clip.events??[])];
  if(clip.quality==='clear'){
   clear++;if(scored)covered++;
   for(const event of events){const index=remaining.findIndex(gold=>same(event,gold));if(index<0)fp++;else{tp++;remaining.splice(index,1);}}
   fn+=remaining.length;
   if(clip.category==='correct'){correct++;if(events.length)falseAlarm++;}
   if(clip.unreleased){unreleased++;if(events.length)unreleasedAlarm++;}
   if(clip.category==='different_word'&&result?.score===100)wrongWord100++;
   if(clip.events?.length){const group=groups[clip.category]??{tp:0,total:0};group.total+=clip.events.length;group.tp+=clip.events.length-remaining.length;groups[clip.category]=group;}
  }else{unclear++;if(result&&!result.error&&!scored)rejected++;}
  if(!result||result.error)requestErrors++;
  if(Number.isFinite(result?.latencyMs))latency.push(result.latencyMs);
 }
 latency.sort((a,b)=>a-b);const quantile=p=>latency.length?latency[Math.max(0,Math.ceil(latency.length*p)-1)]:null;
 return {clips:clips.length,tp,fp,fn,correct,falseAlarm,clear,covered,unclear,rejected,unreleased,unreleasedAlarm,wrongWord100,requestErrors,precision:ratio(tp,tp+fp),recall:ratio(tp,tp+fn),falseAlarmRate:ratio(falseAlarm,correct),coverage:ratio(covered,clear),rejection:ratio(rejected,unclear),errorRate:ratio(requestErrors,clips.length),p50:quantile(.5),p95:quantile(.95),groups:Object.fromEntries(Object.entries(groups).map(([key,value])=>[key,{...value,recall:ratio(value.tp,value.total)}]))};
}

export function pilotReport(clips,results,repeats=[]){
 const overall=measure(clips,results),children=measure(clips.filter(clip=>clip.ageGroup==='child'),results);
 function quality(m){return m.precision!==null&&m.precision>=.9&&m.falseAlarmRate!==null&&m.falseAlarmRate<=.05&&m.recall!==null&&m.recall>=.8&&['omission','substitution','insertion'].every(kind=>m.groups[kind]?.recall>=.75)&&m.coverage>=.9&&m.rejection>=.9&&m.wrongWord100===0&&m.unreleasedAlarm===0;}
 let stable=0,close=0;
 for(const repeat of repeats){const original=results.find(result=>result.id===repeat.id);if(original&&!original.error&&!repeat.error&&original.score!==null&&repeat.score!==null){if(original.status===repeat.status&&JSON.stringify(original.priority)===JSON.stringify(repeat.priority))stable++;if(Math.abs(original.score-repeat.score)<=10)close++;}}
 const complete=clips.length===60&&results.length===60&&children.clips===30&&overall.correct===20&&overall.clear===50&&overall.unclear===10&&overall.unreleased>=8&&children.correct===10&&children.clear===25&&children.unclear===5&&children.unreleased>=4;
 const childRepeats=repeats.filter(row=>clips.some(clip=>clip.id===row.id&&clip.ageGroup==='child')).length;
 const repeatComplete=repeats.length===10&&new Set(repeats.map(row=>row.id)).size===10&&childRepeats>=5;
 const latencyEvidence=results.length===60&&results.every(result=>result.latencyScope==='end_to_end');
 const gates={complete,overallQuality:quality(overall),childQuality:quality(children),repeatComplete,repeatStable:stable>=9,repeatScoreClose:close>=9,latencyEvidence,latency:overall.p50!==null&&overall.p50<=3500&&overall.p95<=8000,requests:overall.errorRate!==null&&overall.errorRate<=.05};
 return {status:Object.values(gates).every(Boolean)?'pilot_pass':'quality_pending_or_failed',gates,overall,children,repeats:{count:repeats.length,stable,close},limits:'Dataset pilot only; not evidence of all children, physical devices or provider eligibility.'};
}

export function validateManifest(manifest){
 if(!Number.isInteger(manifest.priorRequests??0)||(manifest.priorRequests??0)<0||(manifest.priorRequests??0)>300)throw new Error('Prior probe requests must be counted within the 300-request budget.');
 if(manifest.schemaVersion!==1||manifest.permissionConfirmed!==true||manifest.labelsReviewed!==true||!Array.isArray(manifest.reviewers)||new Set(manifest.reviewers).size<2||!manifest.reviewers.includes(manifest.phoneticsReviewer))throw new Error('A permitted dataset with two completed human reviews, including phonetics review, is required.');
 const clips=manifest.clips;if(!Array.isArray(clips)||clips.length!==100)throw new Error('Pilot requires 100 labeled clips; templates and synthetic voices are not a child-quality pass.');
 const ids=new Set(),speakers=new Map(),sources=new Map(),hashes=new Map();
 for(const clip of clips){
  if(!/^[a-z0-9-]{1,64}$/.test(clip.id)||ids.has(clip.id)||!/^[a-z0-9-]{1,64}$/.test(clip.speakerId))throw new Error('Invalid or duplicate anonymous clip/speaker identifier.');ids.add(clip.id);
  if(!['tuning','evaluation'].includes(clip.split)||!['child','adult'].includes(clip.ageGroup)||!['clear','unclear'].includes(clip.quality)||!['correct','omission','substitution','insertion','different_word','unclear'].includes(clip.category)||!Array.isArray(clip.events)||!Array.isArray(clip.targets)||clip.targets.length!==1||clip.targets[0].variants?.length!==1||!clip.audioPath||!/^[a-f0-9]{64}$/.test(clip.sha256)||!/^[a-z0-9-]{1,64}$/.test(clip.sourceRecordingId))throw new Error('Incomplete clip metadata; use one human-selected reference variant per clip.');
  for(const [map,key] of [[sources,clip.sourceRecordingId],[hashes,clip.sha256]]){if(map.has(key)&&map.get(key)!==clip.split)throw new Error('Original recordings or identical audio cannot cross splits.');map.set(key,clip.split);}
  const identity=`${clip.split}:${clip.ageGroup}`;if(speakers.has(clip.speakerId)&&speakers.get(clip.speakerId)!==identity)throw new Error('Speakers must not cross split or age boundaries.');speakers.set(clip.speakerId,identity);
  if((clip.category==='correct'||clip.quality==='unclear')&&clip.events.length)throw new Error('Correct/unclear gold cannot contain a certain error diagnosis.');
  if((clip.quality==='unclear')!==(clip.category==='unclear')||clip.quality==='clear'&&clip.category!=='correct'&&!clip.events.length)throw new Error('Gold quality/category mismatch.');
  const requiredKind={omission:'missing',substitution:'substitution',insertion:'insertion'}[clip.category];if(requiredKind&&!clip.events.some(event=>event.kind===requiredKind))throw new Error('Gold event kinds must agree with the clip category.');
  for(const event of clip.events){if(event.wordIndex!==0||!['missing','substitution','insertion'].includes(event.kind)||!Number.isInteger(event.index)||event.index<(event.kind==='insertion'?-1:0)||event.index>=clip.targets[0].variants[0].length||(event.kind==='missing'?event.heard!==null:typeof event.heard!=='string'))throw new Error('Invalid labeled phone event.');}
  if(clip.category==='substitution'&&!['near','gross'].includes(clip.substitutionClass))throw new Error('Substitution controls need near/gross labels.');
 }
 const splits={tuning:40,evaluation:60};
 for(const [split,total] of Object.entries(splits)){
  const rows=clips.filter(clip=>clip.split===split),expected=split==='tuning'?2:3;
  if(rows.length!==total||new Set(rows.map(clip=>clip.speakerId)).size!==expected*2)throw new Error('Pilot split/speaker counts do not match the frozen plan.');
  for(const age of ['child','adult']){const subset=rows.filter(clip=>clip.ageGroup===age);if(subset.length!==total/2||new Set(subset.map(clip=>clip.speakerId)).size!==expected)throw new Error('Both age groups must be balanced.');}
  for(const speaker of new Set(rows.map(clip=>clip.speakerId)))if(rows.filter(clip=>clip.speakerId===speaker).length!==10)throw new Error('Each speaker must contribute ten clips.');
 }
 for(const age of ['child','adult']){
  const rows=clips.filter(clip=>clip.split==='evaluation'&&clip.ageGroup===age),counts={correct:10,omission:4,substitution:4,insertion:4,different_word:3,unclear:5};
  for(const [kind,count] of Object.entries(counts))if(rows.filter(clip=>clip.category===kind).length!==count)throw new Error('Evaluation categories do not match the frozen plan.');
  if(rows.filter(clip=>clip.unreleased&&clip.category==='correct').length<4)throw new Error('Four valid unreleased controls per age group are required.');
  for(const kind of ['near','gross'])if(rows.filter(clip=>clip.category==='substitution'&&clip.substitutionClass===kind).length!==2)throw new Error('Two near and two gross substitutions per age group are required.');
 }
 if(new Set(clips.filter(clip=>clip.split==='evaluation').map(clip=>clip.targets[0].text.toLowerCase())).size<15)throw new Error('Evaluation needs at least fifteen distinct words.');
 return clips;
}
