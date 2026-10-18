import {practiceFilterSchema,type PracticeFilter} from '@/lib/learning/practice-filter';
import {eligibleMissingLetters,missingLetterPositions,missingLetters,validMissingPositions} from '@/lib/learning/missing-letters';
import {uniqueAggregateWords,aggregateWordId,withoutWordMemberships} from '@/lib/learning/library-search';
import {canonicalKey} from '@/domain/identity';
import {shuffled} from '@/lib/learning/random';
import {loadPicture} from '@/lib/media/load-picture';
import {approvedMedia} from './media';
import {grammarKey,groupContents,type StudyGroup} from './groups';
import {learningItems} from './learning-library';
import type {LearningContent} from './content';
import {sentenceTiles,type GrammarSnapshot} from '@/lib/learning/grammar-game';
import { z } from "zod";
import {safeArt} from "@/lib/media/catalog";
import type { LocalRepository } from "./repository";
import { RepositoryError } from "./repository";
import type { LibraryWord, ScopedDocument, SearchRow } from "./types";
import { answerKey, schedule, type Rating, type ReviewState } from "@/lib/learning/srs";
export type Mode="flashcard"|"picture-word"|"word-picture"|"letters"|"spelling"|"missing-letters"|"grammar"|"grammar-card";
export type Question={id:string;word:LibraryWord;choices:LibraryWord[];missingIndex:number;missingIndices?:number[];grammar?:GrammarSnapshot};
export type Session={id:string;scopeId:string;mode:Mode;filter?:PracticeFilter;direction?:"en-vi"|"vi-en";questions:Question[];position:number;revealed:boolean;hint:boolean;
  checkedAnswer:string|null;checkedCorrect:boolean|null;
  answers:{questionId:string;correct:boolean;skipped:boolean;hint:boolean;rating:Rating|null}[];completedAt:string|null;version:number;createdAt:string};
