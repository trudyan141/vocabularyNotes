import {Suspense} from 'react';
import Loading from '@/app/loading';
import {Groups} from '@/components/features/groups';
export default function Page(){return <Suspense fallback={<Loading/>}><Groups/></Suspense>;}
