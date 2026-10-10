import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="page-flow" role="status" aria-label="Đang tải / Loading">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-56 w-full" />
      <span className="sr-only">Đang tải / Loading</span>
    </div>
  );
}
