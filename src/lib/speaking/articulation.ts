/** Curated broad US sound practice; Vietnamese spelling is only a memory aid. */
const tips:Record<string,string>={
 'æ':'Mở miệng rộng, lưỡi thấp và phía trước. Nói âm giữa “a” và “e”; đừng khép miệng thành “e”.',
 'p':'Khép hai môi, rồi bật hơi nhẹ. Không chạm răng vào môi và không kéo thành âm “ph”.',
 'b':'Khép hai môi rồi bật ra, cổ họng rung. Đừng thêm “ờ” sau âm cuối.',
 't':'Chạm đầu lưỡi vào nướu sau răng trên rồi nhả ra. Không thêm “ờ” ở cuối.',
 'd':'Chạm đầu lưỡi vào nướu sau răng trên rồi nhả ra, cổ họng rung.',
 'k':'Nâng phần sau lưỡi chạm vòm miệng rồi bật hơi. Giữ âm cuối ngắn, không thêm “ờ”.',
 'g':'Nâng phần sau lưỡi rồi nhả ra, cổ họng rung.',
 'ɡ':'Nâng phần sau lưỡi rồi nhả ra, cổ họng rung.',
 'l':'Đầu lưỡi chạm nướu sau răng trên, hơi đi hai bên lưỡi. Đừng đổi thành “n”.',
 'ə':'Thả lỏng miệng, nói “ờ” thật nhẹ và ngắn; không nhấn mạnh âm này.',
 'ʌ':'Mở miệng vừa, lưỡi ở giữa, nói âm ngắn gần “â”.',
 'ɛ':'Mở miệng vừa, lưỡi phía trước. Nói âm “e” ngắn, không kéo thành “ê”.',
 'ɪ':'Thả lỏng môi, nói âm ngắn gần “i”; không kéo dài như “ii”.',
 'i':'Đưa lưỡi lên cao phía trước, môi hơi mở ngang, giữ âm “ii”.',
 'ʊ':'Môi tròn nhẹ, lưỡi thả lỏng, âm ngắn giữa “u” và “ô”.',
 'u':'Tròn môi và đưa lưỡi cao về sau, giữ âm “uu”.',
 'ɑ':'Mở miệng rộng, lưỡi thấp về sau, nói “a” thoáng.',
 'ɔ':'Tròn môi, lưỡi thấp về sau, nói âm gần “o”.',
 'eɪ':'Bắt đầu gần “ê”, trượt nhẹ sang “i” trong cùng một âm.',
 'aɪ':'Bắt đầu “a”, trượt sang “i”, không tách thành hai tiếng.',
 'oʊ':'Bắt đầu gần “ô”, tròn môi hơn và trượt về “u”.',
 'aʊ':'Bắt đầu “a”, tròn môi trượt sang “u”.',
 'ɔɪ':'Bắt đầu gần “o”, trượt sang “i”.',
 'ɝ':'Cong nhẹ đầu lưỡi về sau, không chạm vòm miệng; môi hơi tròn.',
 'ɚ':'Cong nhẹ lưỡi như âm r Mỹ nhưng nói nhẹ, không nhấn.',
 'r':'Cong nhẹ đầu lưỡi về sau, không chạm nướu và không rung lưỡi.',
 'ɹ':'Cong nhẹ đầu lưỡi về sau, không chạm nướu và không rung lưỡi.',
 'f':'Răng trên chạm nhẹ môi dưới, thổi hơi đều; cổ họng không rung.',
 'v':'Răng trên chạm nhẹ môi dưới, thổi hơi và cho cổ họng rung.',
 'θ':'Đặt đầu lưỡi nhẹ giữa hai hàm răng, thổi hơi. Đừng đổi thành “t” hay “s”.',
 'ð':'Đặt đầu lưỡi nhẹ giữa hai hàm răng, thổi hơi và cho cổ họng rung.',
 's':'Đưa lưỡi gần nướu nhưng không chạm, thổi hơi mảnh như “s”.',
 'z':'Giữ miệng như âm s nhưng cho cổ họng rung.',
 'ʃ':'Môi hơi tròn, đầu lưỡi gần phía sau nướu; thổi “sh” nhẹ.',
 'ʒ':'Giữ miệng như âm sh nhưng cho cổ họng rung.',
 'tʃ':'Bắt đầu như t rồi nhả thành sh trong một âm, gần “ch”.',
 'dʒ':'Bắt đầu như d rồi nhả thành âm zh, cổ họng rung.',
 'm':'Khép môi và cho hơi đi qua mũi, cổ họng rung.',
 'n':'Đầu lưỡi chạm nướu, cho hơi đi qua mũi.',
 'ŋ':'Phần sau lưỡi chạm vòm miệng, hơi qua mũi, gần “ng”; không thêm g.',
 'h':'Mở miệng và thở hơi nhẹ, không ép cổ họng.',
 'w':'Tròn môi như “u” rồi mở nhanh sang âm kế tiếp.',
 'j':'Đưa lưỡi gần vị trí “i” rồi trượt nhanh sang âm kế tiếp.',
};
export function articulation(phone:string){return tips[phone]??'Nghe mẫu, tập âm này chậm rồi nối vào từ. Máy chưa có hướng dẫn riêng cho âm này.';}
export const insertionAdvice='Con nghe mẫu rồi nối các âm trong từ, không thêm tiếng “ờ” hay tiếng khác trước hoặc sau âm nhé.';
export function practiceTip(phone:string,index:number,reference:string[],kind:'retry'|'incorrect'|'missing',heard:string|null){
 const final=index===reference.length-1;
 const stops:Record<string,string>={p:'Khép hai môi',b:'Khép hai môi',t:'Chạm đầu lưỡi vào nướu sau răng trên',d:'Chạm đầu lưỡi vào nướu sau răng trên',k:'Nâng phần sau lưỡi chạm vòm miệng',g:'Nâng phần sau lưỡi chạm vòm miệng'};
 const normalized=phone==='ɡ'?'g':phone;
 const tip=final&&stops[normalized]?`${stops[normalized]} để kết thúc âm. Không cần bật mạnh và đừng thêm “ờ”.`:stops[normalized]&&reference[index-1]==='s'?`${stops[normalized]} rồi nối nhẹ sang âm sau; không cần cố bật hơi mạnh.`:articulation(phone);
 return `${kind==='missing'?'Con thử thêm âm này vào đúng chỗ. ':heard?`Con đang luyện chuyển từ /${heard}/ sang /${phone}/. `:''}${tip}`;
}
const hints:Record<string,string>={apple:'áp-pồ',cat:'két',book:'búc',cup:'cấp',dog:'đo-g',family:'fa-mờ-li',they:'đây',who:'huu',snowy:'snâu-i',nut:'nất'};
export function approximateReading(word:string,saved?:string){return saved?.trim()||hints[word.toLowerCase()]||null;}

