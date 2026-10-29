import {isExpansion,isPairGame,isGrammarGame,modeSchema} from '@/lib/learning/game-registry';
import {type GameState,type GameMove,type GameActivity} from '@/lib/learning/game-activity';
import {moveGame,gameAnswer,correctGame,groupPairQuestions,hasSingletonBoard} from '@/lib/learning/game-engine';
import {cycleState,cycleProgress,cycleRows,cycleSessions,latestCycle,practiceCycleSchema} from './practice-cycle';
import {activityDay,itemIdentity,questionIdentity,coverageState,cycleSelection,type PracticeCycle,type CycleItem} from '@/lib/learning/coverage';
import {practiceFilterSchema,type PracticeFilter} from '@/lib/learning/practice-filter';
import {eligibleMissingLetters,missingLetterPositions,missingLetters,validMissingPositions} from '@/lib/learning/missing-letters';
import {uniqueAggregateWords,aggregateWordId,withoutWordMemberships} from '@/lib/learning/library-search';
import {canonicalKey} from '@/domain/identity';
import {shuffled} from '@/lib/learning/random';
import {loadPicture} from '@/lib/media/load-picture';
import {approvedMedia} from './media';
import {grammarKey,groupContents,type StudyGroup} from './groups';
import {learningItems} from './learning-library';
import {currentActivities,type LearningContent} from './content';
import {sentenceTiles,type GrammarSnapshot} from '@/lib/learning/grammar-game';
import { z } from "zod";
import {safeArt} from "@/lib/media/catalog";
import type { LocalRepository } from "./repository";
import { RepositoryError } from "./repository";
import type { LibraryWord, ScopedDocument, SearchRow } from "./types";
import { answerKey, schedule, type Rating, type ReviewState } from "@/lib/learning/srs";
export type Mode=import("zod").infer<typeof modeSchema>;
export type Question={activity?:GameActivity;boardKeys?:string[];id:string;cycleKey?:string;word:LibraryWord;choices:LibraryWord[];missingIndex:number;missingIndices?:number[];grammar?:GrammarSnapshot};
export type Session={gameState?:GameState;id:string;cycleId?:string;scopeId:string;mode:Mode;filter?:PracticeFilter;direction?:"en-vi"|"vi-en";questions:Question[];position:number;revealed:boolean;hint:boolean;
  checkedAnswer:string|null;checkedCorrect:boolean|null;
  answers:{questionId:string;correct:boolean;skipped:boolean;hint:boolean;rating:Rating|null;answeredAt?:string;day?:string;timezone?:string;coveredKeys?:string[]}[];completedAt:string|null;version:number;createdAt:string};
