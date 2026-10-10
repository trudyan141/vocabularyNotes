"use client";
import {Save} from "lucide-react";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/components/app/provider";
import { useLibraryWord } from "@/data/local/hooks";
import { Button } from "@/components/ui/button";
import { Back } from "@/components/app/shared";
import { DatabaseLoading, ReadFailure } from "@/components/app/database-boundary";
import type { LibraryWord, Note } from "@/data/local/types";
export function LearningNotes({word,editable=false}:{word:LibraryWord;editable?:boolean}){
  const {repository,t}=useApp();
  const result=useLiveQuery(async()=>repository?{scope:repository.scope.id,note:await repository.db.notes.where("[scopeId+targetType+targetId]").equals([repository.scope.id,"sense",word.id]).first()}:null,[repository,word.id]);
  if(!result||result.scope!==repository?.scope.id)return null;
  if(editable)return <NoteEditor key={word.id} word={word} note={result.note}/>;
  if(!result.note)return <p>{t("Chưa có ghi chú của bố mẹ.","No parent notes yet.")}</p>;
  return <><p className="saved-note">{result.note.text}</p>{result.note.mnemonicData&&<Mnemonic word={word} template={result.note.mnemonicData.template}/>}</>;
}
function NoteEditor({word,note}:{word:LibraryWord;note?:Note}){
  const {repository,t}=useApp();const [text,setText]=useState(note?.text??"");
  const [template,setTemplate]=useState<"none"|"word-association"|"sentence-chunks"|"grammar-transform">(note?.mnemonicData?.template??"none");
  const [version,setVersion]=useState(note?.version??null);const [busy,setBusy]=useState(false);const [status,setStatus]=useState("");
  return <div className="note-editor"><label htmlFor="parent-note">{t("Ghi chú giúp con nhớ","Memory note")}</label><textarea id="parent-note" maxLength={10000} value={text} onChange={e=>setText(e.target.value)}/>
    <label htmlFor="note-template">{t("Cách minh hoạ","Illustration template")}</label><select id="note-template" value={template} onChange={e=>setTemplate(e.target.value as typeof template)}>
      <option value="none">{t("Chỉ ghi chú","Text only")}</option><option value="word-association">{t("Từ → nghĩa → ví dụ","Word association")}</option><option value="sentence-chunks">{t("Đọc câu từng cụm","Sentence chunks")}</option><option value="grammar-transform">{t("She likes → They like","Grammar transformation")}</option></select>
    {template!=="none"&&<Mnemonic word={word} template={template}/>}
    <Button disabled={busy} onClick={async()=>{if(!repository||busy)return;setBusy(true);try{const saved=await repository.saveNote({id:note?.id??`note-${word.id}`,targetType:"sense",targetId:word.id,text,expectedVersion:version,
      mnemonicData:template==="none"?null:{template}});setVersion(saved.version);setStatus(t("Đã lưu và duyệt ghi chú cho con.","Note saved and approved."));}catch{setStatus(t("Chưa lưu được hoặc ghi chú đã đổi ở tab khác; phần nhập còn nguyên.","Could not save or another tab changed the note; your input is intact."));}finally{setBusy(false);}}}><Save data-icon="inline-start" aria-hidden="true"/>{t("Lưu và duyệt ghi chú","Save and approve note")}</Button><p role="status">{status}</p></div>;
}
function Mnemonic({word,template}:{word:LibraryWord;template:NonNullable<Note["mnemonicData"]>["template"]}){
  const {t,preferences}=useApp();const [step,setStep]=useState(0);const [playing,setPlaying]=useState(false);
  const words=word.example.split(/\s+/).filter(Boolean);const chunkSize=Math.max(1,Math.ceil(words.length/3));
  const chunks=[0,1,2].map(i=>words.slice(i*chunkSize,(i+1)*chunkSize).join(" ")).filter(Boolean);
  const scenes=template==="word-association"?[word.word,word.vi,word.example||word.en]:template==="sentence-chunks"?chunks:["She likes apples.","They like apples.",t("She: likes; They: like. Hiện tại đơn với động từ thường, câu khẳng định.","She: likes; They: like. Affirmative present simple with a lexical verb.")];
  useEffect(()=>{if(!playing||preferences.reduceMotion)return;const timer=setTimeout(()=>{if(step>=scenes.length-1)setPlaying(false);else setStep(i=>i+1);},2500);return()=>clearTimeout(timer);},[playing,step,scenes.length,preferences.reduceMotion]);
  useEffect(()=>{const pause=()=>{if(document.hidden)setPlaying(false);};document.addEventListener("visibilitychange",pause);return()=>document.removeEventListener("visibilitychange",pause);},[]);
  return <section className="mnemonic-scene"><h3>{t("Mẹo nhớ từng bước","Memory steps")}</h3><p>{template==="grammar-transform"?t("Câu mẫu minh hoạ quy tắc, không trích từ bài của con.","Prepared examples illustrating the rule, not extracted from your lesson."):word.example||word.en}</p>
    <p key={step} className="mnemonic-current" aria-live="polite"><strong>{scenes[step]??scenes[0]}</strong></p><p>{scenes.join(" / ")}</p>
    <div className="row-wrap"><Button variant="outline" onClick={()=>{setPlaying(false);setStep(i=>Math.max(0,i-1));}} disabled={step===0}>{t("Bước trước","Previous step")}</Button><Button onClick={()=>{setPlaying(false);setStep(i=>(i+1)%Math.max(1,scenes.length));}}>{step===scenes.length-1?t("Xem lại","Replay"):t("Bước tiếp","Next step")}</Button><Button variant="outline" disabled={preferences.reduceMotion} onClick={()=>{if(step===scenes.length-1)setStep(0);setPlaying(v=>!v);}}>{playing?t("Tạm dừng minh hoạ","Pause illustration"):t("Phát minh hoạ","Play illustration")}</Button><Button variant="ghost" onClick={()=>{setStep(0);setPlaying(!preferences.reduceMotion);}}>{t("Phát lại","Replay")}</Button></div>{preferences.reduceMotion&&<p>{t("Đang dùng bản tĩnh; con xem đủ các bước ở trên.","Static mode; all steps are shown above.")}</p>}</section>;
}
export function WordNotes({id}:{id:string}){const {t}=useApp();const result=useLibraryWord(id);if(!result)return <DatabaseLoading/>;if(result.error||!result.word)return <ReadFailure/>;
 return <div className="reading-page page-flow parent-page"><Back href={`/library/words/${id}`}/><h1>{t("Ghi chú của bố mẹ","Parent notes")}: {result.word.word}</h1><LearningNotes word={result.word} editable/></div>;}
