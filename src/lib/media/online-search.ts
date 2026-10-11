import {illustrationWord} from './dictionary-art';
import catalogue from './online-illustrations.json';
export function onlineIllustration(word:string,pos:string,definition:string){
 const query=illustrationWord(word);
 // An illustration must describe the selected sense. Abstract meanings need a curated symbol.
 if(!['noun','danh từ'].includes(pos.trim().toLowerCase()))return null;
 const terms=definition.toLowerCase().match(/[a-z]+/g)??[];
 const scored=catalogue.map(item=>{const name=item.word.toLowerCase(),tags=item.tags.split(/[, ]+/);const exact=name===query?100:name.split(/[ -]+/).includes(query)?60:tags.includes(query)?40:0;return {item,score:exact?exact+Math.min(15,terms.filter(t=>t.length>3&&(name.includes(t)||tags.includes(t))).length*3):0};}).filter(row=>row.score>=40).sort((a,b)=>b.score-a.score||a.item.id.localeCompare(b.item.id));
 const best=scored[0];return best?{art:`online-openmoji-${best.item.id}`,label:best.item.word,credit:`OpenMoji · ${best.item.author}`,sourceUrl:`https://github.com/hfg-gmuend/openmoji/blob/17.0.0/color/svg/${best.item.id}.svg`,license:'CC BY-SA 4.0'}:null;
}
