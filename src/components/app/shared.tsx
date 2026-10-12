"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useApp } from "./provider";
import {useState,type ReactNode} from "react";
import {useLiveQuery} from "dexie-react-hooks";
import {approvedMedia} from "@/data/local/media";
import {safeArt} from "@/lib/media/catalog";
import {artCredit} from "@/lib/media/dictionary-art";
export function Back({
  href = "/today",
  label,
}: {
  href?: string;
  label?: string;
}) {
  const { t } = useApp();
  return (
    <Button asChild variant="ghost" className="back-link">
      <Link prefetch={false} href={href}>
        <ArrowLeft data-icon="inline-start" aria-hidden="true" />
        {label ?? t("Quay lại", "Go back")}
      </Link>
    </Button>
  );
}
export function Artwork({
  art,
  word,
  size = 96,
  showCredit = false,
  onUnavailable,
}: {
  art: string | null;
  word: string;
  size?: number;
  showCredit?: boolean;
  onUnavailable?: (art:string)=>void;
}) {
  const {repository,t}=useApp();
  const [failed,setFailed]=useState<string|null>(null);
  const custom=useLiveQuery(async()=>repository&&art?.startsWith('media-')?{scope:repository.scope.id,asset:await approvedMedia(repository,art,word)}:null,[repository,art,word]);
  function unavailable(){if(art){setFailed(art);onUnavailable?.(art);}}
  function credited(picture:ReactNode,source:string,label:string,license?:string,licenseUrl?:string){return showCredit?<figure className="credited-art">{picture}<figcaption><details className="media-credit"><summary>{t('Nguồn hình','Image source')}</summary>{source?<a href={source} target="_blank" rel="noreferrer">{label}</a>:<span>{label}</span>}{licenseUrl&&<> · <a href={licenseUrl} target="_blank" rel="noreferrer">{license}</a></>}</details></figcaption></figure>:picture;}
  if(art?.startsWith('media-'))return custom?.scope===repository?.scope.id&&custom?.asset?credited(<Image unoptimized className="word-art" onError={unavailable} src={`data:image/jpeg;base64,${custom.asset.base64}`} alt="" width={size} height={size}/>,custom.asset.candidate.sourceUrl,custom.asset.candidate.credit):<div className="missing-art"><BookOpen aria-hidden="true"/><span>{word}</span></div>;
  const credit=artCredit(art);
  if(art&&failed===art)return <div className="missing-art"><BookOpen aria-hidden="true"/><span>{word}</span><small>{t("Chưa tải được hình","Image unavailable")}</small></div>;
  if(credit)return credited(<Image unoptimized={art?.startsWith("online-openmoji-")} onError={unavailable} className="word-art" src={art?.startsWith('online-openmoji-')?`/illustrations/online/${art.slice(16)}`:art?.startsWith('openmoji-')?`/illustrations/openmoji/${credit.id.slice(9)}.svg`:`/illustrations/${art}.svg`} alt="" width={size} height={size}/>,credit.sourceUrl,`${credit.id.includes('openmoji-')?'OpenMoji · ':''}${credit.author}`,credit.license,credit.licenseUrl);
  return safeArt(art) ? (
    <Image
      className="word-art"
      onError={unavailable}
      src={`/illustrations/${art}.svg`}
      alt=""
      width={size}
      height={size}
    />
  ) : (
    <div className="missing-art" aria-label={`No illustration: ${word}`}>
      <BookOpen aria-hidden="true" />
      <span>{word}</span>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <Empty className="illustrated-empty">
      <EmptyHeader>
        <EmptyMedia className="empty-fox"><Image src="/illustrations/fox.svg" alt="" width={136} height={136}/></EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  );
}
