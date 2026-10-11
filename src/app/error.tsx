"use client";

import {MainNavigation} from "@/components/app/navigation";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="app-shell with-nav"><MainNavigation/><main className="app-content error-page">
      <h1>Chưa mở được trang</h1>
      <p>Thử mở lại để tiếp tục học nhé.</p>
      <Button size="lg" onClick={reset}>
        Thử lại
      </Button>
    </main></div>
  );
}
