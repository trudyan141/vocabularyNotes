import { Suspense } from "react";
import { Today } from "@/components/features/today";
import Loading from "@/app/loading";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Today />
    </Suspense>
  );
}
