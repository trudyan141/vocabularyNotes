"use client";
import Link from "next/link";
import Image from "next/image";
import { Camera, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {ScopedDocument} from "@/data/local/types";
import type {ReviewState} from "@/lib/learning/srs";
import { useState } from "react";
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
  const due=useLiveQuery(async()=>{if(!repository)return null;const [index,states]=await Promise.all([repository.db.searchIndex.where("[scopeId+ordinal]").between([repository.scope.id,""],[repository.scope.id,"\uffff"]).toArray(),repository.db.table<ScopedDocument>("reviewStates").where("[scopeId+id]").between([repository.scope.id,""],[repository.scope.id,"\uffff"]).toArray()]);const map=new Map(states.map(row=>[row.id,row.payload.state as ReviewState]));return {scope:repository.scope.id,count:index.filter(row=>row.approval&&(!map.has(row.id)||Date.parse(map.get(row.id)!.dueAt)<=Date.now())).length};},[repository]);
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
            <Button asChild size="lg" disabled={databaseStatus!=="ready"}>
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
      <div className="due-summary">{due&&due.scope===repository?.scope.id&&due.count>0&&<p>{due.count} {t("từ đến hạn ôn hôm nay.","words due for review today.")}</p>}</div>
      <ParentGate href="/add"><Button variant="outline">{t("Gõ từ mới cho con", "Type a new word")}</Button></ParentGate>
      {draft?.scopeId === repository?.scope.id && draft?.value && (
        <section className="section-heading">
          <p>{t("Bố mẹ còn một bài đang chuẩn bị.", "A parent has a lesson in progress.")}</p>
          <ParentGate href={`/capture/${draft.value.id}/edit`}>
            <Button variant="outline">{t("Tiếp tục nháp ảnh", "Resume image draft")}</Button>
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
          <div className="lesson-grid">
            {lessons&&lessons.scope===repository?.scope.id&&lessons.values.map(({lesson,total,art,word},i)=><Link key={lesson.id} prefetch={false} className={`lesson-tile ${i%2?"lilac":"mint"}`} href={`/library?lesson=${encodeURIComponent(lesson.id)}`}><Artwork art={art} word={word} size={88}/><div><h3>{lesson.id==="food"?t("Trái cây & đồ ăn","Fruit & food"):lesson.id==="school"?t("Thế giới quanh con","Your world"):lesson.title}</h3><p>{lesson.learnedOn} · {total} {lesson.sourceType==="demo"?t("từ mẫu","sample words"):t("từ","words")}</p></div><ArrowRight aria-hidden="true"/></Link>)}
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
