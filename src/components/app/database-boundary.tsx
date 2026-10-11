"use client";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {FoxLoading} from "./fox-loading";
import { useApp } from "./provider";
export function DatabaseBoundary({ children,progressive=false }: { children: ReactNode;progressive?:boolean }) {
  const { t, databaseStatus, retryDatabase } = useApp();
  if (databaseStatus === "loading"&&!progressive) return <DatabaseLoading />;
  if (databaseStatus === "error")
    return (
      <Alert variant="destructive">
        <AlertTitle>
          {t(
            "Chưa mở được thư viện",
            "Library could not open",
          )}
        </AlertTitle>
        <AlertDescription>
          <p>
            {t(
              "Bấm mở lại để thử nhé. Bài đã lưu sẽ được giữ.",
              "Try opening it again. Your saved lessons are kept.",
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
  return <FoxLoading label={t('Đang tải…','Loading…')}/>;
}
export function ReadFailure() {
  const { t, retryDatabase } = useApp();
  return (
    <Alert variant="destructive">
      <AlertTitle>
        {t("Chưa mở được bài học", "Lessons could not open")}
      </AlertTitle>
      <AlertDescription>
        <Button onClick={retryDatabase}>
          {t("Thử mở lại thư viện", "Try opening the library again")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
