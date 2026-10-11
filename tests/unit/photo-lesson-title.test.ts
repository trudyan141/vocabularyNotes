import {it,expect} from 'vitest';
import {photoLessonTitle,lessonCreatedTime} from '@/lib/learning/lesson-presentation';
it('names photo lessons from up to four distinct reviewed words and keeps explicit names',()=>{
 expect(photoLessonTitle('', ['apple','book','apple','car','chair','table'],'Photo lesson')).toBe('apple, book, car, chair');
 expect(photoLessonTitle('Ảnh đã dán',['car','chair'],'Photo lesson')).toBe('car, chair');
 expect(photoLessonTitle('My lesson',['car'],'Photo lesson')).toBe('My lesson');expect(photoLessonTitle('',[],'Photo lesson')).toBe('Photo lesson');
 expect(lessonCreatedTime('2026-10-12T01:02:03Z',vi=>vi)).toMatch(/\d{2}:02:03/);
});
