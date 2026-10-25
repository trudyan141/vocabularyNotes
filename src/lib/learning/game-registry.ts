import {z} from 'zod';
export const gameModes=['flashcard','picture-word','word-picture','letters','spelling','missing-letters','grammar','grammar-card','match-pairs','memory-pairs','word-builder','grammar-cloze','grammar-repair','grammar-dialogue'] as const;
export const modeSchema=z.enum(gameModes);
export const expansionModes=['match-pairs','memory-pairs','word-builder','grammar-cloze','grammar-repair','grammar-dialogue'] as const;
export type ExpansionMode=typeof expansionModes[number];
export const isExpansion=(mode:string):mode is ExpansionMode=>expansionModes.some(value=>value===mode);
export const isPairGame=(mode:string)=>mode==='match-pairs'||mode==='memory-pairs';
export const isGrammarGame=(mode:string)=>mode==='grammar'||mode==='grammar-card'||mode.startsWith('grammar-');
export const gameRegistry={
 'match-pairs':{vi:'Nối đôi',en:'Match pairs',helpVi:'Chạm hình rồi chạm từ để ghép đôi',helpEn:'Tap a picture, then its word',requirement:'Cần ít nhất 2 hình khác nhau đã duyệt trong phạm vi này.',requirementEn:'This selection needs at least two distinct approved pictures.',art:'apple'},
 'memory-pairs':{vi:'Lật thẻ tìm bạn',en:'Memory pairs',helpVi:'Lật thẻ, tìm hình và từ cùng nghĩa',helpEn:'Turn cards to match pictures and words',requirement:'Cần ít nhất 2 hình khác nhau đã duyệt trong phạm vi này.',requirementEn:'This selection needs at least two distinct approved pictures.',art:'cat'},
 'word-builder':{vi:'Xưởng xếp chữ',en:'Word workshop',helpVi:'Chạm chữ để xếp cả từ; chạm lại để trả chữ',helpEn:'Build a word; tap a letter to return it',requirement:'Cần từ đã duyệt dài 2–8 chữ cái.',requirementEn:'This selection needs approved words with 2–8 letters.',art:'pencil'},
 'grammar-cloze':{vi:'Câu thiếu mảnh',en:'Complete the sentence',helpVi:'Chọn mảnh để hoàn thành câu',helpEn:'Choose a piece to complete the sentence',requirement:'Chưa mở được bài chơi. Thử lại nhé.',requirementEn:'Could not open the activity. Please retry.',art:'notebook'},
 'grammar-repair':{vi:'Bác sĩ câu',en:'Fix the sentence',helpVi:'Tìm mảnh sai rồi chọn mảnh thay thế',helpEn:'Find and replace the incorrect piece',requirement:'Chưa mở được bài chơi. Thử lại nhé.',requirementEn:'Could not open the activity. Please retry.',art:'book'},
 'grammar-dialogue':{vi:'Trả lời Cáo',en:'Answer Fox',helpVi:'Nghe câu hỏi, chọn lời đáp phù hợp',helpEn:'Listen and choose a reply',requirement:'Chưa mở được bài chơi. Thử lại nhé.',requirementEn:'Could not open the activity. Please retry.',art:'cat'},
} as const;
