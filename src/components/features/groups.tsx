'use client';
import {practiceHref} from '@/lib/learning/practice-filter';
import {groupGrammarItems} from '@/data/local/learning-library';
import {DeleteControl} from './delete-control';
import {LearningCard} from './content-library';
import {useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {useLiveQuery} from 'dexie-react-hooks';
import {FolderHeart,Plus,Play,BookOpen,CalendarDays,ChevronLeft,ChevronRight} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Artwork,Back,EmptyState} from '@/components/app/shared';
import {ActionLink} from '@/components/app/action-link';
import {DatabaseLoading,ReadFailure} from '@/components/app/database-boundary';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {SearchHighlight} from '@/components/ui/search-highlight';
import {studyGroups,groupContents,grammarKey} from '@/data/local/groups';
import {groupLibraryWords,matchesLibraryWord} from '@/lib/learning/library-search';
import {searchTerms} from '@/domain/identity';
import {lessonTitle,learningDate} from '@/lib/learning/lesson-presentation';
const pageSize=12;
export function Groups(){const {repository}=useApp(),params=useSearchParams();return <ScopedGroups key={`${repository?.scope.id??'loading'}:${params.get('group')??'all'}`}/>;}
function ScopedGroups(){
 const {repository,t}=useApp(),params=useSearchParams();
 const [mode,setMode]=useState<'words'|'grammar'>('words'),[query,setQuery]=useState(''),[page,setPage]=useState(0),[setId,setSetId]=useState<string|null>(null),[lessonPage,setLessonPage]=useState(0);
 const groupId=params.get('group');
 const data=useLiveQuery(async()=>{if(!repository)return null;try{const rows=await studyGroups(repository),selected=rows.find(row=>row.id===groupId);return {scope:repository.scope.id,error:false,rows,selected,content:selected?await groupContents(repository,selected):null};}catch{return {scope:repository.scope.id,error:true,rows:[],selected:undefined,content:null};}},[repository,groupId]);
 if(!data||data.scope!==repository?.scope.id)return <DatabaseLoading/>;
 if(data.error)return <ReadFailure/>;
 const selected=data.selected,content=data.content,currentSet=content?.sets.find(set=>set.id===setId);
 const needle=searchTerms(query),matching=(value:string)=>searchTerms(value).includes(needle);
 const words=groupLibraryWords(content?.words.filter(word=>!currentSet||currentSet.wordIds.includes(word.id)).filter(word=>matchesLibraryWord(word,query))??[]),grammar=content?.grammar.filter(item=>!currentSet||currentSet.grammarKeys.includes(grammarKey(item))).filter(item=>matching(`${item.title} ${item.textEn} ${item.textVi}`))??[];
 const learning=groupGrammarItems(grammar);
 const total=content?(mode==='words'?words.length:learning.length):data.rows.length;
 const currentSetPage=Math.min(lessonPage,Math.max(0,Math.ceil((content?.sets.length??0)/6)-1));
 const currentPage=Math.min(page,Math.max(0,Math.ceil(total/pageSize)-1)),start=currentPage*pageSize;
 return <div className="reading-page page-flow study-groups">
  <Back href={groupId?'/library/groups':'/library'}/>
  <header className="group-detail-header"><div className="section-heading"><h1>{selected?selected.payload.deck.name:t('Nhóm học của con','My learning groups')}</h1>{selected&&<DeleteControl iconOnly target={{table:'decks',id:selected.id,version:selected.version}} label={t('Xóa nhóm','Delete group')} description={t('Xóa nhóm này? Các từ và ngữ pháp trong thư viện vẫn giữ.','Delete this group? Library words and grammar are kept.')}/>}</div>{selected&&<p className="muted">{selected.payload.deck.group.wordIds.length} {t('từ','words')} · {selected.payload.deck.group.grammar?.length??0} {t('ngữ pháp','grammar items')}</p>}<div className="group-header-actions">{selected&&selected.payload.deck.group.wordIds.length>0&&<Button asChild><Link href={`/practice?deck=${encodeURIComponent(selected.id)}`}><Play aria-hidden="true"/>{t('Học ngay','Play now')}</Link></Button>}<ActionLink href={`/library/groups/edit${selected?`?id=${encodeURIComponent(selected.id)}`:''}`}><Button variant={selected?'secondary':'default'}>{selected?<Plus aria-hidden="true"/>:<Plus aria-hidden="true"/>}{selected?t('Thêm bài','Add lessons'):t('Tạo nhóm','Create group')}</Button></ActionLink></div></header>
  {groupId&&!selected?<EmptyState title={t('Chưa mở được nhóm này','This group is unavailable')} description={t('Nhóm có thể đã đổi hoặc không thuộc thư viện đang mở. Quay lại để chọn nhóm khác.','Return to choose a group from the current library.')}/>:selected&&content?<>
   {content.missing>0&&<p>{t(`${content.missing} mục cần bạn kiểm lại`,`${content.missing} items need review`)}</p>}
   {content.sets.length>0&&<section className="page-flow group-dated-section" aria-label={t('Bài trong nhóm theo ngày','Group lessons by date')}><div className="section-heading"><h2>{t('Bài trong nhóm','Group lessons')}</h2><Button variant="secondary" aria-pressed={!currentSet} onClick={()=>{setSetId(null);setPage(0);}}>{t('Tất cả bài','All lessons')}</Button></div><div className="group-date-sets">{content.sets.slice(currentSetPage*6,(currentSetPage+1)*6).map(set=>{const pictured=content.words.filter(word=>set.wordIds.includes(word.id)&&word.art);const cover=pictured.find(word=>word.art?.startsWith('media-'))??pictured[0];return <div className="group-lesson-card" data-selected={currentSet?.id===set.id} key={set.id}><Button className="group-date-set" variant="outline" aria-pressed={currentSet?.id===set.id} onClick={()=>{setSetId(set.id);setPage(0);setMode(set.wordIds.length?'words':'grammar');}}><span className="group-date-art"><Artwork art={cover?.art??'book'} word={cover?.word??''} size={48}/></span><span><strong>{lessonTitle(set,t)}</strong><small><CalendarDays aria-hidden="true"/>{learningDate(set.learnedOn,t)}</small><small>{set.wordIds.length} {t('từ','words')} · {set.grammarKeys.length} {t('ngữ pháp','grammar items')}</small></span></Button><Button asChild className="group-lesson-play"><Link href={practiceHref({deck:selected.id,set:set.id})}><Play aria-hidden="true"/>{t('Chơi & học bài này','Play & learn this lesson')}</Link></Button></div>;})}</div>{content.sets.length>6&&<nav className="picker-pagination" aria-label={t('Trang bài trong nhóm','Group lesson pages')}><Button variant="secondary" disabled={!currentSetPage} onClick={()=>setLessonPage(currentSetPage-1)}><ChevronLeft aria-hidden="true"/>{t('Trước','Previous')}</Button><span>{currentSetPage+1} / {Math.ceil(content.sets.length/6)}</span><Button variant="secondary" disabled={(currentSetPage+1)*6>=content.sets.length} onClick={()=>setLessonPage(currentSetPage+1)}>{t('Sau','Next')}<ChevronRight aria-hidden="true"/></Button></nav>}</section>}
   <div className="content-modes content-modes-two group-tabs">{([['words','Từ','Words',BookOpen],['grammar','Ngữ pháp','Grammar',BookOpen]] as const).map(([value,vi,en,Icon])=><Button key={value} variant="segment" aria-pressed={mode===value} onClick={()=>{setMode(value);setPage(0);}}><Icon aria-hidden="true"/>{t(vi,en)}</Button>)}</div>
   {currentSet&&<p className="muted group-set-current">{t('Đang xem: ','Viewing: ')}{lessonTitle(currentSet,t)}</p>}
   <label>{t('Tìm trong nhóm','Search this group')}<Input type="search" value={query} onChange={event=>{setQuery(event.target.value);setPage(0);}} placeholder={t('Tìm tiếng Anh hoặc tiếng Việt…','Search English or Vietnamese…')}/></label>
   {!total&&<EmptyState title={t('Chưa có mục phù hợp','No matching items')} description={query?t('Thử từ khác nhé.','Try another word.'):t('Bạn có thể thêm từ, ngữ pháp hoặc cả bài học vào nhóm.','Add words, grammar or a whole lesson to this group.')}/>}
   {mode==='words'?<ul className="group-word-list">{words.slice(start,start+pageSize).map(word=><li key={word.id}><Link href={`/library/words/${encodeURIComponent(word.id)}`}><Artwork art={word.art} word={word.word} size={64}/><span><strong lang="en"><SearchHighlight text={word.word} query={query}/></strong><small><SearchHighlight text={word.vi} query={query}/> · {word.pos}</small></span></Link>{word.relatedSenses&&<details><summary>{t("Xem các nghĩa","View meanings")}</summary>{word.relatedSenses.map(sense=><Link key={sense.id} href={`/library/words/${encodeURIComponent(sense.id)}`}><SearchHighlight text={sense.vi} query={query}/> · {sense.pos}</Link>)}</details>}</li>)}</ul>:<div className="group-sentences page-flow">{learning.slice(start,start+pageSize).map(item=><LearningCard key={`${item.table}:${item.id}`} item={item} mode="grammar" removable={false}/>)}</div>}
  </>:<>{!data.rows.length?<EmptyState title={t('Một nhóm, một chủ đề','A group for every topic')} description={t('Ví dụ: Anh văn Family, Anh văn tiểu học. Chọn từ và ngữ pháp đã lưu cho từng nhóm.','For example: Family English or Primary English. Choose saved words and grammar for each group.')}/>:<div className="group-list">{data.rows.slice(start,start+pageSize).map((row,i)=><Link className={`group-link ${i%2?'lilac':'mint'}`} key={row.id} href={`/library/groups?group=${encodeURIComponent(row.id)}`}><FolderHeart aria-hidden="true"/><span><strong>{row.payload.deck.name}</strong><small>{row.payload.deck.group.wordIds.length} {t('từ','words')} · {row.payload.deck.group.grammar?.length??0} {t('ngữ pháp','grammar items')}</small></span><ChevronRight aria-hidden="true"/></Link>)}</div>}</>}

  {total>pageSize&&<nav className="picker-pagination" aria-label={t('Trang nhóm học','Learning group pages')}><Button variant="secondary" disabled={!currentPage} onClick={()=>setPage(currentPage-1)}><ChevronLeft aria-hidden="true"/>{t('Trước','Previous')}</Button><span>{currentPage+1} / {Math.ceil(total/pageSize)}</span><Button variant="secondary" disabled={start+pageSize>=total} onClick={()=>setPage(currentPage+1)}>{t('Sau','Next')}<ChevronRight aria-hidden="true"/></Button></nav>}
 </div>;
}
