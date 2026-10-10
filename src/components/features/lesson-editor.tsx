"use client";
import {Save, X} from "lucide-react";
import {useRef,useState} from "react";
import {useApp} from "@/components/app/provider";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {OperationStatus} from "@/components/ui/operation-status";
import type {Lesson} from "@/data/local/types";

export function LessonEditor({lesson,close,saved}:{lesson:Lesson;close:()=>void;saved:(title:string)=>void}) {
  const {repository,t}=useApp();
  const [title,setTitle]=useState(lesson.title),[day,setDay]=useState(lesson.learnedOn);
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const saving=useRef(false);
  return <form className="lesson-editor panel page-flow parent-page" onSubmit={async event=>{
    event.preventDefault();
    if(!repository||repository.scope.id!==lesson.scopeId||saving.current)return;
    if(!title.trim()){setError(t("Nhập tên bộ từ trước khi lưu.","Enter a set title before saving."));return;}
    saving.current=true;setBusy(true);setError("");
    try{await repository.editLesson(lesson.id,lesson.version,title.trim(),day);saved(title.trim());}
    catch{setError(t("Chưa lưu được. Kiểm tên/ngày; nếu bộ đã đổi ở tab khác, bấm Hủy rồi mở lại bản mới.","Save failed. Check the title/date; if another tab changed this set, cancel and reopen it."));}
    finally{saving.current=false;setBusy(false);}
  }}>
    <h3>{t("Sửa bộ từ","Edit word set")}</h3>
    <label>{t("Tên bộ","Set title")}<Input autoFocus required maxLength={200} disabled={busy} value={title} onChange={event=>setTitle(event.target.value)}/></label>
    <label>{t("Ngày học","Learning date")}<Input required type="date" disabled={busy} value={day} onChange={event=>setDay(event.target.value)}/></label>
    <p>{t("Đổi tên/ngày không thay từ hay lịch ôn.","Changing the title/date preserves words and review schedules.")}</p>
    <div className="row-wrap"><Button type="submit" disabled={busy}><Save data-icon="inline-start" aria-hidden="true"/>{t("Lưu bộ từ","Save set")}</Button><Button type="button" variant="ghost" disabled={busy} onClick={close}><X data-icon="inline-start" aria-hidden="true"/>{t("Hủy","Cancel")}</Button></div>
    <OperationStatus busy={busy} title={t("Đang lưu bộ từ","Saving word set")} message={error} error={!!error}/>
  </form>;
}
