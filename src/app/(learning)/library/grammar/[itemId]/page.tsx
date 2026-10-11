import {pathId} from '@/lib/path-id';
import {LearningDetail} from '@/components/features/content-library';
export default async function Page({params}:{params:Promise<{itemId:string}>}) {const {itemId}=await params;return <LearningDetail id={pathId(itemId)} mode="grammar"/>;}
