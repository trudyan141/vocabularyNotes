import { Suspense } from "react";
import { PracticePreview } from "@/components/features/practice";
import Loading from "@/app/loading";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PracticePreview />
    </Suspense>
  );
}
