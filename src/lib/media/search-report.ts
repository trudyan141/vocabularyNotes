import {z} from 'zod';
export const pictureSourceNames={noto:'Google Noto',twemoji:'Twemoji',fluent:'Microsoft Fluent',openmoji:'OpenMoji',commons:'Wikimedia Commons'} as const;
export const pictureSource=z.enum(['noto','twemoji','fluent','openmoji','commons']);
export const pictureAttempt=z.object({source:pictureSource,state:z.enum(['found','empty','error']),kind:z.enum(['catalog','network']),count:z.number().int().nonnegative(),code:z.enum(['no-match','filtered','http','timeout','network','invalid-response','provider-error','too-large','busy']).optional(),httpStatus:z.number().int().min(100).max(599).optional(),query:z.string().max(200).optional()}).strict();
export type PictureAttempt=z.infer<typeof pictureAttempt>;
export type PictureSource=z.infer<typeof pictureSource>;
export function pictureAttemptText(attempt:PictureAttempt){
 const name=pictureSourceNames[attempt.source];
 return `${name}: ${attempt.state==='found'?`tìm được ${attempt.count} hình`:attempt.state==='empty'?(attempt.code==='filtered'?'có kết quả nhưng chưa có hình đúng nghĩa/giấy phép phù hợp':'chưa có hình phù hợp'):attempt.code==='timeout'?'chờ quá lâu':attempt.code==='http'?`nguồn trả lỗi${attempt.httpStatus?` (${attempt.httpStatus})`:''}`:attempt.code==='provider-error'?'dịch vụ báo lỗi':attempt.code==='invalid-response'?'phản hồi không đọc được':attempt.code==='too-large'?'phản hồi quá lớn':attempt.code==='busy'?'đang bận':'chưa kết nối được'}${attempt.kind==='catalog'?' · thư viện hình có sẵn':''}`;
}
