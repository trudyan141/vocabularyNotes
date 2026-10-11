import {brandMetadata,siteUrl,siteDescription} from "@/lib/site-metadata";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";
const nunito = localFont({
  src: "./fonts/nunito-variable.woff2",
  variable: "--font-nunito",
  display: "swap",
  weight: "200 1000",
});

export const metadata: Metadata = brandMetadata;

export const viewport: Viewport = { themeColor: "#fff8f8" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={nunito.variable}>
      <body style={{backgroundColor:"#fff8f8",color:"#38213d"}}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'Words for Kids',url:siteUrl,description:siteDescription,inLanguage:'vi'}).replace(/</g,'\\u003c')}}/>
        {children}
      </body>
    </html>
  );
}
