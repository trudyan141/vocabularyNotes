import {MainNavigation} from '@/components/app/navigation';
import {publicWelcomeMetadata} from "@/lib/site-metadata";
export const metadata=publicWelcomeMetadata();
import Image from "next/image";
import { Suspense } from "react";
import { Welcome } from "@/components/features/welcome";
import Loading from "@/app/loading";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="app-shell with-nav welcome-shell"><a className="skip-link" href="#main">Đến nội dung chính</a><header className="app-header"><a className="brand" href="/today"><Image src="/illustrations/wordmark.svg" width="34" height="38" alt=""/><span>Words for Kids</span></a><a className="public-profile" href="/profile">Hồ sơ</a></header><MainNavigation/><div className="app-content"><main id="main" tabIndex={-1}><Welcome /></main></div></div>
    </Suspense>
  );
}
