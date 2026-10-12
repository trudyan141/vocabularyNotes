'use client';
import {useEffect, useRef, useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {Popover} from 'radix-ui';
import {Bell, ChevronRight, CloudUpload, FileImage, RefreshCw, Trash2, X} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useApp} from './provider';
import {Button} from '@/components/ui/button';
import {SubmitButton, type SubmitState} from '@/components/ui/submit-button';
import {EmptyState} from './shared';
import {dismissNotification, listNotifications, type AppNotification} from '@/data/local/notifications';

export function useNotifications() {
 const {repository} = useApp();
 const result = useLiveQuery(async () => {
  if (!repository) return null;
  try { return {scope: repository.scope.id, items: await listNotifications(repository), error: false}; }
  catch { return {scope: repository.scope.id, items: [] as AppNotification[], error: true}; }
 }, [repository]);
 return result?.scope === repository?.scope.id ? result : undefined;
}
export function notificationText(item: AppNotification, t: (vi: string, en: string) => string) {
 if (item.kind === 'capture') return {title:t('Tiếp tục bài từ ảnh', 'Continue your photo lesson'),summary:item.draftTitle?.trim() || t('Bạn còn một bài đang chuẩn bị.', 'You have an unfinished lesson.')};
 return item.kind === 'guest-copy'
  ? {title: t('Mang bài học sang tài khoản', 'Copy lessons to your account'), summary: t(`${item.count} từ trên máy đang chờ bạn chọn.`, `${item.count} device words await your choice.`)}
  : {title: t('Bài học cần được đồng bộ', 'Your lessons need to sync'), summary: t('Bài vẫn ở trên máy. Mở để kiểm tra và tiếp tục.', 'Your lessons remain on this device. Open to check and continue.')};
}
export function NotificationBell() {
 const {t, repository} = useApp();
 const view = useNotifications();
 const pathname = usePathname();
 const [opened, setOpened] = useState<{path: string; scope?: string} | null>(null);
 const open = opened?.path === pathname && opened?.scope === repository?.scope.id;
 const count = view?.items.filter(item => item.unread).length ?? 0;
 const signature = view?.items.filter(item => item.unread).map(item => `${item.id}:${item.signature}`).join('|') ?? '';
 const icon = useRef<SVGSVGElement>(null);
 const closeButton = useRef<HTMLButtonElement>(null);
 useEffect(() => {
  if (!signature || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced') return;
  const animation = icon.current?.animate([{transform:'rotate(0deg)'},{transform:'rotate(-14deg)'},{transform:'rotate(12deg)'},{transform:'rotate(-8deg)'},{transform:'rotate(0deg)'}], {duration:650, easing:'ease-in-out'});
  return () => animation?.cancel();
 }, [signature]);
 return <Popover.Root open={!!open} onOpenChange={value => setOpened(value ? {path: pathname, scope: repository?.scope.id} : null)}>
  <Popover.Trigger asChild><Button variant="ghost" className="notification-bell" disabled={!view} aria-label={t(`Thông báo${count ? `, ${count} chưa đọc` : ''}`, `Notifications${count ? `, ${count} unread` : ''}`)}><Bell ref={icon} aria-hidden="true"/>{count > 0 && <span className="notification-count" aria-hidden="true">{count > 99 ? '99+' : count}</span>}</Button></Popover.Trigger>
  <Popover.Portal><Popover.Content className="notification-popup" sideOffset={12} collisionPadding={16} aria-label={t('Thông báo', 'Notifications')}>
   <div className="notification-popup-header"><h2>{t('Thông báo', 'Notifications')}</h2><Popover.Close asChild><Button variant="ghost" size="icon" ref={closeButton} aria-label={t('Đóng thông báo', 'Close notifications')}><X aria-hidden="true"/></Button></Popover.Close></div>
   {!view ? <p role="status">{t('Đang xem thông báo…', 'Loading notifications…')}</p> : view.error ? <p role="alert">{t('Chưa đọc được thông báo. Đóng rồi mở lại nhé.', 'Could not load notifications. Close and reopen to try again.')}</p> : view.items.length ? <ul className="notification-list">{view.items.map(item => {
    const text = notificationText(item, t); const Icon = item.kind === 'capture' ? FileImage : item.kind === 'guest-copy' ? CloudUpload : RefreshCw;
    return <li key={item.id} className="notification-row"><Popover.Close asChild><Link prefetch={false} href={`/notifications/${item.id}`} className="notification-item"><span className="notification-symbol"><Icon aria-hidden="true"/></span><span><strong>{text.title}</strong><span>{text.summary}</span>{item.unread && <small>{t('Chưa đọc', 'Unread')}</small>}</span><ChevronRight aria-hidden="true"/></Link></Popover.Close><DismissNotification key={`${repository?.scope.id}:${item.id}:${item.signature}`} item={item} onDismiss={() => closeButton.current?.focus()}/></li>;
   })}</ul> : <EmptyState title={t('Chưa có thông báo', 'No notifications yet')} description={t('Có tin mới, chuông sẽ báo cho bạn nhé.', 'The bell will let you know when there is news.')}/>}
   <Popover.Arrow className="notification-arrow"/>
  </Popover.Content></Popover.Portal>
 </Popover.Root>;
}

function DismissNotification({item,onDismiss}: {item: AppNotification;onDismiss:()=>void}) {
 const {repository, t} = useApp();
 const [state, setState] = useState<SubmitState>('idle');
 const [error, setError] = useState('');
 async function remove() {
  if (!repository || state === 'pending') return;
  setState('pending'); setError('');
  try {await dismissNotification(repository,item);setState('success');onDismiss();}
  catch {setState('error');setError(t('Chưa xóa được thông báo. Thử lại nhé.', 'Could not delete the notification. Try again.'));}
 }
 return <SubmitButton type="button" variant="ghost" size="icon" className="notification-delete" state={state} error={error} aria-label={t(`Xóa thông báo: ${notificationText(item,t).title}`, `Delete notification: ${notificationText(item,t).title}`)} onClick={() => void remove()}><Trash2 aria-hidden="true"/></SubmitButton>;
}
