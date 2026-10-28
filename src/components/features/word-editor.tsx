"use client";
import {prepareLearningExtensions} from '@/lib/ai/learning-extensions';
import {saveExtensionProposal} from '@/data/local/extensions';
import {grammarExtensionSource} from '@/lib/learning/extensions';
import Image from 'next/image';
import {Save,ImageOff} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useLiveQuery} from 'dexie-react-hooks';
import {pronunciation} from '@/lib/learning/catalog';
import {useApp} from '@/components/app/provider';
import {Back,EmptyState,Artwork} from '@/components/app/shared';
import {DatabaseLoading,ReadFailure} from '@/components/app/database-boundary';
import {Input} from '@/components/ui/input';
import {Field,FieldLabel,FieldError} from '@/components/ui/field';
import {SubmitButton,type SubmitState} from '@/components/ui/submit-button';
import {submitError} from '@/lib/submit-error';
import {useLibraryWord} from '@/data/local/hooks';
import {updateWord,type ContentSnapshot} from '@/data/local/edit-word';
import type {LearningContent} from '@/data/local/content';
import type {Example,LibraryWord,ScopedDocument,WordInput} from '@/data/local/types';
import type {MediaAsset} from '@/lib/media/contracts';
import {DeleteControl} from './delete-control';
import {WordPictureSearch} from './word-picture-search';
const wordFields=[['word','Từ tiếng Anh','English word'],['vi','Nghĩa tiếng Việt','Vietnamese meaning'],['en','Nghĩa tiếng Anh','English meaning'],['pos','Loại từ','Part of speech'],['sense','Tên nghĩa','Sense label'],['ipa','Phiên âm IPA','IPA'],['hint','Cách đọc gần đúng của từ','Word reading hint'],['example','Câu ví dụ tiếng Anh','English example'],['exampleIpa','IPA cả câu ví dụ','Whole-sentence IPA'],['exampleVi','Nghĩa câu ví dụ','Example translation'],['exampleHint','Cách đọc gần đúng của câu','Sentence reading hint'],['secondExample','Câu ví dụ thứ hai','Second example'],['secondIpa','IPA cả câu ví dụ thứ hai','Second whole-sentence IPA'],['secondVi','Nghĩa câu ví dụ thứ hai','Second example translation'],['secondHint','Cách đọc gần đúng câu thứ hai','Second reading hint']] as const;
const contentFields=[['example','Câu ví dụ','Example'],['exampleIpa','IPA cả câu','Whole-sentence IPA'],['exampleVi','Nghĩa câu ví dụ','Example translation'],['readingHintVi','Cách đọc gần đúng','Reading hint'],['pattern','Mẫu câu','Sentence pattern'],['patternExplanation','Giải thích mẫu câu','Pattern explanation'],['grammarTitle','Tên ngữ pháp','Grammar title'],['conditions','Dùng khi nào','When to use'],['formula','Công thức','Formula'],['analysis','Giải thích từng phần','Explain each part'],['commonError','Lỗi dễ nhầm','Common mistake'],['commonErrorIpa','IPA cả câu sai','Whole mistake IPA'],['correction','Câu sửa đúng','Correction'],['correctionIpa','IPA cả câu sửa đúng','Whole correction IPA']] as const;
export function WordEditor({id}:{id:string}){
 const {repository,t}=useApp();const result=useLibraryWord(id);
 const data=useLiveQuery(async()=>{if(!repository)return null;const [examples,contents]=await Promise.all([repository.db.examples.where('[scopeId+senseId]').equals([repository.scope.id,id]).toArray(),repository.db.table<ScopedDocument>('sentences').where('[scopeId+id]').between([repository.scope.id,''],[repository.scope.id,'\uffff']).toArray()]);return {scope:repository.scope.id,examples:examples.filter(row=>!row.deletedAt&&row.position===1),contents:contents.filter(row=>!row.deletedAt&&(row.payload.content as LearningContent)?.senseId===id).map(row=>({id:row.id,version:row.version,content:row.payload.content as LearningContent}))};},[repository,id]);
 if(!result||!data||data.scope!==repository?.scope.id)return <DatabaseLoading/>;
 if(result.error)return <ReadFailure/>;
 if(!result.word)return <EmptyState title={t('Chưa có từ để sửa','No word to edit')} description={t('Quay về thư viện để chọn từ khác nhé.','Choose another word in your library.')}><Back href="/library"/></EmptyState>;
 return <EditorForm key={`${data.scope}:${id}`} entry={result.word} examples={data.examples} contents={data.contents}/>;
}
function EditorForm({entry,examples,contents}:{entry:LibraryWord;examples:Example[];contents:ContentSnapshot[]}){
 const {repository,t}=useApp(),router=useRouter();const second=examples[0];
 const [baseline,setBaseline]=useState(entry),[snapshots,setSnapshots]=useState(contents);
 const [form,setForm]=useState({word:entry.pendingEdit?.patch.word??entry.word,vi:entry.pendingEdit?.patch.vi??entry.vi,en:entry.pendingEdit?.patch.en??entry.en,pos:entry.pos,sense:entry.sense,ipa:entry.pronunciations[0]?.ipa??'',hint:entry.pronunciations[0]?.readingHintVi??'',example:entry.example,exampleVi:entry.exampleVi,exampleIpa:entry.examplePronunciations[0]?.ipa??'',exampleHint:entry.examplePronunciations[0]?.readingHintVi??'',secondExample:second?.textEn??'',secondVi:second?.translationVi??'',secondIpa:second?.pronunciations[0]?.ipa??'',secondHint:second?.pronunciations[0]?.readingHintVi??''});
 const [extra,setExtra]=useState<LearningContent>(()=>contents.find(row=>row.id===`extra-${entry.id}`)?.content??{senseId:entry.id,targetRevision:entry.revision,example:'',exampleVi:'',readingHintVi:'',pattern:'',patternExplanation:'',grammarTitle:'',conditions:'',formula:'',analysis:'',commonError:'',correction:'',approved:true,origin:'user'});
 const [art,setArt]=useState(entry.art),[prepared,setPrepared]=useState<MediaAsset|null>(null);
 const [pictureBusy,setPictureBusy]=useState(false);
 const [state,setState]=useState<SubmitState>('idle'),[error,setError]=useState(''),[errors,setErrors]=useState<Record<string,string>>({});
 const busy=state==='pending';
 function reset(){setState('idle');setError('');setErrors({});}
 function change(field:typeof wordFields[number][0],value:string){reset();setForm(old=>({...old,[field]:value,...(field==='word'?{ipa:'',hint:''}:field==='example'?{exampleIpa:'',exampleHint:''}:field==='secondExample'?{secondIpa:'',secondHint:''}:{})}));if(field==='word'){setArt(null);setPrepared(null);}}
 async function save(event:React.FormEvent){
  event.preventDefault();if(!repository||busy||pictureBusy)return;
  const invalid:Record<string,string>={};const required=['word','vi','en','pos','sense'] as const;
  for(const field of required)if(!form[field].trim())invalid[field]=t('Điền ô này trước khi lưu.','Complete this field before saving.');
  for(const [a,b] of [['example','exampleVi'],['secondExample','secondVi']] as const)if(!!form[a].trim()!==!!form[b].trim())invalid[form[a].trim()?b:a]=t('Câu ví dụ cần có cả tiếng Anh và nghĩa tiếng Việt.','An example needs both English and Vietnamese.');
  const hasExtra=contentFields.some(([field])=>!!extra[field]?.trim());
  if(hasExtra){for(const field of ['example','exampleVi'] as const)if(!extra[field].trim())invalid[`extra-${field}`]=t('Điền câu ví dụ và nghĩa của câu.','Complete the example and its translation.');if(extra.pattern&&!extra.patternExplanation)invalid['extra-patternExplanation']=t('Thêm giải thích cho mẫu câu.','Explain this pattern.');if(extra.grammarTitle)for(const field of ['conditions','formula','analysis','commonError','correction'] as const)if(!extra[field].trim())invalid[`extra-${field}`]=t('Điền phần này của ngữ pháp.','Complete this grammar field.');}
  setErrors(invalid);if(Object.keys(invalid).length){setState('error');setError(t('Kiểm các ô màu đỏ rồi lưu lại nhé.','Check the marked fields and save again.'));const input=document.getElementById(`word-edit-${Object.keys(invalid)[0]}`);for(let node=input?.parentElement;node;node=node.parentElement)if(node instanceof HTMLDetailsElement)node.open=true;input?.focus();return;}
  setState('pending');setError('');
  try{
   const old=baseline.pronunciations[0],same=form.word===baseline.word&&form.ipa===(old?.ipa??'');
   const exactPronunciation=(text:string,ipa:string,hint:string,old:Example['pronunciations'])=>{const existing=old.find(p=>p.text===text&&p.ipa===(ipa||null)&&p.readingHintVi===(hint||null));return existing?{...existing}:pronunciation(text,hint||null,ipa||null);};
   const input:WordInput={id:entry.id,word:form.word.trim(),vi:form.vi.trim(),en:form.en.trim(),pos:form.pos.trim(),sense:form.sense.trim(),example:form.example.trim(),exampleVi:form.exampleVi.trim(),art,lesson:baseline.lesson,ready:true,source:baseline.source,origin:'user',caseMode:baseline.caseMode,approved:true,pronunciations:[pronunciation(form.word.trim(),form.hint||null,form.ipa||null,same?old?.sourceUrl??null:null,same&&!!old?.verified)],examplePronunciations:form.example.trim()?[exactPronunciation(form.example.trim(),form.exampleIpa,form.exampleHint,baseline.examplePronunciations)]:[],additionalExamples:form.secondExample.trim()?[{textEn:form.secondExample.trim(),translationVi:form.secondVi.trim(),pronunciations:[exactPronunciation(form.secondExample.trim(),form.secondIpa,form.secondHint,second?.pronunciations??[])]}]:[]};
   const result=await updateWord(repository,entry.id,baseline.revision,input,snapshots,hasExtra?extra:null,prepared);
   const additions=result.rows.filter(row=>!snapshots.some(s=>s.id===row.id)).filter(row=>row.content.grammarTitle||row.content.pattern);
   if(additions.length){const drafts=await prepareLearningExtensions(additions.map(row=>({key:row.id,source:grammarExtensionSource(result.word,row.content)})),AbortSignal.timeout(65000));for(const draft of drafts)await saveExtensionProposal(repository,'grammar',draft.key,draft);}
   setBaseline(result.word);setSnapshots(result.rows);setArt(result.word.art);setPrepared(null);setState('success');requestAnimationFrame(()=>document.getElementById('word-edit-submit')?.scrollIntoView({block:'center',behavior:'auto'}));
  }catch(cause){setState('error');setError(submitError(cause,t));}
 }
 return <div className="reading-page page-flow parent-page word-editor"><div className="word-edit-toolbar"><Back href={`/library/words/${entry.id}`}/><DeleteControl iconOnly target={{table:'senses',id:entry.id,version:Number(entry.revision.split(':')[1]),revision:entry.revision}} label={t('Xóa từ này','Delete this word')} description={t(`Xóa “${entry.word}” với nghĩa này? Các nghĩa khác vẫn giữ.`,`Delete “${entry.word}” in this sense? Other senses are kept.`)} onDeleted={()=>router.push('/library')}/></div><h1>{t('Sửa từ','Edit word')}</h1>
 <form onSubmit={save} noValidate className="page-flow"><div className="word-edit-fields">{wordFields.filter(([field])=>["word","vi","en"].includes(field)).map(([field,vi,en])=><Field key={field} data-invalid={!!errors[field]}><FieldLabel htmlFor={`word-edit-${field}`}>{t(vi,en)}</FieldLabel><Input id={`word-edit-${field}`} value={form[field]} disabled={busy} maxLength={field==='word'||field==='sense'?200:field==='pos'?60:1000} aria-invalid={!!errors[field]} aria-describedby={errors[field]?`error-${field}`:undefined} onChange={event=>change(field,event.target.value)}/>{errors[field]&&<FieldError id={`error-${field}`}>{errors[field]}</FieldError>}</Field>)}</div>
 <fieldset disabled={busy}><div className={`staged-picture ${prepared||art?.startsWith('media-')?'with-credit':''}`}>{prepared?<><Image unoptimized src={`data:image/jpeg;base64,${prepared.base64}`} width={96} height={96} alt=""/></>:art?<Artwork art={art} word={baseline.word} size={96} showCredit/>:<Artwork art={null} word={form.word} size={96}/>}<span>{prepared?t('Hình đã chọn','Selected picture'):t('Hình hiện tại','Current picture')}</span>{(art||prepared)&&<Button type="button" variant="ghost" onClick={()=>{setArt(null);setPrepared(null);reset();}}><ImageOff aria-hidden="true"/>{t('Bỏ hình','Remove picture')}</Button>}</div><details className="word-picture-edit"><summary>{t('Đổi hình','Change picture')}</summary><WordPictureSearch key={`${baseline.revision}:${form.word}:${form.en}:${form.sense}`} word={{...baseline,word:form.word.trim(),en:form.en.trim(),sense:form.sense.trim(),vi:form.vi,pos:form.pos,art}} onBusyChange={setPictureBusy} onPrepared={asset=>{setPrepared(asset);reset();}}/></details></fieldset>
 <details className="word-extra-fields"><summary>{t('Ví dụ và cách đọc','Examples and pronunciation')}</summary><div className="word-edit-fields">{wordFields.filter(([field])=>!["word","vi","en"].includes(field)).map(([field,vi,en])=><Field key={field} data-invalid={!!errors[field]}><FieldLabel htmlFor={`word-edit-${field}`}>{t(vi,en)}</FieldLabel><Input id={`word-edit-${field}`} value={form[field]} disabled={busy} maxLength={field==='word'||field==='sense'?200:field==='pos'?60:1000} aria-invalid={!!errors[field]} aria-describedby={errors[field]?`error-${field}`:undefined} onChange={event=>change(field,event.target.value)}/>{errors[field]&&<FieldError id={`error-${field}`}>{errors[field]}</FieldError>}</Field>)}</div>
</details>
 <details><summary>{t('Ngữ pháp và mẫu câu','Grammar and patterns')}</summary><div className="word-edit-fields">{contentFields.map(([field,vi,en])=><Field key={field} data-invalid={!!errors[`extra-${field}`]}><FieldLabel htmlFor={`word-edit-extra-${field}`}>{t(vi,en)}</FieldLabel><Input id={`word-edit-extra-${field}`} value={extra[field]??''} disabled={busy} maxLength={2000} aria-invalid={!!errors[`extra-${field}`]} aria-describedby={errors[`extra-${field}`]?`error-extra-${field}`:undefined} onChange={event=>{reset();setExtra(old=>({...old,[field]:event.target.value,...(field==='example'?{exampleIpa:'',readingHintVi:''}:field==='commonError'?{commonErrorIpa:''}:field==='correction'?{correctionIpa:''}:{})}));}}/>{errors[`extra-${field}`]&&<FieldError id={`error-extra-${field}`}>{errors[`extra-${field}`]}</FieldError>}</Field>)}</div></details>
 <div className="selection-save-bar"><span role="status">{state==='idle'?t("Sửa xong, lưu một lần cho tất cả","Save all your changes together"):state==='pending'?t("Đang lưu…","Saving…"):state==='success'?t("Đã lưu","Saved"):t("Chưa lưu được","Not saved yet")}</span><SubmitButton id="word-edit-submit" size="lg" disabled={pictureBusy} state={state} error={error} successLabel={t('Đã lưu chỉnh sửa','Edits saved')}><Save aria-hidden="true"/>{t('Lưu chỉnh sửa','Save edits')}</SubmitButton></div></form></div>;
}
