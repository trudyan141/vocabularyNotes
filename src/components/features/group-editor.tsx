'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter,useSearchParams} from 'next/navigation';
import {useLiveQuery} from 'dexie-react-hooks';
import {BookOpen,MessageCircle,CalendarDays,Save,ChevronLeft,ChevronRight,Check} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Back,Artwork} from '@/components/app/shared';
import {DatabaseLoading,ReadFailure} from '@/components/app/database-boundary';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {OperationStatus} from '@/components/ui/operation-status';
import {groupCatalog,studyGroups,saveStudyGroup,sentenceKey,type StudyGroup} from '@/data/local/groups';
import {searchTerms} from '@/domain/identity';
import {lessonTitle,learningDate} from '@/lib/learning/lesson-presentation';
const pageSize=12;
export function GroupEditor(){
 const {repository,t}=useApp(),params=useSearchParams(),router=useRouter(),id=params.get('id');
 const data=useLiveQuery(async()=>{if(!repository)return null;try{const [catalog,groups]=await Promise.all([groupCatalog(repository),studyGroups(repository)]);return {scope:repository.scope.id,error:false,catalog,groups,group:groups.find(row=>row.id===id)};}catch{return {scope:repository.scope.id,error:true,catalog:null,groups:[],group:undefined};}},[repository,id]);
 if(!data||data.scope!==repository?.scope.id)return <DatabaseLoading/>;
 if(data.error||!data.catalog||id&&!data.group)return <ReadFailure/>;
 return <>{(params.get("lesson")||params.get("day"))&&data.groups.length>0&&<div className="reading-page group-destination"><label htmlFor="group-destination">{t("Thêm vào nhóm nào?","Add to which group?")}</label><select id="group-destination" value={id??""} onChange={event=>{const next=new URLSearchParams(params);if(event.target.value)next.set("id",event.target.value);else next.delete("id");router.push(`/library/groups/edit?${next}`);}}><option value="">{t("Tạo nhóm mới","Create a new group")}</option>{data.groups.map(row=><option key={row.id} value={row.id}>{row.payload.deck.name}</option>)}</select></div>}<EditGroup key={`${data.scope}:${id??'new'}`} catalog={data.catalog} group={data.group} initialLesson={params.get('lesson')} initialDay={params.get('day')}/></>;
}
function EditGroup({catalog,group,initialLesson,initialDay}:{catalog:Awaited<ReturnType<typeof groupCatalog>>;group?:StudyGroup;initialLesson:string|null;initialDay:string|null}){
 const {repository,t}=useApp();
 const [id]=useState(()=>group?.id??crypto.randomUUID());const lock=useRef(false);
 const [version,setVersion]=useState<number|null>(group?.version??null),[name,setName]=useState(group?.payload.deck.name??'');
 const old=group?.payload.deck.group;
 const validWords=(old?.wordIds??[]).filter(id=>catalog.words.some(word=>word.id===id));
 const validSentences=(old?.sentences??[]).filter(ref=>catalog.sentences.some(item=>sentenceKey(item)===ref.key));
 const missing=(old?.wordIds.length??0)+(old?.sentences.length??0)-validWords.length-validSentences.length;
 const [words,setWords]=useState<string[]>(validWords),[sentences,setSentences]=useState<string[]>(validSentences.map(ref=>ref.key));
 const [days,setDays]=useState<string[]>(initialDay?[initialDay]:[]),[lessons,setLessons]=useState<string[]>(initialLesson?[initialLesson]:[]);
 const [mode,setMode]=useState<'words'|'sentences'|'lessons'>(initialDay||initialLesson?'lessons':'words'),[query,setQuery]=useState(''),[page,setPage]=useState(0),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false),[saved,setSaved]=useState(false);
 const needle=searchTerms(query),lessonDays=[...new Set(catalog.lessons.map(lesson=>lesson.learnedOn))];
 const options=mode==='words'?catalog.words.filter(word=>searchTerms(`${word.word} ${word.vi}`).includes(needle)).map(word=>({id:word.id,label:word.word,description:`${word.vi} · ${word.pos}`,art:word.art,day:false})):
  mode==='sentences'?catalog.sentences.filter(item=>searchTerms(`${item.textEn} ${item.textVi}`).includes(needle)).map(item=>({id:sentenceKey(item),label:item.textEn,description:item.textVi,art:null,day:false})):
  lessonDays.flatMap(day=>{const rows=catalog.lessons.filter(lesson=>lesson.learnedOn===day);return [{id:day,label:t(`Cả ngày ${learningDate(day,t)}`,`All lessons on ${learningDate(day,t)}`),description:t(`${rows.length} bộ từ — gồm từ và câu đã duyệt`,`${rows.length} sets — approved words and sentences`),art:null,day:true},...rows.map(lesson=>({id:lesson.id,label:lessonTitle(lesson,t),description:learningDate(day,t),art:null,day:false}))];}).filter(item=>searchTerms(`${item.label} ${item.description} ${item.id}`).includes(needle));
 const currentPage=Math.min(page,Math.max(0,Math.ceil(options.length/pageSize)-1)),visible=options.slice(currentPage*pageSize,(currentPage+1)*pageSize);
 function checked(option:typeof options[number]){return (mode==='words'?words:mode==='sentences'?sentences:option.day?days:lessons).includes(option.id);}
 function select(items:typeof options,value:boolean){const update=(ids:string[],targets:string[])=>value?[...new Set([...ids,...targets])]:ids.filter(id=>!targets.includes(id));if(mode==='words')setWords(ids=>update(ids,items.map(item=>item.id)));else if(mode==='sentences')setSentences(ids=>update(ids,items.map(item=>item.id)));else{setDays(ids=>update(ids,items.filter(item=>item.day).map(item=>item.id)));setLessons(ids=>update(ids,items.filter(item=>!item.day).map(item=>item.id)));}setSaved(false);}
 function toggle(option:typeof options[number],value:boolean){const update=(ids:string[])=>value?[...new Set([...ids,option.id])]:ids.filter(id=>id!==option.id);if(mode==='words')setWords(update);else if(mode==='sentences')setSentences(update);else if(option.day)setDays(update);else setLessons(update);setSaved(false);}
 return <form className="reading-page page-flow parent-page group-editor" onSubmit={async event=>{
  event.preventDefault();if(!repository||lock.current)return;lock.current=true;setBusy(true);setMessage('');setError(false);
  try{const refs=sentences.map(key=>{const item=catalog.sentences.find(item=>sentenceKey(item)===key)!;return {senseId:item.senseId,key};});const result=await saveStudyGroup(repository,{id,version,name,members:{wordIds:words,sentences:refs},days,lessonIds:lessons});setVersion(result.row.version);setWords(result.row.payload.deck.group.wordIds);setSentences(result.row.payload.deck.group.sentences.map(ref=>ref.key));setDays([]);setLessons([]);setSaved(true);setMessage(t(`Đã lưu nhóm · ${result.added} mục thêm · ${result.duplicates} mục trùng đã bỏ.`,`Group saved · ${result.added} added · ${result.duplicates} duplicates skipped.`));}
  catch(cause){setError(true);setMessage(cause instanceof Error&&cause.message==='duplicate'?t('Tên nhóm đã có. Đổi tên hoặc mở nhóm đó để thêm bài.','That group name exists. Choose another name or open that group.'):t('Chưa lưu được. Lựa chọn vẫn còn. Nếu bài hoặc nhóm đã đổi ở tab khác, quay lại mở bản mới.','Save failed. Your selections remain. Reopen if the lesson or group changed in another tab.'));}
  finally{lock.current=false;setBusy(false);}
 }}>
  <Back href={group?`/library/groups?group=${encodeURIComponent(group.id)}`:'/library/groups'}/>
  <header><h1>{group?t('Sửa nhóm học','Edit learning group'):t('Tạo nhóm học','Create learning group')}</h1><p className="muted">{t('Chọn từng từ, câu hoặc thêm cả bài. Mục trùng sẽ tự bỏ.','Choose words, sentences or whole lessons. Duplicates are skipped.')}</p></header>
  <label htmlFor="group-name">{t('Tên nhóm','Group name')}<Input id="group-name" required maxLength={100} placeholder={t('Ví dụ: Anh văn Family','For example: Family English')} value={name} disabled={busy} onChange={event=>{setName(event.target.value);setSaved(false);}}/></label>
  {missing>0&&<p role="status">{t(`${missing} mục không còn được duyệt sẽ được bỏ khỏi nhóm khi lưu.`,`${missing} unavailable items will be removed when you save.`)}</p>}
  <div className="content-modes group-tabs">{([['words','Từ','Words',BookOpen],['sentences','Câu','Sentences',MessageCircle],['lessons','Bài / ngày','Lessons / dates',CalendarDays]] as const).map(([value,vi,en,Icon])=><Button type="button" variant="segment" key={value} disabled={busy} aria-pressed={mode===value} onClick={()=>{setMode(value);setQuery('');setPage(0);}}><Icon aria-hidden="true"/>{t(vi,en)}</Button>)}</div>
  <section className="deck-picker group-picker">
   <p className="selection-count" role="status">{t(`${words.length} từ · ${sentences.length} câu · ${lessons.length} bài · ${days.length} ngày được chọn`,`${words.length} words · ${sentences.length} sentences · ${lessons.length} lessons · ${days.length} dates selected`)}</p>
   <label>{t('Tìm mục để chọn','Find items to select')}<Input type="search" value={query} disabled={busy} placeholder={t('Tìm tiếng Anh, tiếng Việt hoặc ngày học…','Search English, Vietnamese or a learning date…')} onChange={event=>{setQuery(event.target.value);setPage(0);}}/></label>
   <div className="picker-tools"><Button type="button" variant="secondary" disabled={busy||!options.length||options.every(checked)} onClick={()=>select(options,true)}>{t(`Chọn tất cả ${options.length} mục`,`Select all ${options.length} items`)}</Button><Button type="button" variant="outline" disabled={busy||!visible.length} onClick={()=>select(visible,!visible.every(checked))}>{visible.length&&visible.every(checked)?t('Bỏ chọn trang này','Unselect this page'):t('Chọn cả trang','Select this page')}</Button>{options.some(checked)&&<Button type="button" variant="ghost" disabled={busy} onClick={()=>select(options,false)}>{t('Bỏ chọn kết quả','Unselect results')}</Button>}</div>
   {query.trim()&&<small>{t('Chọn tất cả áp dụng cho kết quả tìm kiếm ở mọi trang.','Select all includes matching results on every page.')}</small>}
   {!options.length&&<p>{t('Chưa có mục phù hợp. Thêm và duyệt bài trong Thư viện trước nhé.','No matching items. Add and approve library content first.')}</p>}
   <ul className={`deck-word-grid group-option-list ${mode==='words'?'':'group-option-full'}`}>{visible.map(option=><li key={`${option.day?'day':'item'}:${option.id}`}><label className={checked(option)?'is-selected':''}><input type="checkbox" disabled={busy} checked={checked(option)} aria-label={`${option.label} · ${option.description}`} onChange={event=>toggle(option,event.target.checked)}/>{option.art&&<Artwork art={option.art} word={option.label} size={40}/>}<span><strong lang={mode==='lessons'?undefined:'en'}>{option.label}</strong><span>{option.description}</span></span></label></li>)}</ul>
   {options.length>pageSize&&<nav className="picker-pagination" aria-label={t('Trang chọn nội dung','Content picker pages')}><Button type="button" variant="secondary" disabled={busy||!currentPage} onClick={()=>setPage(currentPage-1)}><ChevronLeft aria-hidden="true"/>{t('Trước','Previous')}</Button><span>{currentPage+1} / {Math.ceil(options.length/pageSize)}</span><Button type="button" variant="secondary" disabled={busy||(currentPage+1)*pageSize>=options.length} onClick={()=>setPage(currentPage+1)}>{t('Sau','Next')}<ChevronRight aria-hidden="true"/></Button></nav>}
  </section>
  <div className="deck-save-bar"><span>{t('Chỉ lưu khi bạn bấm nút này','Saved only when you confirm')}</span><Button type="submit" disabled={busy||!name.trim()}><Save aria-hidden="true"/>{busy?t('Đang lưu…','Saving…'):t('Lưu nhóm','Save group')}</Button></div>
  <OperationStatus busy={busy} title={t('Đang lưu nhóm','Saving group')} message={message} error={error}/>
  {saved&&<Button asChild variant="secondary"><Link href={`/library/groups?group=${encodeURIComponent(id)}`}><Check aria-hidden="true"/>{t('Mở nhóm vừa lưu','Open saved group')}</Link></Button>}
 </form>;
}
