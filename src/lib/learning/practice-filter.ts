import {z} from 'zod';
export const practiceFilterSchema=z.object({
 set:z.string().min(1).max(200).optional(),word:z.string().min(1).max(200).optional(),lesson:z.string().min(1).max(200).optional(),deck:z.string().min(1).max(200).optional(),
 due:z.boolean().optional(),weak:z.boolean().optional(),direction:z.enum(['en-vi','vi-en']).optional(),
}).strict().refine(filter=>!filter.set||!!filter.deck,{message:'set-needs-group'});
export type PracticeFilter=z.infer<typeof practiceFilterSchema>;
export function practiceFilter(params:Pick<URLSearchParams,'get'>):PracticeFilter{
 return {...(params.get('set')?{set:params.get('set')!}:{}),...(params.get('word')?{word:params.get('word')!}:{}),...(params.get('lesson')?{lesson:params.get('lesson')!}:{}),...(params.get('deck')?{deck:params.get('deck')!}:{}),...(params.get('review')==='due'?{due:true}:{}),...(params.get('weak')==='1'?{weak:true}:{}),...(params.get('direction')==='vi-en'?{direction:'vi-en' as const}:{})};
}
export function practiceHref(filter:PracticeFilter,session?:string,path='/practice'){
 const params=new URLSearchParams();for(const key of ['word','lesson','deck','set'] as const)if(filter[key])params.set(key,filter[key]!);
 if(filter.due)params.set('review','due');if(filter.weak)params.set('weak','1');if(filter.direction==='vi-en')params.set('direction','vi-en');
 if(session)params.set('session',session);return `${path}${params.size?`?${params}`:''}`;
}
