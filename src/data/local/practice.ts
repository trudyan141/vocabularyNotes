import {grammarKey} from './groups';
import {learningItems} from './learning-library';
import type {LearningContent} from './content';
import {sentenceTiles,type GrammarSnapshot} from '@/lib/learning/grammar-game';
import { z } from "zod";
import {safeArt} from "@/lib/media/catalog";
import type { LocalRepository } from "./repository";
import { RepositoryError } from "./repository";
import type { LibraryWord, ScopedDocument } from "./types";
import { answerKey, schedule, type Rating, type ReviewState } from "@/lib/learning/srs";
export type Mode="flashcard"|"picture-word"|"word-picture"|"letters"|"spelling"|"grammar";
export type Question={id:string;word:LibraryWord;choices:LibraryWord[];missingIndex:number;grammar?:GrammarSnapshot};
export type Session={id:string;scopeId:string;mode:Mode;direction?:"en-vi"|"vi-en";questions:Question[];position:number;revealed:boolean;hint:boolean;
  checkedAnswer:string|null;checkedCorrect:boolean|null;
  answers:{questionId:string;correct:boolean;skipped:boolean;hint:boolean;rating:Rating|null}[];completedAt:string|null;version:number;createdAt:string};
const modes=z.enum(["flashcard","picture-word","word-picture","letters","spelling","grammar"]);
export class PracticeRepository{
  constructor(readonly repository:LocalRepository){}
  private get table(){return this.repository.db.table<ScopedDocument>("practiceSessions");}
  async sessions(){
    const rows=await this.table.where("[scopeId+id]").between([this.repository.scope.id,""],[this.repository.scope.id,"\uffff"]).toArray();
    const sessions=rows.map(row=>row.payload.session as Session).filter(Boolean).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));const visible:Session[]=[];
    for(const session of sessions){if(session.completedAt){visible.push(session);continue;}const current=await this.repository.words(session.questions.map(q=>q.word.id));if(session.questions.every(q=>current.some(w=>w.id===q.word.id&&w.approved&&w.revision===q.word.revision))&& (await Promise.all(session.questions.map(q=>this.grammarCurrent(q)))).every(Boolean))visible.push(session);}return visible;
  }
  async get(id:string){return (await this.table.get([this.repository.scope.id,id]))?.payload.session as Session|undefined;}
  async dueIds(){
    const scope=this.repository.scope.id;
    const [index,states]=await Promise.all([
      this.repository.db.searchIndex.where("[scopeId+ordinal]").between([scope,""],[scope,"\uffff"]).toArray(),
      this.repository.db.table<ScopedDocument>("reviewStates").where("[scopeId+id]").between([scope,""],[scope,"\uffff"]).toArray(),
    ]);
    const map=new Map(states.filter(row=>!row.deletedAt).map(row=>[row.id,row.payload.state as ReviewState]));
    const now=Date.now();return index.filter(row=>row.approval&&(!map.has(row.id)||Date.parse(map.get(row.id)!.dueAt)<=now)).map(row=>row.id);
  }
  async start(mode:Mode,filter:{word?:string;due?:boolean;weak?:boolean;lesson?:string;deck?:string;direction?:"en-vi"|"vi-en"}={}):Promise<Session>{
    modes.parse(mode);
    if(mode==="grammar")return this.startGrammar(filter);
    const scope=this.repository.scope.id;
    const index=await this.repository.db.searchIndex.where("[scopeId+ordinal]").between([scope,""],[scope,"\uffff"]).toArray();
    let candidates=index.filter(row=>row.approval&&(!filter.lesson||row.lessonIds.includes(filter.lesson)));
    if(mode==="picture-word"||mode==="word-picture")candidates=candidates.filter(row=>!!safeArt(row.art));
    const picture=(word:LibraryWord)=>!(["intelligent","smart","clever"].includes(word.word.toLowerCase())&&word.pos==="adjective");
    const distractorWords=(await this.repository.words(candidates.slice(0,100).map(row=>row.id))).filter(word=>!(mode==="picture-word"||mode==="word-picture")||picture(word));
    if(filter.deck){const row=await this.repository.db.table<ScopedDocument>("decks").get([scope,filter.deck]);if(!row||row.deletedAt)throw new RepositoryError("not-ready");const deck=row.payload.deck as {senseIds:string[];group?:{wordIds:string[]}};const ids=deck.group?.wordIds??deck.senseIds;candidates=candidates.filter(row=>ids.includes(row.id));}
    if(filter.word)candidates=candidates.filter(row=>row.id===filter.word);
    if(filter.due){const ids=new Set(await this.dueIds());candidates=candidates.filter(row=>ids.has(row.id));}
    if(filter.weak){const attempts=await this.repository.db.table<ScopedDocument>("gameAttempts").where("[scopeId+id]").between([scope,""],[scope,"\uffff"]).toArray();const latest=new Map<string,ScopedDocument>();for(const attempt of attempts.sort((a,b)=>a.updatedAt.localeCompare(b.updatedAt)))latest.set(attempt.payload.senseId as string,attempt);candidates=candidates.filter(row=>{const attempt=latest.get(row.id);return attempt&&(!attempt.payload.correct||attempt.payload.hint);});}
    let words=(await this.repository.words(candidates.slice(0,100).map(row=>row.id))).filter(word=>word.vi.trim()&&word.en.trim());
    if(mode==="picture-word"||mode==="word-picture")words=words.filter(picture);
    if(mode==="letters")words=words.filter(word=>/^[a-z]{2,30}$/i.test(word.word));
    const unique=distractorWords.filter((word,i)=>distractorWords.findIndex(other=>answerKey(other.word,other.caseMode)===answerKey(word.word,word.caseMode))===i);
    const distractorPool=mode==="picture-word"||mode==="word-picture"?unique:words;
    if((mode==="picture-word"||mode==="word-picture")&&unique.length<3)throw new RepositoryError("not-ready");
    if(!words.length)throw new RepositoryError("not-ready");
    const id=crypto.randomUUID(),at=new Date().toISOString();
    const questions=words.slice(0,10).map((word,index)=>{
      const candidates=distractorPool.filter(other=>answerKey(other.word,other.caseMode)!==answerKey(word.word,word.caseMode)&&other.vi!==word.vi&&other.art!==word.art).slice(0,2);
      const choices=[word,...candidates]; if(choices.length===3){const rotate=index%3;choices.push(...choices.splice(0,rotate));}
      return {id:crypto.randomUUID(),word,choices,missingIndex:Math.max(0,Math.floor(word.word.length/2))};
    });
    if((mode==="picture-word"||mode==="word-picture")&&questions.some(q=>q.choices.length<3))throw new RepositoryError("not-ready");
    const session:Session={id,scopeId:this.repository.scope.id,mode,direction:filter.direction??"en-vi",questions,position:0,revealed:false,hint:false,checkedAnswer:null,checkedCorrect:null,answers:[],completedAt:null,version:1,createdAt:at};
    await this.table.add({scopeId:session.scopeId,id,createdAt:at,updatedAt:at,version:1,deletedAt:null,payload:{session}});return session;
  }
  private async startGrammar(filter:{lesson?:string;deck?:string}):Promise<Session>{
    const items=(await learningItems(this.repository,'grammar','',filter.lesson??null,0,Number.MAX_SAFE_INTEGER)).items;
    const deck=filter.deck?(await this.repository.db.table<ScopedDocument>('decks').get([this.repository.scope.id,filter.deck])):null;
    if(filter.deck&&(!deck||deck.deletedAt))throw new RepositoryError('not-ready');
    const group=(deck?.payload.deck as import('./decks').Deck|undefined)?.group;
    const families=items.filter(item=>!group||group.grammar?.some(ref=>ref.key===grammarKey(item)||item.related?.some(child=>ref.key===grammarKey(child))));
    const expanded=families.flatMap(item=>[item,...(item.related??[]),...(item.variants??[]).map(variant=>({...item,related:undefined,variants:undefined,textEn:variant.formula,example:variant.example,exampleVi:variant.exampleVi,exampleIpa:variant.exampleIpa}))]);
    const seen=new Set<string>();const eligible=expanded.filter(item=>{const identity=JSON.stringify([item.example,item.exampleVi,item.textEn]);if(seen.has(identity))return false;seen.add(identity);return true;}).filter(item=>item.table==='sentences'&&item.example&&item.exampleVi&&item.example.length<=200&&sentenceTiles(item.example).length>=2&&sentenceTiles(item.example).length<=12);
    const words=await this.repository.words([...new Set(eligible.map(item=>item.senseId))]);
    const questions:Question[]=eligible.slice(0,10).flatMap(item=>{const word=words.find(word=>word.id===item.senseId&&word.approved);return word?[{id:crypto.randomUUID(),word,choices:[],missingIndex:0,grammar:{id:item.id,version:item.version,formula:item.textEn,example:item.example!,exampleVi:item.exampleVi!,...(item.exampleIpa?{exampleIpa:item.exampleIpa}:{})}}]:[];});
    if(!questions.length)throw new RepositoryError('not-ready');
    const at=new Date().toISOString(),session:Session={id:crypto.randomUUID(),scopeId:this.repository.scope.id,mode:'grammar',questions,position:0,revealed:false,hint:false,checkedAnswer:null,checkedCorrect:null,answers:[],completedAt:null,version:1,createdAt:at};
    await this.table.add({scopeId:session.scopeId,id:session.id,createdAt:at,updatedAt:at,version:1,deletedAt:null,payload:{session}});return session;
  }
  private async grammarCurrent(question:Question){if(!question.grammar)return true;const row=await this.repository.db.table<ScopedDocument>('sentences').get([this.repository.scope.id,question.grammar.id]);const content=row?.payload.content as LearningContent|undefined;return !!row&&!row.deletedAt&&row.version===question.grammar.version&&!!content?.approved&&content.targetRevision===question.word.revision;}
  async reveal(id:string,version:number,hint=false){
    return this.repository.db.transaction("rw",this.repository.db.tables,async()=>{
      const session=await this.get(id);if(!session)throw new RepositoryError("missing");
      if(session.version!==version||session.completedAt)throw new RepositoryError("conflict");
      const question=session.questions[session.position],current=question&&await this.repository.word(question.word.id);if(!current?.approved||current.revision!==question.word.revision||!await this.grammarCurrent(question))throw new RepositoryError("conflict");
      const next={...session,revealed:hint?session.revealed:true,hint:session.hint||hint,version:version+1};await this.put(next);return next;
    });
  }
  async check(id:string,version:number,answer:string){
    z.string().max(200).parse(answer);
    return this.repository.db.transaction("rw",this.repository.db.tables,async()=>{
      const session=await this.get(id);if(!session)throw new RepositoryError("missing");
      if(session.version!==version||session.completedAt||session.mode==="flashcard"||session.checkedAnswer!=null)throw new RepositoryError("conflict");
      const question=session.questions[session.position];const word=await this.repository.word(question.word.id);
      if(!word?.approved||word.revision!==question.word.revision||!await this.grammarCurrent(question))throw new RepositoryError("conflict");
      const correct=answerKey(answer,question.word.caseMode)===answerKey(question.grammar?.example??question.word.word,question.word.caseMode),at=new Date().toISOString();
      await this.repository.db.table<ScopedDocument>("gameAttempts").add({scopeId:session.scopeId,id:`${session.id}:${question.id}`,createdAt:at,updatedAt:at,version:1,deletedAt:null,payload:{senseId:word.id,questionId:question.id,sessionId:session.id,answer,correct,skipped:false,hint:session.hint}});
      const next={...session,checkedAnswer:answer,checkedCorrect:correct,version:version+1};await this.put(next);return next;
    });
  }
  private async put(session:Session){const row=await this.table.get([session.scopeId,session.id]);if(!row)throw new RepositoryError("missing");
    await this.table.put({...row,updatedAt:new Date().toISOString(),version:session.version,payload:{session}});}
  async answer(id:string,version:number,input:{answer?:string;rating?:Rating;skipped?:boolean}):Promise<Session>{
    z.object({answer:z.string().max(200).optional(),rating:z.enum(["Again","Hard","Good","Easy"]).optional(),skipped:z.boolean().optional()}).strict().parse(input);
    return this.repository.db.transaction("rw",this.repository.db.tables,async()=>{
      const session=await this.get(id);if(!session)throw new RepositoryError("missing");
      if(session.version!==version||session.completedAt)throw new RepositoryError("conflict");
      const question=session.questions[session.position];if(!question)throw new RepositoryError("invalid");
      const live=await this.repository.word(question.word.id);
      if(!live||!live.approved||live.revision!==question.word.revision||!await this.grammarCurrent(question))throw new RepositoryError("conflict");
      if(session.mode==="flashcard"&&(!session.revealed||!input.rating))throw new RepositoryError("invalid");
      if(session.mode!=="flashcard"&&input.rating)throw new RepositoryError("invalid");
      if(session.mode!=="flashcard"&&!input.skipped&&session.checkedAnswer==null)throw new RepositoryError("invalid");
      const correct=session.mode==="flashcard"?input.rating!=="Again":session.checkedCorrect===true;
      const at=new Date().toISOString();
      if(input.rating){
        const eventId=`${session.id}:${question.id}`;
        await this.repository.appendReviewEvent({id:eventId,senseId:question.word.id,sessionId:session.id,rating:input.rating,eventTime:at,hints:session.hint});
        const states=this.repository.db.table<ScopedDocument>("reviewStates");const old=await states.get([session.scopeId,question.word.id]);
        const state=schedule(old?.payload.state as ReviewState|undefined,input.rating,at);
        await states.put({scopeId:session.scopeId,id:question.word.id,createdAt:old?.createdAt??at,updatedAt:at,version:(old?.version??0)+1,deletedAt:null,payload:{state}});
      }else if(input.skipped){
        await this.repository.db.table<ScopedDocument>("gameAttempts").add({scopeId:session.scopeId,id:`${session.id}:${question.id}`,createdAt:at,updatedAt:at,version:1,deletedAt:null,
          payload:{senseId:question.word.id,questionId:question.id,sessionId:session.id,answer:input.answer??"",correct,skipped:!!input.skipped,hint:session.hint}});
      }
      const position=session.position+1;
      const next:Session={...session,position,version:version+1,revealed:false,hint:false,
        checkedAnswer:null,checkedCorrect:null,completedAt:position===session.questions.length?at:null,answers:[...session.answers,{questionId:question.id,correct,skipped:!!input.skipped,hint:session.hint,rating:input.rating??null}]};
      await this.put(next);return next;
    });
  }
}
