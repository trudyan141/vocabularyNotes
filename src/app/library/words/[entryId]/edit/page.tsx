import {pathId} from '@/lib/path-id';
import { WordEditor } from "@/components/features/word-editor";
export default async function Page({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = await params;
  return <WordEditor id={pathId(entryId)} />;
}
