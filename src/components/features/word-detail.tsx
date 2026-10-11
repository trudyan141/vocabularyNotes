"use client";
import {SentencePronunciation} from "@/components/app/sentence-pronunciation";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {DeleteControl} from "./delete-control";
import {Pencil,Play,ArrowLeft} from "lucide-react";
import {useLiveQuery} from "dexie-react-hooks";
import {useApp} from "@/components/app/provider";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Alert,AlertDescription,AlertTitle} from "@/components/ui/alert";
import {Artwork,Back,EmptyState} from "@/components/app/shared";
import {AudioControl} from "@/components/app/audio-control";
import {ActionLink} from "@/components/app/action-link";
import {DatabaseLoading,ReadFailure} from "@/components/app/database-boundary";
import {useLibraryWord} from "@/data/local/hooks";
import {WordLearningContent} from "./learning-content";
export function WordDetail({ id }: { id: string }) {
  const { t,repository } = useApp();
  const router=useRouter();
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
              <ArrowLeft data-icon="inline-start" aria-hidden="true"/>{t("Về thư viện", "Back to library")}
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
            "Từ này cần kiểm tra lại",
            "This word needs review",
          )}
          description={t(
            "Bản nội dung mới chưa được duyệt để bé học.",
            "The new content has not been approved for learning.",
          )}
        >
          <ActionLink href={`/library/words/${id}/edit`}>
            <Button>{t("Kiểm tra nội dung", "Review content")}</Button>
          </ActionLink>
        </EmptyState>
      </div>
    );
  return (
    <article className="reading-page page-flow">
      <div className="section-heading">
        <Back href="/library" label={t("Từ của con", "My words")} />
        <ActionLink href={`/library/words/${entry.id}/edit`}>
          <Button variant="ghost">
            <Pencil data-icon="inline-start" />
            {t("Sửa", "Edit")}
          </Button>
        </ActionLink>
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
        <SentencePronunciation text={entry.example} pronunciations={entry.examplePronunciations}/>
        <p className="muted">{entry.exampleVi}</p>
        {entry.examplePronunciations.map((p,i)=>p.readingHintVi?<p key={i} className="reading-hint">{t("Cách đọc gần đúng: ","Reading hint: ")}{p.readingHintVi}</p>:null)}
      </section>
      <WordLearningContent word={entry}/>
      {!entry.art && (
        <Alert>
          <AlertTitle>
            {t("Từ này chưa có hình", "This word has no picture")}
          </AlertTitle>
          <AlertDescription>
            {t(
              "Con vẫn có thể nghe và đọc ví dụ. Bạn sẽ chọn hình đúng nghĩa sau.",
              "You can still listen and read the example. You can choose a picture later.",
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

      <Button asChild variant="secondary"><Link href={`/speaking?word=${encodeURIComponent(entry.id)}`}>{t("Tập phát âm từ này","Practise saying this word")}</Link></Button><DeleteControl target={{table:"senses",id:entry.id,version:Number(entry.revision.split(":")[1]),revision:entry.revision}} label={t("Xóa từ này","Delete this word")} description={t(`Xóa “${entry.word}” với nghĩa này khỏi thư viện và các buổi học? Các nghĩa khác vẫn giữ.`,`Delete “${entry.word}” in this sense from your library and practice? Other senses are kept.`)} onDeleted={()=>router.push("/library")}/>
    </article>
  );
}
