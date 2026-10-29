import {answerKey} from './dialogue-answer';
export type ShadowDifference={expected:string|null;heard:string|null};
/** Exact token alignment, preserving endings and negations. Never correct the reference. */
export function shadowDifferences(heard:string,target:string):ShadowDifference[]{
 const a=answerKey(heard).split(' ').filter(Boolean),b=answerKey(target).split(' ').filter(Boolean);
 const cost=Array.from({length:b.length+1},()=>new Uint16Array(a.length+1));
 for(let i=0;i<=b.length;i++)cost[i][0]=i;for(let j=0;j<=a.length;j++)cost[0][j]=j;
 for(let i=1;i<=b.length;i++)for(let j=1;j<=a.length;j++)cost[i][j]=Math.min(cost[i-1][j]+1,cost[i][j-1]+1,cost[i-1][j-1]+Number(b[i-1]!==a[j-1]));
 const differences:ShadowDifference[]=[];let i=b.length,j=a.length;
 while(i||j){if(i&&j&&cost[i][j]===cost[i-1][j-1]+Number(b[i-1]!==a[j-1])){if(b[i-1]!==a[j-1])differences.push({expected:b[i-1],heard:a[j-1]});i--;j--;}else if(j&&cost[i][j]===cost[i][j-1]+1){differences.push({expected:null,heard:a[--j]});}else{differences.push({expected:b[--i],heard:null});}}
 return differences.reverse();
}
/** Feedback is app-owned and anchored to evidence, not unconstrained model prose.
 * Transcript differences are recognition observations, never proven phoneme errors.
 */
export function shadowFeedback(heard:string,target:string,relation:'target-attempt'|'unrelated'|'uncertain'){
 if(relation==='unrelated')return 'Nội dung máy nghe được khác câu mẫu. Con nghe lại mẫu rồi đọc đúng câu đang hiện nhé.';
 const diff=shadowDifferences(heard,target)[0];
 if(!diff)return 'Máy nghe được đủ từ theo câu mẫu. Con nghe lại bản thu và mẫu để so sánh cách ngắt cụm nhé.';
 if(diff.expected===null)return `Máy nghe thêm “${diff.heard}” ngoài câu mẫu. Con nghe lại bản thu và đọc đúng câu đang hiện nhé.`;
 if(diff.heard===null)return `Máy chưa nhận được “${diff.expected}” trong câu mẫu. Con nghe lại bản thu và đọc rõ cụm có từ này nhé.`;
 const suffix=diff.expected===`${diff.heard}s`?'đuôi -s':diff.expected===`${diff.heard}es`?'đuôi -es':diff.expected===`${diff.heard}ed`?'đuôi -ed':null;
 return `Câu mẫu là “${diff.expected}”, máy nghe “${diff.heard}”. ${suffix?`Con nghe lại ${suffix} trong từ mẫu rồi thử đọc rõ cả từ nhé.`:'Con nghe lại cụm có từ này và đọc theo đúng mẫu nhé.'}`;
}
