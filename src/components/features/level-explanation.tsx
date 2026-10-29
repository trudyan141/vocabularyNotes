'use client';
import {useApp} from '@/components/app/provider';
import {explainLevel} from '@/lib/learning/level-explanation';

/** Derived on read: existing content, edits and shared libraries need no backfill or AI call. */
export function LevelExplanation({level,text,examples,baseText,usageVi,differenceVi,expression,relation}:{level:'B1'|'B2';text:string;examples?:readonly string[];baseText?:string;usageVi?:string;differenceVi?:string;expression?:string;relation?:string}){
 const {t}=useApp();const {features,addedText}=explainLevel(examples??[text],baseText);
 return <details className="level-explanation"><summary>{t(`Vì sao luyện ở mức ${level}?`,`Why practise at ${level}?`)}</summary><div className="page-flow">
 <p>{level==='B1'?t('Mục tiêu B1: nối các ý về chủ đề quen thuộc, phát triển mô tả và giải thích lý do.','B1 target: connect ideas on familiar topics, develop descriptions and give reasons.'):t('Mục tiêu B2: diễn đạt rõ và chi tiết hơn, giải thích quan điểm, cân nhắc các phía hoặc hệ quả.','B2 target: express clear, detailed ideas, explain viewpoints and consider alternatives or consequences.')}</p>
 {expression&&<><p>{t('Cách dùng đang luyện: ','Expression to practise: ')}<strong lang="en">{expression}</strong></p>{usageVi&&<p>{usageVi}</p>}{relation==='collocation'&&<p>{t('Ở đây luyện cách kết hợp từ trong ngữ cảnh; nhãn mức áp dụng cho cả cách diễn đạt, không tự gán mức mới cho từ gốc.','Practise this word combination in context. The target applies to the expression as a whole; it does not reclassify the original word.')}</p>}</>}
 {features.length>0?<><p><strong>{t('Điểm cần chú ý trong câu','What to notice in the sentence')}</strong></p><ul>{features.map(feature=><li key={feature.quote}><q lang="en">{feature.quote}</q><p>{t(feature.vi,feature.en)}</p></li>)}</ul></>:<p>{t('Phần giải thích hiện chưa chỉ ra được cấu trúc đặc trưng trong câu này. Hãy xem cách dùng và ngữ cảnh bên dưới khi rà lại nhãn mức.','This explanation has not identified a distinctive structure in this sentence. Review the usage and context when checking the target level.')}</p>}
 {baseText&&<p>{t('Câu gốc: ','Original: ')}<q lang="en">{baseText}</q></p>}
 {addedText&&<p>{t('Phần phát triển thêm từ câu gốc: ','Added to the original: ')}<q lang="en">{addedText}</q></p>}
 {differenceVi&&<p>{t('So với nội dung gốc: ','Compared with the original: ')}{differenceVi}</p>}
 <p>{t('Các điểm trên giải thích mục tiêu luyện. Một từ nối, một từ thay thế hoặc độ dài câu riêng lẻ chưa đủ xác nhận mức CEFR; nhãn B1/B2 vẫn cần được rà theo toàn câu và nhiệm vụ.','These points explain the practice target. A connector, replacement word or sentence length alone does not establish a CEFR level; review the whole sentence and task.')}</p>
 </div></details>;
}
