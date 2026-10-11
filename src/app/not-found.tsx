import {MainNavigation} from '@/components/app/navigation';
import Image from 'next/image';
import {MissingPage} from '@/components/features/missing-page';
export default function NotFound(){return <div className="app-shell with-nav welcome-shell"><header className="app-header"><a className="brand" href="/today"><Image src="/illustrations/wordmark.svg" width={34} height={38} alt=""/><span>Words for Kids</span></a></header><MainNavigation/><div className="app-content"><main id="main" tabIndex={-1}><MissingPage/></main></div></div>;}
