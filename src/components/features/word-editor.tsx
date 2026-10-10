"use client";
import {MediaEditor} from "./media-editor";
import {WordLearningContent} from "./learning-content";
import {useLiveQuery} from "dexie-react-hooks";
import { useState } from "react";
import {pronunciation} from "@/lib/learning/catalog";
import {safeArt,readyArt} from "@/lib/media/catalog";
import {deleteWord} from "@/data/local/backup";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Back, EmptyState } from "@/components/app/shared";
import { useApp } from "@/components/app/provider";
import {
  DatabaseLoading,
  ReadFailure,
} from "@/components/app/database-boundary";
import { useLibraryWord } from "@/data/local/hooks";
import { RepositoryError } from "@/data/local/repository";
import type { LibraryWord } from "@/data/local/types";
export function WordEditor({ id }: { id: string }) {
  const { t,repository } = useApp();
  const result = useLibraryWord(id);
  const extra=useLiveQuery(async()=>repository?{scope:repository.scope.id,examples:await repository.db.examples.where("[scopeId+senseId]").equals([repository.scope.id,id]).toArray()}:null,[repository,id]);
  if (!result||!extra||extra.scope!==repository?.scope.id) return <DatabaseLoading />;
  if (result.error) return <ReadFailure />;
  if (!result.word)
    return (
      <EmptyState
        title={t("Chưa có từ để sửa", "No word to edit")}
        description={t(
          "Quay về thư viện để chọn từ khác.",
          "Go back to the library and choose another word.",
        )}
      >
        <Back href="/library" />
      </EmptyState>
    );
  return <EditorForm key={id} entry={result.word} extra={extra.examples.filter(e=>!e.deletedAt&&e.textEn!==result.word?.example)}/>;
}
function EditorForm({ entry,extra }: { entry: LibraryWord;extra:import("@/data/local/types").Example[] }) {
  const { t, demo, editPreview,repository } = useApp();
  const [secondExample,setSecondExample]=useState(extra[0]?.textEn??"");const [secondVi,setSecondVi]=useState(extra[0]?.translationVi??"");const [secondHint,setSecondHint]=useState(extra[0]?.pronunciations?.[0]?.readingHintVi??"");
  const [exampleIpa,setExampleIpa]=useState(entry.examplePronunciations[0]?.ipa??"");
  const [example,setExample]=useState(entry.example);const [exampleVi,setExampleVi]=useState(entry.exampleVi);const [pos,setPos]=useState(entry.pos);const [sense,setSense]=useState(entry.sense);
  const [ipa,setIpa]=useState(entry.pronunciations[0]?.ipa??"");const [hint,setHint]=useState(entry.pronunciations[0]?.readingHintVi??"");const [exampleHint,setExampleHint]=useState(entry.examplePronunciations[0]?.readingHintVi??"");const [art,setArt]=useState(safeArt(entry.art));const [checked,setChecked]=useState(false);const [deleting,setDeleting]=useState(false);
  const [word, setWord] = useState(entry.pendingEdit?.patch.word ?? entry.word);
  const [vi, setVi] = useState(entry.pendingEdit?.patch.vi ?? entry.vi);
  const [en, setEn] = useState(entry.pendingEdit?.patch.en ?? entry.en);
  // Keep the version opened by this editor; live queries must not silently erase an unsaved edit.
  const [revision, setRevision] = useState(entry.revision);
  const [proposed, setProposed] = useState(!!entry.pendingEdit);
  const [invalid, setInvalid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!word.trim() || !vi.trim() || !en.trim()) {
      setInvalid(true);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await editPreview(entry.id, revision, {
        word: word.trim(),
        vi: vi.trim(),
        en: en.trim(),
      });
      setRevision(result.revision);
      setProposed(result.proposed);
      if (!result.proposed) router.push(`/library/words/${entry.id}`);
    } catch (cause) {
      setError(
        cause instanceof RepositoryError && cause.code === "conflict"
          ? t(
              "Từ đã đổi ở tab khác hoặc bị trùng. Phần nhập vẫn còn; sao chép nội dung trước khi mở lại bản mới.",
              "The word changed in another tab or conflicts with an existing word. Your input is intact; copy it before reopening the latest version.",
            )
          : t(
              "Chưa lưu được chỉnh sửa. Phần nhập vẫn còn; kiểm tra quyền và dung lượng lưu trữ rồi thử lại.",
              "Edits could not be saved. Your input is intact; check storage permissions and available space, then retry.",
            ),
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="reading-page page-flow parent-page">
      <Back href={`/library/words/${entry.id}`} />
      <h1>
        {demo ? t("Sửa từ mẫu", "Edit sample word") : t("Sửa từ", "Edit word")}
      </h1>
      <p>
        {t(
          "Chỉnh sửa được lưu trên máy. Nếu đang dùng thư viện cloud, thay đổi được gửi khi có mạng. Đổi chữ tiếng Anh làm ví dụ và phát âm cần kiểm lại trước khi bé học.",
          "Edits are saved locally. In a cloud library, changes are sent when online. Changing the English word requires reviewing its examples and pronunciation before learning.",
        )}
      </p>
      {proposed && (
        <Alert>
          <AlertTitle>
            {t(
              "Đã lưu đề xuất chỉnh sửa trên máy",
              "Edit proposal saved on this device",
            )}
          </AlertTitle>
          <AlertDescription>
            {t(
              "Bản đã duyệt của bé vẫn giữ nguyên. Kiểm nghĩa, ví dụ và phát âm bên dưới, rồi bấm Duyệt toàn bộ nội dung.",
              "The approved version is preserved. Review meanings, examples and pronunciation below, then approve the complete content.",
            )}
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={save} noValidate>
        <FieldGroup>
          {[
            {
              id: "word",
              label: t("Từ tiếng Anh", "English word"),
              value: word,
              change: setWord,
            },
            {
              id: "vi",
              label: t("Nghĩa tiếng Việt", "Vietnamese meaning"),
              value: vi,
              change: setVi,
            },
            {
              id: "en",
              label: t("Nghĩa tiếng Anh", "English meaning"),
              value: en,
              change: setEn,
            },
          ].map((f) => (
            <Field key={f.id} data-invalid={invalid && !f.value.trim()}>
              <FieldLabel htmlFor={`word-edit-${f.id}`}>{f.label}</FieldLabel>
              <Input
                id={`word-edit-${f.id}`}
                value={f.value}
                maxLength={f.id === "word" ? 200 : 1000}
                disabled={saving}
                onChange={(e) => {f.change(e.target.value);setChecked(false);if(f.id==="word"){setIpa("");setHint("");setExample("");setExampleVi("");setExampleHint("");setExampleIpa("");setSecondExample("");setSecondVi("");setSecondHint("");setArt(null);}}}
                aria-invalid={invalid && !f.value.trim()}
                aria-describedby={invalid ? "word-edit-error" : undefined}
              />
            </Field>
          ))}
          {invalid && (
            <FieldError id="word-edit-error">
              {t(
                "Điền đầy đủ từ và hai nghĩa trước khi lưu.",
                "Enter the word and both meanings before saving.",
              )}
            </FieldError>
          )}
          {error && <FieldError role="alert">{error}</FieldError>}
          <Button type="submit" size="lg" disabled={saving}>
            {saving
              ? t("Đang lưu…", "Saving…")
              : t("Lưu chỉnh sửa trên máy", "Save edits on this device")}
          </Button>
        </FieldGroup>
      </form>
      <section className="page-flow"><h2>{t("Duyệt toàn bộ nội dung","Review the complete content")}</h2><p>{t("Đổi từ cần sửa ví dụ đúng nghĩa. IPA sửa tay chưa có nguồn xác minh; cách đọc chữ Việt chỉ gần đúng.","Update examples when changing a word. Manually edited IPA is unverified; Vietnamese reading hints are approximate.")}</p>
        {([["pos","Loại từ","Part of speech",pos,setPos],["sense","Tên nghĩa","Sense label",sense,setSense],["example","Câu ví dụ tiếng Anh","English example",example,setExample],["exampleVi","Nghĩa câu ví dụ","Example translation",exampleVi,setExampleVi],["ipa","Phiên âm IPA","IPA",ipa,setIpa],["hint","Cách đọc gần đúng chữ Việt","Vietnamese reading hint",hint,setHint],["secondExample","Câu ví dụ bổ sung","Additional example",secondExample,setSecondExample],["secondVi","Nghĩa câu ví dụ bổ sung","Additional example translation",secondVi,setSecondVi],["secondHint","Cách đọc câu ví dụ bổ sung","Additional example reading hint",secondHint,setSecondHint],["exampleIpa","IPA câu ví dụ (chưa xác minh)","Example IPA (unverified)",exampleIpa,setExampleIpa],["exampleHint","Cách đọc gần đúng của câu","Sentence reading hint",exampleHint,setExampleHint]] as const).map(([id,vi,en,value,change])=><Field key={id}><FieldLabel htmlFor={`review-${id}`}>{t(vi,en)}</FieldLabel><Input id={`review-${id}`} value={value} maxLength={id==="pos"?60:id==="sense"?200:1000} disabled={saving} onChange={e=>{change(e.target.value);setChecked(false);}}/></Field>)}
        <label htmlFor="review-art">{t("Hình đã chuẩn bị","Prepared illustration")}</label><select id="review-art" value={art??""} onChange={e=>{setArt(safeArt(e.target.value));setChecked(false);}}><option value="">{t("Chưa có hình","No illustration")}</option>{[...readyArt].map(a=><option key={a} value={a}>{a}</option>)}</select>
        <label><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/>{t("Tôi đã kiểm nghĩa, ví dụ, cách đọc và hình đúng nghĩa này.","I reviewed meanings, examples, pronunciation and the illustration for this sense.")}</label>
        <Button disabled={saving||!checked} onClick={async()=>{if(!repository||saving)return;setSaving(true);setError("");try{const {revision: ignoredRevision,pendingEdit:ignoredProposal,...content}=entry;void ignoredRevision;void ignoredProposal;const old=entry.pronunciations[0];const same=word===entry.word&&ipa===(old?.ipa??"");await repository.reviewWord(entry.id,revision,{...content,word:word.trim(),vi:vi.trim(),en:en.trim(),pos,sense,example,exampleVi,art,source:entry.source,origin:"user",approved:true,
          pronunciations:[pronunciation(word,hint||null,ipa||null,same?old?.sourceUrl??null:null,same&&!!old?.verified)],examplePronunciations:[pronunciation(example,exampleHint||null,exampleIpa||null)],additionalExamples:secondExample.trim()?[{textEn:secondExample.trim(),translationVi:secondVi.trim(),pronunciations:[pronunciation(secondExample.trim(),secondHint||null)]}]:[]} as unknown as import("@/data/local/types").WordInput);router.push(`/library/words/${entry.id}`);}catch{setError(t("Chưa duyệt được. Điền đủ ví dụ và hai nghĩa; nếu từ đã đổi ở tab khác, mở lại bản mới. Phần nhập vẫn còn.","Approval failed. Complete meanings and examples; reopen if another tab changed the word. Your input is intact."));}finally{setSaving(false);}}}>{t("Duyệt toàn bộ nội dung","Approve complete content")}</Button>
        <Button variant="outline" onClick={()=>setDeleting(true)}>{t("Xóa từ khỏi thư viện","Remove word from library")}</Button>{deleting&&<div role="alert"><p>{t("Xóa từ này khỏi các bài và trò chơi? Lịch sử đã lưu được giữ lại.","Remove this word from lessons and games? Saved history is retained.")}</p><Button disabled={saving} onClick={async()=>{if(!repository)return;setSaving(true);try{await deleteWord(repository,{...entry,revision});router.push('/library');}catch{setError(t("Chưa xóa được; từ có thể đã đổi. Mở lại bản mới.","Removal failed; reopen the latest word."));}finally{setSaving(false);}}}>{t("Xác nhận xóa từ","Confirm removal")}</Button><Button variant="ghost" onClick={()=>setDeleting(false)}>{t("Hủy","Cancel")}</Button></div>}
      </section>
      <MediaEditor word={entry}/><WordLearningContent word={entry} editable/>
    </div>
  );
}
