import type {LibraryWord} from '@/data/local/types';
import type {GameActivity} from './game-activity';
import type {GrammarSnapshot} from './grammar-game';
export type DialogueScene={art:string;word:string;label:string;meaning:string};
export type DialogueRound={activity:GameActivity;scene:DialogueScene;wordId:string;grammar:GrammarSnapshot};
// Reuse the selected construction; never substitute an unrelated grammar family.
export function dialogueFrame(grammar:GrammarSnapshot){
 const example=grammar.example.trim();
 const question=/^Is (it|this|that) (?:a|an) [a-z][a-z -]*\?$/i.exec(example);
 if(question)return {subject:question[1].toLowerCase(),kind:'yes-no' as const};
 const statement=/^(It|This|That) is (?:a|an) [a-z][a-z -]*\.$/i.exec(example);
 if(statement)return {subject:statement[1].toLowerCase(),kind:'name' as const};
 const naming=/^What is (it|this|that)\?$/i.exec(example);
 return naming?{subject:naming[1].toLowerCase(),kind:'name' as const}:null;
}
function nounPhrase(word:LibraryWord){
 if(!['noun','danh từ'].includes(word.pos.trim().toLowerCase())||!word.approved||!word.art||!word.vi.trim()||!/^[a-z]+(?:[ -][a-z]+)*$/i.test(word.word))return null;
 // Countability/article come from an approved example, never spelling heuristics.
 const escaped=word.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const article=new RegExp(`\\b(a|an)\\s+${escaped}(?=[^a-z]|$)`,'i').exec(word.example)?.[1].toLowerCase();
 return article?`${article} ${word.word}`:null;
}
export function buildScopedDialogue(grammar:GrammarSnapshot,words:LibraryWord[]):DialogueRound[]{
 const frame=dialogueFrame(grammar);if(!frame)return [];
 const seen=new Set<string>(),eligible=words.flatMap(word=>{const phrase=nounPhrase(word),key=word.word.toLowerCase();if(!phrase||seen.has(key))return [];seen.add(key);return [{word,phrase}];});
 const subject=frame.subject,capital=subject[0].toUpperCase()+subject.slice(1);
 return eligible.flatMap(({word,phrase},index)=>{
  const peer=eligible.find(other=>other.word.id!==word.id&&other.word.art!==word.art&&other.word.vi!==word.vi);
  if(frame.kind==='name'&&!peer)return [];
  const asked=frame.kind==='yes-no'&&index%2===1&&peer?peer:{word,phrase};
  const yes=asked.word.id===word.id,prompt=frame.kind==='yes-no'?`Is ${subject} ${asked.phrase}?`:`What is ${subject}?`;
  const answer=frame.kind==='yes-no'?(yes?`Yes, it is.`:`No, it isn't.`):`${capital} is ${phrase}.`;
  const other=frame.kind==='yes-no'?(yes?`No, it isn't.`:`Yes, it is.`):`${capital} is ${peer!.phrase}.`;
  return [{wordId:word.id,grammar,scene:{art:word.art!,word:word.word,label:word.vi,meaning:frame.kind==='yes-no'?`Đây có phải là ${asked.word.vi} không?`:'Đây là cái gì?'},activity:{version:1,kind:'grammar-dialogue',context:`Hình là ${word.vi}.`,prompt,solution:answer,answer,options:[answer,other],translation:frame.kind==='yes-no'?(yes?'Đúng rồi.':'Không phải.'):`Đây là ${word.vi}.`,explanation:frame.kind==='yes-no'?`Hình là ${word.vi}. ${yes?'Đúng':'Khác'} với điều Cáo hỏi, nên con đáp ${answer}`:`Hình là ${word.vi}. Con dùng cấu trúc ${grammar.formula} để trả lời: ${answer}`}}];
 });
}
