import {expect,it} from 'vitest';
import {catalog} from '@/lib/learning/catalog';
import type {LibraryWord} from '@/data/local/types';
import {buildScopedDialogue,dialogueFrame} from '@/lib/learning/scoped-dialogue';
const grammar={id:'selected-grammar',version:3,formula:'Is this + a/an + noun?',example:'Is this a book?',exampleVi:'Đây có phải sách không?'};
function word(name:string,example:string):LibraryWord{return {...catalog[0],id:name,word:name,vi:`nghĩa ${name}`,art:name,pos:'noun',example,approved:true,revision:'1:1',origin:'user',caseMode:'fold',pronunciations:[],examplePronunciations:[],tags:[]};}
it('uses only selected grammar and picture words, grounding yes/no in the actual image',()=>{
 const words=[word('kite','I have a kite.'),word('egg','It is an egg.')],rounds=buildScopedDialogue(grammar,words);
 expect(rounds.map(r=>r.wordId)).toEqual(['kite','egg']);expect(rounds.map(r=>r.scene.art)).toEqual(['kite','egg']);
 expect(rounds[0].activity.prompt).toBe('Is this a kite?');expect(rounds[0].activity.answer).toBe('Yes, it is.');
 expect(rounds[1].activity.prompt).toBe('Is this a kite?');expect(rounds[1].activity.answer).toBe("No, it isn't.");
 expect(rounds.every(r=>r.grammar.id===grammar.id)).toBe(true);
 const changed=buildScopedDialogue({...grammar,formula:'Is that + a/an + noun?',example:'Is that an egg?'},[word('egg','It is an egg.')]);expect(changed[0].activity.prompt).toBe('Is that an egg?');
 expect(JSON.stringify(changed)).not.toContain('kite');
});
it('uses the selected statement construction in the answer rather than defaulting to Is it',()=>{
 const rounds=buildScopedDialogue({...grammar,formula:'This is + a/an + noun',example:'This is a book.'},[word('egg','It is an egg.'),word('kite','I have a kite.')]);
 expect(rounds[0].activity.prompt).toBe('What is this?');expect(rounds[0].activity.answer).toBe('This is an egg.');
});
it('does not invent a fallback construction, countability, or include unapproved words',()=>{
 expect(dialogueFrame({...grammar,example:'She is happy.'})).toBeNull();
 expect(buildScopedDialogue({...grammar,example:'She is happy.'},[word('egg','It is an egg.')])).toEqual([]);
 const words=[word('water','I drink water.'),{...word('egg','It is an egg.'),approved:false}];expect(buildScopedDialogue(grammar,words)).toEqual([]);
});
