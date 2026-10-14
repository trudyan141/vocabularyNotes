export type AccountProfile={id:string;email:string|null;name:string|null;avatarUrl:string|null};
export type CloudOverview={state:'ready'|'empty'|'unavailable';words:number;lessons:number;error?:string};
export type AccountStatus={configured:boolean;hasSharedDevice?:boolean;user:AccountProfile|null;cloud?:CloudOverview;error?:string};
export function profileFor(user:{id:string;email?:string;user_metadata?:Record<string,unknown>}):AccountProfile{
 const meta=user.user_metadata??{};
 const name=[meta.full_name,meta.name].find(value=>typeof value==='string'&&value.trim());
 const candidate=meta.avatar_url??meta.picture;let avatarUrl:string|null=null;
 if(typeof candidate==='string'&&candidate.length<=2048){try{const url=new URL(candidate);if(url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&(url.hostname==='googleusercontent.com'||url.hostname.endsWith('.googleusercontent.com')))avatarUrl=url.href;}catch{}}
 return {id:user.id,email:user.email??null,name:typeof name==='string'?name.trim().slice(0,200):null,avatarUrl};
}
export function databaseFailure(code?:string){return ['42P01','42703','42883','PGRST202','PGRST204','PGRST205'].includes(code??'')?'schema-not-ready':code==='42501'?'permission-denied':'database-unavailable';}
export function cloudFailureText(code:string,english=false){const messages:Record<string,[string,string]>={
 'schema-not-ready':['Đã đăng nhập Google nhưng chưa mở được bài trong tài khoản. Thử lại sau nhé; bài trên máy vẫn còn.','You are signed in, but account lessons could not open. Try again later; device lessons are kept.'],
 'permission-denied':['Chưa mở được bài của tài khoản này. Đăng nhập lại đúng tài khoản rồi thử nhé.','These account lessons could not open. Sign in with the correct account and retry.'],
 'signed-out':['Phiên đăng nhập đã hết hạn. Đăng nhập Google lại rồi thử tiếp.','Your sign-in expired. Sign in with Google again.'],
 'not-configured':['Chưa dùng được bài trong tài khoản lúc này. Bài trên máy vẫn học được.','Account lessons are unavailable for now. Device lessons still work.'],
 'conflict':['Bài đã được sửa trên hai thiết bị. Chọn bản muốn giữ trước khi đồng bộ tiếp.','Two devices changed the same lesson. Choose the version to keep before continuing.'],
 'duplicate':['Tài khoản đã có từ cùng nghĩa. Kiểm các mục trùng trước khi gửi tiếp.','The account already has the same word and sense. Check duplicate items before continuing.'],
 'timeout':['Chờ hơi lâu rồi. Kiểm tra mạng và thử lại nhé; bài trên máy vẫn còn.','This is taking too long. Check your connection and retry; device lessons are kept.'],
 'network':['Chưa kết nối được. Kiểm tra mạng rồi thử lại; bài trên máy vẫn còn.','Could not connect. Check your connection and retry; device lessons are kept.']
 };return (messages[code]??['Chưa đọc hoặc lưu được bài trên tài khoản. Bài trên máy vẫn còn; bấm thử lại.','Account lessons could not be read or saved. Local lessons are preserved; retry.'])[english?1:0];}
export class CloudRequestError extends Error{constructor(public code:string,public status:number){super(code);}}
export const safeCloudCodes=new Set(['schema-not-ready','permission-denied','signed-out','not-configured','database-unavailable','cloud-unavailable','sync-unavailable','pull-unavailable','duplicate','conflict','invalid-batch','invalid-record','origin']);
export function cloudDiagnostic(error:unknown){
 const value=error as {code?:string;reason?:string;status?:number;name?:string}|null;
 const candidate=value?.reason??value?.code;
 const code=candidate&&(safeCloudCodes.has(candidate)||['conflict','duplicate','signed-out','offline'].includes(candidate))?candidate==='offline'?'network':candidate:value?.name==='TimeoutError'||value?.name==='AbortError'?'timeout':'network';
 return {code,status:Number.isInteger(value?.status)?value?.status:undefined};
}
