import {expect,it} from 'vitest';
import {adventureGames} from '@/lib/learning/adventure-registry';
import {adventureCorrect,boardSizes,buildAdventure,makeQuestions,newAdventureState} from '@/lib/learning/adventure-engine';
import {samplePlayWords,sampleGrammar} from '@/lib/learning/adventure-samples';
import {playWord} from '@/lib/learning/adventure-facts';
import {catalog} from '@/lib/learning/catalog';
const words=samplePlayWords();
it.each(adventureGames)('$id has a playable sample without writing or requiring a library',game=>{
 const pack=buildAdventure(game.id,[],[]);expect(pack.source).toBe('sample');expect(pack.questions.length).toBeGreaterThan(0);expect(pack.questions.every(q=>q.target.id.startsWith('sample:'))).toBe(true);
});
it.each([4,5,8,9,10,11,12,13,18,20,31])('bingo covers %i selected pictures exactly once with no tiny tail',count=>{
 const sizes=boardSizes(count);expect(sizes.reduce((n,s)=>n+s,0)).toBe(count);expect(sizes.every(s=>s>=4&&s<=9)).toBe(true);
 const pool=Array.from({length:count},(_,i)=>({...words[0],id:`actual:${i}`,text:`word${i}`,art:`art${i}`,vi:`nghĩa${i}`}));const pack=buildAdventure('listen-bingo',pool,[]);expect(pack.source).toBe('selection');expect(pack.questions.flatMap(q=>q.choices.map(w=>w.id)).sort()).toEqual(pool.map(w=>w.id).sort());
});
it('uses selected word identities and grammar, and validates state rather than trusting a submitted answer',()=>{
 const pool=words.filter(w=>w.portable&&w.plural).map(w=>({...w,id:w.id.replace('sample:','selected:')}));
 for(const mode of ['place-object','one-many','fox-shop'] as const){const p=buildAdventure(mode,pool,sampleGrammar);expect(p.source).toBe('selection');expect(p.questions.every(q=>q.target.id.startsWith('selected:'))).toBe(true);}
 const q=makeQuestions('listen-bingo',pool,[]).questions[0];expect(adventureCorrect('listen-bingo',q,{...newAdventureState(),marked:q.choices.map(()=>0)})).toBe(false);
 const order=makeQuestions('fox-shop',pool,sampleGrammar).questions[0],right=order.choices.findIndex(w=>w.id===order.target.id),wrong=order.choices.findIndex(w=>w.id!==order.target.id),items=Array.from({length:order.count!},()=>right);
 expect(adventureCorrect('fox-shop',order,{...newAdventureState(),picked:items})).toBe(true);expect(adventureCorrect('fox-shop',order,{...newAdventureState(),picked:[...items,wrong]})).toBe(false);
});
it('does not derive category from tags, plural by spelling alone or phoneme from the first letter',()=>{
 const base={...catalog[0],approved:true,revision:'1:1',caseMode:'fold' as const,origin:'user' as const,tags:['Animals'],pronunciations:[],examplePronunciations:[]};
 const unknown=playWord({...base,word:'fish',en:'Something in this picture.',example:'I see a fish.',art:'fish'})!;expect(unknown.category).toBeUndefined();expect(unknown.plural).toBeUndefined();expect(unknown.onset).toBeUndefined();
 const chair=playWord({...base,word:'chair',en:'A seat for one person.',example:'This is a chair.',art:'chair',pronunciations:[{...catalog[0].pronunciations![0],text:'chair',ipa:'/tʃeə/',verified:true}]})!;expect(chair.onset).toBe('tʃ');
 const ship=playWord({...base,word:'ship',en:'A large boat.',example:'This is a ship.',art:'car',pronunciations:[{...catalog[0].pronunciations![0],text:'ship',ipa:'/ʃɪp/',verified:true}]})!;expect(ship.onset).toBe('ʃ');
});
it('counting never uses unverified multi-object art and source grammar never falls through to another construction',()=>{
 const unknown=words.map(w=>({...w,singleArt:false}));expect(makeQuestions('one-many',unknown,sampleGrammar).questions).toEqual([]);
 expect(makeQuestions('place-object',words,[{id:'g',version:1,formula:'She + is + adjective',example:'She is happy.',exampleVi:'Bạn ấy vui.'}]).questions).toEqual([]);
});

it('does not mistake want-to verbs for a shop request construction',()=>{
 const first={id:'g',version:1,formula:'First conditional: if + present, will + verb',example:'If I am ready, then I will go.',exampleVi:'Nếu sẵn sàng thì mình đi.'};
 expect(makeQuestions('fox-shop',words,[{...first,formula:'Want + to + verb',example:'I want to swim.'}]).questions).toEqual([]);
});

it('does not turn negation, resemblance or a mentioned animal into a classification fact',()=>{
 const base={...catalog[0],approved:true,revision:'1:1',caseMode:'fold' as const,origin:'user' as const,tags:[],pronunciations:[],examplePronunciations:[]};
 expect(playWord({...base,en:'A small domesticated animal.'})?.category).toBe('animals');
 expect(playWord({...base,en:'A round fruit that grows on a tree.'})?.category).toBe('food');
 for(const en of ['A tool shaped like an animal.','A person who keeps a pet.','Not an animal.'])expect(playWord({...base,en})?.category).toBeUndefined();
});

it('detective keeps separate meanings of the same headword instead of silently dropping a sense',()=>{
 const batTool={...words.find(w=>w.text==='book')!,id:'selected:bat-tool',text:'bat',vi:'gậy đánh bóng',en:'A wooden stick for striking a ball.',art:'media-00000000-0000-4000-8000-000000000001',category:undefined};
 const batAnimal={...words.find(w=>w.text==='cat')!,id:'selected:bat-animal',text:'bat',vi:'con dơi',en:'A flying mammal that rests upside down.',art:'media-00000000-0000-4000-8000-000000000002'};
 const pack=buildAdventure('word-detective',[batTool,batAnimal,...words.filter(w=>w.text==='apple'||w.text==='pen')],[]);
 expect(pack.source).toBe('selection');expect(pack.questions.filter(q=>q.target.text==='bat').map(q=>q.target.id).sort()).toEqual(['selected:bat-animal','selected:bat-tool']);
 for(const q of pack.questions.filter(q=>q.target.text==='bat'))expect(q.cue).toBe(q.target.en);
 const bingo=makeQuestions('listen-bingo',[batTool,batAnimal,...words],[]);expect(bingo.questions.flatMap(q=>q.choices).filter(w=>w.text==='bat')).toHaveLength(1);
});
