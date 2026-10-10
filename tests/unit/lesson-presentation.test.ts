import {it,expect} from 'vitest';
import {lessonTitle,learningDate} from '@/lib/learning/lesson-presentation';
const vi=(vi:string)=>vi,en=(_vi:string,en:string)=>en;
it('presents legacy automatic titles without changing custom titles or shifting calendar dates',()=>{
 const lesson={title:'7be664db-ded5-44ca-b8c5-508b86c92f31',learnedOn:'2026-10-10',sourceType:'image' as const};
 expect(lessonTitle(lesson,vi)).toBe('Bài học từ ảnh · 10/10/2026');expect(lessonTitle(lesson,en)).toBe('Photo lesson · 10/10/2026');expect(lesson.title).toMatch(/^7be/);
 expect(lessonTitle({...lesson,title:'Anh văn Family'},vi)).toBe('Anh văn Family');
 expect(learningDate('2026-10-10',vi)).toBe('10/10/2026');expect(learningDate('invalid',vi)).toBe('invalid');
 expect(lessonTitle({...lesson,sourceType:'manual',title:'Từ gõ tay · 2026-10-10'},vi)).toBe('Từ gõ tay · 10/10/2026');
});