export const sessionStarted=(session:Session)=>session.position>0||session.answers.length>0||session.checkedAnswer!==null||!!session.gameState;
const modes=modeSchema;
export class PracticeRepository{
  private pictures=new Map<string,Promise<boolean>>();
  private failedPictures=new Set<string>();
  constructor(readonly repository:LocalRepository,private readonly imageLoads=loadPicture){}
  pictureFailed(art:string){this.failedPictures.add(art);}
  private async pictureLoads(word:LibraryWord){
    const art=safeArt(word.art);if(!art||this.failedPictures.has(art))return false;
    let src=art.startsWith('online-openmoji-')?`/illustrations/online/${art.slice(16)}`:art.startsWith('openmoji-')?`/illustrations/openmoji/${art.slice(9)}.svg`:`/illustrations/${art}.svg`;
    if(art.startsWith('media-')){const asset=await approvedMedia(this.repository,art,word.word);if(!asset)return false;src=`data:image/jpeg;base64,${asset.base64}`;}
    const key=`${word.id}:${word.revision}:${art}`;
    if(!this.pictures.has(key))this.pictures.set(key,this.imageLoads(src).catch(()=>false));
    return this.pictures.get(key)!;
  }
  private async picturedWords(words:LibraryWord[],limit=Number.POSITIVE_INFINITY){
    const result:LibraryWord[]=[];
    // Bound online downloads; missing images never become default game artwork.
    for(let i=0;i<words.length&&result.length<limit;){const chunk=words.slice(i,i+Math.min(2,limit-result.length)),ready=await Promise.all(chunk.map(word=>this.pictureLoads(word)));result.push(...chunk.filter((_,i)=>ready[i]));i+=chunk.length;}
    return result;
  }
  async pictureSessionLoaded(session:Session){
    if(!await this.pictureSessionCurrent(session))return false;
    if(session.mode!=='picture-word'&&session.mode!=='word-picture'&&!isPairGame(session.mode))return true;
    const words=[...new Map(session.questions.flatMap(q=>[q.word,...q.choices]).map(word=>[word.id,word])).values()];
    return (await this.picturedWords(words)).length===words.length;
  }
  private get table(){return this.repository.db.table<ScopedDocument>("practiceSessions");}
  private async sessionCurrent(session:Session){
    if(session.completedAt)return true;
    const current=await this.repository.words(session.questions.map(q=>q.word.id));
    return session.questions.every(q=>current.some(w=>w.id===q.word.id&&w.approved&&w.revision===q.word.revision))&&await this.pictureSessionLoaded(session)&&(await Promise.all(session.questions.map(q=>this.grammarCurrent(q)))).every(Boolean);
  }
  /** Load this URL's session only; unrelated saved rounds must not block it. */
  async loadSession(id:string){const session=await this.get(id);if(session&&!session.completedAt&&hasSingletonBoard(session))return this.start(session.mode,session.filter??{});return session&&await this.sessionCurrent(session)?session:undefined;}
  private async visibleSessions(resumable=false){
    const rows=await this.table.where('[scopeId+id]').between([this.repository.scope.id,''],[this.repository.scope.id,'\uffff']).toArray();
    const sessions=rows.filter(row=>!row.deletedAt).map(row=>row.payload.session as Session).filter(session=>session&&(!resumable||!session.completedAt&&sessionStarted(session))).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const visible:Session[]=[];for(const session of sessions)if(await this.sessionCurrent(session))visible.push(session);return visible;
  }
  async sessions(){return this.visibleSessions();}
  async resumableSessions(){return this.visibleSessions(true);}
  async discardUnstarted(id:string){
    return this.repository.db.transaction('rw',this.table,async()=>{
      const row=await this.table.get([this.repository.scope.id,id]);const session=row?.payload.session as Session|undefined;
      if(!row||row.deletedAt||!session||session.completedAt||sessionStarted(session))return;
      const at=new Date().toISOString();await this.table.put({...row,version:row.version+1,updatedAt:at,deletedAt:at});
    });
  }
  async historyPage(page:number,includeRows=true){
    z.number().int().nonnegative().parse(page);
    return this.repository.db.transaction('r',this.table,async()=>{
      const rows=()=>this.table.where('[scopeId+createdAt]').between([this.repository.scope.id,''],[this.repository.scope.id,'\uffff']).reverse().filter(row=>!row.deletedAt&&!!(row.payload.session as Session)?.completedAt);
      const total=await rows().count(),currentPage=Math.min(page,Math.max(0,Math.ceil(total/10)-1));
      const sessions=includeRows?(await rows().offset(currentPage*10).limit(10).toArray()).map(row=>row.payload.session as Session):[];
      return {total,page:currentPage,sessions};
    });
  }
  async get(id:string){const row=await this.table.get([this.repository.scope.id,id]);return row&&!row.deletedAt?row.payload.session as Session:undefined;}
  async remove(id:string,version:number){
    this.repository.assertContentWritable();
    return this.repository.db.transaction('rw',this.table,async()=>{
      const row=await this.table.get([this.repository.scope.id,id]);
      if(!row||row.deletedAt)throw new RepositoryError('missing');
      if(row.version!==version)throw new RepositoryError('conflict');
      const at=new Date().toISOString();
      await this.table.put({...row,version:row.version+1,updatedAt:at,deletedAt:at});
    });
  }
  async removeProgress(id:string){
    this.repository.assertContentWritable();
    const repo=this.repository,cycles=repo.db.table<ScopedDocument>('practiceCycles');
    return repo.db.transaction('rw',cycles,this.table,async()=>{
      const row=await cycles.get([repo.scope.id,id]);if(!row||row.deletedAt)throw new RepositoryError('missing');
      const cycle=row.payload.cycle as PracticeCycle;
      if((await latestCycle(repo,cycle.mode,cycle.filter))?.id!==id)throw new RepositoryError('conflict');
      const at=new Date().toISOString();await cycles.put({...row,version:row.version+1,updatedAt:at,deletedAt:at});
      for(const saved of await this.table.where('[scopeId+id]').between([repo.scope.id,''],[repo.scope.id,'\uffff']).toArray()){const session=saved.payload.session as Session;if(!saved.deletedAt&&session.cycleId===id&&!session.completedAt)await this.table.put({...saved,version:saved.version+1,updatedAt:at,deletedAt:at});}
    });
  }
  async dueIds(){
    const scope=this.repository.scope.id;
    const [index,states]=await Promise.all([
      this.repository.db.searchIndex.where("[scopeId+ordinal]").between([scope,""],[scope,"\uffff"]).toArray(),
      this.repository.db.table<ScopedDocument>("reviewStates").where("[scopeId+id]").between([scope,""],[scope,"\uffff"]).toArray(),
    ]);
    const map=new Map(states.filter(row=>!row.deletedAt).map(row=>[row.id,row.payload.state as ReviewState]));
    const now=Date.now();return index.filter(row=>row.approval&&(!map.has(row.id)||Date.parse(map.get(row.id)!.dueAt)<=now)).map(row=>row.id);
  }
  async dueSummary(){
    const scope=this.repository.scope.id;
    return this.repository.db.transaction('r',[this.repository.db.searchIndex,this.repository.db.table('reviewStates'),this.repository.db.senses,this.repository.db.entries],async()=>{
      const [due,senses,entries]=await Promise.all([
        this.dueIds(),
        this.repository.db.senses.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray(),
        this.repository.db.entries.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray(),
      ]);
      const ids=new Set(due),lexemes=new Map(entries.filter(entry=>!entry.deletedAt).map(entry=>[entry.id,entry]));
      const words=new Set<string>(),meanings=new Set<string>();
      for(const sense of senses){
        if(!ids.has(sense.id)||sense.deletedAt||sense.learningApprovalStatus!=='approved'||sense.approvedContentVersion!==sense.contentVersion)continue;
        const entry=lexemes.get(sense.entryId);if(!entry)continue;
        const written=[canonicalKey(entry.displayText,entry.caseMode),entry.caseMode];
        words.add(JSON.stringify(written));meanings.add(JSON.stringify([...written,sense.pos,aggregateWordId(sense)]));
      }
      return {words:words.size,senses:meanings.size};
    });
  }
  private async candidates(filter:PracticeFilter,existingIndex?:SearchRow[]){
    const scope=this.repository.scope.id;
    const index=existingIndex??await this.repository.db.searchIndex.where('[scopeId+ordinal]').between([scope,''],[scope,'\uffff']).toArray();
    let candidates=index.filter(row=>row.approval&&(!filter.lesson||row.lessonIds.includes(filter.lesson)));
    if(filter.deck){const row=await this.repository.db.table<ScopedDocument>("decks").get([scope,filter.deck]);if(!row||row.deletedAt)throw new RepositoryError("not-ready");const deck=row.payload.deck as {senseIds:string[];group?:{wordIds:string[]}};const set=filter.set?(await groupContents(this.repository,row as StudyGroup)).sets.find(set=>set.id===filter.set):null;if(filter.set&&!set)throw new RepositoryError('not-ready');const ids=set?.wordIds??deck.group?.wordIds??deck.senseIds;candidates=candidates.filter(row=>ids.includes(row.id));}
    if(filter.word)candidates=candidates.filter(row=>row.id===filter.word);
    if(filter.due){const ids=new Set(await this.dueIds());candidates=candidates.filter(row=>ids.has(row.id));}
    if(filter.weak){const attempts=await this.repository.db.table<ScopedDocument>("gameAttempts").where("[scopeId+id]").between([scope,""],[scope,"\uffff"]).toArray();const latest=new Map<string,ScopedDocument>();for(const attempt of attempts.filter(a=>typeof a.payload.understood!=='boolean').sort((a,b)=>a.updatedAt.localeCompare(b.updatedAt)))latest.set(attempt.payload.senseId as string,attempt);candidates=candidates.filter(row=>{const attempt=latest.get(row.id);return attempt&&(!attempt.payload.correct||attempt.payload.hint);});}
    return candidates;
  }
  async speakingWords(filter:PracticeFilter){
    return uniqueAggregateWords((await this.repository.words((await this.candidates(filter)).map(row=>row.id))).filter(word=>word.approved));
  }
  async shadowGrammar(filter:PracticeFilter){try{return (await this.grammarQuestions('grammar-card',filter)).map(q=>q.grammar!);}catch(error){if(error instanceof RepositoryError&&error.code==='not-ready')return [];throw error;}}
  async dialogueInputs(filter:PracticeFilter){return this.gameInputs(filter);}
  async gameInputs(filter:PracticeFilter){
    const selected=await this.speakingWords(filter);
    const words=await this.picturedWords(selected.filter(word=>!!safeArt(word.art)));
    let questions:Question[]=[];
    try{questions=await this.grammarQuestions('grammar-card',filter);}catch(cause){if(!(cause instanceof RepositoryError)||cause.code!=='not-ready')throw cause;}
    const seen=new Set<string>();
    const grammars=questions.flatMap(q=>{const grammar=q.grammar!,key=JSON.stringify([grammar.id,grammar.formula,grammar.example]);if(seen.has(key))return [];seen.add(key);return [grammar];}).sort((a,b)=>a.formula.localeCompare(b.formula)||a.id.localeCompare(b.id));
    return {words,grammars};
  }
  private async roundWords(rows:SearchRow[],mode:Mode,limit=10,orderedIds?:string[]){
    const scope=this.repository.scope.id,selected=new Set(rows.map(row=>row.id));
    // Group explicit source aliases before the draw, retaining their primary ID.
    const senses=await this.repository.db.senses.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray();
    const groups=new Map<string,string>();
    for(const sense of senses){
      if(!selected.has(sense.id)||sense.deletedAt||sense.learningApprovalStatus!=='approved'||sense.approvedContentVersion!==sense.contentVersion)continue;
      const aggregate=aggregateWordId(sense),key=JSON.stringify([sense.entryId,sense.pos,aggregate]);
      if(!groups.has(key)||sense.id===aggregate)groups.set(key,sense.id);
    }
    const ids=orderedIds??shuffled([...groups.values()]),words:LibraryWord[]=[];
    for(let i=0;i<ids.length&&words.length<limit;i+=16){
      const batch=await this.repository.words(ids.slice(i,i+16));
      for(const word of batch){
        if(!word.approved||!word.vi.trim()||!word.en.trim())continue;
        if(mode==='word-builder'&&!/^[a-z]{2,8}$/i.test(word.word))continue;
        if(mode==='letters'&&!/^[a-z]{2,30}$/i.test(word.word))continue;
        if(mode==='missing-letters'&&!eligibleMissingLetters(word.word))continue;
        words.push(word);if(words.length===limit)break;
      }
    }
    return words;
  }
  private async wordCycleItems(mode:Mode,filter:PracticeFilter):Promise<CycleItem[]>{
    const rows=await this.candidates(filter),selected=new Set(rows.map(row=>row.id)),scope=this.repository.scope.id;
    const [senses,entries]=await Promise.all([
      this.repository.db.senses.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray(),
      this.repository.db.entries.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray(),
    ]);
    const lexemes=new Map(entries.filter(e=>!e.deletedAt).map(e=>[e.id,e])),groups=new Map<string,CycleItem>();
    for(const sense of senses){
      const entry=lexemes.get(sense.entryId);
      if(!selected.has(sense.id)||!entry||sense.deletedAt||sense.learningApprovalStatus!=='approved'||sense.approvedContentVersion!==sense.contentVersion||!sense.meaningVi.trim()||!sense.definitionEn.trim())continue;
      if(mode==='word-builder'&&!/^[a-z]{2,8}$/i.test(entry.displayText))continue;
      if(mode==='letters'&&!/^[a-z]{2,30}$/i.test(entry.displayText)||mode==='missing-letters'&&!eligibleMissingLetters(entry.displayText))continue;
      const aggregate=aggregateWordId(sense),key=JSON.stringify([entry.id,sense.pos,aggregate]);
      if(!groups.has(key)||sense.id===aggregate)groups.set(key,{key:crypto.randomUUID(),senseId:sense.id,revision:`${entry.version}:${sense.version}`});
    }
    return shuffled([...groups.values()]);
  }
  async progress(cycleId:string){
    const row=await this.repository.db.table<ScopedDocument>('practiceCycles').get([this.repository.scope.id,cycleId]);
    return row&&!row.deletedAt?cycleProgress(this.repository,row.payload.cycle as PracticeCycle):null;
  }
  async progressForSelection(filter:PracticeFilter){
    const rows=await cycleRows(this.repository),latest=new Map<string,ScopedDocument>();
    for(const row of rows.sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id))){
      const cycle=row.payload.cycle as PracticeCycle;
      if(cycleSelection(cycle.mode,cycle.filter)===cycleSelection(cycle.mode,filter))latest.set(cycle.mode,row);
    }
    const sessions=await cycleSessions(this.repository);
    return Promise.all([...latest.values()].filter(row=>!row.deletedAt).map(row=>cycleProgress(this.repository,row.payload.cycle as PracticeCycle,sessions)));
  }
  async start(mode:Mode,filter:PracticeFilter={},newCycle=false):Promise<Session>{
    modes.parse(mode);practiceFilterSchema.parse(filter);
    if(!this.repository.canPractice)throw new RepositoryError('not-ready');
    this.pictures.clear();this.failedPictures.clear();
    const repo=this.repository,previous=await latestCycle(repo,mode,filter);
    let cycle=previous;
    const oldState=cycle?await cycleState(repo,cycle):null;
    if(oldState?.active.length){
      for(const active of oldState.active)if(!hasSingletonBoard(active)&&await this.sessionCurrent(active))return active;
    }
    if(newCycle&&cycle&&oldState&&oldState.done.size+oldState.unavailable.size!==cycle.items.length)throw new RepositoryError('conflict');
    if(!cycle||newCycle){
      const picture=mode==='picture-word'||mode==='word-picture'||isPairGame(mode),grammar=isGrammarGame(mode);
      const items=grammar||picture?(await (grammar?this.grammarQuestions(mode,filter):isPairGame(mode)?this.pairQuestions(filter,undefined,true):this.wordQuestions(mode,filter,undefined,true))).map(q=>({key:crypto.randomUUID(),senseId:q.word.id,revision:q.word.revision,...(q.grammar?{grammar:{id:q.grammar.id,version:q.grammar.version,formula:q.grammar.formula,example:q.grammar.example}}:{})})):await this.wordCycleItems(mode,filter);
      if(!items.length)throw new RepositoryError('not-ready');
      cycle=practiceCycleSchema.parse({id:crypto.randomUUID(),scopeId:repo.scope.id,mode,filter,createdAt:new Date(Math.max(Date.now(),previous?Date.parse(previous.createdAt)+1:0)).toISOString(),items});
    }
    const state=await cycleState(repo,cycle);
    if(state.done.size+state.unavailable.size===cycle.items.length)throw new RepositoryError('complete');
    const remaining=cycle.items.filter(item=>!state.done.has(item.key)&&!state.unavailable.has(item.key));
    remaining.sort((a,b)=>Number(state.deferred.has(a.key))-Number(state.deferred.has(b.key)));
    const allowed=new Set(remaining.map(itemIdentity)),byIdentity=new Map(remaining.map(item=>[itemIdentity(item),item.key]));
    const all=isGrammarGame(mode)?(await this.grammarQuestions(mode,filter,cycle)).filter(q=>allowed.has(questionIdentity(q))):isPairGame(mode)?await this.pairQuestions(filter,remaining.map(item=>item.senseId)):await this.wordQuestions(mode,filter,remaining.map(item=>item.senseId));
    const positions=new Map(remaining.map((item,i)=>[itemIdentity(item),i]));
    let questions:Question[]=all.filter(q=>allowed.has(questionIdentity(q))).sort((a,b)=>positions.get(questionIdentity(a))!-positions.get(questionIdentity(b))!).slice(0,isPairGame(mode)&&remaining.length===11?9:10).map(q=>({...q,cycleKey:byIdentity.get(questionIdentity(q))!}));
    if(isPairGame(mode)&&questions.length){
      if(questions.length===1){
        const target=questions[0],doneItems=cycle.items.filter(item=>state.done.has(item.key)&&!state.unavailable.has(item.key));
        const peers=await this.pairQuestions(filter,[target.word.id,...doneItems.map(item=>item.senseId)]);
        const peer=peers.find(q=>q.word.id!==target.word.id&&q.word.art!==target.word.art&&q.word.vi!==target.word.vi&&doneItems.some(item=>item.senseId===q.word.id&&item.revision===q.word.revision));
        if(!peer)throw new RepositoryError('not-ready');questions.push({...peer,cycleKey:doneItems.find(item=>item.senseId===peer.word.id&&item.revision===peer.word.revision)!.key});
      }
      questions=groupPairQuestions(questions);
    }
    if(!questions.length)throw new RepositoryError('not-ready');
    const at=new Date().toISOString(),session:Session={id:crypto.randomUUID(),scopeId:repo.scope.id,mode,filter,direction:filter.direction??'en-vi',cycleId:cycle.id,questions,position:0,revealed:false,hint:false,checkedAnswer:null,checkedCorrect:null,answers:[],completedAt:null,version:1,createdAt:at};
    const prepared=cycle;
    return repo.db.transaction('rw',repo.db.tables,async()=>{
      const currentCycle=await latestCycle(repo,mode,filter);
      if(currentCycle?.id!==previous?.id){
        if(currentCycle){const current=coverageState(currentCycle,await cycleSessions(repo)).active[0];if(current&&!hasSingletonBoard(current))return current;}
        throw new RepositoryError('conflict');
      }
      const current=await cycleState(repo,prepared);
      if(state.lastPlayedAt!==current.lastPlayedAt||state.active.length!==current.active.length||state.active.some(s=>!current.active.some(c=>c.id===s.id&&c.version===s.version)))throw new RepositoryError('conflict');
      if(questions.some(q=>{const keys=q.boardKeys??[q.cycleKey!];return keys.some(key=>current.unavailable.has(key))||(isPairGame(mode)?keys.every(key=>current.done.has(key)):keys.some(key=>current.done.has(key)));}))throw new RepositoryError('conflict');
      const words=await repo.words(questions.map(q=>q.word.id));
      if(questions.some(q=>!words.some(w=>w.id===q.word.id&&w.approved&&w.revision===q.word.revision))||!await this.pictureSessionCurrent(session)||(await Promise.all(questions.map(q=>this.grammarCurrent(q)))).some(ok=>!ok))throw new RepositoryError('conflict');
      // Stale rounds keep their answered prefix for coverage/history; only unused
      // reservations are released when the user explicitly continues this set.
      for(const active of current.active){const row=await this.table.get([repo.scope.id,active.id]);if(row)await this.table.put({...row,deletedAt:at,updatedAt:at,version:row.version+1});}
      if(prepared.id!==previous?.id)await repo.db.table<ScopedDocument>('practiceCycles').add({scopeId:repo.scope.id,id:prepared.id,version:1,createdAt:prepared.createdAt,updatedAt:prepared.createdAt,deletedAt:null,payload:{cycle:prepared}});
      await this.table.add({scopeId:repo.scope.id,id:session.id,createdAt:at,updatedAt:at,version:1,deletedAt:null,payload:{session}});
      return session;
    });
  }
  private async pairQuestions(filter:PracticeFilter,orderedIds?:string[],poolOnly=false):Promise<Question[]>{
    const rows=await this.candidates(filter),words=uniqueAggregateWords(await this.repository.words((orderedIds??rows.map(row=>row.id))));
    const seenWords=new Set<string>(),seenArt=new Set<string>(),seenMeanings=new Set<string>();
    const eligible=words.filter(word=>{const key=answerKey(word.word,word.caseMode);if(!word.approved||!safeArt(word.art)||seenWords.has(key)||seenArt.has(word.art!)||seenMeanings.has(word.vi))return false;seenWords.add(key);seenArt.add(word.art!);seenMeanings.add(word.vi);return true;});
    if(poolOnly&&eligible.length<2)throw new RepositoryError('not-ready');
    const ready=poolOnly?shuffled(eligible):await this.picturedWords(eligible,10);
    return ready.map(word=>({id:crypto.randomUUID(),word:withoutWordMemberships(word),choices:[],missingIndex:0}));
  }
  private async wordQuestions(mode:Mode,filter:PracticeFilter,orderedIds?:string[],poolOnly=false):Promise<Question[]>{
    const scope=this.repository.scope.id;
    const index=await this.repository.db.searchIndex.where('[scopeId+ordinal]').between([scope,''],[scope,'\uffff']).toArray();
    const pictureGame=mode==='picture-word'||mode==='word-picture'||isPairGame(mode);
    const orderedSet=new Set(orderedIds);
    const selectedRows=orderedIds?index.filter(row=>orderedSet.has(row.id)&&row.approval):await this.candidates(filter,index),selected=new Set(selectedRows.map(row=>row.id));
    const choiceScope=pictureGame?new Set((await this.candidates({...filter,word:undefined,due:false,weak:false},index)).map(row=>row.id)):new Set<string>();
    let candidates=index.filter(row=>row.approval);
    if(pictureGame)candidates=candidates.filter(row=>!!safeArt(row.art));
    const picture=(word:LibraryWord)=>!!safeArt(word.art)&&word.approved&&!(["intelligent","smart","clever"].includes(word.word.toLowerCase())&&word.pos==="adjective");
    const distractorWords=pictureGame?(await this.repository.words(candidates.map(row=>row.id))).filter(picture):[];
    candidates=candidates.filter(row=>selected.has(row.id));
    let words=pictureGame?(await this.repository.words(candidates.map(row=>row.id))).filter(word=>word.vi.trim()&&word.en.trim()):await this.roundWords(selectedRows,mode,poolOnly?Number.POSITIVE_INFINITY:10,orderedIds);
    if(pictureGame)words=words.filter(word=>picture(word)&&distractorWords.some(ready=>ready.id===word.id&&ready.revision===word.revision&&ready.art===word.art));
    if(mode==="letters")words=words.filter(word=>/^[a-z]{2,30}$/i.test(word.word));
    if(mode==="missing-letters")words=words.filter(word=>eligibleMissingLetters(word.word));
    const unique=distractorWords.filter((word,i)=>distractorWords.findIndex(other=>answerKey(other.word,other.caseMode)===answerKey(word.word,word.caseMode))===i);
    const distractorPool=pictureGame?unique:[];
    if(pictureGame&&unique.length<3)throw new RepositoryError("not-ready");
    if(!words.length)throw new RepositoryError("not-ready");
    if(poolOnly)return shuffled(uniqueAggregateWords(words)).filter(word=>!pictureGame||distractorPool.filter(other=>answerKey(other.word,other.caseMode)!==answerKey(word.word,word.caseMode)&&other.vi!==word.vi&&other.art!==word.art).length>=2).map(word=>({id:crypto.randomUUID(),word:withoutWordMemberships(word),choices:[],missingIndex:0}));
    const order=new Map(orderedIds?.map((id,i)=>[id,i]));
    const questions:Question[]=[],targets=orderedIds?uniqueAggregateWords(words).sort((a,b)=>(order.get(a.id)??0)-(order.get(b.id)??0)):shuffled(uniqueAggregateWords(words)),decoded=new Set<string>();
    // Draw from the full pool, but decode only this round's targets and choices.
    // Continue past unavailable candidates without limiting eligibility to a prefix.
    for(let offset=0;offset<targets.length&&questions.length<10;offset+=10){
      const batch=targets.slice(offset,offset+10),ready=pictureGame?await this.picturedWords(batch):batch;
      for(const word of ready)decoded.add(word.id);
      for(const word of ready){
        const eligible=distractorPool.filter(other=>answerKey(other.word,other.caseMode)!==answerKey(word.word,word.caseMode)&&other.vi!==word.vi&&other.art!==word.art);
        const peers=shuffled(eligible.filter(other=>choiceScope.has(other.id)));
        // Reuse decoded choices within the same lesson/group before fetching more.
        if(pictureGame)peers.sort((a,b)=>Number(decoded.has(b.id))-Number(decoded.has(a.id)));
        const preferred=pictureGame?await this.picturedWords(peers,2):peers.slice(0,2);
        const outside=shuffled(eligible.filter(other=>!choiceScope.has(other.id)));
        if(pictureGame)outside.sort((a,b)=>Number(decoded.has(b.id))-Number(decoded.has(a.id)));
        const fallback=pictureGame?await this.picturedWords(outside,2-preferred.length):outside.slice(0,2-preferred.length);
        for(const choice of [...preferred,...fallback])decoded.add(choice.id);
        const choices=shuffled([word,...preferred,...fallback]);
        if(pictureGame&&choices.length<3)continue;
        const missingIndices=(mode==='missing-letters'||mode==='letters')?missingLetterPositions(word.word):undefined;
        questions.push({id:crypto.randomUUID(),word:withoutWordMemberships(word),choices:choices.map(withoutWordMemberships),missingIndex:missingIndices?.[0]??Math.max(0,Math.floor(word.word.length/2)),...(missingIndices?{missingIndices}:{})});
        if(questions.length===10)break;
      }
    }
    if(!questions.length)throw new RepositoryError("not-ready");
    return questions;
  }
  private async grammarQuestions(mode:Mode,filter:PracticeFilter,cycle?:PracticeCycle):Promise<Question[]>{
    const items=(await learningItems(this.repository,'grammar','',cycle?null:filter.lesson??null,0,Number.MAX_SAFE_INTEGER)).items;
    const deck=!cycle&&filter.deck?(await this.repository.db.table<ScopedDocument>('decks').get([this.repository.scope.id,filter.deck])):null;
    if(!cycle&&filter.deck&&(!deck||deck.deletedAt))throw new RepositoryError('not-ready');
    const group=(deck?.payload.deck as import('./decks').Deck|undefined)?.group;
    const set=filter.set&&deck?(await groupContents(this.repository,deck as StudyGroup)).sets.find(set=>set.id===filter.set):null;
    if(!cycle&&filter.set&&!set)throw new RepositoryError('not-ready');
    const families=items.filter(item=>cycle||(!set||set.grammarKeys.includes(grammarKey(item))||item.related?.some(child=>set.grammarKeys.includes(grammarKey(child))))&&(!filter.word||item.senseId===filter.word)&&(!filter.deck||!!group?.grammar?.some(ref=>ref.senseId===item.senseId&&ref.key===grammarKey(item)||item.related?.some(child=>ref.senseId===child.senseId&&ref.key===grammarKey(child)))));
    const expanded=families.flatMap(item=>[item,...(item.related??[]),...(item.variants??[]).map(variant=>({...item,related:undefined,variants:undefined,textEn:variant.formula,example:variant.example,exampleVi:variant.exampleVi,exampleIpa:variant.exampleIpa,analysis:variant.analysis}))]);
    const seen=new Set<string>();const eligible=expanded.filter(item=>{const identity=JSON.stringify([item.example,item.exampleVi,item.textEn]);if(seen.has(identity))return false;seen.add(identity);return true;}).filter(item=>item.table==='sentences'&&item.example&&item.exampleVi&&item.example.length<=200&&sentenceTiles(item.example).length>=2&&sentenceTiles(item.example).length<=12);
    const words=await this.repository.words([...new Set(eligible.map(item=>item.senseId))]);
    const questions:Question[]=shuffled(eligible).flatMap(item=>{const word=words.find(word=>word.id===item.senseId&&word.approved);return word?[{id:crypto.randomUUID(),word:withoutWordMemberships(word),choices:[],missingIndex:0,grammar:{id:item.id,version:item.version,formula:item.textEn,title:item.title,conditions:item.conditions||item.textVi,analysis:item.analysis||undefined,example:item.example!,exampleVi:item.exampleVi!,...(item.exampleIpa?{exampleIpa:item.exampleIpa}:{})}}]:[];});
    if(isExpansion(mode)){
      const generated:Question[]=[];
      for(const q of questions){const row=await this.repository.db.table<ScopedDocument>('sentences').get([this.repository.scope.id,q.grammar!.id]);const content=row?.payload.content as LearningContent|undefined;
       const activity=content&&(await currentActivities(content)).find(a=>a.kind===mode);if(!activity)continue;
       if(generated.some(existing=>existing.grammar?.id===q.grammar!.id))continue;
       generated.push({...q,activity,grammar:{...q.grammar!,example:activity.solution,exampleVi:activity.translation,exampleIpa:activity.solutionIpa}});
      }return generated;
    }
    if(!questions.length)throw new RepositoryError('not-ready');
    return questions;
  }
  async replay(id:string,reviewOnly=false):Promise<Session>{
    const original=await this.get(id);if(!original)throw new RepositoryError('missing');
    if(!await this.pictureSessionLoaded(original))throw new RepositoryError('conflict');
    let replayQuestions=reviewOnly?original.questions.filter(q=>original.answers.some(a=>a.questionId===q.id&&!a.correct)):original.questions;
    if(isPairGame(original.mode)&&replayQuestions.some(q=>q.choices.length<2)){
      const unique=[...new Map(replayQuestions.flatMap(q=>q.choices).map(word=>[word.id,word])).values()];
      if(unique.length===1){const peers=await this.pairQuestions(original.filter??{});const peer=peers.find(q=>q.word.id!==unique[0].id&&q.word.art!==unique[0].art&&q.word.vi!==unique[0].vi);if(!peer)throw new RepositoryError('not-ready');unique.push(peer.word);}
      replayQuestions=groupPairQuestions(unique.map(word=>({id:crypto.randomUUID(),word,choices:[],missingIndex:0,cycleKey:crypto.randomUUID()})));
    }
    return this.repository.db.transaction('rw',this.repository.db.tables,async()=>{
      const saved=await this.get(id);if(!saved||saved.version!==original.version)throw new RepositoryError('conflict');
      const questions=replayQuestions;
      if(reviewOnly&&!saved.completedAt||!questions.length)throw new RepositoryError('not-ready');
      const current=await this.repository.words(questions.map(q=>q.word.id));
      if(!questions.length||!questions.every(q=>current.some(w=>w.id===q.word.id&&w.approved&&w.revision===q.word.revision))||!await this.pictureSessionCurrent({...saved,questions})||(await Promise.all(questions.map(q=>this.grammarCurrent(q)))).some(valid=>!valid))throw new RepositoryError('conflict');
      const at=new Date().toISOString();
      const next:Session={...saved,cycleId:undefined,id:crypto.randomUUID(),gameState:undefined,questions:shuffled(questions).map(q=>({...q,id:crypto.randomUUID()})),position:0,revealed:false,hint:false,checkedAnswer:null,checkedCorrect:null,answers:[],completedAt:null,version:1,createdAt:at};
      await this.table.add({scopeId:next.scopeId,id:next.id,createdAt:at,updatedAt:at,version:1,deletedAt:null,payload:{session:next}});return next;
    });
  }
  async pictureSessionCurrent(session:Session){
    if(session.mode!=='picture-word'&&session.mode!=='word-picture'&&!isPairGame(session.mode))return true;
    const snapshots=session.questions.flatMap(question=>[question.word,...question.choices]);
    const current=await this.repository.words([...new Set(snapshots.map(word=>word.id))]);const byId=new Map(current.map(word=>[word.id,word]));
    return snapshots.every(snapshot=>{const word=byId.get(snapshot.id);return word?.approved&&!!safeArt(word.art)&&!this.failedPictures.has(word.art!)&&word.art===snapshot.art&&word.revision===snapshot.revision;});
  }
  private async grammarCurrent(question:Question){if(!question.grammar)return true;const row=await this.repository.db.table<ScopedDocument>('sentences').get([this.repository.scope.id,question.grammar.id]);const content=row?.payload.content as LearningContent|undefined;return !!row&&!row.deletedAt&&row.version===question.grammar.version&&!!content?.approved&&content.targetRevision===question.word.revision;}
  async reveal(id:string,version:number,hint=false){
    const pending=await this.get(id);if(pending&&!await this.pictureSessionLoaded(pending))throw new RepositoryError('conflict');
    return this.repository.db.transaction("rw",this.repository.db.tables,async()=>{
      const session=await this.get(id);if(!session)throw new RepositoryError("missing");
      if(session.version!==version||session.completedAt||!await this.pictureSessionCurrent(session))throw new RepositoryError("conflict");
      const question=session.questions[session.position],current=question&&await this.repository.word(question.word.id);if(!current?.approved||current.revision!==question.word.revision||!await this.grammarCurrent(question))throw new RepositoryError("conflict");
      const next={...session,revealed:hint?session.revealed:true,hint:session.hint||hint,version:version+1};await this.put(next);return next;
    });
  }
  async check(id:string,version:number,answer:string){
    const pending=await this.get(id);if(pending&&!await this.pictureSessionLoaded(pending))throw new RepositoryError('conflict');
    z.string().max(200).parse(answer);
    return this.repository.db.transaction("rw",this.repository.db.tables,async()=>{
      const session=await this.get(id);if(!session)throw new RepositoryError("missing");
      if(session.version!==version||session.completedAt||!await this.pictureSessionCurrent(session)||(session.mode==="flashcard"||session.mode==="grammar-card")||session.checkedAnswer!=null)throw new RepositoryError("conflict");
      const question=session.questions[session.position];const word=await this.repository.word(question.word.id);
      if(!word?.approved||word.revision!==question.word.revision||!await this.grammarCurrent(question))throw new RepositoryError("conflict");
      if(session.mode==='missing-letters'&&!validMissingPositions(question.word.word,question.missingIndices??[]))throw new RepositoryError('invalid');
      const expected=session.mode==='missing-letters'?missingLetters(question.word.word,question.missingIndices!):question.grammar?.example??question.word.word;
      const typed=answer.normalize('NFKC').trim();
      const validInput=session.mode!=='missing-letters'||(/^[a-z]{1,3}$/i.test(typed)&&typed.length===question.missingIndices!.length);
      if(isExpansion(session.mode)&&(gameAnswer(session)===null||answer!==gameAnswer(session)))throw new RepositoryError('invalid');
      const correct=isExpansion(session.mode)?correctGame(session):validInput&&answerKey(answer,question.word.caseMode)===answerKey(expected,question.word.caseMode),at=new Date().toISOString();
      const targets=isPairGame(session.mode)?question.choices:[word];
      for(const [index,target] of targets.entries())await this.repository.db.table<ScopedDocument>("gameAttempts").add({scopeId:session.scopeId,id:`${session.id}:${question.id}${isPairGame(session.mode)?`:${index}`:''}`,createdAt:at,updatedAt:at,version:1,deletedAt:null,payload:{senseId:target.id,questionId:question.id,sessionId:session.id,answer,correct:isPairGame(session.mode)?!session.gameState?.wrong.includes(index):correct,skipped:false,hint:session.hint}});
      const next={...session,checkedAnswer:answer,checkedCorrect:correct,version:version+1};await this.put(next);return next;
    });
  }
  async move(id:string,version:number,move:GameMove){
    const pending=await this.get(id),question=pending?.questions[pending.position];
    if(!pending||!question||!await this.pictureSessionLoaded({...pending,questions:[question]}))throw new RepositoryError('conflict');
    return this.repository.db.transaction('rw',this.repository.db.tables,async()=>{
      const session=await this.get(id);if(!session||session.version!==version||session.completedAt||session.checkedAnswer!==null||!isExpansion(session.mode))throw new RepositoryError('conflict');
      const q=session.questions[session.position],current=await this.repository.word(q.word.id);
      if(!current?.approved||current.revision!==q.word.revision||!await this.pictureSessionCurrent({...session,questions:[q]})||!await this.grammarCurrent(q))throw new RepositoryError('conflict');
      let gameState:GameState;try{gameState=moveGame(session,move);}catch{throw new RepositoryError('invalid');}
      const next={...session,gameState,version:version+1};await this.put(next);return next;
    });
  }
  private async put(session:Session){const row=await this.table.get([session.scopeId,session.id]);if(!row)throw new RepositoryError("missing");
    await this.table.put({...row,updatedAt:new Date().toISOString(),version:session.version,payload:{session}});}
  async answer(id:string,version:number,input:{answer?:string;rating?:Rating;skipped?:boolean;understood?:boolean}):Promise<Session>{
    const pending=await this.get(id);if(pending&&!await this.pictureSessionLoaded(pending))throw new RepositoryError('conflict');
    z.object({answer:z.string().max(200).optional(),rating:z.enum(["Again","Hard","Good","Easy"]).optional(),skipped:z.boolean().optional(),understood:z.boolean().optional()}).strict().parse(input);
    return this.repository.db.transaction("rw",this.repository.db.tables,async()=>{
      const session=await this.get(id);if(!session)throw new RepositoryError("missing");
      if(session.version!==version||session.completedAt||!await this.pictureSessionCurrent(session))throw new RepositoryError("conflict");
      const question=session.questions[session.position];if(!question)throw new RepositoryError("invalid");
      const live=await this.repository.word(question.word.id);
      if(!live||!live.approved||live.revision!==question.word.revision||!await this.grammarCurrent(question))throw new RepositoryError("conflict");
      if(session.mode==="flashcard"&&(!session.revealed||!input.rating))throw new RepositoryError("invalid");
      if(session.mode!=="flashcard"&&input.rating)throw new RepositoryError("invalid");
      if(session.mode==='grammar-card'&&(!session.revealed||typeof input.understood!=='boolean'||input.skipped))throw new RepositoryError("invalid");
      if(session.mode!=='grammar-card'&&input.understood!==undefined)throw new RepositoryError("invalid");
      if(session.mode!=="flashcard"&&session.mode!=="grammar-card"&&!input.skipped&&session.checkedAnswer==null)throw new RepositoryError("invalid");
      const correct=session.mode==='grammar-card'?input.understood===true:session.mode==="flashcard"?input.rating!=="Again":session.checkedCorrect===true;
      const at=new Date().toISOString();
      if(input.rating){
        const eventId=`${session.id}:${question.id}`;
        await this.repository.appendReviewEvent({id:eventId,senseId:question.word.id,sessionId:session.id,rating:input.rating,eventTime:at,hints:session.hint});
        const states=this.repository.db.table<ScopedDocument>("reviewStates");const old=await states.get([session.scopeId,question.word.id]);
        const state=schedule(old?.payload.state as ReviewState|undefined,input.rating,at);
        await states.put({scopeId:session.scopeId,id:question.word.id,createdAt:old?.createdAt??at,updatedAt:at,version:(old?.version??0)+1,deletedAt:null,payload:{state}});
      }else if((input.skipped&&session.checkedAnswer===null)||session.mode==='grammar-card'){
        for(const [index,target] of (isPairGame(session.mode)?question.choices:[question.word]).entries())await this.repository.db.table<ScopedDocument>("gameAttempts").add({scopeId:session.scopeId,id:`${session.id}:${question.id}${isPairGame(session.mode)?`:${index}`:''}`,createdAt:at,updatedAt:at,version:1,deletedAt:null,
          payload:{senseId:target.id,questionId:question.id,sessionId:session.id,answer:input.answer??"",...(session.mode==='grammar-card'?{understood:input.understood}:{}),correct,skipped:!!input.skipped,hint:session.hint}});
      }
      const position=session.position+1;
      const next:Session={...session,gameState:undefined,position,version:version+1,revealed:false,hint:false,
        checkedAnswer:null,checkedCorrect:null,completedAt:position===session.questions.length?at:null,answers:[...session.answers,{questionId:question.id,correct,skipped:!!input.skipped,hint:session.hint,rating:input.rating??null,...(question.boardKeys?{coveredKeys:input.skipped?[]:question.boardKeys}:{}),answeredAt:at,day:activityDay(new Date(at)),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone}]};
      await this.put(next);return next;
    });
  }
}
