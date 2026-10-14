import {ParentAiError} from '@/lib/ai/byok';
export type SpeakingFailureCode='recording'|'network'|'timeout'|'json'|'schema'|'incomplete'|'blocked'|'response';
/** Fixed diagnostic codes only; never retain provider text, audio, keys or transcripts. */
export class SpeakingAssessmentError extends Error{
 constructor(public code:SpeakingFailureCode){super(code==='recording'?'recording':'response');}
}
export function speakingFailureMessage(error:unknown,t:(vi:string,en:string)=>string):string{
 if(error instanceof ParentAiError){
  if(error.code==='quota')return t('Hết lượt chấm miễn phí. Con nghe lại và thử sau nhé.','Free grading limit reached. Listen again and try later.');
  if(error.code==='missing-key')return t('Bật Gemini trong Cài đặt để chấm phát âm nhé.','Enable Gemini in Settings for pronunciation feedback.');
  if(error.code==='access')return t('Gemini từ chối key chấm phát âm. Kiểm tra key trong Cài đặt nhé.','Gemini rejected the grading key. Check the key in Settings.');
  return t('Gemini đang báo lỗi dịch vụ. Bản thu vẫn nghe lại được; thử chấm sau nhé. [SP-PROVIDER]','Gemini returned a service error. You can still replay the recording; try grading later. [SP-PROVIDER]');
 }
 if(error instanceof SpeakingAssessmentError){
  switch(error.code){
   case 'recording':return t('Bản thu quá ngắn, quá dài hoặc không đúng định dạng để chấm. Con thử nói lại nhé. [SP-RECORDING]','The recording is too short, too long or in an unsupported format. Try recording again. [SP-RECORDING]');
   case 'network':return t('Không kết nối được với Gemini để chấm. Kiểm tra mạng rồi thử lại; bản thu vẫn nghe được. [SP-NETWORK]','Could not connect to Gemini. Check your connection and try again; replay still works. [SP-NETWORK]');
   case 'timeout':return t('Gemini chưa trả kết quả sau 6 giây. Con có thể nghe lại rồi thử sau. [SP-TIMEOUT]','Gemini did not respond within 6 seconds. Listen back and try later. [SP-TIMEOUT]');
   case 'json':return t('Gemini trả kết quả không đọc được; lượt này tạm 0 điểm. Đây là lỗi chấm, không phải con đọc sai. [SP-JSON]','Gemini returned an unreadable result, so this attempt has a temporary zero. This is a grading error, not a pronunciation error. [SP-JSON]');
   case 'schema':return t('Kết quả Gemini không khớp mẫu âm cần chấm; lượt này tạm 0 điểm. Đây là lỗi chấm, không phải con đọc sai. [SP-SCHEMA]','Gemini’s result does not match the required sound reference. This is a grading error, not a pronunciation error. [SP-SCHEMA]');
   case 'incomplete':return t('Gemini trả kết quả bị cắt dở; lượt này tạm 0 điểm. Con có thể nghe lại rồi thử sau. [SP-INCOMPLETE]','Gemini returned an incomplete result. Listen back and try later. [SP-INCOMPLETE]');
   case 'blocked':return t('Gemini từ chối xử lý bản thu này; lượt này tạm 0 điểm. Con vẫn nghe lại được. [SP-BLOCKED]','Gemini declined to process this recording. Replay still works. [SP-BLOCKED]');
   case 'response':return t('Gemini không trả dữ liệu chấm có thể dùng được. Bản thu vẫn nghe lại được. [SP-RESPONSE]','Gemini returned no usable grading data. Replay still works. [SP-RESPONSE]');
  }
 }
 if(error instanceof Error&&error.message==='unknown')return t('Chưa có âm mẫu chắc chắn cho từ này. Con vẫn nghe và thu lại được.','No reliable reference for this word. Listening and recording still work.');
 return t('Chưa chấm được do lỗi xử lý. Bản thu vẫn nghe lại được. [SP-UNKNOWN]','A processing error prevented grading. Replay still works. [SP-UNKNOWN]');
}
