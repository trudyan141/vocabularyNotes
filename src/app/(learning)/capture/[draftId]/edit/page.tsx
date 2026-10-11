import { CaptureEditor } from "@/components/features/capture";
export default async function Page({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  return <CaptureEditor draftId={draftId} />;
}
