/** Explain observable language features, never infer a CEFR certificate from tokens. */
export type LevelFeature={quote:string;vi:string;en:string};
const rules:{pattern:RegExp;vi:string;en:string}[]=[
 {pattern:/\b(?:although|even though|even if|even when|despite|in spite of)\b[^.!?;]*/i,vi:'Cụm này đưa vào một trở ngại hoặc điều trái với kỳ vọng. Khi nói, cần làm rõ quan hệ giữa hai ý, thay vì chỉ nối thêm thông tin.',en:'This phrase introduces an obstacle or an unexpected contrast. Make the relationship between the ideas clear.'},
 {pattern:/\b(?:however|nevertheless|whereas)\b[^.!?;]*/i,vi:'Phần này chuyển sang một ý đối chiếu. Người học luyện trình bày hai phía và chọn cách nhấn ý phù hợp.',en:'This introduces a contrasting point. Practise presenting both sides and choosing what to emphasise.'},
 {pattern:/\bbut\s+(?:I|you|he|she|it|we|they|the|my|our|there)\b[^.!?;]+|,\s*yet\s+[^.!?;]+/i,vi:'Phần này nối hai ý tương phản. Người học cần hiểu ý trước và ý sau để ngắt giọng, nhấn đúng điểm đối lập.',en:'This links contrasting ideas. Understand both parts to pause and emphasise the contrast.'},
 {pattern:/\b(?:because|in order to|so that)\s+[^.!?;]+/i,vi:'Phần này bổ sung lý do hoặc mục đích. Điểm luyện là giải thích vì sao làm việc đó, phát triển một ý thành thông tin có liên kết.',en:'This adds a reason or purpose. Practise explaining why something happens and connecting information.'},
 {pattern:/\b(?:therefore|as a result|consequently|which means)\b[^.!?;]*/i,vi:'Phần này nêu hệ quả. Người học luyện theo dõi mối liên hệ giữa nguyên nhân và kết quả để trình bày lập luận rõ hơn.',en:'This gives a consequence. Follow the cause and effect to present a clearer argument.'},
 {pattern:/\b(?:if|unless|provided that)\s+[^.!?;]+/i,vi:'Phần này đặt một điều kiện. Cần hiểu điều kiện nào làm cho ý còn lại đúng; mức độ khó còn phụ thuộc loại điều kiện và toàn bộ ngữ cảnh.',en:'This sets a condition. Understand when the other idea applies; difficulty depends on the condition and context.'},
 {pattern:/(?<=[a-z,] )(?:who|which|whose)\s+[^.!?;]+/i,vi:'Cụm này bổ sung thông tin về người hoặc sự vật vừa nhắc tới. Người học luyện giữ mạch ý khi phát triển phần mô tả.',en:'This adds information about a person or thing already mentioned. Practise developing a description without losing the main idea.'},
 {pattern:/\b(?:rather than|instead of|compared with|compared to)\s+[^.!?;]+/i,vi:'Phần này đặt các lựa chọn hoặc sự vật cạnh nhau để so sánh. Muốn phát triển thành lập luận sâu hơn, cần giải thích cơ sở hoặc hệ quả của sự lựa chọn.',en:'This compares alternatives or things. A fuller argument also explains the basis or consequences of the choice.'},
 {pattern:/\b(?:might|should|could)\s+[^.!?;]+/i,vi:'Cụm có động từ tình thái giúp diễn đạt khả năng, lời khuyên hoặc lựa chọn theo ngữ cảnh. Cần chú ý sắc thái, thay vì đọc như một khẳng định chắc chắn.',en:'The modal phrase can express possibility, advice or a choice in context. Pay attention to its nuance.'},
 {pattern:/\bwithout\s+[a-z]+ing\b[^.!?;]*/i,vi:'Cụm without + V-ing bổ sung điều không xảy ra cùng hành động chính. Người học luyện nối hành động với điều kiện thực hiện.',en:'Without + -ing adds what does not happen alongside the main action. Practise connecting an action with its circumstances.'},
];
export function explainLevel(texts:readonly string[],baseText?:string){
 const features:LevelFeature[]=[];
 for(const rule of rules){for(const text of texts){const match=rule.pattern.exec(text);if(match){features.push({quote:match[0],vi:rule.vi,en:rule.en});break;}}if(features.length===3)break;}
 const text=texts[0]??'';let addedText:string|null=null;
 if(baseText&&baseText!==text){const base=baseText.replace(/[.!?]+$/,'');if(text.startsWith(base))addedText=text.slice(base.length).replace(/^[\s,;:]+/,'');}
 return {features,addedText};
}
