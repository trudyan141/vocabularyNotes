"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="error-page">
      <h1>Chưa mở được trang</h1>
      <p>Thử mở lại để tiếp tục. Bản thử này chưa lưu bài học.</p>
      <Button size="lg" onClick={reset}>
        Thử lại
      </Button>
    </div>
  );
}
