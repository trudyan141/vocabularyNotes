import type {Question,Session} from '@/data/local/practice';
import {isPairGame} from './game-registry';
import {emptyGameState,gameMoveSchema,type GameMove,type GameState} from './game-activity';
import {shuffledTiles} from './grammar-game';
export function spellingHintTiles(word:string,seed:string){const tiles=shuffledTiles([...word].join(' '),seed);if(tiles.map(tile=>tile.text).join('')===word.replace(/\s/g,'')&&new Set(tiles.map(tile=>tile.text)).size>1)tiles.push(tiles.shift()!);return tiles;}
/** Prefer three pairs, splitting four as two plus two instead of leaving a singleton. */
export function groupPairQuestions(items:Question[]):Question[]{
 if(items.length<2)throw new Error('not-ready');const boards:Question[]=[];
 for(let i=0;i<items.length;){const size=items.length-i===4?2:Math.min(3,items.length-i),batch=items.slice(i,i+size);boards.push({...batch[0],choices:batch.map(q=>q.word),boardKeys:batch.map(q=>q.cycleKey!)});i+=size;}return boards;
}
export function hasSingletonBoard(session:Session){return isPairGame(session.mode)&&session.questions.slice(session.position).some(q=>q.choices.length<2);}
export function gameTiles(q:Question){return shuffledTiles([...q.word.word].join(' '),q.id);}
export function memoryCards(q:Question){return shuffledTiles(q.choices.map((_,i)=>`${i}:picture ${i}:word`).join(' '),q.id).map(tile=>{const [pair,side]=tile.text.split(':');return {pair:Number(pair),side};});}
export function moveGame(session:Session,input:GameMove):GameState{
 const move=gameMoveSchema.parse(input),q=session.questions[session.position],s=structuredClone(session.gameState??emptyGameState()),i=move.index??-1;
 const pair=isPairGame(session.mode),count=q.choices.length;
 if(pair){
  if(move.kind==='close'){s.open=[];return s;}
  if(session.mode==='match-pairs'){
   if(i<0||i>=count)throw new Error('invalid move');
   if(move.kind==='left'){if(s.matched.includes(i))throw new Error('invalid move');s.left=s.left===i?null:i;return s;}
   if(move.kind!=='right'||s.left===null||(s.matched.includes(s.left)||s.matched.includes(i)))throw new Error('invalid move');
   if(i===s.left)s.matched.push(i);else{s.mistakes++;s.wrong=[...new Set([...s.wrong,s.left,i])];}s.left=null;
  }else{
   const cards=memoryCards(q),card=cards[i];if(move.kind!=='flip'||!card||s.matched.includes(card.pair)||s.open.includes(i)||s.open.length===2)throw new Error('invalid move');
   s.open.push(i);if(s.open.length===2){const a=cards[s.open[0]],b=cards[s.open[1]];if(a.pair===b.pair){s.matched.push(a.pair);s.open=[];}else{s.mistakes++;s.wrong=[...new Set([...s.wrong,a.pair,b.pair])];}}
  }
 }else if(session.mode==='word-builder'){
  const tiles=gameTiles(q);if(move.kind==='reset')s.chosen=[];
  else if(move.kind==='pick'&&i>=0&&i<tiles.length&&!s.chosen.includes(i))s.chosen.push(i);
  else if(move.kind==='remove'&&i>=0&&i<s.chosen.length)s.chosen.splice(i,1);else throw new Error('invalid move');
 }else{
  if(!q.activity)throw new Error('invalid activity');
  if(move.kind==='error'&&q.activity.kind==='grammar-repair'&&i>=0&&i<q.activity.prompt.split(/\s+/).length)s.chosen=[i];
  else if(move.kind==='pick'&&i>=0&&i<q.activity.options.length&&(q.activity.kind!=='grammar-repair'||s.chosen.length>0))s.chosen=q.activity.kind==='grammar-repair'?[s.chosen[0]??-1,i]:[i];
  else if(move.kind==='reset'||move.kind==='remove')s.chosen=[];else throw new Error('invalid move');
 }
 return s;
}
export function gameAnswer(session:Session){const q=session.questions[session.position],s=session.gameState??emptyGameState();
 if(isPairGame(session.mode))return s.matched.length===q.choices.length?'complete':null;
 if(session.mode==='word-builder'){const tiles=gameTiles(q);return s.chosen.length===tiles.length?s.chosen.map(id=>tiles.find(tile=>tile.id===id)!.text).join(''):null;}
 const a=q.activity;if(!a)return null;if(a.kind==='grammar-repair')return s.chosen.length===2?`${s.chosen[0]}:${a.options[s.chosen[1]]}`:null;
 return s.chosen.length===1?a.options[s.chosen[0]]:null;
}
export function correctGame(session:Session){const q=session.questions[session.position],answer=gameAnswer(session),s=session.gameState??emptyGameState();if(answer===null)return false;
 if(isPairGame(session.mode))return s.mistakes===0;
 if(session.mode==='word-builder')return answer===q.word.word;
 return answer===(q.activity!.kind==='grammar-repair'?`${q.activity!.slot}:${q.activity!.answer}`:q.activity!.answer);
}

/** Validate restored/cloud DTOs before rendering indexed tile state. */
export function validExpansionSession(session:Session){
 const pair=isPairGame(session.mode),allKeys:string[]=[];
 if(!session.questions.length)return false;
 for(const q of session.questions){
  if(pair){
   if(!q.boardKeys||q.boardKeys.length!==q.choices.length||!q.choices.length||new Set(q.choices.map(w=>w.id)).size!==q.choices.length||q.choices[0]?.id!==q.word.id)return false;
   allKeys.push(...q.boardKeys);
  }else if(session.mode==='word-builder'){if(!/^[a-z]{2,8}$/i.test(q.word.word)||q.activity||q.boardKeys)return false;}
  else if(q.activity?.kind!==session.mode||!q.grammar||q.grammar.example!==q.activity.solution)return false;
 }
 if(new Set(allKeys).size!==allKeys.length)return false;
 for(const answer of session.answers){const q=session.questions.find(q=>q.id===answer.questionId);if(!q)return false;if(pair&&JSON.stringify(answer.coveredKeys)!==JSON.stringify(answer.skipped?[]:q.boardKeys))return false;}
 const s=session.gameState,q=session.questions[session.position];if(!s)return true;if(!q||new Set(s.matched).size!==s.matched.length||new Set(s.open).size!==s.open.length||new Set(s.wrong).size!==s.wrong.length)return false;
 if(pair)return [...s.matched,...s.wrong].every(i=>i<q.choices.length)&&s.open.every(i=>i<q.choices.length*2)&&(s.left===null||s.left<q.choices.length)&&s.chosen.length===0;
 if(session.mode==='word-builder')return new Set(s.chosen).size===s.chosen.length&&s.chosen.every(i=>i<q.word.word.length);
 const a=q.activity!;return a.kind==='grammar-repair'?s.chosen.length<=2&&(!s.chosen.length||s.chosen[0]<a.prompt.split(/\s+/).length)&&(s.chosen.length<2||s.chosen[1]<a.options.length):s.chosen.length<=1&&(!s.chosen.length||s.chosen[0]<a.options.length);
}
