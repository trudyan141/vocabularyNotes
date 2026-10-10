"use client";
import {useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {ChevronLeft,ChevronRight,Search,Layers,Save,Plus} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {useLibrarySearch} from '@/data/local/hooks';
import {Back} from '@/components/app/shared';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {saveDeck,type Deck} from '@/data/local/decks';
import type {ScopedDocument} from '@/data/local/types';
const pageSize=12;
export function DeckEditor(){const {repository}=useApp();return <ScopedDeckEditor key={repository?.scope.id??'loading'}/>;}
function ScopedDeckEditor(){
 const {repository,t}=useApp();
 const [query,setQuery]=useState(''),[page,setPage]=useState(0),[name,setName]=useState(''),[selected,setSelected]=useState<string[]>([]),[direction,setDirection]=useState<Deck['direction']>('en-vi'),[version,setVersion]=useState<number|null>(null),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
 const id=useRef(crypto.randomUUID()),lock=useRef(false);
 const result=useLibrarySearch(query,{limit:pageSize,offset:page*pageSize});
 const decks=useLiveQuery(async()=>repository?{scope:repository.scope.id,rows:await repository.db.table<ScopedDocument>('decks').where('[scopeId+id]').between([repository.scope.id,''],[repository.scope.id,'\uffff']).toArray()}:null,[repository]);
 const selectedSet=new Set(selected),pageIds=result?.words.map(word=>word.id)??[];
 const allPageSelected=pageIds.length>0&&pageIds.every(wordId=>selectedSet.has(wordId));
 async function save(){if(!repository||lock.current)return;lock.current=true;setBusy(true);setStatus('');try{const row=await saveDeck(repository,id.current,version,{name,senseIds:selected,direction});setVersion(row.version);setStatus(t('Đã lưu bộ thẻ. Chọn bộ này trong Chơi & học.','Deck saved. Select it in Play & learn.'));}catch{setStatus(t('Chưa lưu được. Các từ đã chọn vẫn còn; thử lại hoặc mở bản mới nếu bộ thẻ đã đổi ở tab khác.','Save failed. Your selections remain; retry or reopen if another tab changed this deck.'));}finally{lock.current=false;setBusy(false);}}
 return <div className="reading-page page-flow parent-page deck-editor">
  <Back href="/practice"/><header><h1>{t('Bộ thẻ của con','Custom flashcards')}</h1><p className="muted">{t('Đặt tên, chọn từ rồi lưu để con ôn.','Name it, pick words, then save for practice.')}</p></header>
  <div className="form-field"><label htmlFor="deck-name">{t('Tên bộ thẻ','Deck name')}</label><Input id="deck-name" placeholder={t('Ví dụ: Đồ dùng của con','For example: My school things')} value={name} maxLength={100} onChange={e=>setName(e.target.value)} disabled={busy}/></div>
  <details className="deck-direction"><summary>{t('Cách ôn: ','Practice: ')}{direction==='en-vi'?t('nhìn tiếng Anh → nhớ tiếng Việt','English → Vietnamese'):t('nhìn tiếng Việt → nhớ tiếng Anh','Vietnamese → English')}</summary><div className="form-field"><label htmlFor="deck-direction">{t('Chiều ôn','Direction')}</label><select id="deck-direction" disabled={busy} value={direction} onChange={e=>setDirection(e.target.value as Deck['direction'])}><option value="en-vi">English → tiếng Việt</option><option value="vi-en">Tiếng Việt → English</option></select></div></details>
  <section className="deck-picker" aria-labelledby="pick-words-title">
   <div className="section-heading"><h2 id="pick-words-title" className="icon-heading"><Layers aria-hidden="true"/>{t('Chọn từ cho bộ thẻ','Pick words')}</h2><span className="selection-count" aria-live="polite">{t(`Đã chọn ${selected.length} từ`,`${selected.length} selected`)}</span></div>
   <div className="form-field"><label htmlFor="deck-search">{t('Tìm từ để chọn','Find words to select')}</label><div className="search-field"><Search aria-hidden="true"/><Input id="deck-search" type="search" placeholder={t('Tìm bằng tiếng Anh hoặc tiếng Việt','Search English or Vietnamese')} value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/></div></div>
   <div className="picker-tools"><Button size="sm" variant="outline" disabled={busy||!pageIds.length} onClick={()=>setSelected(ids=>allPageSelected?ids.filter(wordId=>!pageIds.includes(wordId)):[...new Set([...ids,...pageIds])])}>{allPageSelected?t('Bỏ chọn trang này','Unselect this page'):t('Chọn cả trang','Select this page')}</Button>{selected.length>0&&<Button size="sm" variant="ghost" disabled={busy} onClick={()=>setSelected([])}>{t('Bỏ chọn tất cả','Clear selections')}</Button>}</div>
   {!result?<p role="status">{t('Đang tìm từ…','Finding words…')}</p>:result.error?<p role="alert">{t('Chưa đọc được thư viện. Thử tìm lại sau; các từ đã chọn vẫn còn trên trang này.','Could not read the library. Try searching later; your selections remain on this page.')}</p>:!result.words.length?<p>{t(query?'Không có từ phù hợp. Thử tên khác nhé.':'Chưa có từ để chọn. Thêm và duyệt từ trong Thư viện trước nhé.',query?'No matches. Try another word.':'Add and approve library words first.')}</p>:<ul className="deck-word-grid">{result.words.map(word=><li key={word.id}><label className={selectedSet.has(word.id)?'is-selected':''}><input type="checkbox" aria-label={`${word.word} · ${word.vi} · ${word.pos}`} checked={selectedSet.has(word.id)} disabled={busy} onChange={e=>setSelected(ids=>e.target.checked?[...ids,word.id]:ids.filter(x=>x!==word.id))}/><span><strong lang="en">{word.word}</strong><span lang="vi">{word.vi}</span></span></label></li>)}</ul>}
   {result&&!result.error&&result.total>pageSize&&<nav className="picker-pagination" aria-label={t('Trang danh sách từ','Word list pages')}><Button variant="outline" size="sm" disabled={busy||page===0} onClick={()=>setPage(p=>p-1)}><ChevronLeft aria-hidden="true"/>{t('Trước','Previous')}</Button><span>{t(`Trang ${page+1} / ${Math.ceil(result.total/pageSize)}`,`Page ${page+1} / ${Math.ceil(result.total/pageSize)}`)}</span><Button variant="outline" size="sm" disabled={busy||(page+1)*pageSize>=result.total} onClick={()=>setPage(p=>p+1)}>{t('Sau','Next')}<ChevronRight aria-hidden="true"/></Button></nav>}

  </section>
  <div className="deck-save-bar"><span>{t(`${selected.length} từ trong bộ thẻ`,`${selected.length} words in deck`)}</span><Button disabled={busy||!selected.length||!name.trim()} onClick={()=>void save()}><Save aria-hidden="true"/>{busy?t('Đang lưu…','Saving…'):t('Lưu bộ thẻ','Save deck')}</Button></div>
  {status&&<p role="status">{status}</p>}
  <Button variant="outline" className="self-start" disabled={busy} onClick={()=>{id.current=crypto.randomUUID();setVersion(null);setName('');setSelected([]);setQuery('');setPage(0);setStatus('');}}><Plus aria-hidden="true"/>{t('Tạo bộ khác','Create another deck')}</Button>
  {decks&&decks.scope===repository?.scope.id&&decks.rows.some(row=>!row.deletedAt&&!(row.payload.deck as Deck).group)&&<section className="page-flow"><h2>{t('Bộ thẻ đã lưu','Saved decks')}</h2><div className="row-wrap">{decks.rows.filter(row=>!row.deletedAt&&!(row.payload.deck as Deck).group).map(row=>{const deck=row.payload.deck as Deck;return <Button key={row.id} disabled={busy} variant="outline" onClick={()=>{id.current=row.id;setVersion(row.version);setName(deck.name);setSelected(deck.senseIds);setDirection(deck.direction);setQuery('');setPage(0);setStatus('');}}>{deck.name} · {deck.senseIds.length} {t('từ','words')}</Button>;})}</div></section>}
 </div>;
}
