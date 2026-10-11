import {expect,it} from 'vitest';
import {candidateIdentity,removeDuplicateCandidates,type OcrCandidate} from '@/lib/ocr/candidates';
import {worksheetPatterns} from '@/lib/learning/worksheet-patterns';
const book:OcrCandidate={id:'first',literal:'book',word:'book',vi:'sách',en:'A book.',pos:'noun',sense:'object',example:'A book.',exampleVi:'Một quyển sách.',selected:false,art:null};
it('removes only exact duplicates, retaining the first selected row and distinct meanings/POS',()=>{const selected={...book,id:'selected',word:' Book! ',selected:true,vi:'bản đã kiểm'};const otherSense={...book,id:'verb',pos:'verb',sense:'reserve'};const otherMeaning={...book,id:'second-meaning',sense:'register'};expect(removeDuplicateCandidates([book,selected,{...selected,id:'later'},otherSense,otherMeaning])).toEqual([selected,otherSense,otherMeaning]);expect(candidateIdentity({...book,word:''})).toBeNull();expect(removeDuplicateCandidates([{...book,word:''}])).toHaveLength(1);});
it('keeps literal source questions and answers distinct from supplementary Vietnamese teaching',()=>{const text="book\nWhat is it?\nIt is a book.\nIs it a book?";const patterns=worksheetPatterns(book,text);expect(patterns[0].content.sourceEvidenceText).toBe('What is it? It is a book.');expect(patterns[1].content.sourceEvidenceText).toBe('Is it a book?');expect(patterns[0].content.analysis).toContain('It’s = It is');for(const p of patterns)expect(p.content.source).toContain('dự án bổ sung');expect(worksheetPatterns(book,'book').every(p=>!p.content.sourceEvidenceText)).toBe(true);expect(worksheetPatterns(book,"It’s a chair.")[0].content.sourceEvidenceText).toBeUndefined();expect(worksheetPatterns(book,'It is a bookshelf.')[0].content.sourceEvidenceText).toBeUndefined();expect(worksheetPatterns({...book,word:'water'},'What is it?')).toEqual([]);});

import {pathId} from '@/lib/path-id';
it('decodes imported IDs once without corrupting literal percent sequences',()=>{expect(pathId('operation%3Aai-7')).toBe('operation:ai-7');expect(pathId('literal%253Avalue')).toBe('literal%3Avalue');expect(pathId('bad%')).toBe('bad%');});
it('derives family questions from readable dialogue without treating inferred grammar as printed evidence',()=>{
 const family={word:'family',pos:'noun'},text='Who are they?\nThey are a family.';
 const result=worksheetPatterns(family,text);expect(result.map(row=>row.content.example)).toEqual(['Who are they?','They are a family.','Who are they? They are a family.']);
 expect(result[2].content.conditions).toContain('They chỉ nhiều người nên dùng are');expect(result[2].content.sourceEvidenceText).toBe('They are a family.');
 expect(worksheetPatterns(family,'Who are they?')).toEqual([]);expect(worksheetPatterns(family,'Who are they? They are teachers.')).toEqual([]);
});
