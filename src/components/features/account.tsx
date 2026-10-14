'use client';
import {useEffect,useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {HardDrive,Cloud,RefreshCw,LogOut,CloudUpload} from 'lucide-react';
import {SubmitButton,type SubmitState} from '@/components/ui/submit-button';
import {Back} from '@/components/app/shared';
import {GoogleMark} from '@/components/ui/google-mark';
import {OperationStatus} from '@/components/ui/operation-status';
import {CloudFailure,type CloudIssue} from '@/components/ui/cloud-failure';
import {useApp} from '@/components/app/provider';
import {CloudTools} from './cloud-tools';
import {TransferTools} from './transfer-tools';
import {CloudSources} from './cloud-sources';
import {AccountDelete} from './account-delete';
import {SessionHistory} from './session-history';
import {ProfileAvatar,ProfileSettings} from './profile';
import {CurrentLibrary} from './current-library';
import {LibraryDatabase} from '@/data/local/database';
import {openAccountRepository,requestCloudLibrary} from '@/data/cloud/account';
import {syncEngine} from '@/data/cloud/sync';
import {cloudDiagnostic,cloudFailureText,CloudRequestError,type AccountStatus} from '@/lib/account-profile';

export function AccountTools(){
 const {t,repository,selectCloudLibrary}=useApp();
 const [status,setStatus]=useState<AccountStatus|null>(null),[busy,setBusy]=useState(false),[checking,setChecking]=useState(true),[stage,setStage]=useState(''),[issue,setIssue]=useState<CloudIssue|null>(null);
 const locked=useRef(false);const [action,setAction]=useState<string|null>(null),[submitState,setSubmitState]=useState<SubmitState>('idle');
 const feedback=(label:string)=>({type:'button' as const,state:action===label?submitState:'idle' as SubmitState,error:action===label&&submitState==='error'&&issue?t(cloudFailureText(issue.code),cloudFailureText(issue.code,true)):undefined});
 async function readStatus(signal?:AbortSignal){
  const response=await fetch('/api/auth/status?profile=1',{cache:'no-store',signal:signal??AbortSignal.timeout(15000)});
  if(!response.ok)throw new CloudRequestError(response.status===401?'signed-out':'cloud-unavailable',response.status);
  return await response.json() as AccountStatus;
 }
 useEffect(()=>{const controller=new AbortController();let active=true,generation=0;const check=()=>{const current=++generation;void readStatus(AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])).then(value=>{if(active&&current===generation){setStatus(value);setIssue(null);}}).catch(error=>{if(active&&current===generation&&!controller.signal.aborted)setIssue({...cloudDiagnostic(error),stage:'Kiểm đăng nhập'});}).finally(()=>{if(active&&current===generation)setChecking(false);});};check();window.addEventListener('wfk-auth-changed',check);window.addEventListener('wfk-cloud-synced',check);return()=>{active=false;controller.abort();window.removeEventListener('wfk-auth-changed',check);window.removeEventListener('wfk-cloud-synced',check);};},[]);
 async function run(label:string,work:()=>Promise<void>){if(locked.current)return;locked.current=true;setAction(label);setSubmitState('pending');setBusy(true);setStage(label);setIssue(null);try{await work();setSubmitState('success');}catch(error){setSubmitState('error');setIssue({...cloudDiagnostic(error),stage:label});}finally{locked.current=false;setBusy(false);}}
 async function refresh(){await run(t('Kiểm tra tài khoản và bài đã lưu','Checking account and saved lessons'),async()=>setStatus(await readStatus()));}
 async function logout(){await run(t('Đăng xuất Google','Signing out of Google'),async()=>{
  const response=await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});if(!response.ok)throw new CloudRequestError('cloud-unavailable',response.status);
  window.dispatchEvent(new Event('wfk-auth-changed'));
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
  <p>{t("Quản lý tài khoản, thư viện và thông tin của bạn.","Manage your account, libraries and personal details.")}</p>
  <section className="profile-group page-flow" aria-labelledby="profile-account-title"><h2 id="profile-account-title">{t("Tài khoản Google","Google account")}</h2>
  {!status?.user&&<p>{t('Đăng nhập Google để mở bài trên nhiều thiết bị. Bạn vẫn học được khi chưa đăng nhập.','Sign in with Google to open lessons on multiple devices. You can also study without signing in.')}</p>}
  <OperationStatus busy={checking} title={t('Đang kiểm đăng nhập','Checking sign-in')}/>
  {status?.user?<section className="account-identity" aria-label={t('Tài khoản đã đăng nhập','Signed-in account')}>
   <ProfileAvatar key={status.user.id} user={status.user}/>
   <div><h2>{status.user.name??t('Người dùng','User')}</h2><p className="account-email">{status.user.email??t('Tài khoản Google','Google account')}</p><p className="account-connected"><GoogleMark/>{t('Đã đăng nhập bằng Google','Signed in with Google')}</p></div>
   <SubmitButton {...feedback(t('Đăng xuất Google','Signing out of Google'))} successLabel={t('Đã đăng xuất','Signed out')} variant="outline" disabled={busy} onClick={()=>void logout()}><LogOut data-icon="inline-start" aria-hidden="true"/>{t('Đăng xuất / đổi tài khoản','Sign out / change account')}</SubmitButton>
  </section>:!checking&&status&&<section className="page-flow account-signin"><h2>{t('Chưa đăng nhập','Not signed in')}</h2><p>{status&&!status.configured?t('Đăng nhập chưa được bật trên bản website này. Bài trên máy vẫn dùng được.','Sign-in is not enabled for this website. Local lessons still work.'):t('Bài hiện tại ở trên máy này. Đăng nhập Google để lưu thêm một bản trên tài khoản.','Your current lessons are on this device. Sign in with Google to save an account copy.')}</p><SubmitButton {...feedback(t('Mở đăng nhập Google','Opening Google sign-in'))} successLabel={t('Đã mở đăng nhập','Sign-in opened')} variant="google" disabled={busy||!status?.configured} onClick={()=>void login()}><GoogleMark/>{t('Đăng nhập bằng Google','Sign in with Google')}</SubmitButton></section>}
  <OperationStatus busy={busy} title={stage}/><CloudFailure issue={issue}/>
  <SubmitButton {...feedback(t('Kiểm tra tài khoản và bài đã lưu','Checking account and saved lessons'))} successLabel={t('Đã kiểm tra','Checked')} className="account-refresh" variant="secondary" disabled={busy||checking} onClick={()=>void refresh()}><RefreshCw data-icon="inline-start" aria-hidden="true"/>{t('Kiểm tra lại trạng thái','Refresh account status')}</SubmitButton></section>
  <section className="profile-group page-flow" aria-labelledby="profile-libraries-title"><h2 id="profile-libraries-title">{t('Thư viện & đồng bộ','Libraries & sync')}</h2>
   <p className="account-current">{repository?.scope.kind==='shared'?t('Đang học từ thư viện được chia sẻ — chỉ học.','Currently studying a shared library — learning only.'):accountActive?t('Đang học từ thư viện tài khoản.','Currently studying from your account library.'):repository?.scope.kind==='demo'?t('Đang xem bài mẫu. Bài mẫu không được đưa lên tài khoản.','Currently viewing sample lessons. Samples are not transferred to your account.'):t('Đang học từ bài trên máy này.','Currently studying from lessons on this device.')}</p>
   <details className="profile-storage" open={status?.cloud?.state==='unavailable'||undefined}><summary>{t("Nơi lưu bài trên máy và tài khoản","Device and account lesson storage")}</summary><div className="account-storage"><DeviceSummary/><section className="account-storage-location account-storage-cloud"><h3><Cloud aria-hidden="true"/>{t('Trên tài khoản Google','In your Google account')}</h3>{status?.user?status.cloud?.state==='unavailable'?<CloudFailure issue={{code:status.cloud.error??'database-unavailable',stage:t('Kiểm nơi lưu bài','Checking lesson storage')}}/>:<><p><strong>{status.cloud?.words??0}</strong> {t('từ đã lưu','saved words')} · <strong>{status.cloud?.lessons??0}</strong> {t('bộ bài','lesson sets')}</p><p>{t('Bản lưu của Words for Kids gắn với tài khoản này. Có thể mở trên thiết bị khác sau khi đăng nhập.','Your Words for Kids copy belongs to this account. Open it on another device after signing in.')}</p>{!accountActive&&<SubmitButton {...feedback(t('Tải bài từ tài khoản về máy này','Downloading account lessons to this device'))} disabled={busy||!repository} onClick={()=>void openCloud()}><CloudUpload data-icon="inline-start" aria-hidden="true"/>{t('Mở thư viện tài khoản','Open account library')}</SubmitButton>}</>:<p>{t('Đăng nhập để kiểm tra bài đã lưu trên tài khoản.','Sign in to check your account’s saved lessons.')}</p>}</section></div></details>

  <CurrentLibrary/>
  {status?.user&&<details className="profile-subgroup page-flow"><summary>{t('Đồng bộ và chuyển bài','Sync and transfer lessons')}</summary><CloudTools onSynced={()=>void refresh()}/><TransferTools key={status.user.id} owner={status.user.id}/></details>}
  </section>
  <details className="profile-group profile-personal page-flow"><summary>{t('Thông tin cá nhân','Personal details')}</summary><ProfileSettings/></details>
  <section className="profile-group page-flow" aria-labelledby="profile-learning-title"><h2 id="profile-learning-title">{t('Hoạt động học','Learning activity')}</h2><SessionHistory/></section>
  {status?.user&&<details className="profile-group page-flow"><summary>{t('Quản lý dữ liệu tài khoản','Account data management')}</summary><p>{t('Xem ảnh chụp gốc và tùy chọn xóa tài khoản.','View source photos and account deletion options.')}</p><CloudSources/><AccountDelete owner={status.user.id} onDeleted={()=>setStatus(previous=>previous?{configured:previous.configured,user:null}:previous)}/></details>}
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
