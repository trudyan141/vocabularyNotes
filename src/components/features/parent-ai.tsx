'use client';
import {OperationStatus} from '@/components/ui/operation-status';
import {useSyncExternalStore,useState,useEffect} from 'react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Sparkles,RotateCcw,Save,KeyRound,Trash2} from 'lucide-react';
import {parentAi,configureParentAi,parentKeyStorage,parentModels,defaultParentKey,defaultParentModel,checkParentModel,testParentApi,ParentAiError,type AiFailure} from '@/lib/ai/byok';
export function ParentAiSettings(){const hydrated=useSyncExternalStore(()=>()=>{},()=>true,()=>false);return hydrated?<ParentAiForm/>:null;}
function ParentAiForm(){
  useEffect(()=>{if(window.location.hash==='#parent-ai')document.getElementById('parent-ai')?.scrollIntoView({block:'start'});},[]);
  const {t}=useApp();
  const [key,setKey]=useState(()=>parentAi()?.key??'');
  const [model,setModel]=useState(()=>parentAi()?.model??defaultParentModel);
  const [custom,setCustom]=useState(()=>!parentModels.some(item=>item.id===(parentAi()?.model??defaultParentModel)));
  const [remember,setRemember]=useState(()=>{try{return !!localStorage.getItem(parentKeyStorage);}catch{return false;}});
  const [message,setMessage]=useState('');const [checking,setChecking]=useState(false);const [failure,setFailure]=useState<AiFailure|null>(null);
  async function check(inference=false){if(checking)return;setChecking(true);setMessage('');setFailure(null);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);try{const result=await (inference?testParentApi:checkParentModel)({key:key.trim(),model:model.trim()},controller.signal);setMessage(inference?t(`Google đã chấp nhận câu mẫu với ${result.model}. Nếu phân tích ảnh vẫn lỗi, cần kiểm request ảnh/JSON.`,`Google accepted the sample prompt with ${result.model}. If photo analysis fails, check its image/JSON request.`):t(`Google đã chấp nhận key và model ${result.model}. Chưa gửi ảnh; quota và khả năng đọc ảnh được kiểm khi phân tích.`,`Google accepted the key and model ${result.model}. No photo sent; analysis checks quota and image support.`));}catch(e){setFailure(e instanceof ParentAiError?e.details??null:null);setMessage(t(controller.signal.aborted?'Kiểm tra hết thời gian. Thử lại khi có mạng tốt.':'Chưa kiểm tra được key/model. Xem lỗi Google bên dưới; nếu chưa có mã lỗi, kiểm tra key, model và kết nối.','Key/model check failed. See the Google error below or check your key, model and connection.'));}finally{clearTimeout(timer);setChecking(false);}}
  return <section id="parent-ai" className="page-flow ai-settings">
    <h2 className="icon-heading"><Sparkles aria-hidden="true"/>{t('AI giúp bố mẹ chuẩn bị bài','AI helps parents prepare lessons')}</h2>
    <p className="ai-default-note">{key===defaultParentKey?t('Sẵn sàng đọc ảnh bài học. Không cần cài đặt thêm.','Ready to read lesson photos. No setup needed.'):key?t('Đang dùng key riêng của bố mẹ.','Using your own parent key.'):t('AI đang tắt trên trình duyệt này.','AI is off in this browser.')}</p>
    <p className="muted">{t('Chỉ gửi ảnh đến Google khi bố mẹ bấm phân tích.','Photos go to Google only when you choose to analyse them.')}</p>
    <div className="row-wrap">      <Button variant="outline" disabled={checking} onClick={()=>{setFailure(null);try{configureParentAi(null);setKey('');setRemember(false);setMessage(t('Đã xóa key riêng và tắt AI trên trình duyệt này. Key chung vẫn là cấu hình công khai của website.','Your own key was removed and AI is off in this browser. The shared key remains public website configuration.'));}catch{setMessage(t('Trình duyệt chặn thao tác xóa key.','Browser blocked key deletion.'));}}}><Trash2 data-icon="inline-start" aria-hidden="true"/>{t('Tắt AI','Turn AI off')}</Button>
      {key!==defaultParentKey&&<Button variant="secondary" disabled={checking||key===defaultParentKey} onClick={()=>{setFailure(null);try{configureParentAi({key:defaultParentKey,model:defaultParentModel});setKey(defaultParentKey);setModel(defaultParentModel);setCustom(false);setRemember(false);setMessage(t('Đã bật lại key Gemini dùng chung.','Shared Gemini key restored.'));}catch{setMessage(t('Chưa bật lại được. Kiểm quyền lưu của trình duyệt.','Could not restore. Check browser storage access.'));}}}><RotateCcw data-icon="inline-start" aria-hidden="true"/>{t('Dùng mặc định','Use default')}</Button>}
