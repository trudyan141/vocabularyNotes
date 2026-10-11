'use client';
import {useEffect,useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {HardDrive,Cloud,RefreshCw,LogOut,CloudUpload} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Back} from '@/components/app/shared';
import {GoogleMark} from '@/components/ui/google-mark';
import {OperationStatus} from '@/components/ui/operation-status';
import {CloudFailure,type CloudIssue} from '@/components/ui/cloud-failure';
import {useApp} from '@/components/app/provider';
import {CloudTools} from './cloud-tools';
import {TransferTools} from './transfer-tools';
import {CloudSources} from './cloud-sources';
import {AccountDelete} from './account-delete';
import {ProfileAvatar,ProfileSettings} from './profile';
import {CurrentLibrary} from './current-library';
import {LibraryDatabase} from '@/data/local/database';
import {openAccountRepository,requestCloudLibrary} from '@/data/cloud/account';
import {syncEngine} from '@/data/cloud/sync';
import {cloudDiagnostic,CloudRequestError,type AccountStatus} from '@/lib/account-profile';

export function AccountTools(){
 const {t,repository,selectCloudLibrary,selectLocalLibrary}=useApp();
 const [status,setStatus]=useState<AccountStatus|null>(null),[busy,setBusy]=useState(false),[checking,setChecking]=useState(true),[stage,setStage]=useState(''),[issue,setIssue]=useState<CloudIssue|null>(null);
 const locked=useRef(false);
 async function readStatus(signal?:AbortSignal){
  const response=await fetch('/api/auth/status?profile=1',{cache:'no-store',signal:signal??AbortSignal.timeout(15000)});
  if(!response.ok)throw new CloudRequestError(response.status===401?'signed-out':'cloud-unavailable',response.status);
  return await response.json() as AccountStatus;
 }
 useEffect(()=>{const controller=new AbortController();let active=true,generation=0;const check=()=>{const current=++generation;void readStatus(AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])).then(value=>{if(active&&current===generation){setStatus(value);setIssue(null);}}).catch(error=>{if(active&&current===generation&&!controller.signal.aborted)setIssue({...cloudDiagnostic(error),stage:'Kiểm đăng nhập'});}).finally(()=>{if(active&&current===generation)setChecking(false);});};check();window.addEventListener('wfk-auth-changed',check);return()=>{active=false;controller.abort();window.removeEventListener('wfk-auth-changed',check);};},[]);
 async function run(label:string,work:()=>Promise<void>){if(locked.current)return;locked.current=true;setBusy(true);setStage(label);setIssue(null);try{await work();}catch(error){setIssue({...cloudDiagnostic(error),stage:label});}finally{locked.current=false;setBusy(false);}}
 async function refresh(){await run(t('Kiểm tra tài khoản và bài đã lưu','Checking account and saved lessons'),async()=>setStatus(await readStatus()));}
 async function logout(){await run(t('Đăng xuất Google','Signing out of Google'),async()=>{
  const response=await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});if(!response.ok)throw new CloudRequestError('cloud-unavailable',response.status);
  await selectLocalLibrary(false);window.dispatchEvent(new Event('wfk-auth-changed'));
  if('BroadcastChannel'in window){const channel=new BroadcastChannel('wfk-auth');channel.postMessage('changed');channel.close();}
  setStatus(previous=>previous?{configured:previous.configured,user:null}:previous);
 });}
 async function login(){await run(t('Mở đăng nhập Google','Opening Google sign-in'),async()=>{
  const response=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});if(!response.ok)throw new CloudRequestError('cloud-unavailable',response.status);
  const data=await response.json();if(typeof data.url!=='string')throw new CloudRequestError('cloud-unavailable',502);window.location.assign(data.url);
 });}
 async function openCloud(){await run(t('Tải bài từ tài khoản về máy này','Downloading account lessons to this device'),async()=>{
  if(!status?.user||!repository)return;
  const library=await requestCloudLibrary();if(library.ownerId!==status.user.id)throw new CloudRequestError('signed-out',401);
  const db=new LibraryDatabase();try{await syncEngine(await openAccountRepository(db,library)).synchronize();}finally{db.close();}
  await selectCloudLibrary(status.user.id);
 });}
 const accountActive=repository?.scope.kind==='account'&&repository.scope.ownerId===status?.user?.id;
 return <div className="reading-page page-flow account-page">
  <Back href="/settings" label={t('Quay lại tùy chọn','Back to settings')}/>
  <h1>{t('Hồ sơ của bạn','Your profile')}</h1>
  <h2>{t('Bài học và tài khoản','Lessons and account')}</h2>
  <p>{t('Dùng tài khoản Google để mở cùng bài học trên nhiều thiết bị. Bạn vẫn học được khi không đăng nhập.','Use your Google account to open the same lessons on multiple devices. You can also study without signing in.')}</p>
  <OperationStatus busy={checking} title={t('Đang kiểm đăng nhập','Checking sign-in')}/>
  {status?.user?<section className="account-identity" aria-label={t('Tài khoản đã đăng nhập','Signed-in account')}>
   <ProfileAvatar key={status.user.id} user={status.user}/>
   <div><h2>{status.user.name??t('Người dùng','User')}</h2><p className="account-email">{status.user.email??t('Tài khoản Google','Google account')}</p><p className="account-connected"><GoogleMark/>{t('Đã đăng nhập bằng Google','Signed in with Google')}</p></div>
   <Button variant="outline" disabled={busy} onClick={()=>void logout()}><LogOut data-icon="inline-start" aria-hidden="true"/>{t('Đăng xuất / đổi tài khoản','Sign out / change account')}</Button>
  </section>:!checking&&status&&<section className="page-flow account-signin"><h2>{t('Chưa đăng nhập','Not signed in')}</h2><p>{status&&!status.configured?t('Đăng nhập chưa được bật trên bản website này. Bài trên máy vẫn dùng được.','Sign-in is not enabled for this website. Local lessons still work.'):t('Bài hiện tại ở trên máy này. Đăng nhập Google để lưu thêm một bản trên tài khoản.','Your current lessons are on this device. Sign in with Google to save an account copy.')}</p><Button variant="google" disabled={busy||!status?.configured} onClick={()=>void login()}><GoogleMark/>{t('Đăng nhập bằng Google','Sign in with Google')}</Button></section>}
  <ProfileSettings/>
  <section className="page-flow"><h2>{t('Bài của con đang ở đâu?','Where are your child’s lessons?')}</h2>
   <p className="account-current">{accountActive?t('Đang học từ thư viện tài khoản.','Currently studying from your account library.'):repository?.scope.kind==='demo'?t('Đang xem bài mẫu. Bài mẫu không được đưa lên tài khoản.','Currently viewing sample lessons. Samples are not transferred to your account.'):t('Đang học từ bài trên máy này.','Currently studying from lessons on this device.')}</p>
   <div className="account-storage"><DeviceSummary/><section className="account-storage-location account-storage-cloud"><h3><Cloud aria-hidden="true"/>{t('Trên tài khoản Google','In your Google account')}</h3>{status?.user?status.cloud?.state==='unavailable'?<CloudFailure issue={{code:status.cloud.error??'database-unavailable',stage:t('Kiểm nơi lưu bài','Checking lesson storage')}}/>:<><p><strong>{status.cloud?.words??0}</strong> {t('từ đã lưu','saved words')} · <strong>{status.cloud?.lessons??0}</strong> {t('bộ bài','lesson sets')}</p><p>{t('Bản lưu của Words for Kids gắn với tài khoản này. Có thể mở trên thiết bị khác sau khi đăng nhập.','Your Words for Kids copy belongs to this account. Open it on another device after signing in.')}</p>{!accountActive&&<Button disabled={busy||!repository} onClick={()=>void openCloud()}><CloudUpload data-icon="inline-start" aria-hidden="true"/>{t('Mở thư viện tài khoản','Open account library')}</Button>}</>:<p>{t('Đăng nhập để kiểm tra bài đã lưu trên tài khoản.','Sign in to check your account’s saved lessons.')}</p>}</section></div>
   {accountActive&&<Button variant="outline" disabled={busy} onClick={()=>void run(t('Mở bài trên máy','Opening device lessons'),()=>selectLocalLibrary(false))}>{t('Dùng bài riêng trên máy này','Use this device’s separate lessons')}</Button>}
  </section>
  {status?.user&&!accountActive&&repository?.scope.kind==='guest'&&<section className="panel mint page-flow"><h2>{t('Đã đăng nhập, nhưng bài này chưa lên tài khoản','Signed in, but these lessons are still local')}</h2><p>{t('Hai thiết bị chỉ có cùng bài khi mở thư viện tài khoản. Đưa bài trên máy lên tài khoản trước; bản gốc vẫn được giữ.','Both devices share lessons when using the account library. Save device lessons to your account first; the original is kept.')}</p><Button asChild><a href="#save-account-lessons">{t('Lưu bài trên máy lên tài khoản','Save device lessons to account')}</a></Button></section>}<CurrentLibrary/>
  <OperationStatus busy={busy} title={stage}/><CloudFailure issue={issue}/>
  <Button className="account-refresh" variant="secondary" disabled={busy||checking} onClick={()=>void refresh()}><RefreshCw data-icon="inline-start" aria-hidden="true"/>{t('Kiểm tra lại trạng thái','Refresh account status')}</Button>
  {status?.user&&<><CloudTools onSynced={()=>void refresh()}/><TransferTools key={status.user.id} owner={status.user.id}/><details className="account-more"><summary>{t('Ảnh chụp gốc và tùy chọn tài khoản','Source photos and account options')}</summary><CloudSources/><AccountDelete owner={status.user.id} onDeleted={()=>setStatus(previous=>previous?{configured:previous.configured,user:null}:previous)}/></details></>}
  <Back href="/today" label={t('Về Hôm nay','Back to Today')}/>
 </div>;
}
function DeviceSummary(){const {repository,t}=useApp();const stats=useLiveQuery(async()=>{
 if(!repository)return null;
 try{const selected=await repository.db.metadata.get('active-guest');const library=selected?await repository.db.libraries.get(selected.value):null;
 if(!library||library.scope.kind!=='guest')return {scope:repository.scope.id,words:0,lessons:0};
 const bounds={lower:[library.scopeId,''],upper:[library.scopeId,'\uffff']};
 const [senses,lessons]=await Promise.all([repository.db.senses.where('[scopeId+id]').between(bounds.lower,bounds.upper).filter(row=>!row.deletedAt).count(),repository.db.lessons.where('[scopeId+id]').between(bounds.lower,bounds.upper).filter(row=>!row.deletedAt).count()]);
 return {scope:repository.scope.id,words:senses,lessons,error:false};}catch{return {scope:repository.scope.id,words:0,lessons:0,error:true};}
 },[repository]);return <section className="account-storage-location account-storage-device"><h3><HardDrive aria-hidden="true"/>{t('Riêng trên máy này','Only on this device')}</h3>{stats&&stats.scope===repository?.scope.id?stats.error?<p role="alert">{t('Chưa đếm được bài trên máy. Tải lại để thử; dữ liệu chưa bị thay đổi.','Could not count device lessons. Reload to retry; content is unchanged.')}</p>:<p><strong>{stats.words}</strong> {t('từ đã lưu','saved words')} · <strong>{stats.lessons}</strong> {t('bộ bài','lesson sets')}</p>:<p>{t('Đang đếm bài trên máy…','Counting device lessons…')}</p>}<p>{t('Bài chưa gắn với tài khoản. Đưa bài lên tài khoản bên dưới nếu muốn dùng trên máy khác.','These lessons are separate from your account. Transfer them below to use them on another device.')}</p></section>;}
