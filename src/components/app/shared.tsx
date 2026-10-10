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
import type { ReactNode } from "react";
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
    <Button asChild variant="ghost">
      <Link prefetch={false} href={href}>
        <ArrowLeft data-icon="inline-start" />
        {label ?? t("Quay lại", "Go back")}
      </Link>
    </Button>
  );
}
export function Artwork({
  art,
  word,
  size = 96,
}: {
  art: string | null;
  word: string;
  size?: number;
}) {
  const {repository}=useApp();
  const custom=useLiveQuery(async()=>repository&&art?.startsWith('media-')?{scope:repository.scope.id,asset:await approvedMedia(repository,art,word)}:null,[repository,art,word]);
  if(art?.startsWith('media-'))return custom?.scope===repository?.scope.id&&custom?.asset?<figure><Image unoptimized className="word-art" src={`data:image/jpeg;base64,${custom.asset.base64}`} alt="" width={size} height={size}/><figcaption className="media-credit"><a href={custom.asset.candidate.sourceUrl} target="_blank" rel="noreferrer">{custom.asset.candidate.credit}</a></figcaption></figure>:<div className="missing-art"><BookOpen aria-hidden="true"/><span>{word}</span></div>;
  // Repository fixtures only, never an arbitrary model/provider URL.
  const credit=artCredit(art);
  if(credit)return <figure><Image className="word-art" src={`/illustrations/openmoji/${credit.id.slice(9)}.svg`} alt="" width={size} height={size}/><figcaption className="media-credit"><a href="https://openmoji.org/" target="_blank" rel="noreferrer">OpenMoji · {credit.author}</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></figcaption></figure>;
  return safeArt(art) ? (
    <Image
      className="word-art"
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
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpen aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  );
}
