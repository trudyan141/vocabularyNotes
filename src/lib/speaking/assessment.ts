import {articulation} from './articulation';
import type {HeardPhone} from './ctc';
export type TargetWord={text:string;variants:string[][]};
export type PhoneFeedback={expected:string;heard:string|null;status:'match'|'retry'|'missing'|'uncertain';advice:string};
export type WordFeedback={index:number;text:string;expected:string[];heard:string[];status:'match'|'retry'|'missing'|'uncertain';advice:string;score?:number|null;phones?:PhoneFeedback[]};
const neighbours=new Set(['æ:ɛ','ɛ:ɪ','ɪ:i','ʊ:u','ɑ:ɔ','ə:ɑ','ʌ:ə','p:b','p:f','t:d','k:g','s:z','f:v','θ:s','θ:t','ð:d','ð:z','r:l','r:w','ʃ:s','ʒ:z','tʃ:dʒ'].flatMap(pair=>[pair,pair.split(':').reverse().join(':')]));
const comparable=(p:string)=>p.replace('ɡ','g').replace('ɹ','r').replace('ʌ','ə').replace('ɚ','ɝ').replace('ɑɹ','ɝ');
export function assessPhones(words:TargetWord[],heard:HeardPhone[]):WordFeedback[]{
 if(!words.length||words.length>20||heard.length>300)throw new Error('target');
 if(!heard.length||heard.filter(p=>p.confidence>=.55).length<heard.length*.6)return words.map((word,index)=>({index,text:word.text,expected:word.variants[0],heard:[],status:'uncertain',phones:word.variants[0].map(expected=>({expected,heard:null,status:'uncertain' as const,advice:articulation(expected)})),advice:'Máy chưa nghe rõ. Con nói gần mic, chậm hơn rồi thử lại nhé.'}));
 // Unprompted phones aligned globally. Target is never sent to the acoustic model.
 const expected=words.flatMap((word,index)=>word.variants[0].map(phone=>({phone,index})));
 const cost=Array.from({length:expected.length+1},()=>new Uint16Array(heard.length+1));
 for(let i=0;i<=expected.length;i++)cost[i][0]=i;for(let j=0;j<=heard.length;j++)cost[0][j]=j;
 for(let i=1;i<=expected.length;i++)for(let j=1;j<=heard.length;j++)cost[i][j]=Math.min(cost[i-1][j]+1,cost[i][j-1]+1,cost[i-1][j-1]+(comparable(expected[i-1].phone)===comparable(heard[j-1].phone)?0:1));
 const aligned=words.map(()=>[] as HeardPhone[]);let i=expected.length,j=heard.length;
 while(i||j){if(i&&j&&cost[i][j]===cost[i-1][j-1]+(comparable(expected[i-1].phone)===comparable(heard[j-1].phone)?0:1)){aligned[expected[i-1].index].unshift(heard[j-1]);i--;j--;}else if(i&&cost[i][j]===cost[i-1][j]+1)i--;else{if(i)aligned[expected[i-1].index].unshift(heard[j-1]);j--;}}
 return words.map((word,index)=>{
  const received=aligned[index];
  const candidates=word.variants.map(variant=>({variant,details:alignWord(variant,received)}));
  candidates.sort((a,b)=>a.details.filter(p=>p.status!=='match').length-b.details.filter(p=>p.status!=='match').length);
  const {variant,details}=candidates[0];
  const matches=details.filter(p=>p.status==='match').length;
  const status=details.some(p=>p.status==='uncertain')?'uncertain':matches===details.length&&received.length===variant.length?'match':!matches?'missing':'retry';
  const repairs=details.filter(p=>p.status==='retry'||p.status==='missing');
  return {index,text:word.text,expected:variant,heard:received.map(p=>p.phone),status,phones:details,
   advice:status==='uncertain'?'Máy chưa nghe rõ. Con thử lại ở chỗ yên tĩnh nhé.':status==='match'?'Các âm máy nghe được giống mẫu. Giỏi lắm!':repairs.length?repairs.map(p=>`Âm /${p.expected}/: ${p.advice}`).join(' '):'Máy nghe thêm âm. Con nghe mẫu rồi nối các âm, không thêm tiếng ở cuối nhé.'};
 });
}
function alignWord(expected:string[],heard:HeardPhone[]):PhoneFeedback[]{
 const cost=Array.from({length:expected.length+1},()=>new Uint16Array(heard.length+1));
 for(let i=0;i<=expected.length;i++)cost[i][0]=i;for(let j=0;j<=heard.length;j++)cost[0][j]=j;
 for(let i=1;i<=expected.length;i++)for(let j=1;j<=heard.length;j++)cost[i][j]=Math.min(cost[i-1][j]+1,cost[i][j-1]+1,cost[i-1][j-1]+(comparable(expected[i-1])===comparable(heard[j-1].phone)?0:1));
 const result:PhoneFeedback[]=[];let i=expected.length,j=heard.length;
 while(i||j){if(i&&j&&cost[i][j]===cost[i-1][j-1]+(comparable(expected[i-1])===comparable(heard[j-1].phone)?0:1)){
  const status=heard[j-1].confidence<.55?'uncertain':comparable(expected[i-1])===comparable(heard[j-1].phone)?'match':neighbours.has(`${comparable(expected[i-1])}:${comparable(heard[j-1].phone)}`)?'retry':'missing';
  result.unshift({expected:expected[i-1],heard:heard[j-1].phone,status,advice:articulation(expected[i-1])});i--;j--;
 }else if(i&&cost[i][j]===cost[i-1][j]+1){result.unshift({expected:expected[i-1],heard:null,status:'missing',advice:articulation(expected[i-1])});i--;}else j--;}
 return result;
}
export function recordingQuality(samples:Float32Array){
 if(samples.length<4000||samples.length>320000||samples.some(n=>!Number.isFinite(n)))return false;
 let energy=0,clipped=0,voice=0;for(const n of samples){energy+=n*n;if(Math.abs(n)>.98)clipped++;if(Math.abs(n)>.015)voice++;}
 return Math.sqrt(energy/samples.length)>.004&&voice>1600&&clipped/samples.length<.02;
}

/** Normalised phone agreement, with half credit for a recognised substitution.
 * Acoustic uncertainty has no score; insertion/deletion cannot earn full credit. */
export function pronunciationScore(feedback:WordFeedback[]):number|null{
 if(!feedback.length||feedback.some(word=>word.status==='uncertain'||!word.phones?.length||word.phones.some(phone=>phone.status==='uncertain')))return null;
 if(feedback.every(word=>word.score!==undefined))return feedback.some(word=>word.score===null)?null:Math.round(feedback.reduce((sum,word)=>sum+word.score!,0)/feedback.length);
 let earned=0,total=0;
 for(const word of feedback){total+=Math.max(word.expected.length,word.heard.length);for(const phone of word.phones!){earned+=phone.status==='match'?1:phone.status==='retry'?.5:0;}}
 return total?Math.round(100*earned/total):null;
}
