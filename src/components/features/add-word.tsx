"use client";
import {completeWordExamples} from '@/lib/ai/word-examples';
import {parentAi} from '@/lib/ai/byok';
import {SubmitButton} from '@/components/ui/submit-button';
import {submitError} from '@/lib/submit-error';
import Image from 'next/image';
import {WordPictureSearch} from './word-picture-search';
import type {MediaAsset} from '@/lib/media/contracts';
import {Check} from "lucide-react";
import {OperationStatus} from "@/components/ui/operation-status";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/components/app/provider";
import { Back, Artwork } from "@/components/app/shared";
import { DatabaseLoading } from "@/components/app/database-boundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field";
import { suggestions, pronunciation, type LookupWord } from "@/lib/learning/catalog";
import {type DictionarySense,type WordSuggestion,readingHint} from "@/lib/learning/dictionary";
import {artCredit} from "@/lib/media/dictionary-art";
import {RepositoryError} from "@/data/local/repository";
import type { ScopedDocument, WordInput } from "@/data/local/types";
type Form = { learnedOn?:string; word: string; vi: string; en: string; pos: string; sense: string; example: string;
  exampleVi: string; ipa: string; hint: string; exampleHint: string; exampleIpa?:string; secondExample?:string;secondExampleVi?:string;secondHint?:string;secondIpa?:string; art: string | null; source: string; evidence: string; ipaSource?:string|null; ipaVerified?:boolean;origin?:WordInput["origin"] };