export const sessionStarted=(session:Session)=>session.position>0||session.answers.length>0||session.checkedAnswer!==null;
const modes=z.enum(["flashcard","picture-word","word-picture","letters","spelling","missing-letters","grammar","grammar-card"]);
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
    if(session.mode!=='picture-word'&&session.mode!=='word-picture')return true;
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
  async loadSession(id:string){const session=await this.get(id);return session&&await this.sessionCurrent(session)?session:undefined;}
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
  private async roundWords(rows:SearchRow[],mode:Mode){
    const scope=this.repository.scope.id,selected=new Set(rows.map(row=>row.id));
    // Group explicit source aliases before the draw, retaining their primary ID.
    const senses=await this.repository.db.senses.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray();
    const groups=new Map<string,string>();
    for(const sense of senses){
      if(!selected.has(sense.id)||sense.deletedAt||sense.learningApprovalStatus!=='approved'||sense.approvedContentVersion!==sense.contentVersion)continue;
      const aggregate=aggregateWordId(sense),key=JSON.stringify([sense.entryId,sense.pos,aggregate]);
      if(!groups.has(key)||sense.id===aggregate)groups.set(key,sense.id);
    }
    const ids=shuffled([...groups.values()]),words:LibraryWord[]=[];
    for(let i=0;i<ids.length&&words.length<10;i+=16){
      const batch=await this.repository.words(ids.slice(i,i+16));
      for(const word of batch){
        if(!word.approved||!word.vi.trim()||!word.en.trim())continue;
        if(mode==='letters'&&!/^[a-z]{2,30}$/i.test(word.word))continue;
        if(mode==='missing-letters'&&!eligibleMissingLetters(word.word))continue;
        words.push(word);if(words.length===10)break;
      }
    }
    return words;
  }
  async start(mode:Mode,filter:PracticeFilter={}):Promise<Session>{
    modes.parse(mode);practiceFilterSchema.parse(filter);
    this.pictures.clear();this.failedPictures.clear();
    if(mode==="grammar"||mode==="grammar-card")return this.startGrammar(mode,filter);
    const scope=this.repository.scope.id;
    const index=await this.repository.db.searchIndex.where('[scopeId+ordinal]').between([scope,''],[scope,'\uffff']).toArray();
    const pictureGame=mode==='picture-word'||mode==='word-picture';
    const selectedRows=await this.candidates(filter,index),selected=new Set(selectedRows.map(row=>row.id));
    const choiceScope=pictureGame?new Set((await this.candidates({...filter,word:undefined,due:false,weak:false},index)).map(row=>row.id)):new Set<string>();
    let candidates=index.filter(row=>row.approval);
    if(mode==="picture-word"||mode==="word-picture")candidates=candidates.filter(row=>!!safeArt(row.art));
    const picture=(word:LibraryWord)=>!!safeArt(word.art)&&word.approved&&!(["intelligent","smart","clever"].includes(word.word.toLowerCase())&&word.pos==="adjective");
    const distractorWords=mode==="picture-word"||mode==="word-picture"?(await this.repository.words(candidates.map(row=>row.id))).filter(picture):[];
    candidates=candidates.filter(row=>selected.has(row.id));
    let words=pictureGame?(await this.repository.words(candidates.map(row=>row.id))).filter(word=>word.vi.trim()&&word.en.trim()):await this.roundWords(selectedRows,mode);
    if(mode==="picture-word"||mode==="word-picture")words=words.filter(word=>picture(word)&&distractorWords.some(ready=>ready.id===word.id&&ready.revision===word.revision&&ready.art===word.art));
    if(mode==="letters")words=words.filter(word=>/^[a-z]{2,30}$/i.test(word.word));
    if(mode==="missing-letters")words=words.filter(word=>eligibleMissingLetters(word.word));
    const unique=distractorWords.filter((word,i)=>distractorWords.findIndex(other=>answerKey(other.word,other.caseMode)===answerKey(word.word,word.caseMode))===i);
    const distractorPool=pictureGame?unique:[];
    if((mode==="picture-word"||mode==="word-picture")&&unique.length<3)throw new RepositoryError("not-ready");
    if(!words.length)throw new RepositoryError("not-ready");
    const id=crypto.randomUUID(),at=new Date().toISOString();
    const questions:Question[]=[],targets=shuffled(uniqueAggregateWords(words)),decoded=new Set<string>();
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
    const session:Session={id,scopeId:this.repository.scope.id,mode,filter,direction:filter.direction??"en-vi",questions,position:0,revealed:false,hint:false,checkedAnswer:null,checkedCorrect:null,answers:[],completedAt:null,version:1,createdAt:at};
    await this.table.add({scopeId:session.scopeId,id,createdAt:at,updatedAt:at,version:1,deletedAt:null,payload:{session}});return session;
  }
  private async startGrammar(mode:"grammar"|"grammar-card",filter:PracticeFilter):Promise<Session>{
    const items=(await learningItems(this.repository,'grammar','',filter.lesson??null,0,Number.MAX_SAFE_INTEGER)).items;
    const deck=filter.deck?(await this.repository.db.table<ScopedDocument>('decks').get([this.repository.scope.id,filter.deck])):null;
    if(filter.deck&&(!deck||deck.deletedAt))throw new RepositoryError('not-ready');
    const group=(deck?.payload.deck as import('./decks').Deck|undefined)?.group;
    const set=filter.set&&deck?(await groupContents(this.repository,deck as StudyGroup)).sets.find(set=>set.id===filter.set):null;
    if(filter.set&&!set)throw new RepositoryError('not-ready');
    const families=items.filter(item=>(!set||set.grammarKeys.includes(grammarKey(item))||item.related?.some(child=>set.grammarKeys.includes(grammarKey(child))))&&(!filter.word||item.senseId===filter.word)&&(!filter.deck||!!group?.grammar?.some(ref=>ref.senseId===item.senseId&&ref.key===grammarKey(item)||item.related?.some(child=>ref.senseId===child.senseId&&ref.key===grammarKey(child)))));
    const expanded=families.flatMap(item=>[item,...(item.related??[]),...(item.variants??[]).map(variant=>({...item,related:undefined,variants:undefined,textEn:variant.formula,example:variant.example,exampleVi:variant.exampleVi,exampleIpa:variant.exampleIpa,analysis:variant.analysis}))]);
    const seen=new Set<string>();const eligible=expanded.filter(item=>{const identity=JSON.stringify([item.example,item.exampleVi,item.textEn]);if(seen.has(identity))return false;seen.add(identity);return true;}).filter(item=>item.table==='sentences'&&item.example&&item.exampleVi&&item.example.length<=200&&sentenceTiles(item.example).length>=2&&sentenceTiles(item.example).length<=12);
    const words=await this.repository.words([...new Set(eligible.map(item=>item.senseId))]);
    const questions:Question[]=shuffled(eligible).flatMap(item=>{const word=words.find(word=>word.id===item.senseId&&word.approved);return word?[{id:crypto.randomUUID(),word:withoutWordMemberships(word),choices:[],missingIndex:0,grammar:{id:item.id,version:item.version,formula:item.textEn,title:item.title,conditions:item.conditions||item.textVi,analysis:item.analysis||undefined,example:item.example!,exampleVi:item.exampleVi!,...(item.exampleIpa?{exampleIpa:item.exampleIpa}:{})}}]:[];}).slice(0,10);
    if(!questions.length)throw new RepositoryError('not-ready');
    const at=new Date().toISOString(),session:Session={id:crypto.randomUUID(),scopeId:this.repository.scope.id,mode,filter,questions,position:0,revealed:false,hint:false,checkedAnswer:null,checkedCorrect:null,answers:[],completedAt:null,version:1,createdAt:at};
    await this.table.add({scopeId:session.scopeId,id:session.id,createdAt:at,updatedAt:at,version:1,deletedAt:null,payload:{session}});return session;
  }
  async replay(id:string,reviewOnly=false):Promise<Session>{
    const original=await this.get(id);if(!original)throw new RepositoryError('missing');
    if(!await this.pictureSessionLoaded(original))throw new RepositoryError('conflict');
    return this.repository.db.transaction('rw',this.repository.db.tables,async()=>{
      const saved=await this.get(id);if(!saved||saved.version!==original.version)throw new RepositoryError('conflict');
      const questions=reviewOnly?saved.questions.filter(q=>saved.answers.some(a=>a.questionId===q.id&&!a.correct)):saved.questions;
      if(reviewOnly&&!saved.completedAt||!questions.length)throw new RepositoryError('not-ready');
      const current=await this.repository.words(questions.map(q=>q.word.id));
      if(!questions.length||!questions.every(q=>current.some(w=>w.id===q.word.id&&w.approved&&w.revision===q.word.revision))||!await this.pictureSessionCurrent(saved)||(await Promise.all(questions.map(q=>this.grammarCurrent(q)))).some(valid=>!valid))throw new RepositoryError('conflict');
      const at=new Date().toISOString();
      const next:Session={...saved,id:crypto.randomUUID(),questions:shuffled(questions).map(q=>({...q,id:crypto.randomUUID()})),position:0,revealed:false,hint:false,checkedAnswer:null,checkedCorrect:null,answers:[],completedAt:null,version:1,createdAt:at};
      await this.table.add({scopeId:next.scopeId,id:next.id,createdAt:at,updatedAt:at,version:1,deletedAt:null,payload:{session:next}});return next;
    });
  }
  async pictureSessionCurrent(session:Session){
    if(session.mode!=='picture-word'&&session.mode!=='word-picture')return true;
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
      const correct=validInput&&answerKey(answer,question.word.caseMode)===answerKey(expected,question.word.caseMode),at=new Date().toISOString();
      await this.repository.db.table<ScopedDocument>("gameAttempts").add({scopeId:session.scopeId,id:`${session.id}:${question.id}`,createdAt:at,updatedAt:at,version:1,deletedAt:null,payload:{senseId:word.id,questionId:question.id,sessionId:session.id,answer,correct,skipped:false,hint:session.hint}});
      const next={...session,checkedAnswer:answer,checkedCorrect:correct,version:version+1};await this.put(next);return next;
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
      }else if(input.skipped||session.mode==='grammar-card'){
        await this.repository.db.table<ScopedDocument>("gameAttempts").add({scopeId:session.scopeId,id:`${session.id}:${question.id}`,createdAt:at,updatedAt:at,version:1,deletedAt:null,
          payload:{senseId:question.word.id,questionId:question.id,sessionId:session.id,answer:input.answer??"",...(session.mode==='grammar-card'?{understood:input.understood}:{}),correct,skipped:!!input.skipped,hint:session.hint}});
      }
      const position=session.position+1;
      const next:Session={...session,position,version:version+1,revealed:false,hint:false,
        checkedAnswer:null,checkedCorrect:null,completedAt:position===session.questions.length?at:null,answers:[...session.answers,{questionId:question.id,correct,skipped:!!input.skipped,hint:session.hint,rating:input.rating??null}]};
      await this.put(next);return next;
    });
  }
}
