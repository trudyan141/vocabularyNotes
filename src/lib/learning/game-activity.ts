import {z} from 'zod';
const line=z.string().trim().min(1).max(200);
export const activitySchema=z.object({
 sourceHash:z.string().regex(/^[a-f0-9]{64}$/).optional(),version:z.literal(1),kind:z.enum(['grammar-cloze','grammar-repair','grammar-dialogue']),
 prompt:line,solution:line,translation:line,explanation:z.string().trim().min(1).max(1000),
 options:z.array(line).min(2).max(3),answer:line,
 context:z.string().trim().max(500).optional(),promptIpa:line.optional(),solutionIpa:line.optional(),
 slot:z.number().int().min(0).max(39).optional(),
}).strict().superRefine((a,ctx)=>{
 if(new Set(a.options.map(x=>x.toLowerCase())).size!==a.options.length||!a.options.includes(a.answer))ctx.addIssue({code:'custom',message:'Các lựa chọn phải khác nhau và có đáp án đúng.'});
 if(a.kind==='grammar-cloze'&&(a.prompt.split('___').length!==2||a.prompt.replace('___',a.answer)!==a.solution))ctx.addIssue({code:'custom',message:'Câu khuyết cần đúng một ___ và khớp câu hoàn chỉnh.'});
 if(a.kind==='grammar-repair'){
  const tokens=a.prompt.split(/\s+/);if(a.slot===undefined||a.slot>=tokens.length||tokens[a.slot]===a.answer||tokens.map((token,i)=>i===a.slot?a.answer:token).join(' ')!==a.solution)ctx.addIssue({code:'custom',message:'Chọn đúng một mảnh sai; câu sửa phải khớp.'});
 }
 if(a.kind==='grammar-dialogue'&&(!a.context?.trim()||a.solution!==a.answer))ctx.addIssue({code:'custom',message:'Cặp hỏi–đáp cần ngữ cảnh và lời đáp đúng.'});
});
export const activitiesSchema=z.array(activitySchema).max(3).superRefine((items,ctx)=>{if(new Set(items.map(a=>a.kind)).size!==items.length)ctx.addIssue({code:'custom',message:'Mỗi bài chỉ có một hoạt động mỗi loại.'});});
export type GameActivity=z.infer<typeof activitySchema>;
export const boardKeysSchema=z.array(z.string().min(1).max(200)).min(1).max(3);
export const gameStateSchema=z.object({chosen:z.array(z.number().int().min(0).max(39)).max(40),matched:z.array(z.number().int().min(0).max(2)).max(3),open:z.array(z.number().int().min(0).max(5)).max(2),wrong:z.array(z.number().int().min(0).max(2)).max(3),left:z.number().int().min(0).max(2).nullable(),mistakes:z.number().int().nonnegative().max(10000)}).strict();
export type GameState=z.infer<typeof gameStateSchema>;
export const emptyGameState=():GameState=>({chosen:[],matched:[],open:[],wrong:[],left:null,mistakes:0});
export const gameMoveSchema=z.object({kind:z.enum(['left','right','flip','close','pick','remove','reset','error']),index:z.number().int().min(0).max(39).optional()}).strict();
export type GameMove=z.infer<typeof gameMoveSchema>;
