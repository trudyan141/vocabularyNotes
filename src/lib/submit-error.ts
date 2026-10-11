import {RepositoryError} from '@/data/local/repository';
type Translate=(vi:string,en:string)=>string;
export function submitError(cause:unknown,t:Translate){
 if(cause instanceof RepositoryError){
  if(cause.code==='conflict')return t('Nội dung đã đổi ở tab hoặc thiết bị khác, hoặc trùng với mục đã có. Phần nhập vẫn còn; mở lại bản mới trước khi lưu.','Content changed in another tab or device, or matches an existing item. Your input is intact; reopen the latest version before saving.');
  if(cause.code==='scope')return t('Thư viện đã đổi. Mở lại mục trong tài khoản hiện tại rồi thử lại.','The library changed. Reopen this item in your current account and retry.');
  if(cause.code==='not-ready')return t('Thư viện đang mở. Đợi một chút rồi thử lưu lại.','The library is loading. Wait a moment and retry.');
  if(cause.code==='missing')return t('Mục này không còn trong thư viện. Quay lại danh sách để chọn mục khác.','This item is no longer in the library. Return to the list and choose another.');
  return t('Có ô chưa đầy đủ hoặc dữ liệu chưa hợp lệ. Kiểm các ô được đánh dấu rồi lưu lại.','Some fields are incomplete or invalid. Check the marked fields and save again.');
 }
 if(cause instanceof DOMException&&cause.name==='QuotaExceededError')return t('Máy đã hết dung lượng lưu bài. Sao lưu rồi dọn bớt ảnh nháp trước khi thử lại.','This device is out of storage. Back up your lessons and remove unused drafts before retrying.');
 return t('Chưa lưu được. Kiểm kết nối và dung lượng lưu trữ rồi thử lại; phần nhập vẫn còn.','Could not save. Check your connection and available storage and retry; your input is intact.');
}
