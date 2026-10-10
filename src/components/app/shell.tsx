"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, House, Layers, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useApp } from "./provider";
import { DatabaseBoundary } from "./database-boundary";
import { ParentGate } from "./parent-gate";
import type { ReactNode } from "react";
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t, demo, repository } = useApp();
  const showNav = ["/today", "/library", "/practice"].includes(pathname);
  const nav = [
    { href: "/today", label: t("Hôm nay", "Today"), icon: House },
    { href: "/library", label: t("Từ của con", "My words"), icon: BookOpen },
    { href: "/practice", label: t("Chơi & học", "Play & learn"), icon: Layers },
  ];
  return (
    <div className={cn("app-shell", showNav && "with-nav")}>
      <a className="skip-link" href="#main">
        {t("Đến nội dung chính", "Skip to main content")}
      </a>
      <header className="app-header">
        <Link
          prefetch={false}
          className="brand"
          href="/today"
          aria-label="Words for Kids"
        >
          <Image
            src="/illustrations/wordmark.svg"
            alt=""
            width={34}
            height={38}
          />
          <span>Words for Kids</span>
        </Link>
        <ParentGate href="/settings">
          <Button variant="outline">
            <ShieldCheck data-icon="inline-start" />
            <span>{t("Phụ huynh", "Parents")}</span>
          </Button>
        </ParentGate>
      </header>
      {showNav && (
        <nav
          className="main-nav"
          aria-label={t("Điều hướng chính", "Main navigation")}
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            >
              <item.icon aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
      <div className="app-content">
        <main id="main" tabIndex={-1}>
          {["/welcome", "/settings"].includes(pathname) ? (
            children
          ) : (
            <DatabaseBoundary progressive={showNav}>{children}</DatabaseBoundary>
          )}
        </main>
        <footer className="demo-note">
          {demo && (
            <Badge variant="secondary">{t("Dữ liệu demo", "Demo data")}</Badge>
          )}
          <p>
            {demo
              ? t(
                  "Bài mẫu lưu riêng trên máy. Nhập từ và tra từ điển dùng ngay; phân tích ảnh bằng Gemini trong phần phụ huynh.",
                  "Sample lessons stay in a separate local library. Add words and use the dictionary now; use Gemini in parent settings to analyse photos.",
                )
              : repository?.scope.kind === "account" ? t("Thư viện cloud có bản lưu trên máy. Kiểm trạng thái đồng bộ trong tài khoản phụ huynh trước khi xóa bộ nhớ trình duyệt.", "Your cloud library has a local cache. Check sync status in the parent account before clearing browser storage.") : t(
                  "Bài đang lưu riêng trên trình duyệt này. Vào Tài khoản phụ huynh để lưu thêm bản cloud; xóa bộ nhớ trình duyệt có thể làm mất bài trên máy.",
                  "Lessons are stored separately in this browser. Open Parent account to save a cloud copy; clearing browser storage can remove device lessons.",
                )}
          </p>
        </footer>
      </div>
    </div>
  );
}
