import type {PracticeFilter} from './practice-filter';
import type {Question,Session,Mode} from '@/data/local/practice';

export type CycleItem={key:string;senseId:string;revision:string;grammar?:{id:string;version:number;formula:string;example:string}};
export type PracticeCycle={id:string;scopeId:string;mode:Mode;filter:PracticeFilter;items:CycleItem[];createdAt:string};
export type SessionRow={deletedAt:string|null;updatedAt:string;payload:{session:Session}};

/** A day is an activity label, never part of a cycle's identity. */
export function activityDay(at=new Date()){
 return `${at.getFullYear()}-${String(at.getMonth()+1).padStart(2,'0')}-${String(at.getDate()).padStart(2,'0')}`;
}
export function cycleSelection(mode:string,filter:PracticeFilter={}){
 return JSON.stringify([mode,filter.deck??null,filter.lesson??null,filter.set??null,filter.word??null,!!filter.due,!!filter.weak,filter.direction??'en-vi']);
}
export function questionIdentity(question:Pick<Question,'word'|'grammar'>){
 return JSON.stringify([question.word.id,question.word.revision,question.grammar?.id??null,question.grammar?.version??null,question.grammar?.formula??null,question.grammar?.example??null]);
}
export function itemIdentity(item:CycleItem){
 return JSON.stringify([item.senseId,item.revision,item.grammar?.id??null,item.grammar?.version??null,item.grammar?.formula??null,item.grammar?.example??null]);
}
/** Includes tombstones: deleting a round releases only its unanswered items. */
export function coverageState(cycle:PracticeCycle,rows:SessionRow[],day=activityDay()){
 const keys=new Set(cycle.items.map(item=>item.key)),done=new Set<string>(),deferred=new Set<string>(),reserved=new Set<string>(),today=new Set<string>();
 let lastPlayedAt=cycle.createdAt;
 const active:Session[]=[];
 for(const row of rows){
  const session=row.payload.session;if(session.cycleId!==cycle.id)continue;
  if(row.updatedAt>lastPlayedAt)lastPlayedAt=row.updatedAt;
  const questions=new Map(session.questions.map(q=>[q.id,q]));
  for(const answer of session.answers){
   const question=questions.get(answer.questionId);const targets=question?.boardKeys??(question?.cycleKey?[question.cycleKey]:[]);
   for(const key of targets){if(!keys.has(key))continue;
    if(answer.skipped)deferred.add(key);else if(!question?.boardKeys||answer.coveredKeys?.includes(key)){done.add(key);if(answer.day===day)today.add(key);}
   }
  }
  if(!row.deletedAt&&!session.completedAt){active.push(session);for(const q of session.questions.slice(session.position))for(const key of q.boardKeys??(q.cycleKey?[q.cycleKey]:[]))if(keys.has(key))reserved.add(key);}
 }
 for(const key of done)deferred.delete(key);
 return {done,deferred,reserved,today,lastPlayedAt,active:active.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id))};
}
