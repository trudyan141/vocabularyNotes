export const metadata={title:"Từ của con"};
import { Suspense } from "react";
import { Library } from "@/components/features/library";
import Loading from "@/app/loading";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Library />
    </Suspense>
  );
}
