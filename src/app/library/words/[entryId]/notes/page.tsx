import {pathId} from '@/lib/path-id';
import { WordNotes } from "@/components/features/notes";
export default async function Page({params}:{params:Promise<{entryId:string}>}){const {entryId}=await params;return <WordNotes id={pathId(entryId)}/>;}
