import type {Lesson} from '@/data/local/types';

type Translate = (vi:string,en:string)=>string;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A calendar date, independent of the browser's time zone. */
export function learningDate(day:string, t:Translate) {
  const date = new Date(`${day}T12:00:00Z`);
  if (!Number.isFinite(date.getTime())) return day;
  return new Intl.DateTimeFormat(t('vi-VN','en-GB'), {
    day:'2-digit', month:'2-digit', year:'numeric', timeZone:'UTC',
  }).format(date);
}

/** Presentation only: never silently rename a saved lesson. */
export function lessonTitle(lesson:Pick<Lesson,'title'|'learnedOn'|'sourceType'>, t:Translate) {
  const title = lesson.title.trim();
  if(lesson.sourceType==='demo'&&title==='Fruit & food / Trái cây & đồ ăn')return t('Trái cây & đồ ăn','Fruit & food');
  if(lesson.sourceType==='demo'&&title==='Your world / Thế giới quanh con')return t('Thế giới quanh con','Your world');
  if (title && !uuid.test(title) && !/^Từ gõ tay · \d{4}-\d{2}-\d{2}$/.test(title)) return title;
  const source = lesson.sourceType === 'image'
    ? t('Bài học từ ảnh','Photo lesson')
    : lesson.sourceType === 'demo' ? t('Bài mẫu','Sample lesson') : t('Từ gõ tay','Typed words');
  return `${source} · ${learningDate(lesson.learnedOn,t)}`;
}
