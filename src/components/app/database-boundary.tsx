"use client";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "./provider";
export function DatabaseBoundary({ children,progressive=false }: { children: ReactNode;progressive?:boolean }) {
  const { t, databaseStatus, retryDatabase } = useApp();
  if (databaseStatus === "loading"&&!progressive) return <DatabaseLoading />;
  if (databaseStatus === "error")
    return (
      <Alert variant="destructive">
        <AlertTitle>
          {t(
            "Chưa mở được thư viện trên máy",
            "On-device library could not open",
          )}
        </AlertTitle>
        <AlertDescription>
          <p>
            {t(
              "Kiểm tra quyền lưu trữ hoặc đóng tab cũ đang mở app rồi thử lại. Dữ liệu cũ không bị xóa để sửa lỗi.",
              "Check browser storage permissions or close older app tabs, then retry. Existing data is not deleted to fix errors.",
            )}
          </p>
          <Button variant="outline" onClick={retryDatabase}>
            {t("Thử mở lại thư viện", "Try opening the library again")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  return children;
}
export function DatabaseLoading() {
  const { t } = useApp();
  return (
    <div role="status" className="page-flow">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-56 w-full" />
      <p>
        {t("Đang mở thư viện trên máy…", "Opening your on-device library…")}
      </p>
    </div>
  );
}
export function ReadFailure() {
  const { t, retryDatabase } = useApp();
  return (
    <Alert variant="destructive">
      <AlertTitle>
        {t("Chưa đọc được dữ liệu", "Data could not be read")}
      </AlertTitle>
      <AlertDescription>
        <Button onClick={retryDatabase}>
          {t("Thử mở lại thư viện", "Try opening the library again")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
