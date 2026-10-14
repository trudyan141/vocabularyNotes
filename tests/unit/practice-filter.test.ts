import {it,expect} from 'vitest';
import {practiceFilter,practiceHref} from '@/lib/learning/practice-filter';
it('round-trips the scope without auto-start group or previous session parameters',()=>{
 const filter={lesson:'bài a',deck:'nhóm & b',set:'lesson:abc',word:'word?',due:true,weak:true,direction:'vi-en' as const};
 const href=practiceHref(filter,'new-round');const url=new URL(href,'https://fixture.invalid');expect(practiceFilter(url.searchParams)).toEqual(filter);expect(url.searchParams.get('session')).toBe('new-round');
 expect(practiceHref({})).toBe('/practice');expect(practiceHref({deck:'g'},undefined,'/practice/speaking')).toBe('/practice/speaking?deck=g');
});
