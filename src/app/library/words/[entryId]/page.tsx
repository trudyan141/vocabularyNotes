import {pathId} from '@/lib/path-id';
import { WordDetail } from "@/components/features/word-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = await params;
  return <WordDetail id={pathId(entryId)} />;
}
