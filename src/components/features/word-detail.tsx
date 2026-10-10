"use client";
import Link from "next/link";
import {Pencil,Play} from "lucide-react";
import {useLiveQuery} from "dexie-react-hooks";
import {useApp} from "@/components/app/provider";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Alert,AlertDescription,AlertTitle} from "@/components/ui/alert";
import {Artwork,Back,EmptyState} from "@/components/app/shared";
import {AudioControl} from "@/components/app/audio-control";
import {ParentGate} from "@/components/app/parent-gate";
import {DatabaseLoading,ReadFailure} from "@/components/app/database-boundary";
import {useLibraryWord} from "@/data/local/hooks";
import {WordLearningContent} from "./learning-content";
import {LearningNotes} from "./notes";
export function WordDetail({ id }: { id: string }) {
  const { t,repository } = useApp();
  const sources=useLiveQuery(async()=>{if(!repository)return null;const links=await repository.db.lessonItems.where("[scopeId+senseId]").equals([repository.scope.id,id]).toArray();const values=await Promise.all(links.filter(l=>!l.deletedAt).map(async link=>({lesson:await repository.db.lessons.get([repository.scope.id,link.lessonId]),evidence:link.evidenceId?await repository.db.evidence.get([repository.scope.id,link.evidenceId]):null})));return {scope:repository.scope.id,values};},[repository,id]);
  const senses=useLiveQuery(async()=>{if(!repository)return null;const sense=await repository.db.senses.get([repository.scope.id,id]);if(!sense)return null;const rows=await repository.db.senses.where("[scopeId+entryId]").equals([repository.scope.id,sense.entryId]).toArray();return {scope:repository.scope.id,id,words:(await repository.words(rows.filter(row=>!row.deletedAt).map(row=>row.id))).filter(word=>word.approved)};},[repository,id]);
  const result = useLibraryWord(id);
  if (!result) return <DatabaseLoading />;
  if (result.error) return <ReadFailure />;
  const entry = result.word;
  if (!entry)
    return (
      <div className="reading-page">
        <Back href="/library" />
        <EmptyState
          title={t("Không tìm thấy từ này", "Word not found")}
          description={t(
            "Từ có thể đã bị xóa hoặc thuộc thư viện khác. Quay về thư viện để chọn từ khác.",
            "This word may have been removed or belong to another library. Choose another word in the library.",
          )}
        >
          <Button asChild>
            <Link prefetch={false} href="/library">
              {t("Về thư viện", "Back to library")}
            </Link>
          </Button>
        </EmptyState>
      </div>
    );
  if (!entry.approved)
    return (
      <div className="reading-page page-flow">
        <Back href="/library" />
        <EmptyState
          title={t(
            "Từ này chờ phụ huynh kiểm tra",
            "This word needs parent review",
          )}
          description={t(
            "Bản nội dung mới chưa được duyệt để bé học.",
            "The new content has not been approved for learning.",
          )}
        >
          <ParentGate href={`/library/words/${id}/edit`}>
            <Button>{t("Bố mẹ kiểm tra", "Parent review")}</Button>
          </ParentGate>
        </EmptyState>
      </div>
    );
  return (
    <article className="reading-page page-flow">
      <div className="section-heading">
        <Back href="/library" label={t("Từ của con", "My words")} />
        <ParentGate href={`/library/words/${entry.id}/edit`}>
          <Button variant="ghost">
            <Pencil data-icon="inline-start" />
            {t("Sửa", "Edit")}
          </Button>
        </ParentGate>
      </div>
      <div className="word-detail-hero">
        <Artwork art={entry.art} word={entry.word} size={210} showCredit />
        <div>
          <h1 lang="en">{entry.word}</h1>
          <Badge variant="secondary">{entry.pos}</Badge>
          {entry.pronunciations.map((p,i)=><div key={i}><p className="ipa" lang="en">{p.verified?p.ipa:null}</p>{p.readingHintVi&&<p className="reading-hint">{t("Cách đọc gần đúng: ", "Reading hint: ")}{p.readingHintVi}</p>}</div>)}
          <div className="row-wrap audio-row">
            <AudioControl text={entry.word} />
            <AudioControl text={entry.word} slow />
          </div>
        </div>
      </div>
      {senses&&senses.scope===repository?.scope.id&&senses.id===id&&senses.words.length>1&&<section className="sense-picker page-flow" aria-label={t("Các nghĩa của từ","Word meanings")}><h2>{t("Chọn nghĩa theo câu","Choose the meaning for your sentence")}</h2><p>{t("Từ này có nhiều nghĩa. Mỗi nghĩa có ví dụ riêng.","This word has several meanings, each with its own example.")}</p><div className="row-wrap">{senses.words.map(word=><Button key={word.id} asChild variant={word.id===entry.id?"secondary":"outline"}><Link prefetch={false} href={`/library/words/${word.id}`} aria-current={word.id===entry.id?"page":undefined}>{word.word} · {word.vi.split("—")[0].trim()}</Link></Button>)}</div></section>}
      <section>
        <h2 className="meaning">
          {entry.vi ||
            t("Chưa có nghĩa tiếng Việt", "Vietnamese meaning is missing")}
        </h2>
        <p lang="en">{entry.en}</p>
      </section>
      <section className="example-block">
        <h2>{t("Một câu ví dụ", "An example")}</h2>
        <p lang="en">{entry.example}</p>
        <p className="muted">{entry.exampleVi}</p>
        {entry.examplePronunciations.filter(p=>p.verified&&p.ipa).map((p,i)=><p key={`ipa-${i}`} className="ipa" lang="en">{p.ipa}</p>)}{entry.examplePronunciations.map((p,i)=>p.readingHintVi?<p key={i} className="reading-hint">{t("Cách đọc gần đúng: ","Reading hint: ")}{p.readingHintVi}</p>:null)}
        <AudioControl text={entry.example} />
      </section>
      <WordLearningContent word={entry}/>
      {!entry.art && (
        <Alert>
          <AlertTitle>
            {t("Từ này chưa có hình", "This word has no picture")}
          </AlertTitle>
          <AlertDescription>
            {t(
              "Con vẫn có thể nghe và đọc ví dụ. Bố mẹ sẽ chọn hình đúng nghĩa sau.",
              "You can still listen and read the example. A parent can choose a picture later.",
            )}
          </AlertDescription>
        </Alert>
      )}
      <Button asChild size="lg">
        <Link prefetch={false} href={`/practice?word=${entry.id}`}>
          <Play data-icon="inline-start" />
          {t("Ôn từ này", "Review this word")}
        </Link>
      </Button>
      <details>
        <summary>{t("Nguồn và ghi chú", "Source and notes")}</summary>
        <p>
          {entry.origin === "demo"
            ? t(
                "Nghĩa và ví dụ là nội dung minh họa chuẩn bị sẵn, chưa do AI trích hay bổ sung.",
                "Meanings and examples are prepared demo content, not AI extraction or enrichment.",
              )
            : entry.origin === "user"
              ? t(
                  "Nghĩa do phụ huynh nhập hoặc sửa. Ví dụ giữ nguồn đã lưu.",
                  "Meanings were entered or edited by a parent. Examples retain their saved source.",
                )
              : entry.source}
        </p>
        <p>{entry.source}</p>
        {sources&&sources.scope===repository?.scope.id&&sources.values.map((source,i)=><div key={i}><p>{t("Bài học","Lesson")}: {source.lesson?.title??entry.lesson} · {source.lesson?.learnedOn}</p>{source.evidence&&<p>{t("Chữ nguồn được giữ lại","Original source text")}: <span lang="en">{source.evidence.literalText}</span></p>}</div>)}
        {entry.pronunciations.filter(p=>p.verified&&p.sourceUrl?.startsWith("https://")).map((p,i)=><p key={i}><a href={p.sourceUrl!} target="_blank" rel="noreferrer">{t("Nguồn phiên âm IPA","IPA source")}</a></p>)}
        <LearningNotes word={entry}/>
        <ParentGate href={`/library/words/${entry.id}/notes`}><Button variant="outline">{t("Viết ghi chú cho con", "Write a memory note")}</Button></ParentGate>
      </details>
    </article>
  );
}
