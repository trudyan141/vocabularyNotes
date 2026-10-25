export const adventureGames=[
 {id:'sort-baskets',vi:'Xếp vào giỏ',en:'Sort into baskets',helpVi:'Chọn giỏ đúng với hình',helpEn:'Choose the basket for this picture',category:'words',art:0},
 {id:'listen-bingo',vi:'Bingo nghe từ',en:'Listening bingo',helpVi:'Nghe rồi tìm hết hình trên bảng',helpEn:'Listen and find every picture',category:'words',art:1},
 {id:'word-detective',vi:'Thám tử từ vựng',en:'Word detective',helpVi:'Nghe gợi ý, tìm hình bí mật',helpEn:'Hear the clue, find the picture',category:'words',art:2},
 {id:'sound-hunt',vi:'Săn âm cùng Cáo',en:'Fox sound hunt',helpVi:'Nghe từ mẫu, tìm âm đầu giống nhau',helpEn:'Hear a word, match its first sound',category:'words',art:3},
 {id:'place-object',vi:'Đặt đúng chỗ',en:'Put it in place',helpVi:'Chạm đồ vật rồi chạm chỗ đặt',helpEn:'Tap an object, then its place',category:'grammar',art:4},
 {id:'one-many',vi:'Một hay nhiều?',en:'One or many?',helpVi:'Đếm hình, chọn đúng dạng từ',helpEn:'Count the pictures, choose the word',category:'grammar',art:5},
 {id:'fox-shop',vi:'Cửa hàng của Cáo',en:'Fox shop',helpVi:'Nghe đơn hàng, chọn đủ món cho Cáo',helpEn:'Hear the order, fill Fox’s tray',category:'grammar',art:7},
] as const;
export type AdventureMode=typeof adventureGames[number]['id'];
