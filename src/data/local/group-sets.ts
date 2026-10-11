import type {Deck,GroupSet} from './decks';
import type {LearningItem} from './learning-library';
import type {Lesson,LessonItem} from './types';
type Members=NonNullable<Deck['group']>;
/** Persist the original source label/date; assign each member only once across the group. */
export function assignGroupSets(members:Members,lessons:Lesson[],links:LessonItem[],items:{sentences:LearningItem[];grammar:LearningItem[]},keys:{sentence:(item:LearningItem)=>string;grammar:(item:LearningItem)=>string},previous:GroupSet[]=[],preferred=new Map<string,string>(),fallbackDay=localDay()):GroupSet[]{
 const selected={words:new Set(members.wordIds),sentences:new Set(members.sentences.map(ref=>ref.key)),grammar:new Set((members.grammar??[]).map(ref=>ref.key))},used={words:new Set<string>(),sentences:new Set<string>(),grammar:new Set<string>()};
 const sets=new Map<string,GroupSet>();
 for(const set of previous){const keep=(values:string[],type:keyof typeof selected)=>values.filter(value=>{if(!selected[type].has(value)||used[type].has(value))return false;used[type].add(value);return true;});const next={...set,wordIds:keep(set.wordIds,'words'),sentenceKeys:keep(set.sentenceKeys,'sentences'),grammarKeys:keep(set.grammarKeys,'grammar')};if(next.wordIds.length+next.sentenceKeys.length+next.grammarKeys.length)sets.set(next.id,next);}
 const ordered=[...lessons].sort((a,b)=>a.learnedOn.localeCompare(b.learnedOn)||a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
 function assign(type:keyof typeof selected,id:string,senseId:string,sourceId?:string){if(used[type].has(id))return;used[type].add(id);const lessonId=preferred.get(`${type}:${id}`)??sourceId;const source=ordered.find(lesson=>lesson.id===lessonId)??ordered.find(lesson=>links.some(link=>!link.deletedAt&&link.lessonId===lesson.id&&link.senseId===senseId));const setId=source?`lesson:${source.id}`:`day:${fallbackDay}`;let set=sets.get(setId);if(!set){set={id:setId,...(source?{lessonId:source.id}:{}),title:source?.title??'',learnedOn:source?.learnedOn??fallbackDay,sourceType:source?.sourceType??'manual',wordIds:[],sentenceKeys:[],grammarKeys:[]};sets.set(setId,set);}set[type==='words'?'wordIds':type==='sentences'?'sentenceKeys':'grammarKeys'].push(id);}
 for(const id of members.wordIds)assign('words',id,id);
 for(const ref of members.sentences){const item=items.sentences.find(item=>item.senseId===ref.senseId&&keys.sentence(item)===ref.key);assign('sentences',ref.key,ref.senseId,item?.lessonId);}
 for(const ref of members.grammar??[]){const item=items.grammar.find(item=>item.senseId===ref.senseId&&keys.grammar(item)===ref.key);assign('grammar',ref.key,ref.senseId,item?.lessonId);}
 return [...sets.values()].sort((a,b)=>b.learnedOn.localeCompare(a.learnedOn)||a.id.localeCompare(b.id));
}
function localDay(){const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
