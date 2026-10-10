import illustrations from './open-illustrations.json';
import {readyArt} from './catalog';
export const openIllustrations=illustrations;
export function dictionaryArt(word:string,pos:string,definition:string):string|null{
  const query=word.trim().toLowerCase();
  if(pos==='noun'&&readyArt.has(query))return query;
  const aliases:Record<string,string>={handsome:'man',pretty:'woman',bunny:'rabbit',bike:'bicycle',plane:'airplane',purse:'handbag',schoolbag:'backpack',bag:'backpack',dad:'man',father:'man',mom:'woman',mother:'woman'};
  const appearance=pos==='adjective'&&['handsome','pretty'].includes(query)&&/man|woman|appearance|attractive|beautiful/i.test(definition);
  const name=pos==='noun'||appearance?aliases[query]??query:'';
  return illustrations.find(item=>item.word===name)?.id??null;
}
export function artCredit(art:string|null){return illustrations.find(item=>item.id===art);}
