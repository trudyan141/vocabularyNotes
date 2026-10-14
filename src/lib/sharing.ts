import {z} from 'zod';

export const codeAlphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function normalizeShareCode(value:string){return value.toUpperCase().replace(/[\s-]/g,'');}
export function validShareCode(value:string){const code=normalizeShareCode(value);return code.length===10&&[...code].every(letter=>codeAlphabet.includes(letter));}
export function displayShareCode(value:string){const code=normalizeShareCode(value);return `${code.slice(0,5)}-${code.slice(5)}`;}
export function shareEmails(value:string){return [...new Set(value.split(/[\s,;]+/).map(email=>email.trim().toLowerCase()).filter(Boolean))];}
export const shareContextSchema=z.object({id:z.uuid(),kind:z.enum(['email','device']),libraryId:z.uuid(),ownerId:z.uuid(),name:z.string().max(200),expiresAt:z.iso.datetime({offset:true}).nullable(),serverTime:z.iso.datetime({offset:true})}).strict();
export type ShareContext=z.infer<typeof shareContextSchema>;
export type ShareSelection=Pick<ShareContext,'kind'|'id'>;
export const sharedScopeId=(context:ShareContext)=>`shared:${context.id}:${context.libraryId}`;
export const shareNotificationSchema=z.object({id:z.uuid(),kind:z.enum(['library-invite','device-invite']),sourceId:z.uuid(),generation:z.number().int().positive(),name:z.string().max(200),libraryId:z.uuid(),status:z.enum(['pending','active','revoked','ready','used','expired','cancelled']),expiresAt:z.iso.datetime({offset:true}).nullable(),createdAt:z.iso.datetime({offset:true}),code:z.string().optional(),token:z.string().optional()}).strict();
export type ShareNotification=z.infer<typeof shareNotificationSchema>;
const selection={kind:z.enum(['email','device']),id:z.uuid().optional()};
const proof={code:z.string().max(30).optional(),token:z.string().regex(/^[a-f0-9]{64}$/).optional(),notificationId:z.uuid().optional()};
const emails=z.array(z.email().max(254)).max(20);
export const shareCommandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('overview'),libraryId:z.uuid()}).strict(),
 z.object({action:z.literal('invite'),libraryId:z.uuid(),emails:emails.min(1)}).strict(),
 z.object({action:z.literal('pair'),libraryId:z.uuid(),emails:emails.optional()}).strict(),
 z.object({action:z.enum(['revoke','cancel']),libraryId:z.uuid(),id:z.uuid()}).strict(),
 z.object({action:z.literal('device-revoke'),id:z.uuid()}).strict(),
 z.object({action:z.literal('accept'),id:z.uuid(),generation:z.number().int().positive()}).strict(),
 z.object({action:z.enum(['inbox','list'])}).strict(),
 z.object({action:z.literal('detail'),id:z.uuid()}).strict(),
 z.object({action:z.enum(['context','watermark','snapshot']),...selection}).strict(),
 z.object({action:z.literal('end'),kind:z.literal('device'),id:z.uuid().optional()}).strict(),
 z.object({action:z.literal('page'),...selection,snapshotId:z.uuid(),page:z.number().int().nonnegative()}).strict(),
 z.object({action:z.literal('preview'),...proof}).strict(),
 z.object({action:z.literal('claim'),...proof,label:z.string().trim().min(1).max(60)}).strict(),
 z.object({action:z.literal('progress'),...selection,operationId:z.uuid(),items:z.array(z.object({entity:z.enum(['practiceSessions','reviewEvents','gameAttempts']),baseVersion:z.number().int().nonnegative(),row:z.unknown()}).strict()).min(1).max(100)}).strict(),
]);
export type ShareCommand=z.infer<typeof shareCommandSchema>;
export class SharingError extends Error {constructor(public readonly code:string,public readonly status=503){super(code);}}
export function sharingMessage(error:unknown,t:(vi:string,en:string)=>string){
 const code=error instanceof SharingError?error.code:error instanceof Error?error.message:'';
 const messages:Record<string,[string,string]>={
  'preview-required':['Bấm kiểm tra mã trước khi kết nối.','Check the code before connecting.'],
  'invalid-emails':['Nhập từ 1 đến 20 email hợp lệ, cách nhau bằng dấu phẩy hoặc xuống dòng.','Enter 1–20 valid emails, separated by commas or new lines.'],
  'device-name-required':['Đặt tên cho máy trước khi kết nối.','Name this device before connecting.'],
  'signed-out':['Đăng nhập Google của bạn để tiếp tục.','Sign in with your Google account to continue.'],
  'owner-required':['Bạn chỉ có quyền học kho này. Chọn kho của bạn để chia sẻ.','This library is read-only. Choose your own library to share.'],
  'recipient-unavailable':['Email này chưa đăng ký app. Người nhận cần đăng nhập Google trong app trước.','This email has not registered. The recipient needs to sign in to the app first.'],
  'pairing-used':['Mã này đã kết nối một máy. Xin mã mới để dùng máy khác.','This code has already connected a device. Ask for another code.'],
  'pairing-expired':['Mã chưa được nhận đã hết hạn. Xin chủ thư viện tạo mã mới.','The unused code has expired. Ask the owner for a new code.'],
  'pairing-unavailable':['Không tìm thấy mã còn hiệu lực. Kiểm mã hoặc xin mã mới.','This code is unavailable. Check it or ask for a new code.'],
  'invalid-code':['Nhập đủ 10 chữ và số trong mã kết nối.','Enter all 10 letters and numbers in the connection code.'],
  'access-revoked':['Chủ thư viện đã ngừng chia sẻ. Kết quả đã đồng bộ vẫn được giữ.','The owner ended access. Synced results are kept.'],
  'session-expired':['Phiên học 3 ngày đã hết hạn. Nhập mã mới để học tiếp.','Your three-day session has expired. Enter a new code to continue.'],
  'progress-conflict':['Lượt này có kết quả mới trên máy khác. Tải lại hoặc bắt đầu lượt khác; kết quả chưa gửi vẫn được giữ.','This round changed on another device. Reload or start another round; pending results are kept.'],
  'content-changed':['Bài đã đổi. Kết quả chưa gửi vẫn được giữ; mở lại để xem bài mới.','The lesson changed. Pending results are kept; reopen the updated lesson.'],
  'rate-limited':['Đang có nhiều yêu cầu. Chờ một chút rồi thử lại.','There are too many requests. Wait a little and try again.'],
  'device-limit':['Kho đã có 20 máy còn kết nối. Ngắt một máy trước khi thêm.','This library has 20 connected devices. Disconnect one before adding another.'],
  'feature-not-ready':['Chia sẻ chưa được cấu hình trên cloud. Kho hiện tại vẫn được giữ.','Cloud sharing is not configured yet. Your library is kept.'],
  'read-only':['Kho này chỉ cho học; không sửa hoặc xóa bài gốc.','This library is for learning only; its content cannot be edited or deleted.'],
  'snapshot-expired':['Bản tải đã hết hạn. Bấm mở lại để lấy bản mới.','The download expired. Reopen it to fetch a new copy.'],
 };
 return t(...(messages[code]??['Chưa hoàn tất được. Kiểm mạng rồi thử lại; dữ liệu đã lưu vẫn được giữ.','Could not complete this. Check the connection and retry; saved data is kept.']));
}
/** Re-scope a cache/learning DTO, never its content identity or source record IDs. */
export function reScope<T>(value:T,scopeId:string):T{
 if(Array.isArray(value))return value.map(item=>reScope(item,scopeId)) as T;
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,key==='scopeId'?scopeId:reScope(item,scopeId)])) as T;
 return value;
}
