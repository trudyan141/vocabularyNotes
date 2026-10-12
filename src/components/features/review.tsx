"use client";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Pencil, Save, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApp, useHydrated } from "@/components/app/provider";
import { Artwork, Back, EmptyState } from "@/components/app/shared";
import { validCandidate, type Candidate } from "@/lib/demo/model";

function CandidateEditor({
  candidate,
  onSave,
  disabled,
}: {
  candidate: Candidate;
  onSave: (c: Candidate) => void;
  disabled: boolean;
}) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState(candidate.text);
  const [meaning, setMeaning] = useState(candidate.vi);
  const [invalid, setInvalid] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) {
      setInvalid(true);
      return;
    }
    onSave({
      ...candidate,
      text: word.trim(),
      vi: meaning.trim(),
      confirmed: true,
    });
    setOpen(false);
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (value) {
          setWord(candidate.text);
          setMeaning(candidate.vi);
          setInvalid(false);
        }
        setOpen(value);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={`${t("Sửa", "Edit")} ${candidate.text}`}
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Kiểm tra và sửa từ", "Check and edit the word")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "Đối chiếu chữ trên bài mẫu. Nghĩa bên dưới là nội dung minh họa được chuẩn bị sẵn.",
              "Compare with the sample worksheet. The meaning below is prepared demo content.",
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate>
          <FieldGroup>
            <Field data-invalid={invalid && !word.trim()}>
              <FieldLabel htmlFor={`edit-word-${candidate.id}`}>
                {t("Từ tiếng Anh", "English word")}
              </FieldLabel>
              <Input
                id={`edit-word-${candidate.id}`}
                autoFocus
                value={word}
                onChange={(e) => setWord(e.target.value)}
                aria-invalid={invalid && !word.trim()}
              />
            </Field>
            <Field data-invalid={invalid && !meaning.trim()}>
              <FieldLabel htmlFor={`edit-meaning-${candidate.id}`}>
                {t("Nghĩa tiếng Việt", "Vietnamese meaning")}
              </FieldLabel>
              <Input
                id={`edit-meaning-${candidate.id}`}
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                aria-invalid={invalid && !meaning.trim()}
              />
            </Field>
            {invalid && (
              <FieldError>
                {t(
                  "Điền từ và nghĩa trước khi xác nhận.",
                  "Enter the word and meaning before confirming.",
                )}
              </FieldError>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  {t("Hủy", "Cancel")}
                </Button>
              </DialogClose>
              <Button type="submit">
                <Check data-icon="inline-start" />
                {t("Xác nhận sửa", "Confirm edit")}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function Worksheet() {
  const { t } = useApp();
  return (
    <div className="worksheet">
      <h2 lang="en">School objects</h2>
      <p>
        {t("Ảnh bài mẫu", "Sample worksheet")}
      </p>
      <div className="worksheet-grid">
        {[
          "pencil",
          "book",
          "bag",
          "pen",
          "ruler",
          "scissors",
          "glue",
          "desk",
          "chair",
          "eraser",
        ].map((word) => (
          <div key={word}>
            <Artwork art={word} word={word} size={72} />
            <span lang="en">{word}</span>
          </div>
        ))}
      </div>
      <small>
        {t(
          "Đây là nguồn minh họa, chưa phải ảnh đã chụp hay kết quả AI.",
          "This is illustrative source content, not a captured image or AI result.",
        )}
      </small>
    </div>
  );
}
export function Review({ draftId }: { draftId: string }) {
  const hydrated = useHydrated();
  const app = useApp();
  const { t, demo, candidates, setCandidates } = app;
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const attempts = useRef(0);
  const router = useRouter();
  const params = useSearchParams();
  const selected = candidates.filter((c) => c.selected);
  const unresolved = selected.some((c) => !validCandidate(c));
  const matches = candidates.filter(
    (c) =>
      filter === "all" ||
      (filter === "existing" && c.existing) ||
      (filter === "uncertain" && c.uncertain && !c.confirmed) ||
      (filter === "new" && !c.existing && (!c.uncertain || c.confirmed)),
  );
  async function save() {
    if (lock.current || unresolved || !selected.length) return;
    lock.current = true;
    setSaving(true);
    setError("");
    try {
      await app.savePreview(
        params.get("case") === "save-error" && attempts.current++ === 0,
      );
      router.push("/lessons/demo");
    } catch {
      setError(
        t(
          "Chưa lưu được bản thử. Phần sửa và lựa chọn vẫn còn; bấm Lưu để thử lại.",
          "The preview could not save. Your edits and selection are intact; tap Save to retry.",
        ),
      );
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  if (!demo || draftId !== "demo")
    return (
      <div className="page-flow">
        <Back href="/capture" />
        <EmptyState
          title={t("Chưa có kết quả để duyệt", "No results to review")}
          description={t(
            "Ảnh này chưa có kết quả để duyệt. Quay lại ảnh để phân tích hoặc nhập tay.",
            "Image extraction is not connected. Go back to try a sample when available.",
          )}
        >
          <Button asChild>
            <Link prefetch={false} href="/capture">
              <ArrowLeft data-icon="inline-start" aria-hidden="true"/>{t("Về phần thêm bài", "Back to add lesson")}
            </Link>
          </Button>
        </EmptyState>
      </div>
    );
  return (
    <div className="page-flow parent-page">
      <div className="section-heading">
        <Back href="/capture" />
        <Badge variant="secondary">
          {t("Chuẩn bị bài học", "Prepare lessons")}
        </Badge>
      </div>
      <h1>{t("Duyệt bài School objects", "Review School objects")}</h1>
      <p>
        {t(
          "Kiểm tra chữ chưa rõ, sửa nghĩa và chọn mục muốn lưu cho con.",
          "Check unclear text, edit meanings and choose items to save in this browser.",
        )}
      </p>
      {app.draftError && (
        <Alert variant="destructive">
          <AlertTitle>
            {t(
              "Chưa lưu được nháp trên máy",
              "Draft could not be saved on this device",
            )}
          </AlertTitle>
          <AlertDescription>
            {t(
              "Phần sửa vẫn trên màn hình; kiểm tra bộ nhớ và thử lưu nháp lại trước khi rời trang.",
              "Your edits are still on screen; check storage and retry saving the draft before leaving.",
            )}
            <Button onClick={() => setCandidates(candidates)}>
              {t("Thử lưu nháp lại", "Retry saving draft")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <details className="mobile-source">
        <summary>
          {t("Xem bài mẫu để đối chiếu", "View sample worksheet")}
        </summary>
        <Worksheet />
      </details>
      <div className="review-layout">
        <aside className="desktop-source">
          <Worksheet />
        </aside>
        <section aria-label={t("Kết quả minh họa", "Illustrative results")}>
          <Tabs defaultValue="words">
            <TabsList className="content-modes-two" aria-label={t("Loại nội dung", "Content type")}>
              <TabsTrigger value="words">{t("Từ vựng", "Words")}</TabsTrigger>
              <TabsTrigger value="grammar">
                {t("Ngữ pháp", "Grammar")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="words">
              <ToggleGroup
                className="review-filters"
                type="single"
                value={filter}
                onValueChange={(v) => {
                  if (v) setFilter(v);
                }}
                aria-label={t("Lọc kết quả", "Filter results")}
                disabled={saving}
              >
                {[
                  ["all", t("Tất cả", "All")],
                  ["new", t("Mới", "New")],
                  ["existing", t("Đã có", "Existing")],
                  ["uncertain", t("Cần kiểm tra", "Check")],
                ].map(([value, label]) => (
                  <ToggleGroupItem key={value} value={value}>
                    {label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="result-count" role="status">
                {matches.length} {t("mục hiển thị", "items shown")} ·{" "}
                {selected.length} {t("đã chọn", "selected")}
              </p>
              {matches.length ? (
                <ul className="candidate-list">
                  {matches.map((c) => (
                    <li key={c.id}>
                      <div className="candidate-top">
                        <Checkbox
                          id={`select-${c.id}`}
                          checked={c.selected}
                          disabled={saving || !validCandidate(c)}
                          aria-label={`${t("Chọn", "Select")} ${c.text}`}
                          onCheckedChange={(v) =>
                            setCandidates(
                              candidates.map((x) =>
                                x.id === c.id
                                  ? { ...x, selected: v === true }
                                  : x,
                              ),
                            )
                          }
                        />
                        <label htmlFor={`select-${c.id}`}>
                          <strong lang="en">{c.text}</strong>
                          <span>
                            {c.vi || t("Chưa có nghĩa", "Meaning missing")}
                          </span>
                        </label>
                        <CandidateEditor
                          candidate={c}
                          disabled={saving}
                          onSave={(value) =>
                            setCandidates(
                              candidates.map((x) =>
                                x.id === c.id ? value : x,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="candidate-meta">
                        {c.existing ? (
                          <>
                            <Badge variant="secondary">
                              {t("Đã có", "Existing")}
                            </Badge>
                            <Link
                              prefetch={false}
                              href={`/library/words/${c.id}`}
                            >
                              {t("Xem bản cũ", "View existing word")}
                            </Link>
                            <p>
                              {t(
                                "Bản thử giữ từ cũ; không tạo thêm bản sao.",
                                "The preview keeps the existing word without a duplicate.",
                              )}
                            </p>
                          </>
                        ) : c.uncertain && !c.confirmed ? (
                          <>
                            <Badge variant="outline">
                              <AlertCircle />
                              {t("Cần kiểm tra", "Needs checking")}
                            </Badge>
                            <p>
                              {t(
                                "Chữ trên bài mẫu: eraser. Sửa và xác nhận trước khi chọn.",
                                "The sample says: eraser. Edit and confirm before selecting.",
                              )}
                            </p>
                          </>
                        ) : (
                          <Badge variant="outline">{t("Mới", "New")}</Badge>
                        )}
                        <small>
                          {t(
                            "Chữ từ bài mẫu; nghĩa/ví dụ chuẩn bị sẵn.",
                            "Word from the sample; meaning/example prepared separately.",
                          )}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title={t("Không có mục ở nhóm này", "No items in this group")}
                  description={t(
                    "Chọn Tất cả để xem lại các mục khác.",
                    "Choose All to see the other items.",
                  )}
                />
              )}
            </TabsContent>
            <TabsContent value="grammar">
              <EmptyState
                title={t(
                  "Bài mẫu chưa có mục ngữ pháp",
                  "No grammar in this sample",
                )}
                description={t(
                  "Chỉ lưu những mục đã được duyệt; không tự bổ sung kết quả nhận dạng.",
                  "Only keep reviewed items; do not invent extraction results.",
                )}
              />
            </TabsContent>
          </Tabs>
        </section>
      </div>
      <div className="save-bar">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t("Chưa lưu được", "Could not save")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <p>
          {selected.length
            ? t(
                "Đang duyệt bài mẫu. Bài của con vẫn được giữ riêng.",
                "You are reviewing sample lessons. Your child’s lessons are kept separately.",
              )
            : t(
                "Chọn ít nhất một mục hợp lệ để tiếp tục.",
                "Select at least one valid item to continue.",
              )}
        </p>
        {unresolved && (
          <p role="alert">
            {t(
              "Sửa mục chưa rõ hoặc thiếu nghĩa trước khi lưu.",
              "Fix unclear items or missing meanings before saving.",
            )}
          </p>
        )}
        <Button
          size="lg"
          disabled={!hydrated || !selected.length || unresolved || saving}
          onClick={save}
          aria-busy={saving}
        >
          <Save data-icon="inline-start" />
          {saving
            ? t("Đang lưu bản thử…", "Saving preview…")
            : t(`Lưu ${selected.length} mục`, `Save ${selected.length} items`)}
        </Button>
      </div>
    </div>
  );
}
export function LessonPreview() {
  const { t, receipt } = useApp();
  return (
    <div className="reading-page page-flow">
      <Back href="/capture/demo/review" />
      <h1>
        {t("Bài mẫu đã lưu trên máy", "Sample lesson saved on this device")}
      </h1>
      {receipt ? (
        <>
          <Alert>
            <Check />
            <AlertTitle>
              {receipt.added} {t("từ mới", "new words")} · {receipt.linked}{" "}
              {t("từ đã có", "existing words")}
            </AlertTitle>
            <AlertDescription>
              {t(
                "Đã lưu bài mẫu. Mở Thư viện để xem và cho con ôn nhé.",
                "Sample lesson saved. Open the library to view it and practise.",
              )}
            </AlertDescription>
          </Alert>
          <Button asChild size="lg">
            <Link prefetch={false} href="/practice">
              {t("Ôn bài này", "Review this lesson")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link prefetch={false} href="/library">
              {t("Xem từ trong thư viện mẫu", "See sample library")}
            </Link>
          </Button>
        </>
      ) : (
        <EmptyState
          title={t(
            "Chưa có kết quả lưu bài mẫu",
            "No saved sample lesson result",
          )}
          description={t(
            "Quay lại màn duyệt để chọn các từ.",
            "Go back to review and select words.",
          )}
        >
          <Button asChild>
            <Link prefetch={false} href="/capture/demo/review">
              {t("Duyệt bài mẫu", "Review sample lesson")}
            </Link>
          </Button>
        </EmptyState>
      )}
    </div>
  );
}
