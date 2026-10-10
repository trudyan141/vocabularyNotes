import { Suspense } from "react";
import { Welcome } from "@/components/features/today";
import Loading from "@/app/loading";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Welcome />
    </Suspense>
  );
}
