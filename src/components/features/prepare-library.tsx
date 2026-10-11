'use client';
import {SentencePronunciation} from '@/components/app/sentence-pronunciation';
import {ImagePlus, Check} from 'lucide-react';
import {GrammarSteps} from './grammar-steps';
import {useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {Artwork,Back} from '@/components/app/shared';
import {Button} from '@/components/ui/button';
import {OperationStatus} from '@/components/ui/operation-status';
import {DatabaseLoading,ReadFailure} from '@/components/app/database-boundary';
import {dictionaryArt} from '@/lib/media/dictionary-art';
import {safeArt} from '@/lib/media/catalog';
import {objectPatterns} from '@/lib/learning/worksheet-patterns';
import type {LibraryWord} from '@/data/local/types';
export function PrepareLibrary(){
  const {repository}=useApp(),params=useSearchParams(),lesson=params.get('lesson');
  const data=useLiveQuery(async()=>{if(!repository)return null;try{return {scope:repository.scope.id,error:false,words:(await repository.search('',{approvedOnly:true,limit:50,lesson})).words};}catch{return {scope:repository.scope.id,error:true,words:[]};}},[repository,lesson]);
  if(!data||data.scope!==repository?.scope.id)return <DatabaseLoading/>;
  if(data.error)return <ReadFailure/>;
  return <Preparation key={`${data.scope}:${lesson}`} words={data.words} lesson={lesson}/>;
}
type SearchProgress={completed:number;total:number;found:number;missing:number;stage:string;failures:string[]};
function Preparation({words,lesson}:{words:LibraryWord[];lesson:string|null}){
  const {repository,t}=useApp();
  const [images,setImages]=useState<{word:LibraryWord;art:string}[]>(()=>words.filter(w=>!w.art).flatMap(word=>{const art=dictionaryArt(word.word,word.pos,word.en);return art?[{word,art}]:[];}));
  const [busy,setBusy]=useState(false),[searched,setSearched]=useState(false),[approved,setApproved]=useState(false),[status,setStatus]=useState(''),[saved,setSaved]=useState(false),[saveResult,setSaveResult]=useState(false);
  const [progress,setProgress]=useState<SearchProgress|null>(null),[saving,setSaving]=useState(false),[failed,setFailed]=useState(false);
  const target=words.find(w=>w.word==='book'&&objectPatterns(w).length)||words.find(w=>objectPatterns(w).length);
  const patterns=target?objectPatterns(target):[];
  const controller=useRef<AbortController|null>(null),lock=useRef(false),mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;controller.current?.abort();};},[]);
  async function search(){
    if(lock.current)return;lock.current=true;setBusy(true);setApproved(false);setStatus('');setFailed(false);setSaveResult(false);
    const jobs=words.filter(w=>!w.art&&!images.some(i=>i.word.id===w.id));
    const current:SearchProgress={completed:0,total:jobs.length,found:0,missing:0,stage:'',failures:[]};
    const update=()=>{if(mounted.current)setProgress({...current,failures:[...current.failures]});};update();
    const worker=new AbortController();controller.current=worker;const signal=worker.signal;
    let timedOut=false;const timer=setTimeout(()=>{timedOut=true;worker.abort();},90000);
    try{
      for(const word of jobs){
        if(signal.aborted)break;
        current.stage=t(`Tìm hình cho “${word.word}”`,`Searching for “${word.word}”`);update();
        const requestSignal=AbortSignal.any([signal,AbortSignal.timeout(10000)]);
        try{
          const response=await fetch(`/api/illustrations?${new URLSearchParams({word:word.word,pos:word.pos,definition:word.en})}`,{signal:requestSignal});
          if(!response.ok)throw new Error(`HTTP ${response.status}`);
          const {result}=await response.json();const art=safeArt(result?.art);
          if(!art){current.missing++;}
          else {
            current.stage=t(`Tải hình cho “${word.word}”`,`Downloading “${word.word}”`);update();
            if(art.startsWith('online-openmoji-')){
              const image=await fetch(`/illustrations/online/${art.slice(16)}`,{signal:requestSignal});
              if(!image.ok)throw new Error(`HTTP ${image.status}`);await image.text();
            }
            if(signal.aborted)break;
            if(mounted.current)setImages(old=>[...old,{word,art}]);current.found++;
          }
        }catch{
          if(signal.aborted)break;
          const reason=requestSignal.aborted?t('hết thời gian 10 giây','10-second timeout'):t('chưa tải được hình, thử lại sau nhé','picture unavailable, please retry later');
          current.failures.push(`${word.word}: ${reason}`);
        }
        current.completed++;update();
      }
      if(mounted.current){
        setSearched(true);setFailed(current.failures.length>0||timedOut);
        setStatus(t(`${signal.aborted?(timedOut?'Đã hết thời gian 90 giây.':'Đã dừng.'):jobs.length?'Đã tìm xong.':'Không còn từ cần tìm hình.'} Đã xử lý ${current.completed}/${current.total} từ, tải thêm ${current.found} hình; ${current.missing} từ chưa tìm thấy hình phù hợp, ${current.failures.length} từ gặp lỗi. Các hình đã tải được giữ để duyệt.`,`${signal.aborted?'Search stopped.':'Search complete.'} Processed ${current.completed}/${current.total}, downloaded ${current.found}, no match for ${current.missing}, failed ${current.failures.length}. Downloaded pictures remain for review.`));
        current.stage='';update();
      }
    }finally{clearTimeout(timer);lock.current=false;controller.current=null;if(mounted.current)setBusy(false);}
  }
  async function save(){
    if(!repository||lock.current||!approved)return;lock.current=true;setBusy(true);setSaving(true);setFailed(false);setSaveResult(true);setStatus('');
    try{
      await repository.prepareLearning(images.map(i=>({id:i.word.id,revision:i.word.revision,art:i.art})),target?{id:target.id,revision:target.revision,contents:patterns.map(item=>({...item,content:{...item.content,...(lesson?{lessonId:lesson}:{})}}))}:null);
      if(mounted.current){setSaved(true);setStatus(t('Đã bổ sung hình và lưu mẫu câu/ngữ pháp. Mở thư viện để học.','Illustrations and patterns saved. Open the library to learn.'));setProgress(null);}
    }catch{if(mounted.current){setFailed(true);setStatus(t('Chưa lưu được hoặc bài đã đổi ở tab khác. Các gợi ý vẫn còn; mở lại bản mới để kiểm.','Save failed or another tab changed the content. Reopen the latest version for review.'));}}
    finally{lock.current=false;if(mounted.current){setBusy(false);setSaving(false);}}
  }
  return <div className="reading-page page-flow parent-page">
    <Back href={lesson?`/library?lesson=${encodeURIComponent(lesson)}`:'/library'}/><h1>{t('Bổ sung hình và mẫu câu','Prepare pictures and patterns')}</h1>
    <p>{t('Chỉ điền hình còn thiếu; giữ nghĩa, ví dụ và hình bạn đã chọn. Mẫu câu bên dưới là nội dung dự án bổ sung, cần kiểm trước khi con học.','Fill missing illustrations while preserving existing content. The patterns below are suggestions to review.')}</p>
    <div className="page-flow">
      <div className="row-wrap"><Button variant="secondary" disabled={busy||saved} onClick={()=>void search()}><ImagePlus data-icon="inline-start" aria-hidden="true"/>{busy&&!saving?t('Đang tìm hình…','Finding illustrations…'):searched?t('Tìm hình lại','Search again'):t('Tự tìm thêm hình còn thiếu','Find remaining illustrations')}</Button>
      {busy&&!saving&&<Button variant="outline" onClick={()=>controller.current?.abort()}>{t('Dừng tìm hình','Stop image search')}</Button>}</div>
      <OperationStatus key={saving?'saving':'search'} busy={busy&&!saveResult} title={saving?t('Đang lưu hình và mẫu câu…','Saving pictures and patterns…'):busy?progress?.stage??t('Chuẩn bị tìm hình…','Preparing picture search…'):failed?t('Có mục chưa hoàn tất','Some items did not complete'):t('Kết quả bổ sung','Preparation result')} message={busy&&!saving&&progress?t(`Đã xử lý ${progress.completed}/${progress.total} từ · tải được ${progress.found} hình`,`Processed ${progress.completed}/${progress.total} words · downloaded ${progress.found} pictures`):saveResult?undefined:status} error={!busy&&failed} completed={saving?undefined:progress?.completed} total={saving?undefined:progress?.total}/>
      {progress&&progress.failures.length>0&&<details open><summary>{t(`Lỗi tải hình (${progress.failures.length})`,`Picture errors (${progress.failures.length})`)}</summary><ul>{progress.failures.map(item=><li key={item}>{item}</li>)}</ul><p>{t('Bấm Tìm hình lại để thử các từ còn thiếu; các hình đã tải không bị mất.','Search again to retry missing pictures; downloaded pictures are preserved.')}</p></details>}
    </div>
    <div className="preparation-images">{images.map(({word,art})=><article key={word.id}><Artwork art={art} word={word.word} size={88} showCredit/><strong>{word.word}</strong><span>{word.vi}</span>{!saved&&<Button variant="ghost" disabled={busy} onClick={()=>{setImages(old=>old.filter(i=>i.word.id!==word.id));setApproved(false);}}>{t('Bỏ hình này','Skip illustration')}</Button>}</article>)}</div>
    {patterns.map(item=><article className="example-block page-flow" key={item.key}><h2>{item.content.grammarTitle}</h2><p lang="en">{item.content.example}</p><SentencePronunciation text={item.content.example} ipa={item.content.exampleIpa}/><p>{item.content.exampleVi}</p><p>{item.content.conditions}</p><p lang="en">{item.content.formula}</p><p>{item.content.analysis}</p><p>{t('Lỗi dễ nhầm: ','Common mistake: ')}{item.content.commonError}</p><SentencePronunciation text={item.content.commonError} ipa={item.content.commonErrorIpa}/><p>{t('Sửa thành: ','Correction: ')}{item.content.correction}</p><SentencePronunciation text={item.content.correction} ipa={item.content.correctionIpa}/><GrammarSteps pattern={item.content.pattern}/><small>{item.content.source}</small></article>)}
    {!words.length&&<p>{t('Chưa có từ đã duyệt trong bộ này.','No approved words in this set.')}</p>}
    {!saved&&(images.length>0||patterns.length>0)&&<><label><input type="checkbox" checked={approved} disabled={busy} onChange={e=>setApproved(e.target.checked)}/>{t('Tôi đã kiểm hình đúng nghĩa và mẫu câu/ngữ pháp để con học.','I reviewed these illustrations and patterns for learning.')}</label><Button disabled={!approved||busy} onClick={()=>void save()}><Check data-icon="inline-start" aria-hidden="true"/>{saving?t('Đang lưu…','Saving…'):t('Duyệt và bổ sung vào thư viện','Approve and add to library')}</Button></>}
    {saveResult&&<OperationStatus busy={saving} title={saving?t('Đang lưu hình và mẫu câu…','Saving pictures and patterns…'):failed?t('Chưa lưu được nội dung','Content was not saved'):t('Đã lưu bổ sung','Preparation saved')} message={status} error={failed}/>}
    <small>{t('Mỗi lượt tối đa 50 từ, 90 giây; tìm từng hình để tránh quá tải nguồn.','Up to 50 words / 90 seconds; pictures are searched one at a time.')}</small>
  </div>;
}
