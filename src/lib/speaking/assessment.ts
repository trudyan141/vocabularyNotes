import type {HeardPhone} from './ctc';
export type TargetWord={text:string;variants:string[][]};
export type WordFeedback={index:number;text:string;expected:string[];heard:string[];status:'match'|'retry'|'missing'|'uncertain';advice:string};
const comparable=(p:string)=>p.replace('ɡ','g').replace('ɹ','r').replace('ʌ','ə').replace('ɚ','ɝ').replace('ɑɹ','ɝ');
export function assessPhones(words:TargetWord[],heard:HeardPhone[]):WordFeedback[]{
 if(!words.length||words.length>20||heard.length>300)throw new Error('target');
 if(!heard.length||heard.filter(p=>p.confidence>=.55).length<heard.length*.6)return words.map((word,index)=>({index,text:word.text,expected:word.variants[0],heard:[],status:'uncertain',advice:'Máy chưa nghe rõ. Con nói gần mic, chậm hơn rồi thử lại nhé.'}));
 // Unprompted phones aligned globally. Target is never sent to the acoustic model.
 const expected=words.flatMap((word,index)=>word.variants[0].map(phone=>({phone,index})));
 const cost=Array.from({length:expected.length+1},()=>new Uint16Array(heard.length+1));
 for(let i=0;i<=expected.length;i++)cost[i][0]=i;for(let j=0;j<=heard.length;j++)cost[0][j]=j;
 for(let i=1;i<=expected.length;i++)for(let j=1;j<=heard.length;j++)cost[i][j]=Math.min(cost[i-1][j]+1,cost[i][j-1]+1,cost[i-1][j-1]+(comparable(expected[i-1].phone)===comparable(heard[j-1].phone)?0:1));
 const aligned=words.map(()=>[] as HeardPhone[]);let i=expected.length,j=heard.length;
 while(i||j){if(i&&j&&cost[i][j]===cost[i-1][j-1]+(comparable(expected[i-1].phone)===comparable(heard[j-1].phone)?0:1)){aligned[expected[i-1].index].unshift(heard[j-1]);i--;j--;}else if(i&&cost[i][j]===cost[i-1][j]+1)i--;else{if(i)aligned[expected[i-1].index].unshift(heard[j-1]);j--;}}
 return words.map((word,index)=>{const phones=aligned[index].map(p=>p.phone);const same=word.variants.some(variant=>variant.map(comparable).join(' ')===phones.map(comparable).join(' '));const status=same?'match':!phones.length?'missing':aligned[index].some(p=>p.confidence<.55)?'uncertain':'retry';return {index,text:word.text,expected:word.variants[0],heard:phones,status,advice:status==='match'?'Máy nghe các âm giống mẫu. Con nghe lại để tự kiểm nhé.':status==='missing'?`Máy chưa nhận ra âm của “${word.text}”. Con nghe mẫu rồi nói riêng từ này nhé.`:status==='retry'?`Âm máy nhận được chưa giống mẫu của “${word.text}”. Con nghe và nói chậm từng âm rồi nối lại nhé.`:'Âm này chưa rõ. Con thu lại ở chỗ yên tĩnh nhé.'};});
}
export function recordingQuality(samples:Float32Array){
 if(samples.length<4000||samples.length>320000||samples.some(n=>!Number.isFinite(n)))return false;
 let energy=0,clipped=0,voice=0;for(const n of samples){energy+=n*n;if(Math.abs(n)>.98)clipped++;if(Math.abs(n)>.015)voice++;}
 return Math.sqrt(energy/samples.length)>.004&&voice>1600&&clipped/samples.length<.02;
}
