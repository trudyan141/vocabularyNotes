import {it,expect} from 'vitest';
import {assessPhones} from '@/lib/speaking/assessment';
import {soundGroups} from '@/lib/speaking/graphemes';
const heard=(phones:string[])=>phones.map((phone,i)=>({phone,confidence:.9,startMs:i*40,endMs:(i+1)*40}));
it('covers every apple letter, groups pp and le, and colours only the affected group',()=>{
 const row=assessPhones([{text:'apple',variants:[['æ','p','ə','l']]}],heard(['æ','b','ɑ','l']))[0],groups=soundGroups(row);
 expect(groups.map(g=>g.letters)).toEqual(['a','pp','le']);expect(groups.map(g=>g.status)).toEqual(['match','retry','incorrect']);expect(groups[2].phones.map(p=>p.expected)).toEqual(['ə','l']);expect(groups.map(g=>g.letters).join('')).toBe('apple');
});
it('handles doubled/digraph consonants, missing sounds and silent final e without inventing a phone',()=>{
 const cat=assessPhones([{text:'cat',variants:[['k','æ','t']]}],heard(['k','æ']))[0];expect(soundGroups(cat).map(g=>g.status)).toEqual(['match','match','missing']);
 const book=assessPhones([{text:'book',variants:[['b','ʊ','k']]}],heard(['b','ʊ','k']))[0];expect(soundGroups(book).map(g=>g.letters)).toEqual(['b','oo','k']);
 const name=assessPhones([{text:'name',variants:[['n','eɪ','m']]}],heard(['n','eɪ','m']))[0];const groups=soundGroups(name);expect(groups.map(g=>g.letters).join('')).toBe('name');expect(groups.at(-1)?.silentTail).toBe('e');expect(groups.flatMap(g=>g.phones).map(p=>p.expected)).toEqual(name.expected);
});
it('keeps all spelling and sound feedback when spelling correspondence is unsupported',()=>{const row=assessPhones([{text:'colonel',variants:[['k','ɝ','n','ə','l']]}],heard(['k','ɝ','n','ə','l']))[0];const groups=soundGroups(row);expect(groups).toHaveLength(1);expect(groups[0].letters).toBe('colonel');expect(groups[0].phones).toHaveLength(5);});
