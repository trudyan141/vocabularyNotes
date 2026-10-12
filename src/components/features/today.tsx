"use client";
import Link from "next/link";
import {FoxLoading} from "@/components/app/fox-loading";
import Image from "next/image";
import { Camera, ArrowRight, Play } from "lucide-react";
import { FeatureAction } from "@/components/app/feature-action";
import { Button } from "@/components/ui/button";
import {PracticeRepository} from "@/data/local/practice";
import {lessonTitle,learningDate} from "@/lib/learning/lesson-presentation";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/components/app/provider";
import { ActionLink } from "@/components/app/action-link";
import { Artwork } from "@/components/app/shared";

export function Today() {
  const { t, entries, repository,databaseStatus } = useApp();
  const lessons=useLiveQuery(async()=>{if(!repository)return null;const rows=await repository.db.lessons.where("[scopeId+learnedOn]").between([repository.scope.id,""],[repository.scope.id,"\uffff"]).reverse().toArray();const values=[];for(const lesson of rows.filter(l=>!l.deletedAt).sort((a,b)=>b.learnedOn.localeCompare(a.learnedOn)||b.updatedAt.localeCompare(a.updatedAt))){const result=await repository.search("",{lesson:lesson.id,approvedOnly:true,limit:1});if(result.total){values.push({lesson,total:result.total,art:result.words[0]?.art??null,word:result.words[0]?.word??lesson.title});break;}}return {scope:repository.scope.id,values};},[repository]);
  const due=useLiveQuery(async()=>{if(!repository)return null;try{return {scope:repository.scope.id,count:(await new PracticeRepository(repository).dueIds()).length,error:false};}catch{return {scope:repository.scope.id,count:0,error:true};}},[repository]);
  const dueCount=due&&due.scope===repository?.scope.id?due.count:0;
  if(databaseStatus==='loading')return <FoxLoading label={t('Đang tải…','Loading…')}/>;
  const hasLessons=entries.length>0;
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
                  "Thêm bài mới để cùng học nhé.",
                  "Add a lesson so you can learn together.",
                )}
          </p>
          {hasLessons ? (
            <Button asChild size="lg" variant="default" disabled={databaseStatus!=="ready"}>
              <Link prefetch={false} href={dueCount>0?"/practice?review=due":"/practice"}>
                <Play data-icon="inline-start" />
                {dueCount>0?t(`Ôn ${Math.min(10,dueCount)} từ hôm nay`,`Review ${Math.min(10,dueCount)} words today`):t("Chơi 5 phút", "Play for 5 minutes")}
              </Link>
            </Button>
          ) : (
            <ActionLink href="/capture">
              <Button size="lg" disabled={databaseStatus!=="ready"}>
                <Camera data-icon="inline-start" />
                {t("Thêm bài mới", "Add a lesson")}
              </Button>
            </ActionLink>
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
      <section className="today-section page-flow" aria-labelledby="today-review"><h2 id="today-review">{t("Ôn bài","Review")}</h2><div className="today-section-actions">
        <ActionLink href="/practice?review=due"><Button variant="feature" aria-label={t("Ôn bài hôm nay","Today's review")}><FeatureAction image="/illustrations/notebook.svg" title={t("Ôn bài hôm nay","Today's review")} description={dueCount?t(`${dueCount} từ đến hạn · tất cả nhóm`,`${dueCount} due words · all groups`):t("Hôm nay chưa có từ đến hạn","No words due today")}/></Button></ActionLink>
        <ActionLink href="/practice/groups"><Button variant="feature"><FeatureAction image="/illustrations/bag.svg" title={t("Ôn bài theo nhóm","Review by group")} description={t("Chọn nhóm con muốn ôn","Choose a group to review")}/></Button></ActionLink>
      </div>{due&&due.scope===repository?.scope.id&&due.error&&<p role="alert">{t("Chưa đọc được lịch ôn. Thử tải lại nhé.","Could not read review dates. Please reload.")}</p>}</section>
      <section className="today-section page-flow" aria-labelledby="today-add"><h2 id="today-add">{t("Thêm từ","Add words")}</h2><div className="today-section-actions">
      <ActionLink href="/add"><Button variant="feature"><FeatureAction image="/illustrations/pencil.svg" title={t("Gõ từ mới", "Type a new word")} description={t("Gõ từ, chọn nghĩa rồi lưu","Type a word, choose its meaning and save")}/></Button></ActionLink>
      <ActionLink href="/capture"><Button variant="feature"><FeatureAction image="/illustrations/book.svg" title={t("Thêm bài từ ảnh", "Add a photo lesson")} description={t("Chọn ảnh bài học để thêm từ và ngữ pháp", "Choose a lesson photo to add words and grammar")}/></Button></ActionLink>
      </div></section>
      {hasLessons && (
        <section className="lesson-section">
          <div className="section-heading">
            <h2>{t("Bài gần nhất", "Latest lesson")}</h2>
          </div>
          <Button asChild variant="link"><Link href="/library/lessons">{t("Tất cả bài theo ngày","All word sets by date")}</Link></Button>
          <div className="lesson-grid">
            {lessons&&lessons.scope===repository?.scope.id&&lessons.values.map(({lesson,total,art,word},i)=><article className="recent-lesson" key={lesson.id}><Link prefetch={false} className={`lesson-tile ${i%2?"lilac":"mint"}`} href={`/library?lesson=${encodeURIComponent(lesson.id)}`}><Artwork art={art} word={word} size={88}/><div><h3>{lesson.id==="food"?t("Trái cây & đồ ăn","Fruit & food"):lesson.id==="school"?t("Thế giới quanh con","Your world"):lessonTitle(lesson,t)}</h3><p>{learningDate(lesson.learnedOn,t)} · {total} {lesson.sourceType==="demo"?t("từ mẫu","sample words"):t("từ","words")}</p></div><ArrowRight aria-hidden="true"/></Link></article>)}
          </div>
        </section>
      )}

    </div>
  );
}
