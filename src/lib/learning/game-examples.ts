import type {GameActivity} from './game-activity';
// Project-authored review suggestions, never automatically inserted into a library.
const sentences:[string,string,string,string[],string,string][]=[
 ['I ___ happy.','am','I am happy.',['am','is','are'],'Mình vui.','I đi với am.'],
 ['She ___ kind.','is','She is kind.',['is','am','are'],'Bạn ấy tốt bụng.','She đi với is.'],
 ['He ___ tall.','is','He is tall.',['is','am','are'],'Bạn ấy cao.','He đi với is.'],
 ['They ___ here.','are','They are here.',['are','is','am'],'Họ ở đây.','They đi với are.'],
 ['We ___ ready.','are','We are ready.',['are','is','am'],'Chúng mình sẵn sàng.','We đi với are.'],
 ['It ___ red.','is','It is red.',['is','am','are'],'Nó màu đỏ.','It đi với is.'],
 ['This ___ a book.','is','This is a book.',['is','am','are'],'Đây là một quyển sách.','This chỉ một vật, đi với is.'],
 ['These ___ books.','are','These are books.',['are','is','am'],'Đây là những quyển sách.','These chỉ nhiều vật, đi với are.'],
 ['I ___ a pen.','have','I have a pen.',['have','has','is'],'Mình có một cây bút.','I đi với have khi nói mình có gì.'],
 ['She ___ a bag.','has','She has a bag.',['has','have','are'],'Bạn ấy có một chiếc cặp.','She đi với has khi nói bạn ấy có gì.'],
 ['He can ___.','swim','He can swim.',['swim','swims','swimming'],'Bạn ấy có thể bơi.','Sau can dùng động từ nguyên mẫu.'],
 ['It is ___ apple.','an','It is an apple.',['an','a','are'],'Đó là một quả táo.','Apple bắt đầu bằng một nguyên âm khi đọc, dùng an.'],
];
export const sampleWords=['apple','cat','dog','book','bag','pen','pencil','banana','bird','car','chair','fish'] as const;
export const clozeExamples:GameActivity[]=sentences.map(([prompt,answer,solution,options,translation,explanation])=>({version:1,kind:'grammar-cloze',prompt,answer,solution,options,translation,explanation}));
export const repairExamples:GameActivity[]=sentences.slice(0,8).map(([prompt,answer,solution,options,translation,explanation])=>({version:1,kind:'grammar-repair',prompt:prompt.replace('___',options[1]),answer,solution,options,translation,explanation,slot:prompt.split(' ').indexOf('___')}));
// A single familiar picture grounds every starter question. Four yes / four no.
const dialogues:[string,string,string,string,string][]=[
 ['cat','con mèo','Is it a cat?','Đây có phải là con mèo không?','Yes, it is.'],
 ['book','quyển sách','Is it a cat?','Đây có phải là con mèo không?',"No, it isn't."],
 ['dog','con chó','Is it a dog?','Đây có phải là con chó không?','Yes, it is.'],
 ['apple','quả táo','Is it a banana?','Đây có phải là quả chuối không?',"No, it isn't."],
 ['bag','chiếc cặp','Is it a bag?','Đây có phải là chiếc cặp không?','Yes, it is.'],
 ['banana','quả chuối','Is it an apple?','Đây có phải là quả táo không?',"No, it isn't."],
 ['fish','con cá','Is it a fish?','Đây có phải là con cá không?','Yes, it is.'],
 ['chair','chiếc ghế','Is it a book?','Đây có phải là quyển sách không?',"No, it isn't."],
];
export const dialogueScenes=dialogues.map(([art,label,,meaning])=>({art,label:`Một ${label}`,meaning}));
export const dialogueExamples:GameActivity[]=dialogues.map(([,label,prompt,,answer])=>({
 version:1,kind:'grammar-dialogue',context:`Con nhìn thấy một ${label}.`,prompt,answer,solution:answer,
 options:[answer,answer==='Yes, it is.'?"No, it isn't.":'Yes, it is.'],
 translation:answer==='Yes, it is.'?'Đúng rồi.':'Không phải.',
 explanation:answer==='Yes, it is.'?`Hình là ${label}, đúng với câu Cáo hỏi. Con đáp Yes, it is. (Đúng rồi.)`:`Hình là ${label}, khác với điều Cáo hỏi. Con đáp No, it isn't. (Không phải.)`,
}));
export const gameExamples=[...clozeExamples,...repairExamples,...dialogueExamples];
