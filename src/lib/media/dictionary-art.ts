import illustrations from './open-illustrations.json';
import {readyArt} from './catalog';
export const openIllustrations=illustrations;
export function dictionaryArt(word:string,pos:string,definition:string):string|null{
  const query=word.trim().toLowerCase();
  if(readyArt.has(query))return query;
  const aliases:Record<string,string>={handsome:'man',pretty:'woman',bunny:'rabbit',bike:'bicycle',plane:'airplane',purse:'handbag',schoolbag:'backpack',bag:'backpack',dad:'man',father:'man',mom:'woman',mother:'woman'};
  if(query==='handsome'&&!/man|appearance|attractive/i.test(definition))return null;
  const name=pos==='noun'||aliases[query]?aliases[query]??query:'';
  return illustrations.find(item=>item.word===name)?.id??null;
}
export function artCredit(art:string|null){return illustrations.find(item=>item.id===art);}
