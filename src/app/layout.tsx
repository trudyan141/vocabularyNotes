import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";
import { getServerEnv } from "@/server/env";
import { AppProvider } from "@/components/app/provider";
import {CloudBackground} from "@/components/app/cloud-background";
import {OfflineRegistration} from "@/components/app/offline";
import { AppShell } from "@/components/app/shell";
export const dynamic = "force-dynamic";

const nunito = localFont({
  src: "./fonts/nunito-variable.woff2",
  variable: "--font-nunito",
  display: "swap",
  weight: "200 1000",
});

export const metadata: Metadata = {
  title: "Words for Kids",
  appleWebApp:{capable:true,title:"Words for Kids",statusBarStyle:"default"},
  icons:{apple:"/icons/app-192.png"},
  description: "Học và ôn tiếng Anh từ bài học của con, cùng phụ huynh.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#fff8f8" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={nunito.variable}>
      <body>
        <AppProvider demo={getServerEnv().APP_DEMO_MODE}>
          <OfflineRegistration/><CloudBackground/><AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
