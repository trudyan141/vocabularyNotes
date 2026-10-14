import type {LocalRepository} from './repository';
import {practiceFilterSchema,type PracticeFilter} from '@/lib/learning/practice-filter';
const key=(repository:LocalRepository)=>`practice-selection:v1:${repository.scope.id}`;
export async function readPracticeSelection(repository:LocalRepository):Promise<PracticeFilter>{
 const row=await repository.db.metadata.get(key(repository));
 if(!row)return {};
 try{const parsed=practiceFilterSchema.safeParse(JSON.parse(row.value));return parsed.success?parsed.data:{};}catch{return {};}
}
export async function savePracticeSelection(repository:LocalRepository,filter:PracticeFilter){
 await repository.db.metadata.put({key:key(repository),value:JSON.stringify(practiceFilterSchema.parse(filter))});
}
