"use client";

import Image from "next/image";
import Link from "next/link";
import { House } from "lucide-react";
import { useApp } from "@/components/app/provider";
import { Button } from "@/components/ui/button";

export function MissingPage() {
  const { t } = useApp();
  return (
    <section className="not-found-world" aria-labelledby="missing-page-title">
      <div className="not-found-scene">
        <p className="not-found-code" aria-hidden="true">404</p>
        <Image
          className="not-found-fox"
          src="/illustrations/fox-lost-map.webp"
          width={768}
          height={846}
          sizes="(max-width: 700px) 280px, 380px"
          priority
          alt={t("Cáo đang xem bản đồ để tìm đường.", "Fox is looking at a map to find the way.")}
        />
      </div>
      <div className="not-found-copy">
        <h1 id="missing-page-title">
          {t("Úi, Cáo đi lạc rồi!", "Oops, Fox took a wrong turn!")}
          <span className="sr-only"> {t("Không tìm thấy trang (404).", "Page not found (404).")}</span>
        </h1>
        <p>{t("Trang này chưa tìm thấy. Cùng Cáo về trang đầu nhé.", "We couldn’t find this page. Let’s head home with Fox.")}</p>
        <Button asChild size="lg">
          <Link prefetch={false} href="/"><House data-icon="inline-start" />{t("Về trang đầu", "Go home")}</Link>
        </Button>
      </div>
    </section>
  );
}
