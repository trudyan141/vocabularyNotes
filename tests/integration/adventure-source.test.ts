import 'fake-indexeddb/auto';
import {afterEach,expect,it} from 'vitest';
import {Dexie} from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {PracticeRepository} from '@/data/local/practice';
import {saveContent,type LearningContent} from '@/data/local/content';
import {catalog,pronunciation} from '@/lib/learning/catalog';
import {playWord} from '@/lib/learning/adventure-facts';
import {adventureGames} from '@/lib/learning/adventure-registry';
import {buildAdventure} from '@/lib/learning/adventure-engine';
import {samplePlayWords} from '@/lib/learning/adventure-samples';
const dbs:LibraryDatabase[]=[];
afterEach(async()=>{for(const db of dbs.splice(0)){db.close();await Dexie.delete(db.name);}});
// Authored test content, not catalog/sample definitions or a list of runtime answers.
const entries=[
 ['pencil','pencil','A narrow tool used for writing marks on paper.','a pencil','pencils','/pɛnsəl/'],
 ['rubber','eraser','A small object that removes marks from paper.','a rubber','rubbers','/rʌbɚ/'],
 ['ruler','ruler','A handheld tool for measuring short lengths.','a ruler','rulers','/ruːlər/'],
 ['notebook','notebook','A set of paper pages used for writing notes.','a notebook','notebooks','/noʊtbʊk/'],
 ['fish','fish','A small aquatic animal with fins.','a fish','fish','/fɪʃ/'],
 ['car','car','A road vehicle with four wheels.','a car','cars','/kɑr/'],
 ['chair','chair','A seat for one person.','a chair','chairs','/tʃɛr/'],
] as const;
async function setup(){
 const db=new LibraryDatabase(`adventure-source-${crypto.randomUUID()}`);dbs.push(db);const repo=new LocalRepository(db,{kind:'guest',id:'guest:audit'});
 await repo.saveLesson({operationId:crypto.randomUUID(),title:'Selected audit lesson',learnedOn:'2026-10-25',sourceType:'manual',items:entries.map(([word,art,en,article,plural,ipa])=>({...catalog[0],id:word,word,pos:'noun',sense:'audit',art,en,vi:`Nghĩa riêng ${word}`,example:`This is ${article}. I see two ${plural}.`,exampleVi:`Ví dụ riêng ${word}`,source:'Isolated test fixture',approved:true,pronunciations:[{...pronunciation(word,null,ipa,null,true),accent:'US' as const}],examplePronunciations:[],additionalExamples:[]}))});
 const word=(await repo.word('pencil'))!,base:LearningContent={senseId:word.id,targetRevision:word.revision,example:'Put the pencil under the table.',exampleVi:'Đặt bút chì dưới bàn.',readingHintVi:'',pattern:'Position',patternExplanation:'Vị trí',grammarTitle:'Position',conditions:'Vị trí đồ vật',formula:'Put + noun + under + place',analysis:'Dưới bàn',commonError:'on',correction:'under',approved:true,origin:'user'};
 for(const [id,formula,example] of [['audit-position','Put + noun + under + place','Put the pencil under the table.'],['audit-plural','Plural nouns','These are rulers.'],['audit-request','I would like + quantity + noun','I would like three rulers, please.']])await saveContent(repo,id,null,{...base,formula,example});
 const lesson=(await db.lessons.toArray())[0];return {repo,practice:new PracticeRepository(repo,async()=>true),filter:{lesson:lesson.id}};
}
it.each(adventureGames)('$id constructs its playable questions from actual selected repository content, not the fallback word bank',async game=>{
 const {repo,practice,filter}=await setup(),input=await practice.gameInputs(filter),words=input.words.flatMap(w=>{const item=playWord(w);return item?[item]:[];}),pack=buildAdventure(game.id,words,input.grammars),ids=new Set(input.words.map(w=>w.id));
 expect(input.words).toHaveLength(entries.length);expect(input.words.every(w=>!samplePlayWords().some(sample=>sample.text===w.word))).toBe(true);
 expect(pack.source).toBe('selection');expect(pack.questions.length).toBeGreaterThan(0);
 for(const q of pack.questions){expect(ids.has(q.target.id)).toBe(true);expect(q.choices.every(w=>ids.has(w.id))).toBe(true);
  if(game.id==='word-detective'){expect(q.cue).toBe(input.words.find(w=>w.id===q.target.id)!.en);expect(q.answer).toBe(q.target.id);}
  if(game.id==='sort-baskets')expect(q.answer).toBe(q.target.category);
  if(game.id==='sound-hunt'){expect(q.anchor!.onset).toBe(q.target.onset);expect(ids.has(q.anchor!.id)).toBe(true);}
  if(game.id==='place-object'){expect(pack.grammar!.id).toBe('audit-position');expect(q.relation).toBe('under');expect(q.cue).toContain(q.target.text);}
  if(game.id==='one-many'){expect(pack.grammar!.id).toBe('audit-plural');expect(q.forms).toContain(q.target.plural);}
  if(game.id==='fox-shop'){expect(pack.grammar!.id).toBe('audit-request');expect(q.cue).toMatch(/^I would like /);expect(q.request![0].id).toBe(q.target.id);}
 }
 const outside=await practice.gameInputs({word:'not-in-this-library'});expect(outside.words).toEqual([]);expect(buildAdventure(game.id,outside.words.flatMap(w=>{const p=playWord(w);return p?[p]:[];}),outside.grammars).source).toBe('sample');
 expect(await repo.db.table('practiceSessions').count()).toBe(0);expect(await repo.db.table('reviewStates').count()).toBe(0);
});
it('detective reflects an edited selected definition and rejects a clue that gives away its answer',async()=>{
 const {repo,practice,filter}=await setup();const compile=async()=>{const input=await practice.gameInputs(filter);return buildAdventure('word-detective',input.words.flatMap(w=>{const p=playWord(w);return p?[p]:[];}),input.grammars);};
 const before=await compile(),q=before.questions.find(q=>q.target.text==='ruler')!;expect(q).toBeTruthy();const w=(await repo.word(q.target.id))!;
 const en='A long measuring instrument marked with centimetres.';await repo.editWord(w.id,w.revision,{word:w.word,vi:w.vi,en});const after=await compile();expect(after.source).toBe('selection');expect(after.questions.find(q=>q.target.id===w.id)?.cue).toBe(en);expect(after.questions.some(item=>item.cue===q.cue)).toBe(false);
 const current=(await repo.word(w.id))!;await repo.editWord(current.id,current.revision,{word:current.word,vi:current.vi,en:'A ruler for measuring length.'});expect((await compile()).questions.some(q=>q.target.id===w.id)).toBe(false);
});
