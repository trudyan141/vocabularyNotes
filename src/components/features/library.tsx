"use client";
import dynamic from "next/dynamic";
const ContentLibrary=dynamic(()=>import("./content-library").then(module=>module.ContentLibrary),{loading:()=> <DatabaseLoading/>});
import {useLiveQuery} from "dexie-react-hooks";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Filter, Plus, FolderHeart, CalendarDays, BookOpen, MessageCircle, Layers, Shapes } from "lucide-react";
import {lessonTitle} from "@/lib/learning/lesson-presentation";
import { FeatureAction } from "@/components/app/feature-action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useApp, useHydrated } from "@/components/app/provider";
import { Artwork, EmptyState } from "@/components/app/shared";
import { ParentGate } from "@/components/app/parent-gate";
import { useLibrarySearch } from "@/data/local/hooks";
import {
  DatabaseLoading,
  ReadFailure,
} from "@/components/app/database-boundary";

export function Library() {
  const hydrated = useHydrated();
  const { t,repository } = useApp();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [mode,setMode]=useState<"words"|"sentences"|"patterns"|"grammar">("words");
  const [filter, setFilter] = useState("all");
  const lesson = params.get("lesson");
  const lessonRecord=useLiveQuery(()=>repository&&lesson?repository.db.lessons.get([repository.scope.id,lesson]):undefined,[repository,lesson]);
  const [offset, setOffset] = useState(0);
  const result = useLibrarySearch(query, {
    lesson,
    missingArt: filter === "missing",
    offset,
  });
  const matches = result?.words ?? [];
  if (result?.error) return <ReadFailure />;
  return (
    <div className="page-flow">
      <div className="section-heading library-header">
        <h1>{t("Từ của con", "My words")}</h1>
        <div className="library-header-actions">
        <ParentGate href="/add"><Button><Plus data-icon="inline-start" aria-hidden="true"/>{t("Thêm từ", "Add word")}</Button></ParentGate>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" aria-label={t("Lọc từ", "Filter words")}>
              <Filter data-icon="inline-start" />
              {t("Lọc", "Filter")}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{t("Lọc từ của con", "Filter my words")}</SheetTitle>
              <SheetDescription>
                {t("Chọn nhóm từ muốn xem.", "Choose the words to display.")}
              </SheetDescription>
            </SheetHeader>
            <div className="sheet-body">
              <ToggleGroup
                type="single"
                value={filter}
                onValueChange={(value) => {
                  if (value) {
                    setFilter(value);
                    setOffset(0);
                  }
                }}
                aria-label={t("Nhóm từ", "Word group")}
              >
                <ToggleGroupItem value="all">
                  {t("Tất cả", "All")}
                </ToggleGroupItem>
                <ToggleGroupItem value="missing">
                  {t("Chưa có hình", "No picture")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>
      {lesson && (
        <div className="row-wrap">
          <Badge variant="secondary">
            {lesson === "food"
              ? t("Trái cây & đồ ăn", "Fruit & food")
              : lesson==="school"?t("Thế giới quanh con", "Your world"):lessonRecord?lessonTitle(lessonRecord,t):t("Bài học đã lưu","Saved lesson")}
          </Badge>
          <Button asChild variant="link">
            <Link prefetch={false} href="/library">
              {t("Bỏ lọc bài", "Clear lesson filter")}
            </Link>
          </Button>
        </div>
      )}
      <div className="row-wrap"><Button asChild variant="secondary"><Link href="/library/lessons"><CalendarDays data-icon="inline-start" aria-hidden="true"/>{t("Bộ từ theo ngày","Word sets by date")}</Link></Button><Button asChild variant="secondary"><Link href="/library/groups"><FolderHeart aria-hidden="true"/>{t("Nhóm học","Learning groups")}</Link></Button>{lesson&&<Button asChild><Link href={`/practice?lesson=${encodeURIComponent(lesson)}`}>{t("Học bộ này","Learn this set")}<ArrowRight data-icon="inline-end" aria-hidden="true"/></Link></Button>}</div>
      <ParentGate href={`/library/prepare${lesson?`?lesson=${encodeURIComponent(lesson)}`:""}`}><Button variant="feature" aria-label={t("Bổ sung hình và mẫu câu","Prepare pictures and patterns")}><FeatureAction image="/illustrations/book.svg" title={t("Bổ sung hình và mẫu câu","Prepare pictures and patterns")} description={t("Thêm hình, thêm câu để con học vui hơn","Add pictures and examples for learning")}/></Button></ParentGate>
      <div className="content-modes" aria-label={t("Loại nội dung","Content type")}>{([["words","Từ","Words",BookOpen],["sentences","Câu","Sentences",MessageCircle],["patterns","Mẫu câu","Patterns",Layers],["grammar","Ngữ pháp","Grammar",Shapes]] as const).map(([value,vi,en,Icon])=><Button key={value} variant="segment" aria-pressed={mode===value} onClick={()=>{setMode(value);setOffset(0);}}><Icon aria-hidden="true"/>{t(vi,en)}</Button>)}</div>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="library-search">
            {t(
              "Tìm bằng tiếng Anh hoặc tiếng Việt",
              "Search in English or Vietnamese",
            )}
          </FieldLabel>
          <Input
            id="library-search"
            type="search"
            disabled={!hydrated}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOffset(0);
            }}
            placeholder={t("Từ hoặc nghĩa…", "A word or meaning…")}
          />
        </Field>
      </FieldGroup>
      {mode!=="words"?<ContentLibrary key={`${mode}:${query}:${lesson}`} mode={mode} query={query} lesson={lesson}/>:<>
      <p className="result-count" role="status">
        {result?.total ?? "…"} {t("từ", "words")}
        {filter === "missing" && ` · ${t("chưa có hình", "no picture")}`}
      </p>
      {!result ? (
        <DatabaseLoading />
      ) : !result.totalLibrary ? (
        <EmptyState
          title={t("Thư viện đang trống", "Your library is empty")}
          description={t(
            "Nhờ bố mẹ chuẩn bị bài đầu tiên nhé.",
            "Ask a parent to prepare your first lesson.",
          )}
        >
          <ParentGate href="/capture">
            <Button>
              {t("Nhờ bố mẹ thêm bài", "Ask a parent to add a lesson")}
            </Button>
          </ParentGate>
        </EmptyState>
      ) : matches.length ? (
        <ul className="word-list library-list">
          {matches.map((e) => (
            <li key={e.id}>
              <Link prefetch={false} href={`/library/words/${e.id}`}>
                <Artwork art={e.art} word={e.word} size={80} />
                <div>
                  <strong lang="en">{e.word}</strong>
                  <span>{t(e.vi, e.en)}</span>
                  {!e.art && (
                    <small>
                      {t(
                        "Chưa có hình · vẫn xem và học được",
                        "No picture · you can still learn",
                      )}
                    </small>
                  )}
                </div>
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={t("Không có từ phù hợp", "No matching words")}
          description={t(
            "Thử từ khác hoặc xóa bộ lọc.",
            "Try another word or clear the filters.",
          )}
        >
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              setFilter("all");
              setOffset(0);
            }}
          >
            {t("Xóa tìm kiếm và lọc", "Clear search and filter")}
          </Button>
        </EmptyState>
      )}
      {result && result.total > 50 && (
        <div className="row-wrap">
          <Button
            variant="outline"
            disabled={offset === 0}
            onClick={() => setOffset((v) => Math.max(0, v - 50))}
          >
            {t("Trước", "Previous")}
          </Button>
          <span>
            {offset + 1}–{Math.min(offset + 50, result.total)} / {result.total}
          </span>
          <Button
            variant="outline"
            disabled={offset + 50 >= result.total}
            onClick={() => setOffset((v) => v + 50)}
          >
            {t("Tiếp", "Next")}
          </Button>
        </div>
      )}
      </>}
    </div>
  );
}
