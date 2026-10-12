"use client";

import {MainNavigation} from "@/components/app/navigation";
import { Button } from "@/components/ui/button";

import {usePublicLocale} from '@/lib/public-locale';
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t=usePublicLocale();
  return (
    <div className="app-shell with-nav"><MainNavigation/><main className="app-content error-page">
      <h1>{t("Chưa mở được trang","Could not open this page")}</h1>
      <p>{t("Thử mở lại để tiếp tục học nhé.","Try again to continue learning.")}</p>
      <Button size="lg" onClick={reset}>
        {t("Thử lại","Try again")}
      </Button>
    </main></div>
  );
}
