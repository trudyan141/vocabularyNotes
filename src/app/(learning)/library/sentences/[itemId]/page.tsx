import {pathId} from '@/lib/path-id';
import {LegacySentenceLink} from '@/components/features/legacy-sentence-link';
export default async function Page({params}:{params:Promise<{itemId:string}>}) {const {itemId}=await params;return <LegacySentenceLink id={pathId(itemId)}/>;}
