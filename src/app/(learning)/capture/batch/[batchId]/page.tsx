import {CaptureBatch} from '@/components/features/capture-batch';
export default async function Page({params}:{params:Promise<{batchId:string}>}){const {batchId}=await params;return <CaptureBatch batchId={batchId}/>;}