</div>
    <details className="ai-advanced"><summary>{t('Dùng key riêng / Tùy chọn nâng cao','Use your own key / Advanced options')}</summary><div className="compact-form">
    <p>{t('Chỉ cần đổi khi muốn dùng tài khoản Google AI riêng.','Change this only to use your own Google AI account.')} <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer">{t('Lấy key ở Google AI Studio','Get a Google AI Studio key')}</a></p>
    <label htmlFor="parent-api-key">Gemini API key</label>
    <Input id="parent-api-key" disabled={checking} type="password" autoComplete="off" spellCheck={false} maxLength={300} value={key} onChange={e=>setKey(e.target.value)} placeholder="AIza…"/>
    <label htmlFor="parent-ai-model">{t('Model đọc ảnh','Vision model')}</label>
    <select id="parent-ai-model" disabled={checking} value={custom?'custom':model} onChange={e=>{const isCustom=e.target.value==='custom';setCustom(isCustom);if(!isCustom)setModel(e.target.value);}}>
      {parentModels.map(item=><option key={item.id} value={item.id}>{item.name}{item.id===defaultParentModel?t(' — mặc định, quota miễn phí',' — default, free quota'):t(' — có free tier',' — free tier available')}</option>)}
      <option value="custom">{t('Nhập model Gemini khác…','Enter another Gemini model…')}</option>
    </select>
    {custom&&<><label htmlFor="parent-ai-custom-model">{t('Model ID Gemini','Gemini model ID')}</label><Input id="parent-ai-custom-model" disabled={checking} value={model} maxLength={100} spellCheck={false} onChange={e=>setModel(e.target.value)} placeholder="gemini-…"/></>}
    <label><input type="checkbox" checked={remember} disabled={checking} onChange={e=>setRemember(e.target.checked)}/> {t('Nhớ key trên máy này','Remember the key on this device')}</label>
    <small>{t('Chỉ lưu trên trình duyệt này. Người dùng chung máy có thể đọc key; bỏ chọn để chỉ dùng trong lần mở này.','Saved only in this browser. People sharing this device may read the key; leave unchecked to use it only this session.')}</small>
    <div className="row-wrap">
      <Button disabled={checking} onClick={()=>{setFailure(null);try{configureParentAi({key:key.trim(),model:model.trim()},remember);setMessage(t('Đã lưu cấu hình Gemini. Chọn ảnh rồi bấm Phân tích ảnh bằng AI.','Gemini configured. Choose a photo and press Analyse photo with AI.'));}catch{setMessage(t('Chưa lưu được. Dùng key từ Google AI Studio, model ID bắt đầu gemini- và kiểm quyền lưu của trình duyệt.','Could not save. Use a Google AI Studio key and a gemini- model ID; check browser storage access.'));}}}><Save data-icon="inline-start" aria-hidden="true"/>{t('Lưu cấu hình AI','Save AI settings')}</Button>
      <Button variant="outline" disabled={checking||!key.trim()} onClick={()=>void check()}><KeyRound data-icon="inline-start" aria-hidden="true"/>{checking?t('Đang kiểm tra…','Checking…'):t('Kiểm tra key và model (không gửi ảnh)','Check key and model (no photo sent)')}</Button>
      <Button variant="outline" disabled={checking||!key.trim()} onClick={()=>void check(true)}>{t('Thử API với câu mẫu (không gửi ảnh)','Test API with sample prompt (no photo)')}</Button>
    </div>
    <small>{t('Câu mẫu chỉ gửi “Reply with the word OK.” để kiểm quyền gọi API; dùng một ít quota và có thể tính phí nếu project bật billing. Không tự thử lại.','The sample only sends “Reply with the word OK.” to check inference access; it uses a small API quota and may incur charges on a billed project. No automatic retries.')}</small>
    </div></details>
    <OperationStatus busy={checking} title={checking?t('Đang chờ Google kiểm tra key và model…','Waiting for Google to check the key and model…'):t('Kết quả kiểm tra AI','AI check result')} message={message} error={!!failure}/>{failure&&<AiFailureDetails details={failure}/>}
    <details className="ai-data-note"><summary>{t('Dữ liệu gửi Google và điều kiện sử dụng','Google data use and eligibility')}</summary><p>{t('Free tier có thể dùng nội dung gửi để cải thiện sản phẩm. Chỉ gửi bài đã cắt bỏ thông tin riêng. Điều khoản Gemini API hiện hạn chế ứng dụng hướng tới hoặc có thể được người dưới 18 tuổi truy cập; key phụ huynh không tự miễn điều kiện này.','Free tier content may be used to improve products. Crop private details before sending. Gemini API terms currently restrict apps directed toward or likely accessed by under-18s; a parent key does not exempt this requirement.')} <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">{t('Điều khoản Google','Google terms')}</a></p></details>
  </section>;
}

export function AiFailureDetails({details}:{details:AiFailure}){const {t}=useApp();return <details open className="ai-error-details"><summary>{t('Chi tiết lỗi từ Google (đã ẩn key)','Google error details (key redacted)')}</summary><p><strong>HTTP {details.http} · {details.status}</strong><br/>Model: {details.model}{details.reason&&<><br/>{details.reason}</>}</p><pre>{[details.message,...details.fields].join('\n')}</pre></details>;}
