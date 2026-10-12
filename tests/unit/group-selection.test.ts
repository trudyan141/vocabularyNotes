import {describe,it,expect} from 'vitest';
import {selectNewMembers} from '@/lib/learning/group-selection';
describe('group pending additions',()=>{
 it('all filtered and page operations keep saved members and selections outside the filter',()=>{
  const saved=['apple-river','apple-fruit'];
  const current=[...saved,'new-page-one','outside-filter'];
  expect(selectNewMembers(current,['apple-fruit','new-page-one'],false,saved)).toEqual([...saved,'outside-filter']);
  expect(selectNewMembers(current,['apple-fruit','new-page-two'],true,saved)).toEqual([...current,'new-page-two']);
 });
 it('cannot unselect a saved sense by selecting its whole headword row',()=>{
  expect(selectNewMembers(['bank-old','bank-new'],['bank-old','bank-new'],false,['bank-old'])).toEqual(['bank-old']);
 });
});
