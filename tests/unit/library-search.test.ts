import {describe,it,expect} from 'vitest';
import {searchRanges,visibleSenseChoices} from '@/lib/learning/library-search';
import type {LibraryWord} from '@/data/local/types';
describe('word search and highlight ranges',()=>{
 it('matches are at word starts, never inside care, share or scare',()=>{
  expect(searchRanges('care share scare','are')).toEqual([]);
  expect(searchRanges('ARE you there? are','are')).toEqual([[0,3],[15,18]]);
  expect(searchRanges('teddy bears','ted')).toEqual([[0,3]]);
 });
 it('folds Vietnamese accents and preserves the displayed highlight offsets',()=>{
  expect(searchRanges('Quả táo đỏ','qua tao')).toEqual([[0,7]]);
  expect(searchRanges('đẹp trai','dep')).toEqual([[0,3]]);
 });
 it('handles whitespace, punctuation and regex input safely',()=>{
  expect(searchRanges('Teddy   bears',' teddy be ')).toEqual([[0,10]]);
  expect(searchRanges('a+b','a+')).toEqual([[0,2]]);
  expect(searchRanges('apple',' ')).toEqual([]);
 });
});
it('hides repeated sense labels in detail while retaining current ID and distinct meanings',()=>{
 const words=[{id:'one',pos:'noun',vi:'ông'},{id:'two',pos:'noun',vi:'ÔNG'},{id:'three',pos:'noun',vi:'người già'}] as LibraryWord[];
 expect(visibleSenseChoices(words,'two').map(word=>word.id)).toEqual(['two','three']);expect(words).toHaveLength(3);
});
