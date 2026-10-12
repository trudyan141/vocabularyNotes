'use client';
import {useEffect, useState} from 'react';
import {useApp} from '@/components/app/provider';
import {notificationText, useNotifications} from '@/components/app/notifications';
import {Back, EmptyState} from '@/components/app/shared';
import {declineDeviceCopy, markNotificationRead} from '@/data/local/notifications';
import {TransferTools} from './transfer-tools';
import {CloudTools} from './cloud-tools';
import {SubmitButton, type SubmitState} from '@/components/ui/submit-button';
import {Bell,FileImage,ArrowRight} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
export function NotificationDetail({id}: {id: string}) {
 const {repository, t} = useApp();
 const view = useNotifications();
 const item = view?.items.find(row => row.id === id);
 const [readError, setReadError] = useState('');
 const [state, setState] = useState<SubmitState>('idle');
 const [error, setError] = useState('');
 useEffect(() => {
  if (!repository || !item?.unread) return;
  let active = true;
  void markNotificationRead(repository, item).catch(() => {if (active) setReadError(t('Chưa ghi nhớ được đã đọc. Thử mở lại nhé.', 'Could not mark as read. Try reopening.'));});
  return () => {active = false;};
 }, [repository, item, t]);
 async function decline() {
  if (!repository || state === 'pending') return;
  setState('pending'); setError('');
  try {await declineDeviceCopy(repository); setState('success');}
  catch {setState('error'); setError(t('Chưa lưu được lựa chọn. Thử lại nhé.', 'Could not save your choice. Try again.'));}
 }
 return <div className="page-flow notification-detail"><Back/><h1 className="icon-heading"><Bell aria-hidden="true"/>{item ? notificationText(item,t).title : t('Thông báo', 'Notification')}</h1>
  {!view ? <p role="status">{t('Đang mở thông báo…', 'Loading notification…')}</p> : view.error ? <p role="alert">{t('Chưa mở được thông báo. Thử tải lại trang nhé.', 'Could not open the notification. Try reloading.')}</p> : !item ? <EmptyState title={t('Đã xong rồi!', 'All done!')} description={t('Thông báo này không còn cần xử lý. Bạn có thể quay lại học nhé.', 'This notification no longer needs attention. You can return to learning.')}/> : <>
   <div className="page-flow"><p>{item.kind === 'capture' ? t('Ảnh và phần bạn đang chuẩn bị vẫn được giữ. Tiếp tục bài học khi bạn sẵn sàng nhé.', 'Your photo and work in progress are kept. Continue your lesson when you are ready.') : item.kind === 'guest-copy' ? t(`Máy này có ${item.count} từ. Bạn có thể xem trước rồi sao chép vào tài khoản để học trên thiết bị khác. Bài gốc vẫn được giữ; chỉ sao chép khi bạn xác nhận. Ảnh chụp gốc cần chọn gửi riêng.`, `This device has ${item.count} words. Preview and copy them to your account to learn on other devices. Originals stay on this device; copying requires your confirmation. Source photos need a separate upload choice.`) : notificationText(item, t).summary}</p></div>
   {readError && <p role="alert">{readError}</p>}
   {item.kind === 'capture' && item.draftId && <Button asChild className="self-start"><Link prefetch={false} href={`/capture/${encodeURIComponent(item.draftId)}/edit`}><FileImage aria-hidden="true"/>{t('Tiếp tục nháp ảnh', 'Resume image draft')}<ArrowRight aria-hidden="true"/></Link></Button>}
   {item.kind !== 'capture' && repository?.scope.kind === 'account' && (item.kind === 'guest-copy' ? <><TransferTools compact key={repository.scope.id} owner={repository.scope.ownerId}/><SubmitButton className="self-start" type="button" variant="outline" state={state} error={error} onClick={() => void decline()}>{t('Giữ bài trên máy, không sao chép', 'Keep device lessons without copying')}</SubmitButton></> : <CloudTools/>)}
  </>}
 </div>;
}
