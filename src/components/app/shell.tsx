"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {MainNavigation} from "./navigation";
import dynamic from 'next/dynamic';
const GuestCopyPrompt=dynamic(()=>import('./guest-copy-prompt').then(module=>module.GuestCopyPrompt));
import { ProfileLink } from "@/components/features/profile";
import { cn } from "@/lib/utils";
import { useApp } from "./provider";
import { DatabaseBoundary } from "./database-boundary";
import { PullToRefresh } from "./pull-to-refresh";
import type { ReactNode } from "react";
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useApp();
  const showNav = true;
  return (
    <div className={cn("app-shell", showNav && "with-nav", pathname === "/welcome" && "welcome-shell")}>
      <PullToRefresh />
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
        <ProfileLink />
      </header>
      <MainNavigation labels={[t('Hôm nay','Today'),t('Từ của con','My words'),t('Chơi & học','Play & learn'),t('Cài đặt','Settings')]} label={t('Điều hướng chính','Main navigation')}/>
      <div className="app-content">
        <main id="main" tabIndex={-1}><GuestCopyPrompt/>
          {["/welcome", "/settings"].includes(pathname) ? (
            children
          ) : (
            <DatabaseBoundary progressive={showNav}>{children}</DatabaseBoundary>
          )}
        </main>
      </div>
    </div>
  );
}
