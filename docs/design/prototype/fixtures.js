/* Prepared illustrative content. Nothing here was extracted by a live model. */
WFK.entry=function(id,word,vi,en,example,exampleVi,art,lesson) {
  return {id,word,vi,en,example,exampleVi,art,lesson,pos:'danh từ',sense:id,ready:!!art,source:'Dữ liệu minh họa được chuẩn bị sẵn'};
};
const make=WFK.entry;
WFK.seed=[
  make('apple','apple','quả táo','A round fruit that grows on a tree.','I eat an apple.','Tôi ăn một quả táo.','apple','food'),
  make('banana','banana','quả chuối','A long fruit with yellow skin.','I like bananas.','Tôi thích chuối.','banana','food'),
  make('grapes','grapes','quả nho','Small fruits that grow in a bunch.','The grapes are purple.','Những quả nho có màu tím.','grapes','food'),
  make('orange','orange','quả cam','A round fruit with orange skin.','This is an orange.','Đây là một quả cam.','orange','food'),
  make('milk','milk','sữa','A white drink that comes from animals such as cows.','I drink milk.','Tôi uống sữa.','milk','food'),
  make('bread','bread','bánh mì','A food made from flour and water.','I eat bread.','Tôi ăn bánh mì.','bread','food'),
  make('water','water','nước','A clear liquid that we drink.','I drink water.','Tôi uống nước.','water','food'),
  make('egg','egg','quả trứng','A round or oval thing laid by a bird.','This is an egg.','Đây là một quả trứng.','egg','food'),
  make('book','book','quyển sách','Pages joined together for reading.','This is a book.','Đây là một quyển sách.','book','school'),
  make('bag','bag','cái cặp','Something used to carry things.','My book is in my bag.','Sách của tôi ở trong cặp.','bag','school'),
  make('pen','pen','bút mực','A tool that writes with ink.','This is my pen.','Đây là bút mực của tôi.','pen','school'),
  make('cat','cat','con mèo','A small animal with fur and whiskers.','I see a cat.','Tôi thấy một con mèo.','cat','school'),
  make('dog','dog','con chó','An animal often kept as a pet.','The dog can run.','Con chó có thể chạy.','dog','school'),
  make('fish','fish','con cá','An animal that lives in water.','The fish can swim.','Con cá có thể bơi.','fish','school'),
  make('tree','tree','cây','A tall plant with a trunk and branches.','The tree is tall.','Cái cây cao.','tree','school'),
  make('bird','bird','con chim','An animal with feathers and wings.','I see a bird.','Tôi thấy một con chim.','bird','school'),
  make('sun','sun','mặt trời','The star that gives Earth light and warmth.','The sun is bright.','Mặt trời sáng rực.','sun','school'),
  make('car','car','xe ô tô','A vehicle with wheels that carries people.','This car is small.','Chiếc ô tô này nhỏ.','car','school'),
  make('bank-money','bank','ngân hàng','A place that keeps money for people.','We go to the bank.','Chúng tôi đến ngân hàng.',null,'school'),
  make('bank-river','bank','bờ sông — phần đất dọc theo mép dòng sông, nơi bạn có thể đứng nhìn nước chảy','The land along the side of a river.','We sit on the river bank.','Chúng tôi ngồi trên bờ sông.',null,'school')
];
WFK.capture=[
  make('pencil','pencil','bút chì','A tool used for writing or drawing.','This is a pencil.','Đây là một cây bút chì.','pencil','objects'),
  ...WFK.seed.filter(x=>['book','bag','pen'].includes(x.id)),
  make('ruler','ruler','thước kẻ','A tool used to measure or draw straight lines.','This is a ruler.','Đây là một cái thước kẻ.','ruler','objects'),
  make('scissors','scissors','cái kéo','A tool with two blades used for cutting.','I cut paper with scissors.','Tôi cắt giấy bằng kéo.','scissors','objects'),
  make('glue','glue','keo dán','Something used to stick things together.','I use glue.','Tôi dùng keo dán.','glue','objects'),
  make('desk','desk','bàn học','A table used for working or studying.','My book is on the desk.','Sách của tôi ở trên bàn học.','desk','objects'),
  make('chair','chair','cái ghế','A seat for one person.','This is a chair.','Đây là một cái ghế.','chair','objects'),
  make('notebook','notebook','vở','A book of pages used for writing notes.','I write in my notebook.','Tôi viết vào vở của mình.','notebook','objects'),
  make('eraser','eraser','cục tẩy','A tool used to remove pencil marks.','This is an eraser.','Đây là một cục tẩy.','eraser','objects')
];
WFK.candidates=()=>WFK.capture.map(e=>({...e,text:e.id==='eraser'?'erqser':e.word,selected:e.id!=='eraser',uncertain:e.id==='eraser',existing:['book','bag','pen'].includes(e.id)}));
WFK.patterns=[
  {en:'This is a pencil.',vi:'Đây là một cây bút chì.',source:'Dữ liệu minh họa trên bài'},
  {en:'This is a book.',vi:'Đây là một quyển sách.',source:'Dữ liệu minh họa trên bài'}
];
WFK.norm=t=>t.trim().normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/g,' ');
WFK.key=e=>WFK.norm(e.word)+'|noun|'+e.sense;
WFK.searchText=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
