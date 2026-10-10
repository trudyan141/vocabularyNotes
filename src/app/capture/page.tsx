import { Suspense } from "react";
import { Capture } from "@/components/features/capture";
import Loading from "@/app/loading";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Capture />
    </Suspense>
  );
}
