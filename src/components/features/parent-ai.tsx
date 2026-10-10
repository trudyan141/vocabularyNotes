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
  async function check(inference=false){if(checking)return;setChecking(true);setMessage('');setFailure(null);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);try{await (inference?testParentApi:checkParentModel)({key:key.trim(),model:model.trim()},controller.signal);setMessage(inference?t('Google đã trả lời câu mẫu. Chưa gửi ảnh bài học.','Google answered the sample prompt. No lesson photo was sent.'):t('Đã kết nối được Google. Chưa gửi ảnh bài học.','Connected to Google. No lesson photo was sent.'));}catch(e){setFailure(e instanceof ParentAiError?e.details??null:null);setMessage(t(controller.signal.aborted?'Kiểm tra hết thời gian. Thử lại khi có mạng tốt.':'Chưa kết nối được Google. Kiểm tra mạng và thử lại nhé.','Could not connect to Google. Check your connection and retry.'));}finally{clearTimeout(timer);setChecking(false);}}
  return <section id="parent-ai" className="page-flow ai-settings">
    <h2 className="icon-heading"><Sparkles aria-hidden="true"/>{t('AI giúp bạn chuẩn bị bài','AI helps prepare lessons')}</h2>
    <p className="ai-default-note">{Boolean(key&&defaultParentKey&&key===defaultParentKey)?t('Sẵn sàng đọc ảnh bài học. Không cần cài đặt thêm.','Ready to read lesson photos. No setup needed.'):key?t('Đang dùng key riêng của bạn.','Using your own personal key.'):t('AI đang tắt trên máy này.','AI is off on this device.')}</p>
    <p className="muted">{t('Chỉ gửi ảnh đến Google khi bạn bấm phân tích.','Photos go to Google only when you choose to analyse them.')}</p>
    <div className="row-wrap">      <Button variant="outline" disabled={checking} onClick={()=>{setFailure(null);try{configureParentAi(null);setKey('');setRemember(false);setMessage(t('Đã tắt AI trên máy này.','Your own key was removed and AI is off on this device. The shared key remains public website configuration.'));}catch{setMessage(t('Chưa tắt được AI. Thử lại nhé.','Could not turn AI off. Please retry.'));}}}><Trash2 data-icon="inline-start" aria-hidden="true"/>{t('Tắt AI','Turn AI off')}</Button>
      {Boolean(defaultParentKey&&key!==defaultParentKey)&&<Button variant="secondary" disabled={checking||key===defaultParentKey} onClick={()=>{setFailure(null);try{configureParentAi({key:defaultParentKey,model:defaultParentModel});setKey(defaultParentKey);setModel(defaultParentModel);setCustom(false);setRemember(false);setMessage(t('Đã bật lại AI.','AI restored.'));}catch{setMessage(t('Chưa bật lại được. Thử lại nhé.','Could not restore. Please retry.'));}}}><RotateCcw data-icon="inline-start" aria-hidden="true"/>{t('Dùng mặc định','Use default')}</Button>}
