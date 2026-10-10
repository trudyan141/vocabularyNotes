import { Suspense } from "react";
import { Settings } from "@/components/features/settings";
import Loading from "@/app/loading";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Settings />
    </Suspense>
  );
}