const empty: Form = { word:"",vi:"",en:"",pos:"noun",sense:"",example:"",exampleVi:"",ipa:"",hint:"",exampleHint:"",exampleIpa:"",art:null,source:"Người dùng nhập",evidence:"" };
export function AddWord() {
  const { repository } = useApp();
  const params = useSearchParams(); const capture = params.get("capture");
  const result = useLiveQuery(async () => repository ? {scope:repository.scope.id,
    draft:await repository.db.table<ScopedDocument>("learningDrafts").get([repository.scope.id, capture ?? "manual"])} : null,[repository,capture]);
  if (!result || result.scope !== repository?.scope.id) return <DatabaseLoading />;
  return <WordForm key={`${result.scope}:${capture}`} initial={(result.draft?.payload.form as Form) ?? empty} capture={capture} initialVersion={result.draft?.version??null} />;
}
function WordForm({initial,capture,initialVersion}:{initial:Form;capture:string|null;initialVersion:number|null}) {
  const { repository, t } = useApp(); const router=useRouter();
  const [form,setForm]=useState<Form>(initial);
  const learnedOn=form.learnedOn??new Date().toLocaleDateString("en-CA");
  const [error,setError]=useState(""); const [saveState,setSaveState]=useState<'idle'|'success'>('idle'); const [busy,setBusy]=useState(false);
  const [lookup,setLookup]=useState<WordSuggestion[]>([]);const [lookupSuccess,setLookupSuccess]=useState(false),[errorAction,setErrorAction]=useState<'lookup'|'save'|null>(null);
  const [senses,setSenses]=useState<LookupWord[]>([]); const [looking,setLooking]=useState(false);
  const [prepared,setPrepared]=useState<MediaAsset|null>(null),[findingArt,setFindingArt]=useState(false);
  const [suggesting,setSuggesting]=useState(true);
  const [status,setStatus]=useState(""); const [active,setActive]=useState(-1);
  const draftVersion=useRef(initialVersion);const draftFailed=useRef(false);
  const serial=useRef(Promise.resolve()); const operation=useRef<string|null>(null);
  const lookupGeneration=useRef(0); const abort=useRef<AbortController|null>(null);
  const saved=useRef(false); const saving=useRef(false); const revision=useRef(initial);
  const local=suggestions(form.word).filter(item=>item.word.toLowerCase().includes(form.word.trim().toLowerCase())||item.vi.toLowerCase().includes(form.word.trim().toLowerCase()));
  const options:(LookupWord|WordSuggestion)[]=suggesting?[...local,...lookup.filter(item=>!local.some(known=>known.word===item.word))].slice(0,8):[];
  useEffect(()=>{
    const word=form.word.trim();if(!suggesting||!word||!navigator.onLine||!/^[a-z][a-z '-]{0,79}$/i.test(word))return;
    const controller=new AbortController();
    const timer=setTimeout(async()=>{try{const response=await fetch(`/api/dictionary?mode=suggest&word=${encodeURIComponent(word)}`,{signal:controller.signal});const data=await response.json();if(response.ok&&!controller.signal.aborted)setLookup(data.results);}catch{/* Local suggestions stay available. */}},350);
    return()=>{clearTimeout(timer);controller.abort();};
  },[form.word,suggesting]);
  function choose(item:LookupWord|WordSuggestion){if("vi" in item)select(item);else {change("word",item.word);void lookupOnline(item.word);}}
  const change=(name:keyof Form,value:string) => {
    if(['word','pos','sense','en'].includes(name))setPrepared(null);
    setSaveState('idle');setLookupSuccess(false);setError('');if(name==="word"){setSuggesting(true);setSenses([]);setStatus("");} abort.current?.abort(); lookupGeneration.current++; setLookup([]); setLooking(false);  setActive(-1); operation.current=null;
    setForm(f=>({...f,[name]:value,origin:"user",...(["pos","sense","en"].includes(name)?{art:null}:{}),...(name==="example"?{exampleIpa:"",exampleHint:""}:name==="secondExample"?{secondIpa:"",secondHint:""}:{}),...(name==="ipa"?{ipaSource:null,ipaVerified:false}:{}),...(name==="word"?{art:null,ipa:"",hint:"",source:"Người dùng nhập",ipaSource:null,ipaVerified:false,vi:"",en:"",sense:"",example:"",exampleVi:"",exampleHint:"",exampleIpa:"",secondExample:"",secondExampleVi:"",secondHint:"",secondIpa:""}:{})}));
  };
  useEffect(()=>{
    if(!repository || form===revision.current || saved.current) return;
    const persist=()=>{
      serial.current=serial.current.catch(()=>{}).then(async()=>{
        if(saved.current)return;
        const table=repository.db.table<ScopedDocument>("learningDrafts");
        const id=capture??"manual", at=new Date().toISOString();
        await repository.db.transaction("rw",table,async()=>{
          const old=await table.get([repository.scope.id,id]);
          if((old?.version??null)!==draftVersion.current)throw new RepositoryError("conflict");
          await table.put({...old,scopeId:repository.scope.id,id,createdAt:old?.createdAt??at,updatedAt:at,
            version:(old?.version??0)+1,deletedAt:null,payload:{form}});draftVersion.current=(old?.version??0)+1;draftFailed.current=false;
        });
      }).catch(()=>{draftFailed.current=true;setStatus(t("Nháp chưa lưu được hoặc đã đổi ở tab khác; giữ nội dung và mở lại bản mới.","Draft could not be saved or another tab changed it; retain your input and reopen the latest draft."));});
    };
    const timer=setTimeout(persist,500); return ()=>{clearTimeout(timer);persist();};
  },[form,repository,capture,t]);
  useEffect(()=>()=>{abort.current?.abort();lookupGeneration.current++;},[]);
  function select(item:LookupWord){
    setPrepared(null);
    abort.current?.abort();lookupGeneration.current++;setLooking(false);
    setForm(f=>({...f,word:item.word,vi:item.vi,en:item.en,pos:item.pos,sense:item.sense,
      example:item.example,exampleVi:item.exampleVi,art:null,source:item.source,origin:item.origin,
      ipa:item.pronunciations?.[0]?.ipa??"",ipaSource:item.pronunciations?.[0]?.sourceUrl??null,ipaVerified:item.pronunciations?.[0]?.verified??false,hint:item.pronunciations?.[0]?.readingHintVi??"",
      secondExample:item.additionalExamples?.[0]?.textEn??"",secondExampleVi:item.additionalExamples?.[0]?.translationVi??"",secondHint:item.additionalExamples?.[0]?.pronunciations?.[0]?.readingHintVi??"",secondIpa:item.additionalExamples?.[0]?.pronunciations?.[0]?.ipa??"",exampleIpa:item.examplePronunciations?.[0]?.ipa??"",exampleHint:item.examplePronunciations?.[0]?.readingHintVi??""}));
    setSuggesting(false);setLookup([]);setActive(-1);operation.current=null;
    if(parentAi())void enrich(item);
  }
  async function enrich(item:LookupWord){setErrorAction('lookup');setLookupSuccess(false);
    const controller=new AbortController();abort.current=controller;const generation=++lookupGeneration.current;setLooking(true);
    try{const value=await completeWordExamples(item.word,item.pos,item.sense,AbortSignal.any([controller.signal,AbortSignal.timeout(30000)]));
      if(generation!==lookupGeneration.current)return;
      setForm(f=>({...f,vi:value.vi,en:value.en,pos:item.pos==="unknown"?value.pos:item.pos,sense:item.sense||value.sense,example:value.examples[0].text,exampleVi:value.examples[0].vi,exampleIpa:value.examples[0].ipa??"",exampleHint:value.examples[0].hint??"",secondExample:value.examples[1].text,secondExampleVi:value.examples[1].vi,secondIpa:value.examples[1].ipa??"",secondHint:value.examples[1].hint??"",origin:"ai_generated",source:`${item.source}\nGoogle Gemini: meanings and two examples.`}));setLookupSuccess(true);setError("");setStatus("");
    }catch{if(generation===lookupGeneration.current&&!controller.signal.aborted)setError(t("Chưa bổ sung được hai ví dụ. Bấm tra lại để thử lại.","Could not complete both examples. Look up again to retry."));}
    finally{if(generation===lookupGeneration.current)setLooking(false);}
  }

  async function enrichUnknown(word:string){
    const seed:LookupWord={id:'lookup-ai',word,vi:'',en:'',pos:'unknown',sense:'',example:'',exampleVi:'',art:null,lesson:'manual',ready:false,source:'Google Gemini',origin:'ai_generated',approved:false,pronunciations:[]};
    setForm(f=>({...f,word}));await enrich(seed);
  }
  async function lookupOnline(word=form.word.trim()){setErrorAction('lookup');setLookupSuccess(false);
    abort.current?.abort();const controller=new AbortController();abort.current=controller;
    const generation=++lookupGeneration.current;setLooking(true);setError("");setSuggesting(false);
    try{
      const response=await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`,{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])});
      const data=await response.json();if(!response.ok)throw new Error(data.error);
      if(generation!==lookupGeneration.current)return;
      const items:LookupWord[]=data.results.map((item:DictionarySense,i:number)=>({
        id:`lookup-${i}`,word:item.word,vi:item.vi,en:item.definition,pos:item.pos,sense:item.definition.slice(0,200),example:item.examples[0]?.en??"",
        exampleVi:item.examples[0]?.vi??"",art:null,lesson:"manual",ready:false,
        source:[item.source,...item.examples.map(example=>example.source)].join("\n"),origin:"source",approved:false,
        additionalExamples:item.examples[1]?[{textEn:item.examples[1].en,translationVi:item.examples[1].vi,pronunciations:[]}]:[],
        pronunciations:[pronunciation(item.word,item.ipa?readingHint(item.ipa):null,item.ipa||null,`https://en.wiktionary.org/wiki/${encodeURIComponent(item.word)}`,!!item.ipa)]}));
      setSenses(items);setLookupSuccess(items.length>0);if(items.length)select(items[0]);else if(parentAi()){await enrichUnknown(word);return;}
      setStatus(items.length?t("Đã tự điền nội dung có nguồn. Kiểm tra nghĩa, ví dụ và hình trước khi lưu; chọn nghĩa khác nếu cần.","Sourced content filled in. Check the sense, examples and illustration before saving; choose another sense if needed."):t("Từ điển chưa có từ này. Thử gõ lại để chọn gợi ý chính tả, hoặc nhập thủ công.","No entry found. Try a spelling suggestion or enter it manually."));
      if(items.length&&!items[0].vi)setError(t("Nguồn này chưa có nghĩa tiếng Việt cho nghĩa đã chọn. Bạn bổ sung hoặc chọn nghĩa khác.","This source has no Vietnamese for the selected sense. Add it or choose another sense."));
    }catch{if(generation===lookupGeneration.current&&parentAi()&&!controller.signal.aborted){await enrichUnknown(word);return;}if(generation===lookupGeneration.current)setError(t("Chưa tra được từ điển. Phần nhập còn nguyên; thử lại hoặc nhập nghĩa bên dưới.","Dictionary lookup failed. Retry or enter the meanings below."));}
    finally{if(generation===lookupGeneration.current)setLooking(false);}
  }
  async function save(event:React.FormEvent){
    event.preventDefault();if(!repository||saving.current)return;setErrorAction('save');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(learnedOn)){setError(t("Chọn ngày học trước khi lưu.","Choose a learning date before saving."));return;}
    if(!form.word.trim()||!form.vi.trim()||!form.en.trim()){setError(t("Điền từ, nghĩa tiếng Việt và nghĩa tiếng Anh.","Enter the word and both meanings."));return;}
    saving.current=true;setBusy(true);setError("");
    try{
      await serial.current;if(draftFailed.current)throw new RepositoryError("conflict");const id=operation.current??crypto.randomUUID();operation.current=id;
      const p=pronunciation(form.word,form.hint.trim()||null,form.ipa.trim()||null,form.ipaSource??null,form.ipaVerified??false);
      if(!!form.secondExample?.trim()!==!!form.secondExampleVi?.trim())throw new RepositoryError("invalid");
      const item:WordInput={id:`word-${id}`,word:form.word.trim(),vi:form.vi.trim(),en:form.en.trim(),pos:form.pos.trim()||"unknown",sense:form.sense.trim()||form.en.trim().slice(0,200),
        example:form.example.trim(),exampleVi:form.exampleVi.trim(),art:form.art,lesson:"manual",ready:true,source:[form.source,...(artCredit(form.art)?[`Illustration: ${artCredit(form.art)!.author} — ${artCredit(form.art)!.sourceUrl} — ${artCredit(form.art)!.license} ${artCredit(form.art)!.licenseUrl}`]:[])].join("\n").slice(0,2000),
        origin:form.origin??"user",approved:true,pronunciations:[p],examplePronunciations:form.example.trim()?[pronunciation(form.example,form.exampleHint.trim()||null,form.exampleIpa?.trim()||null)]:[],
        additionalExamples:form.secondExample?.trim()?[{textEn:form.secondExample.trim(),translationVi:form.secondExampleVi!.trim(),pronunciations:[pronunciation(form.secondExample.trim(),form.secondHint?.trim()||null,form.secondIpa?.trim()||null)]}]:[],
        ...(form.evidence.trim()?{sourceEvidenceText:form.evidence.trim()}:{})};
      const result=await repository.saveLesson({operationId:id,title:capture?"Bài chép từ ảnh":`Từ gõ tay · ${learnedOn}`,learnedOn,
        sourceType:capture&&form.evidence.trim()?"image":"manual",items:[item],...(prepared?{picture:{wordId:item.id,asset:prepared}}:{}),lessonId:capture?`capture-${capture}`:`manual-day-${learnedOn}`});
      saved.current=true;setSaveState('success');await serial.current;await repository.db.transaction("rw",repository.db.table("learningDrafts"),async()=>{const table=repository.db.table("learningDrafts"),key=[repository.scope.id,capture??"manual"];const old=await table.get(key);if(old?.version===draftVersion.current)await table.delete(key);});
      const words=await repository.search(form.word,{lesson:result.lessonId});
      router.push(words.words[0]?`/library/words/${words.words[0].id}`:"/library");
    }catch(cause){setError(submitError(cause,t));}
    finally{saving.current=false;setBusy(false);}
  }
  return <div className="reading-page page-flow parent-page"><Back href={capture?`/capture/${capture}/edit`:"/today"}/>
    <h1>{t("Thêm từ cho con","Add a word")}</h1><p>{t("Gõ vài chữ, chọn từ đúng. App tự điền nghĩa, cách đọc, ví dụ và tìm hình để bạn kiểm tra.","Type a few letters and choose the right word. Available meanings, pronunciation, examples and illustrations fill in for your review.")}</p>
    {capture&&<p>{t("Nhập lại chữ trên ảnh; đây là bản chép tay của người dùng, chưa phải nhận dạng AI.","Transcribe the image manually; this is not AI extraction.")}</p>}
    <form onSubmit={save} noValidate className="page-flow"><fieldset className="page-flow" disabled={busy}><Field><FieldLabel htmlFor="add-word">{t("Từ tiếng Anh","English word")}</FieldLabel>
    <Input id="add-word" role="combobox" aria-autocomplete="list" aria-expanded={options.length>0} aria-controls="word-suggestions" aria-activedescendant={active>=0?`suggestion-${active}`:undefined}
      aria-describedby="dictionary-help" autoComplete="off" spellCheck={false} value={form.word} maxLength={80} onChange={e=>change("word",e.target.value)} onKeyDown={e=>{
        if(e.nativeEvent.isComposing)return;
        if(e.key==="ArrowDown"){e.preventDefault();setActive(i=>Math.min(i+1,options.length-1));}
        if(e.key==="ArrowUp"){e.preventDefault();setActive(i=>Math.max(i-1,0));}
        if(e.key==="Enter"&&active>=0){e.preventDefault();choose(options[active]);}
        if(e.key==="Escape"){setSuggesting(false);setActive(-1);}
      }}/></Field>
    <ul id="word-suggestions" role="listbox" className="suggestion-list">{options.map((item,i)=><li key={"id" in item?item.id:item.word} id={`suggestion-${i}`} role="option" aria-selected={active===i}>
      <button type="button" onClick={()=>choose(item)}><strong>{item.word}</strong><span>{"vi" in item?item.vi||item.en:t("Tra nghĩa và tự điền","Look up and fill in")}</span><small>{"pos" in item?item.pos:t("Gợi ý chính tả từ điển","Dictionary spelling suggestion")} · {t("Gợi ý để bạn duyệt","Suggestion to review")}</small></button></li>)}</ul>
    <div className="row-wrap"><SubmitButton type="button" variant="outline" state={looking?'pending':errorAction==='lookup'&&error?'error':lookupSuccess?'success':'idle'} error={errorAction==='lookup'?error:undefined} successLabel={t('Đã tra · tra lại','Found · look up again')} disabled={looking||!form.word.trim()} onClick={()=>void lookupOnline()}>{looking?t("Đang tra…","Looking up…"):t("Tra từ điển online","Look up online")}</SubmitButton><small id="dictionary-help">{t("Gợi ý gửi từ đang gõ khi có mạng. Chọn từ, rồi kiểm nghĩa trước khi lưu.","Online suggestions send the word you type. Choose a word, then review before saving.")}</small></div>
    <details className="learning-date"><summary>{t(`Ngày học: ${learnedOn}`,`Learning date: ${learnedOn}`)}</summary><Field><FieldLabel htmlFor="add-learned-on">{t("Ngày con học bộ từ này","Learning date")}</FieldLabel><Input id="add-learned-on" type="date" required value={learnedOn} onChange={e=>{setForm(f=>({...f,learnedOn:e.target.value}));operation.current=null;}}/><small>{t("Từ gõ tay được gom vào bộ của ngày này.","Typed words are grouped into this date’s set.")}</small></Field></details>
    {senses.length>1&&<Field><FieldLabel>{t("Chọn nghĩa con sẽ học","Choose the meaning to learn")}</FieldLabel><div className="sense-choices">{senses.map(item=><Button key={item.id} type="button" variant={form.sense===item.sense?"secondary":"outline"} aria-pressed={form.sense===item.sense} onClick={()=>{select(item);setError("");}}>{item.vi||item.en} · {item.pos}</Button>)}</div></Field>}
    <OperationStatus busy={looking} title={t("Đang lấy nghĩa, cách đọc và ví dụ…","Loading meanings, pronunciation and examples…")}/>
    {form.word.trim()&&form.en.trim()&&<section className="page-flow"><div className="word-preview">{prepared?<Image unoptimized src={`data:image/jpeg;base64,${prepared.base64}`} width={120} height={120} alt={form.word}/>:<Artwork art={form.art} word={form.word} size={120} showCredit/>}<p>{t('Chọn hình đúng nghĩa rồi lưu cùng từ.','Choose a matching picture and save it with the word.')}</p></div><WordPictureSearch key={`${form.word}:${form.en}:${form.sense}`} autoSearch saveMessage={t("Đã chọn hình. Bấm Lưu từ bên dưới để lưu.","Picture selected. Use Save word below to keep it.")} word={{id:'manual-picture',word:form.word.trim(),en:form.en.trim(),sense:form.sense.trim()||form.en.trim(),vi:form.vi,pos:form.pos,revision:'1:1',art:form.art}} onBusyChange={setFindingArt} onPrepared={asset=>{operation.current=null;setPrepared(asset);setSaveState('idle');}}/></section>}
    {form.source!=="Người dùng nhập"&&<details><summary>{t("Nguồn nội dung và giấy phép","Content sources and licenses")}</summary><p className="dictionary-source">{form.source}</p><p>{t("Ví dụ từ kho câu là gợi ý; bạn kiểm tra câu dùng đúng nghĩa và phù hợp với con.","Corpus examples are suggestions; check the sense and suitability for your child.")}</p></details>}
    <FieldGroup>{([
      ["vi","Nghĩa tiếng Việt","Vietnamese meaning"],["en","Nghĩa tiếng Anh","English definition"],["pos","Loại từ","Part of speech"],
      ["sense","Tên nghĩa để phân biệt","Sense label"],["ipa","Phiên âm IPA (nếu có)","IPA (optional)"],["hint","Cách đọc gần đúng chữ Việt","Vietnamese reading hint"],
      ["example","Câu ví dụ tiếng Anh","English example"],["exampleVi","Nghĩa câu ví dụ","Vietnamese example"],["exampleIpa","IPA câu ví dụ (chưa xác minh)","Example IPA (unverified)"],["exampleHint","Cách đọc gần đúng của câu","Sentence reading hint"],
      ["secondExample","Câu ví dụ thứ hai","Second example"],["secondExampleVi","Nghĩa câu ví dụ thứ hai","Second example translation"],["secondIpa","IPA cả câu ví dụ thứ hai","Second whole-sentence IPA"],["secondHint","Cách đọc gần đúng câu thứ hai","Second example reading hint"],
      ...(capture?[["evidence","Chữ đọc được trên ảnh (nguyên văn)","Exact text on the image"]]:[]) ] as [keyof Form,string,string][]).filter(([name])=>["vi","en","example","exampleVi"].includes(name)).map(([name,vi,en])=><Field key={name} data-invalid={errorAction==='save'&&!!error&&["vi","en"].includes(name)&&!(form[name] as string)?.trim()}><FieldLabel htmlFor={`add-${name}`}>{t(vi,en)}</FieldLabel><Input id={`add-${name}`} value={typeof form[name]==="string"?form[name] as string:""} maxLength={name==="pos"?60:name==="sense"?200:1000} aria-invalid={errorAction==='save'&&!!error&&["vi","en"].includes(name)&&!(form[name] as string)?.trim()} onChange={e=>change(name,e.target.value)}/>{errorAction==='save'&&!!error&&["vi","en"].includes(name)&&!(form[name] as string)?.trim()&&<FieldError>{t("Điền nghĩa trước khi lưu.","Add the meaning before saving.")}</FieldError>}</Field>)}</FieldGroup>
    <details className="word-extra-fields" open={errorAction==='save'&&!!error}><summary>{t('Sửa chi tiết: loại từ, cách đọc và ví dụ thêm','Edit details: word type, pronunciation and more examples')}</summary><div className="page-flow"><FieldGroup>{([['pos','Loại từ','Part of speech'],['sense','Tên nghĩa để phân biệt','Sense label'],['ipa','Phiên âm IPA (nếu có)','IPA (optional)'],['hint','Cách đọc gần đúng chữ Việt','Vietnamese reading hint'],...(capture?[['evidence','Chữ đọc được trên ảnh (nguyên văn)','Exact text on the image']]:[])] as [keyof Form,string,string][]).map(([name,vi,en])=><Field key={name} data-invalid={errorAction==='save'&&!!error&&["vi","en"].includes(name)&&!(form[name] as string)?.trim()}><FieldLabel htmlFor={`add-${name}`}>{t(vi,en)}</FieldLabel><Input id={`add-${name}`} value={form[name] as string??''} maxLength={name==='pos'?60:name==='sense'?200:1000} onChange={e=>change(name,e.target.value)}/></Field>)}</FieldGroup>
    <section className="page-flow" aria-label={t("Ví dụ và cách đọc","Examples and pronunciation")}><FieldGroup>{([["exampleIpa","IPA câu ví dụ (chưa xác minh)","Example IPA (unverified)"],["exampleHint","Cách đọc gần đúng của câu","Sentence reading hint"],["secondExample","Câu ví dụ thứ hai","Second example"],["secondExampleVi","Nghĩa câu ví dụ thứ hai","Second example translation"],["secondIpa","IPA cả câu ví dụ thứ hai","Second whole-sentence IPA"],["secondHint","Cách đọc gần đúng câu thứ hai","Second example reading hint"]] as [keyof Form,string,string][]).map(([name,vi,en])=><Field key={name} data-invalid={errorAction==='save'&&!!error&&["vi","en"].includes(name)&&!(form[name] as string)?.trim()}><FieldLabel htmlFor={`add-${name}`}>{t(vi,en)}</FieldLabel><Input id={`add-${name}`} value={form[name] as string??""} maxLength={1000} onChange={e=>change(name,e.target.value)}/></Field>)}</FieldGroup></section>
    <p><small>{t("Cách đọc chữ Việt chỉ gần đúng, không thay giọng tiếng Anh. IPA nhập tay cần đối chiếu nguồn; duyệt nội dung không tự xác minh IPA.","Vietnamese hints are approximate. Check manually entered IPA against a source; approval alone does not verify it.")}</small></p>
    </div></details>
    <p role="status">{status}</p>
    </fieldset><div className="selection-save-bar"><span>{t("Kiểm nghĩa và hình trước khi lưu","Review the meaning and picture before saving")}</span><SubmitButton state={busy?'pending':errorAction==='save'&&error?'error':saveState} error={errorAction==='save'?error:undefined} type="submit" size="lg" disabled={busy||looking||findingArt}><Check data-icon="inline-start" aria-hidden="true"/>{busy?t("Đang lưu…","Saving…"):t("Lưu từ","Save word")}</SubmitButton></div>
    </form></div>;
}
