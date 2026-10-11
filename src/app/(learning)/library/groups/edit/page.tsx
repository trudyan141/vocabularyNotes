import {Suspense} from 'react';
import Loading from '@/app/loading';
import {GroupEditor} from '@/components/features/group-editor';
export default function Page(){return <Suspense fallback={<Loading/>}><GroupEditor/></Suspense>;}
