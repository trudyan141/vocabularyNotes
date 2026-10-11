import { Suspense } from "react";
import { Review } from "@/components/features/review";
import Loading from "@/app/loading";
export default async function Page({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  return (
    <Suspense fallback={<Loading />}>
      <Review draftId={draftId} />
    </Suspense>
  );
}
