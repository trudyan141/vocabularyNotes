import {preparedSentenceIpa} from '/offline-prepared-ipa.js';
export function readingGuide(text,pronunciations=[]){
 const rows=pronunciations.filter(p=>p.text===text&&p.ipa&&p.approvedContentVersion===p.contentVersion);
 if(rows.length)return rows.map(p=>p.ipa+(p.verified?'':' · Tham khảo')+(p.accent!=='other'?' · '+p.accent:'')).join(' · ');
 return preparedSentenceIpa[text]?preparedSentenceIpa[text]+' · Tham khảo · US':'';
}
