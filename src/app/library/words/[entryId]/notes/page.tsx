import { WordNotes } from "@/components/features/notes";
export default async function Page({params}:{params:Promise<{entryId:string}>}){const {entryId}=await params;return <WordNotes id={entryId}/>;}
