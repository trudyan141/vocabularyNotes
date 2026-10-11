import { Suspense } from "react";
import { LessonPreview } from "@/components/features/review";
import Loading from "@/app/loading";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <LessonPreview />
    </Suspense>
  );
}
