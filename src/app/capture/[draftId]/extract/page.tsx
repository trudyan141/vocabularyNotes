import { Extract } from '@/components/features/extract';
export default async function Page({params}:{params:Promise<{draftId:string}>}){const {draftId}=await params;return <Extract draftId={draftId}/>;}
