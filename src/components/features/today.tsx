"use client";
import Link from "next/link";
import Image from "next/image";
import { Camera, ArrowRight, Play, FileImage } from "lucide-react";
import { FeatureAction } from "@/components/app/feature-action";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {PracticeRepository} from "@/data/local/practice";
import { useState } from "react";
import {LessonEditor} from "@/components/features/lesson-editor";
import type {Lesson} from "@/data/local/types";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp, useHydrated } from "@/components/app/provider";
import { ParentGate } from "@/components/app/parent-gate";
import { Artwork, EmptyState } from "@/components/app/shared";
import { useLibrarySearch } from "@/data/local/hooks";

export function Today() {
  const hydrated = useHydrated();
  const { t, entries, demo, repository,databaseStatus } = useApp();
  const draft = useLiveQuery(async () => repository ? {
    scopeId: repository.scope.id,
    value: await repository.db.captureDrafts.where("[scopeId+updatedAt]").between([repository.scope.id,""],[repository.scope.id,"\uffff"]).reverse().first(),
  } : null, [repository]);
  const lessons=useLiveQuery(async()=>{if(!repository)return null;const rows=await repository.db.lessons.where("[scopeId+learnedOn]").between([repository.scope.id,""],[repository.scope.id,"\uffff"]).reverse().toArray();const values=[];for(const lesson of rows.filter(l=>!l.deletedAt).slice(0,4)){const result=await repository.search("",{lesson:lesson.id,approvedOnly:true,limit:1});if(result.total)values.push({lesson,total:result.total,art:result.words[0]?.art??null,word:result.words[0]?.word??lesson.title});}return {scope:repository.scope.id,values};},[repository]);
  const due=useLiveQuery(async()=>{if(!repository)return null;try{return {scope:repository.scope.id,count:(await new PracticeRepository(repository).dueIds()).length,error:false};}catch{return {scope:repository.scope.id,count:0,error:true};}},[repository]);
  const dueCount=due&&due.scope===repository?.scope.id?due.count:0;
  const [editing,setEditing]=useState<Lesson|null>(null);
  const [savedTitle,setSavedTitle]=useState("");
  const [query, setQuery] = useState("");
  const result = useLibrarySearch(query, { limit: 4 });
  const words = result?.words ?? [];
  const hasLessons=entries.length>0||(demo&&databaseStatus==="loading");
  return (
    <div className="page-flow">
      <section className="today-hero">
        <div className="hero-copy">
          <h1>
            {hasLessons
              ? t("Một chút tiếng Anh mỗi ngày", "A little English every day")
              : t("Bài học đầu tiên của con", "Your first lesson")}
          </h1>
          <p>
            {hasLessons
              ? t(
                  "Nghe một từ, nhìn một hình. Cùng cáo ôn bài nhé!",
                  "Hear a word, see a picture. Learn with our fox!",
                )
              : t(
                  "Nhờ bố mẹ thêm bài để cùng học nhé.",
                  "Ask a parent to add a lesson so you can learn together.",
                )}
          </p>
          {hasLessons ? (
            <Button asChild size="lg" variant={dueCount>0?"outline":"default"} disabled={databaseStatus!=="ready"}>
              <Link prefetch={false} href="/practice">
                <Play data-icon="inline-start" />
                {t("Chơi 5 phút", "Play for 5 minutes")}
              </Link>
            </Button>
          ) : (
            <ParentGate href="/capture">
              <Button size="lg" disabled={databaseStatus!=="ready"}>
                <Camera data-icon="inline-start" />
                {t("Nhờ bố mẹ thêm bài", "Ask a parent to add a lesson")}
              </Button>
            </ParentGate>
          )}
        </div>
        <Image
          className="hero-fox"
          src="/illustrations/fox.svg"
          width={220}
          height={230}
          priority
          alt=""
        />
      </section>
      <div className="due-summary">
        {dueCount>0&&<><p>{dueCount} {t("từ đến hạn ôn hôm nay.","words due for review today.")}</p><Button asChild size="lg"><Link prefetch={false} href="/practice?review=due"><Play aria-hidden="true"/>{t(`Ôn ${dueCount} từ hôm nay`,`Review ${dueCount} words today`)}</Link></Button>{dueCount>10&&<small>{t("Mỗi lượt tối đa 10 từ; quay lại đây để ôn các từ còn lại.","Up to 10 words per session; return here to review the rest.")}</small>}</>}
        {due&&due.scope===repository?.scope.id&&due.error&&<p role="alert">{t("Chưa đọc được lịch ôn. Mở Chơi & học hoặc tải lại để thử lại.","Could not read review dates. Open Play & learn or reload to retry.")}</p>}
      </div>
      <ParentGate href="/add"><Button variant="feature" aria-label={t("Gõ từ mới cho con", "Type a new word")}><FeatureAction image="/illustrations/pencil.svg" title={t("Gõ từ mới cho con", "Type a new word")} description={t("Gõ một từ, chọn nghĩa rồi lưu bài","Type a word, choose its meaning and save")}/></Button></ParentGate>
      {draft?.scopeId === repository?.scope.id && draft?.value && (
        <section className="draft-resume">
          <p>{t("Bố mẹ còn một bài đang chuẩn bị.", "A parent has a lesson in progress.")}</p>
          <ParentGate href={`/capture/${draft.value.id}/edit`}>
            <Button variant="secondary"><FileImage data-icon="inline-start" aria-hidden="true"/>{t("Tiếp tục nháp ảnh", "Resume image draft")}<ArrowRight data-icon="inline-end" aria-hidden="true"/></Button>
          </ParentGate>
        </section>
      )}
      {hasLessons && (
        <section className="lesson-section">
          <div className="section-heading">
            <h2>{t("Bài gần đây", "Recent lessons")}</h2>
            <ParentGate href="/capture">
              <Button variant="ghost">
                <Camera data-icon="inline-start" />
                {t("Thêm bài", "Add lesson")}
              </Button>
            </ParentGate>
          </div>
          <Button asChild variant="link"><Link href="/library/lessons">{t("Tất cả bộ từ theo ngày","All word sets by date")}</Link></Button>
          {savedTitle&&<p role="status">{savedTitle}</p>}
          <div className="lesson-grid">
            {lessons&&lessons.scope===repository?.scope.id&&lessons.values.map(({lesson,total,art,word},i)=><article className="recent-lesson" key={lesson.id}><Link prefetch={false} className={`lesson-tile ${i%2?"lilac":"mint"}`} href={`/library?lesson=${encodeURIComponent(lesson.id)}`}><Artwork art={art} word={word} size={88}/><div><h3>{lesson.id==="food"?t("Trái cây & đồ ăn","Fruit & food"):lesson.id==="school"?t("Thế giới quanh con","Your world"):lesson.title}</h3><p>{lesson.learnedOn} · {total} {lesson.sourceType==="demo"?t("từ mẫu","sample words"):t("từ","words")}</p></div><ArrowRight aria-hidden="true"/></Link>{lesson.sourceType!=="demo"&&<Button variant="outline" onClick={()=>{setSavedTitle("");setEditing(lesson);}}>{t("Đổi tên","Rename")}<span className="sr-only">: {lesson.title}</span></Button>}{editing?.scopeId===repository?.scope.id&&editing.id===lesson.id&&<LessonEditor key={`${editing.scopeId}:${editing.id}:${editing.version}`} lesson={editing} close={()=>setEditing(null)} saved={title=>{setEditing(null);setSavedTitle(t(`Đã lưu tên bộ: ${title}`,`Saved set title: ${title}`));}}/>}</article>)}
          </div>
        </section>
      )}
      <section>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="today-search">
              {t("Tìm từ con muốn xem", "Find a word")}
            </FieldLabel>
            <Input
              id="today-search"
              type="search"
              disabled={!hydrated}
              placeholder={t("apple, quả táo…", "apple, fruit…")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Field>
        </FieldGroup>
        {hasLessons ? (
          <>
            <p className="result-count" role="status">
              {query
                ? `${result?.total ?? 0} ${t("từ tìm thấy", "words found")}`
                : t("Một vài từ quen thuộc", "A few familiar words")}
            </p>
            {!result?<div aria-busy="true" className="library-loading-space"/>:words.length ? (
              <ul className="word-list">
                {words.map((e) => (
                  <li key={e.id}>
                    <Link prefetch={false} href={`/library/words/${e.id}`}>
                      <Artwork art={e.art} word={e.word} size={64} />
                      <div>
                        <strong lang="en">{e.word}</strong>
                        <span>{t(e.vi, e.en)}</span>
                      </div>
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title={t("Chưa tìm thấy từ này", "No matching word")}
                description={t(
                  "Thử từ khác hoặc bỏ dấu tiếng Việt.",
                  "Try another word or a shorter search.",
                )}
              >
                <Button variant="outline" onClick={() => setQuery("")}>
                  {t("Xóa tìm kiếm", "Clear search")}
                </Button>
              </EmptyState>
            )}
            <Button asChild variant="link">
              <Link prefetch={false} href="/library">
                {t("Xem tất cả từ", "See all words")}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </>
        ) : (
          <EmptyState
            title={t("Thư viện đang trống", "Your library is empty")}
            description={
              demo
                ? t(
                    "Chưa có bài trong thư viện này.",
                    "No lesson in this library.",
                  )
                : t(
                    "Chưa có dữ liệu thật để hiển thị.",
                    "There is no saved content to display yet.",
                  )
            }
          />
        )}
      </section>
    </div>
  );
}
export function Welcome() {
  const { t, demo } = useApp();
  return (
    <section className="welcome">
      <Image
        src="/illustrations/fox.svg"
        width={220}
        height={230}
        priority
        alt=""
      />
      <h1>
        {t("Cùng con nhớ những từ đã học", "Remember the words you learn")}
      </h1>
      <p>
        {t(
          "Bố mẹ chuẩn bị bài. Con nghe, xem và ôn lại mỗi ngày.",
          "Parents prepare the lesson. Children listen, explore and review.",
        )}
      </p>
      <Button asChild size="lg">
        <Link prefetch={false} href="/today">
          {t("Bắt đầu", "Get started")}
          <ArrowRight data-icon="inline-end" />
        </Link>
      </Button>
      <small>
        {demo
          ? t(
              "Bắt đầu với bài mẫu để thử giao diện.",
              "Start with sample lessons to explore the interface.",
            )
          : t("Bắt đầu không cần tài khoản.", "Start without an account.")}
      </small>
      <ParentGate href="/settings">
        <Button variant="link">
          {t("Tùy chọn của phụ huynh", "Parent options")}
        </Button>
      </ParentGate>
    </section>
  );
}
