import {z} from 'zod';
import {safeArt} from '@/lib/media/catalog';
import type {LocalRepository} from './repository';
import type {ScopedDocument} from './types';
import type {Session,Mode} from './practice';
import {practiceFilterSchema,type PracticeFilter} from '@/lib/learning/practice-filter';
import {coverageState,cycleSelection,type PracticeCycle,type SessionRow} from '@/lib/learning/coverage';

const id=z.string().min(1).max(200);
export const practiceCycleSchema=z.object({
 id,scopeId:id,mode:z.enum(['flashcard','picture-word','word-picture','letters','spelling','missing-letters','grammar','grammar-card']),filter:practiceFilterSchema,
 createdAt:z.iso.datetime(),items:z.array(z.object({key:id,senseId:id,revision:id,grammar:z.object({id,version:z.number().int().positive(),formula:z.string().max(10000),example:z.string().max(200)}).strict().optional()}).strict()).min(1).max(10000),
}).strict().superRefine((cycle,ctx)=>{if(new Set(cycle.items.map(item=>item.key)).size!==cycle.items.length)ctx.addIssue({code:'custom',message:'duplicate-cycle-item'});});
export type CycleProgress={cycle:PracticeCycle;done:number;total:number;unavailable:number;skipped:number;today:number;lastPlayedAt:string;complete:boolean;active?:Session};
export async function cycleRows(repo:LocalRepository){return repo.db.table<ScopedDocument>('practiceCycles').where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray();}
export async function latestCycle(repo:LocalRepository,mode:Mode,filter:PracticeFilter){
 const key=cycleSelection(mode,filter);
 return (await cycleRows(repo)).filter(row=>!row.deletedAt).map(row=>row.payload.cycle as PracticeCycle).filter(cycle=>cycleSelection(cycle.mode,cycle.filter)===key).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id))[0];
}
export async function cycleSessions(repo:LocalRepository){return await repo.db.table<ScopedDocument>('practiceSessions').where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray() as unknown as SessionRow[];}
export async function cycleState(repo:LocalRepository,cycle:PracticeCycle,rows?:SessionRow[]){
 const state=coverageState(cycle,rows??await cycleSessions(repo));
 const ids=[...new Set(cycle.items.map(item=>item.senseId))];
 const senses=await repo.db.senses.bulkGet(ids.map(id=>[repo.scope.id,id]));
 const entries=await repo.db.entries.bulkGet(senses.map(s=>[repo.scope.id,s?.entryId??'']));
 const words=new Map(senses.flatMap((s,i)=>s&&entries[i]?[ [s.id,{sense:s,entry:entries[i]!}] as const]:[]));
 const grammarIds=[...new Set(cycle.items.flatMap(item=>item.grammar?[item.grammar.id]:[]))];
 const grammar=new Map((await repo.db.table<ScopedDocument>('sentences').bulkGet(grammarIds.map(id=>[repo.scope.id,id]))).flatMap(row=>row?[[row.id,row] as const]:[]));
 const picture=cycle.mode==='picture-word'||cycle.mode==='word-picture';
 const unavailable=new Set(cycle.items.filter(item=>{
  if(state.done.has(item.key))return false;
  const word=words.get(item.senseId),g=item.grammar?grammar.get(item.grammar.id):null;
  return !word||picture&&!safeArt(word.sense.art)||word.sense.deletedAt||word.entry.deletedAt||word.sense.learningApprovalStatus!=='approved'||word.sense.approvedContentVersion!==word.sense.contentVersion||`${word.entry.version}:${word.sense.version}`!==item.revision||!!item.grammar&&(!g||!!g.deletedAt||g.version!==item.grammar.version);
 }).map(item=>item.key));
 return {...state,unavailable};
}
export async function cycleProgress(repo:LocalRepository,cycle:PracticeCycle,rows?:SessionRow[]):Promise<CycleProgress>{
 const state=await cycleState(repo,cycle,rows);
 const skipped=[...state.deferred].filter(key=>!state.unavailable.has(key)).length;
 return {cycle,done:state.done.size,total:cycle.items.length,unavailable:state.unavailable.size,skipped,today:state.today.size,lastPlayedAt:state.lastPlayedAt,complete:state.done.size+state.unavailable.size===cycle.items.length,active:state.active[0]};
}
