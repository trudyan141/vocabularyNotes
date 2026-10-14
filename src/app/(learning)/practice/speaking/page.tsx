import {Suspense} from 'react';
import Loading from '@/app/loading';
import {Speaking} from '@/components/features/speaking';
export const metadata={title:'Nói cùng Cáo'};
export default function Page(){return <Suspense fallback={<Loading/>}><Speaking/></Suspense>;}
