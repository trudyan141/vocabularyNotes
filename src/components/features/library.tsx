"use client";
import {DeleteControl} from "./delete-control";
import {SearchHighlight} from '@/components/ui/search-highlight';
import dynamic from "next/dynamic";
const ContentLibrary=dynamic(()=>import("./content-library").then(module=>module.ContentLibrary),{loading:()=> <DatabaseLoading/>});
import {useLiveQuery} from "dexie-react-hooks";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Plus, FolderHeart, CalendarDays, BookOpen, Search, ImageOff, LayoutGrid } from "lucide-react";
import {LessonEditor} from "./lesson-editor";
import {lessonTitle} from "@/lib/learning/lesson-presentation";
import { FeatureAction } from "@/components/app/feature-action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useApp, useHydrated } from "@/components/app/provider";
import { Artwork, EmptyState } from "@/components/app/shared";
import { ActionLink } from "@/components/app/action-link";
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
  const [mode,setMode]=useState<"words"|"grammar">(params.get("mode")==="grammar"?"grammar":"words");
  const [filter, setFilter] = useState("all");
  const lesson = params.get("lesson");
  const lessonRecord=useLiveQuery(()=>repository&&lesson?repository.db.lessons.get([repository.scope.id,lesson]):undefined,[repository,lesson]);
  const [editingLesson,setEditingLesson]=useState(false);
  const [offset, setOffset] = useState(0);
  const result = useLibrarySearch(query, {
    libraryOnly:true,
    lesson,
    missingArt: filter === "missing",
    offset,
  });
  const matches = result?.words ?? [];
  if (result?.error) return <ReadFailure />;
  return (
    <div className="page-flow">
      {lessonRecord&&lessonRecord.scopeId===repository?.scope.id&&<details className="page-flow"><summary>{t('Chi tiết bộ theo ngày','Dated set details')}</summary><p>{lessonTitle(lessonRecord,t)}</p><DeleteControl target={{table:'lessons',id:lessonRecord.id,version:lessonRecord.version}} label={t('Xóa bộ theo ngày','Delete dated set')} description={t('Xóa bộ này? Từ trong thư viện và các bộ khác vẫn giữ.','Delete this set? Library words and other sets are kept.')}/><Button variant="outline" onClick={()=>setEditingLesson(true)}>{t('Sửa bộ từ','Edit word set')}</Button>{editingLesson&&<LessonEditor key={`${lessonRecord.id}:${lessonRecord.version}`} lesson={lessonRecord} close={()=>setEditingLesson(false)} saved={()=>setEditingLesson(false)}/>}</details>}
      <div className="section-heading library-header">
        <h1>{t("Từ của con", "My words")}</h1>
        <div className="library-header-actions">
        <ActionLink href="/add"><Button><Plus data-icon="inline-start" aria-hidden="true"/>{t("Thêm từ", "Add word")}</Button></ActionLink>

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
      <ActionLink href={`/library/prepare${lesson?`?lesson=${encodeURIComponent(lesson)}`:""}`}><Button variant="feature" aria-label={t("Bổ sung hình cho từ","Add word pictures")}><FeatureAction image="/illustrations/book.svg" title={t("Bổ sung hình cho từ","Add word pictures")} description={t("Xem và thêm hình cho những từ còn thiếu","Find pictures for words without one")}/></Button></ActionLink>
      <div className="content-modes content-modes-two" aria-label={t("Loại nội dung","Content type")}>{([["words","Từ","Words",BookOpen],["grammar","Ngữ pháp","Grammar",BookOpen]] as const).map(([value,vi,en,Icon])=><Button key={value} variant="segment" aria-pressed={mode===value} onClick={()=>{setMode(value);setOffset(0);}}><Icon aria-hidden="true"/>{t(vi,en)}</Button>)}</div>
      <section className="library-search-card">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="library-search">
            {t(
              "Tìm bằng tiếng Anh hoặc tiếng Việt",
              "Search in English or Vietnamese",
            )}
          </FieldLabel>
          <div className="library-search-input"><Search aria-hidden="true"/><Input
            id="library-search"
            type="search"
            disabled={!hydrated}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOffset(0);
            }}
            placeholder={t("Từ hoặc nghĩa…", "A word or meaning…")}
          /></div>
        </Field>
      </FieldGroup>
      {mode==="words"&&<ToggleGroup className="library-inline-filter" type="single" value={filter} onValueChange={value=>{if(value){setFilter(value);setOffset(0);}}} aria-label={t("Lọc từ","Filter words")}><ToggleGroupItem value="all"><LayoutGrid aria-hidden="true"/>{t("Tất cả","All")}</ToggleGroupItem><ToggleGroupItem value="missing"><ImageOff aria-hidden="true"/>{t("Chưa có hình","No picture")}</ToggleGroupItem></ToggleGroup>}
      </section>
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
            "Thêm bài đầu tiên để bắt đầu nhé.",
            "Add your first lesson to get started.",
          )}
        >
          <ActionLink href="/capture">
            <Button>
              {t("Thêm bài mới", "Add a lesson")}
            </Button>
          </ActionLink>
        </EmptyState>
      ) : matches.length ? (
        <ul className="word-list library-list">
          {matches.map((e) => (
            <li key={e.id}>
              <Link prefetch={false} href={`/library/words/${e.id}`}>
                <Artwork art={e.art} word={e.word} size={80} />
                <div>
                  <strong lang="en"><SearchHighlight text={e.word} query={query}/></strong>
                  <span><SearchHighlight text={t(e.vi, e.en)} query={query}/></span>
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