/** A bounded spelling aid, never a claim of Vietnamese/English sound equivalence. */
export function approximateIpaReading(ipa:string){
 const sounds:Record<string,string>={'tʃ':'ch','dʒ':'j','eɪ':'ây','aɪ':'ai','aʊ':'ao','oʊ':'âu','əʊ':'âu','ɔɪ':'oi','ɝ':'ơr','ɚ':'ờr','ɜ':'ơr','æ':'a-e','ə':'ờ','ʌ':'â','ɪ':'i','i':'i','ɛ':'e','e':'e','ʊ':'u','u':'u','ɒ':'o','ɔ':'o','ɑ':'a','θ':'th','ð':'đ','ʃ':'sh','ʒ':'zh','ŋ':'ng','ɹ':'r','ɡ':'g','j':'y'};
 const cleaned=ipa.replace(/[\/ˈˌːˑ]/g,'').replace(/\./g,'-');let hint='';
 for(let i=0;i<cleaned.length;){const pair=cleaned.slice(i,i+2),single=cleaned[i];if(sounds[pair]){hint+=sounds[pair];i+=2;}else if(sounds[single]){hint+=sounds[single];i++;}else if(/[a-z -]/.test(single)){hint+=single;i++;}else return null;}
 return hint.trim()||null;
}
