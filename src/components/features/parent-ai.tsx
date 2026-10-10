'use client';
import {OperationStatus} from '@/components/ui/operation-status';
import {useSyncExternalStore,useState,useEffect} from 'react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {parentAi,configureParentAi,parentKeyStorage,parentModels,defaultParentModel,checkParentModel,testParentApi,ParentAiError,type AiFailure} from '@/lib/ai/byok';
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
  return <section id="parent-ai" className="page-flow">
    <h2>{t('AI riêng của phụ huynh','Parent’s own AI')}</h2>
    <p>{t('Dùng Gemini API key của bố mẹ để phân tích ảnh. Trình duyệt gửi trực tiếp đến Google; key không gửi qua server app, cloud sync hay backup.','Use your Gemini API key to analyse photos. The browser calls Google directly; the key never enters the app server, cloud sync or backups.')}</p>
    <p><a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer">{t('Lấy key: Google AI Studio → API keys → Create API key','Get a key: Google AI Studio → API keys → Create API key')}</a>. {t('Chọn project ở Free Tier để dùng quota miễn phí; không cần key OpenAI.','Choose a Free Tier project for the free quota; no OpenAI key is needed.')}</p>
    <label htmlFor="parent-api-key">Gemini API key</label>
    <Input id="parent-api-key" disabled={checking} type="password" autoComplete="off" spellCheck={false} maxLength={300} value={key} onChange={e=>setKey(e.target.value)} placeholder="AIza…"/>
    <label htmlFor="parent-ai-model">{t('Model đọc ảnh','Vision model')}</label>
    <select id="parent-ai-model" disabled={checking} value={custom?'custom':model} onChange={e=>{const isCustom=e.target.value==='custom';setCustom(isCustom);if(!isCustom)setModel(e.target.value);}}>
      {parentModels.map(item=><option key={item.id} value={item.id}>{item.name}{item.id===defaultParentModel?t(' — mặc định, quota miễn phí',' — default, free quota'):t(' — có free tier',' — free tier available')}</option>)}
      <option value="custom">{t('Nhập model Gemini khác…','Enter another Gemini model…')}</option>
    </select>
    {custom&&<><label htmlFor="parent-ai-custom-model">{t('Model ID Gemini','Gemini model ID')}</label><Input id="parent-ai-custom-model" disabled={checking} value={model} maxLength={100} spellCheck={false} onChange={e=>setModel(e.target.value)} placeholder="gemini-…"/></>}
    <small>{t('Ưu tiên Gemini 3.5 Flash-Lite để đọc bài. Free tier có giới hạn theo project; nếu project đã bật billing, API có thể tính phí. App không tự đổi model hoặc bật billing.','Gemini 3.5 Flash-Lite is recommended for worksheets. Free quotas depend on your project; a billing-enabled project may incur charges. The app never switches models or enables billing automatically.')} <a href="https://ai.google.dev/gemini-api/docs/pricing" target="_blank" rel="noreferrer">{t('Giá và free tier','Pricing and free tiers')}</a></small>
    <label><input type="checkbox" checked={remember} disabled={checking} onChange={e=>setRemember(e.target.checked)}/> {t('Nhớ key trên trình duyệt này (localStorage)','Remember the key in this browser (localStorage)')}</label>
    <small>{t('Nếu không chọn, key chỉ dùng trong phiên đang mở. localStorage không mã hóa; người dùng chung trình duyệt hoặc mã chạy trên trang có thể đọc key. Có thể xóa ngay bên dưới.','Otherwise the key stays in this open session. localStorage is unencrypted and accessible to people sharing the browser or code running on this page. Delete it below.')}</small>
    <div className="row-wrap">
      <Button disabled={checking} onClick={()=>{setFailure(null);try{configureParentAi({key:key.trim(),model:model.trim()},remember);setMessage(t('Đã lưu cấu hình Gemini. Chọn ảnh rồi bấm Phân tích ảnh bằng AI.','Gemini configured. Choose a photo and press Analyse photo with AI.'));}catch{setMessage(t('Chưa lưu được. Dùng key từ Google AI Studio, model ID bắt đầu gemini- và kiểm quyền lưu của trình duyệt.','Could not save. Use a Google AI Studio key and a gemini- model ID; check browser storage access.'));}}}>{t('Lưu cấu hình AI','Save AI settings')}</Button>
      <Button variant="outline" disabled={checking} onClick={()=>{setFailure(null);try{configureParentAi(null);setKey('');setMessage(t('Đã xóa key khỏi phiên và localStorage.','Key removed from this session and localStorage.'));}catch{setMessage(t('Trình duyệt chặn thao tác xóa key.','Browser blocked key deletion.'));}}}>{t('Xóa key khỏi máy này','Delete key from this browser')}</Button>
      <Button variant="outline" disabled={checking||!key.trim()} onClick={()=>void check()}>{checking?t('Đang kiểm tra…','Checking…'):t('Kiểm tra key và model (không gửi ảnh)','Check key and model (no photo sent)')}</Button>
      <Button variant="outline" disabled={checking||!key.trim()} onClick={()=>void check(true)}>{t('Thử API với câu mẫu (không gửi ảnh)','Test API with sample prompt (no photo)')}</Button>
    </div>
    <small>{t('Câu mẫu chỉ gửi “Reply with the word OK.” để kiểm quyền gọi API; dùng một ít quota và có thể tính phí nếu project bật billing. Không tự thử lại.','The sample only sends “Reply with the word OK.” to check inference access; it uses a small API quota and may incur charges on a billed project. No automatic retries.')}</small>
    <OperationStatus busy={checking} title={checking?t('Đang chờ Google kiểm tra key và model…','Waiting for Google to check the key and model…'):t('Kết quả kiểm tra AI','AI check result')} message={message} error={!!failure}/>{failure&&<AiFailureDetails details={failure}/>}
    <details><summary>{t('Dữ liệu gửi Google và điều kiện sử dụng','Google data use and eligibility')}</summary><p>{t('Free tier có thể dùng nội dung gửi để cải thiện sản phẩm. Chỉ gửi bài đã cắt bỏ thông tin riêng. Điều khoản Gemini API hiện hạn chế ứng dụng hướng tới hoặc có thể được người dưới 18 tuổi truy cập; key phụ huynh không tự miễn điều kiện này.','Free tier content may be used to improve products. Crop private details before sending. Gemini API terms currently restrict apps directed toward or likely accessed by under-18s; a parent key does not exempt this requirement.')} <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">{t('Điều khoản Google','Google terms')}</a></p></details>
  </section>;
}

export function AiFailureDetails({details}:{details:AiFailure}){const {t}=useApp();return <details open className="ai-error-details"><summary>{t('Chi tiết lỗi từ Google (đã ẩn key)','Google error details (key redacted)')}</summary><p><strong>HTTP {details.http} · {details.status}</strong><br/>Model: {details.model}{details.reason&&<><br/>{details.reason}</>}</p><pre>{[details.message,...details.fields].join('\n')}</pre></details>;}
