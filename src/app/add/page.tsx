import { Suspense } from "react";
import { AddWord } from "@/components/features/add-word";
import Loading from "@/app/loading";
export default function Page(){return <Suspense fallback={<Loading/>}><AddWord/></Suspense>;}
