import {Suspense} from 'react';
import {Speaking} from '@/components/features/speaking';
import Loading from '@/app/loading';
export const metadata={title:'Nói cùng Cáo'};
export default function Page(){return <Suspense fallback={<Loading/>}><Speaking/></Suspense>;}