</div>
    <details className="ai-advanced"><summary>{t('Tùy chọn AI nâng cao','Advanced AI options')}</summary><div className="compact-form">
    <p>{t('Chỉ cần đổi khi muốn dùng tài khoản Google AI riêng.','Change this only to use your own Google AI account.')} <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer">{t('Lấy key ở Google AI Studio','Get a Google AI Studio key')}</a></p>
    <label htmlFor="parent-api-key">Gemini API key</label>
    <Input id="parent-api-key" disabled={checking} type="password" autoComplete="off" spellCheck={false} maxLength={300} value={key} onChange={e=>setKey(e.target.value)} placeholder="AIza…"/>
    <label htmlFor="parent-ai-model">{t('Model đọc ảnh','Vision model')}</label>
    <select id="parent-ai-model" disabled={checking} value={custom?'custom':model} onChange={e=>{const isCustom=e.target.value==='custom';setCustom(isCustom);if(!isCustom)setModel(e.target.value);}}>
      {parentModels.map(item=><option key={item.id} value={item.id}>{item.name}{item.id===defaultParentModel?t(' — mặc định',' — default'):t('','')}</option>)}
      <option value="custom">{t('Nhập model Gemini khác…','Enter another Gemini model…')}</option>
    </select>
    {custom&&<><label htmlFor="parent-ai-custom-model">{t('Model ID Gemini','Gemini model ID')}</label><Input id="parent-ai-custom-model" disabled={checking} value={model} maxLength={100} spellCheck={false} onChange={e=>setModel(e.target.value)} placeholder="gemini-…"/></>}
    <label><input type="checkbox" checked={remember} disabled={checking} onChange={e=>setRemember(e.target.checked)}/> {t('Nhớ key trên máy này','Remember the key on this device')}</label>
    <small>{t('Chỉ nhớ trên máy này. Bỏ chọn nếu dùng chung máy.','Remembered only on this device. Leave unchecked when sharing a device.')}</small>
    <div className="row-wrap">
      <Button disabled={checking} onClick={()=>{setFailure(null);try{configureParentAi({key:key.trim(),model:model.trim()},remember);setMessage(t('Đã lưu cấu hình Gemini. Chọn ảnh rồi bấm Phân tích ảnh bằng AI.','Gemini configured. Choose a photo and press Analyse photo with AI.'));}catch{setMessage(t('Chưa lưu được. Kiểm lại mã từ Google AI Studio và thử lại nhé.','Could not save. Check your Google AI Studio key and retry.'));}}}><Save data-icon="inline-start" aria-hidden="true"/>{t('Lưu cấu hình AI','Save AI settings')}</Button>
      <Button variant="outline" disabled={checking||!key.trim()} onClick={()=>void check()}><KeyRound data-icon="inline-start" aria-hidden="true"/>{checking?t('Đang kiểm tra…','Checking…'):t('Kiểm tra key và model (không gửi ảnh)','Check key and model (no photo sent)')}</Button>
      <Button variant="outline" disabled={checking||!key.trim()} onClick={()=>void check(true)}>{t('Thử câu mẫu (không gửi ảnh)','Test sample prompt (no photo)')}</Button>
    </div>
    <small>{t('Chỉ gửi một câu ngắn để thử. Google có thể tính phí nếu tài khoản AI của bạn đã bật thanh toán.','Sends only a short sample prompt. Google may charge if billing is enabled on your AI account.')}</small>
    </div></details>
    <OperationStatus busy={checking} title={checking?t('Đang chờ Google kiểm tra key và model…','Waiting for Google to check the key and model…'):t('Kết quả kiểm tra AI','AI check result')} message={message} error={!!failure}/>{failure&&<AiFailureDetails details={failure}/>}
    <details className="ai-data-note"><summary>{t('Dữ liệu gửi Google và điều kiện sử dụng','Google data use and eligibility')}</summary><p>{t('Google có thể dùng nội dung gửi miễn phí để cải thiện sản phẩm. Cắt bỏ thông tin riêng trước khi gửi. Điều khoản Google hạn chế ứng dụng dành cho hoặc dễ được người dưới 18 tuổi truy cập; dùng tài khoản người dùng không bỏ được hạn chế này.','Google may use content sent without charge to improve its products. Crop private details before sending. Google terms restrict apps directed toward or likely accessed by under-18s; using a personal account does not remove this restriction.')} <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">{t('Điều khoản Google','Google terms')}</a></p></details>
  </section>;
}

export function AiFailureDetails({details}:{details:AiFailure}){const {t}=useApp();const message=details.http===429?t('Google đang bận hoặc đã hết lượt đọc. Thử lại sau; có thể chép bài bằng tay.','Google is busy or the reading allowance is used up. Retry later or type the lesson.'):details.http===401||details.http===403?t('Tài khoản Google AI này chưa dùng được. Kiểm lại trong tùy chọn AI của bạn, hoặc chép bài bằng tay.','This Google AI account is unavailable. Check AI options or type the lesson.'):t('Chưa đọc được bài này. Thử ảnh khác hoặc chép bài bằng tay; nháp vẫn còn.','Could not read this lesson. Try another photo or type it; your draft is kept.');return <p className="ai-error-details">{message}</p>;}
