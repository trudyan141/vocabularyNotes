import type {LearningContent} from '@/data/local/content';
import type {LibraryWord} from '@/data/local/types';
export type PreparedPattern={key:string;content:Omit<LearningContent,'senseId'|'targetRevision'>};
export function objectPatterns(word:Pick<LibraryWord,'word'|'pos'> & {vi?:string}):PreparedPattern[]{
 // Only concrete, singular, countable objects; do not guess countability from arbitrary nouns.
 const nouns=['book','pencil','pen','chair','table','car','ball','box','jar','shelf','apple','egg','eraser','bag','cat','dog'];
 const noun=word.word.toLowerCase();if(!['noun','danh từ'].includes(word.pos)||!nouns.includes(noun))return [];
 const article=/^(apple|egg|eraser)$/.test(noun)?'an':'a';const answer=`It's ${article} ${noun}.`;
 const labels:Record<string,string>={book:'quyển sách',pencil:'bút chì',pen:'bút mực',chair:'cái ghế',table:'cái bàn',car:'chiếc xe',ball:'quả bóng',box:'cái hộp',jar:'cái lọ',shelf:'cái kệ',apple:'quả táo',egg:'quả trứng',eraser:'cục tẩy',bag:'cái cặp',cat:'con mèo',dog:'con chó'};const label=word.vi||labels[noun];
 const common={approved:true as const,origin:'user' as const,readingHintVi:'',source:'Mẫu học do dự án chuẩn bị; phụ huynh duyệt. Không phải chữ trích nguyên văn từ ảnh.'};
 return [{key:'what-is-it',content:{...common,example:`What is it? ${answer}`,exampleVi:`Đó là gì? Đó là một ${label}.`,pattern:"What is it? → It's a/an + noun.",patternExplanation:'Hỏi tên một đồ vật hoặc con vật. It’s là cách viết ngắn của It is (đó là).',grammarTitle:'Hỏi và gọi tên: What is it?',conditions:'Dùng khi hỏi một vật/con vật là gì. Nói a/an trước danh từ đếm được số ít. Chọn a/an theo âm đầu: a book, an apple.',formula:"What + is + it? → It is / It's + a/an + danh từ số ít.",analysis:`What hỏi “gì”; is đứng trước it trong câu hỏi. ${answer} dùng ${article} trước ${noun}. It’s = It is.`,commonError:'What it is? / It’s book.',correction:`What is it? / ${answer}`}},
 {key:'is-it',content:{...common,example:`Is it ${article} ${noun}? Yes, it is.`,exampleVi:`Đó có phải là một ${label} không? Đúng rồi.`,pattern:'Is it a/an + noun? → Yes, it is. / No, it isn’t.',patternExplanation:'Dùng khi đoán tên một vật/con vật và muốn biết mình đoán đúng không.',grammarTitle:'Đoán và xác nhận: Is it …?',conditions:'Hỏi có/không về một vật/con vật. Nếu đúng, nói Yes, it is. Nếu sai, nói No, it isn’t.',formula:'Is + it + a/an + danh từ số ít? → Yes, it is. / No, it is not (isn’t).',analysis:`Is đứng trước it để hỏi. Trong câu trả lời ngắn “Yes, it is.”, giữ nguyên is; không rút thành “Yes, it’s.”.`,commonError:'It is a book? / Yes, it’s.',correction:`Is it ${article} ${noun}? / Yes, it is.`}}];
}

/** Evidence is a literal substring of the reviewed transcript, never a generated quote. */
export function worksheetPatterns(word:Pick<LibraryWord,'word'|'pos'> & {vi?:string},text:string):PreparedPattern[]{
 const patterns=objectPatterns(word);if(!patterns.length)return [];
 const noun=word.word.toLowerCase(); // Whitelist in objectPatterns makes interpolation literal-safe.
 const question=text.match(/\bwhat\s+is\s+it\s*\?/i)?.[0];
 const guess=text.match(new RegExp(`\\bis\\s+it\\s+(?:a|an)\\s+${noun}\\s*\\?`,'i'))?.[0];
 const answer=text.match(new RegExp(`\\bit(?:\\s+is|['’]s)\\s+(?:a|an)\\s+${noun}\\b\\s*[.!?]?`,'i'))?.[0];
 return patterns.map(item=>{const evidence=(item.key==='what-is-it'?[question,answer]:[guess]).filter(Boolean).join(' ');
 return evidence?{...item,content:{...item.content,sourceEvidenceText:evidence,source:'Mục “Chữ gốc trên ảnh” giữ trích đoạn từ nội dung đã đọc; bản dịch, công thức, giải thích và ví dụ học thêm do dự án bổ sung, phụ huynh kiểm lại.'}}:item;});
}
