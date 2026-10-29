import {Suspense} from 'react';
import Loading from '@/app/loading';
import {Shadowing} from '@/components/features/shadowing';
export const metadata={title:'Shadowing · Nói theo Cáo'};
export default function Page(){return <Suspense fallback={<Loading/>}><Shadowing/></Suspense>;}
