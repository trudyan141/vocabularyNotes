import online from './online-illustrations.json';
import illustrations from './open-illustrations.json';
import {readyArt} from './catalog';
export const openIllustrations=illustrations;
export function dictionaryArt(word:string,pos:string,definition:string):string|null{
  pos=pos.trim().toLowerCase();
  pos=pos==='danh từ'?'noun':pos==='tính từ'?'adjective':pos;
  const query=illustrationWord(word);
  if(pos==='noun'&&readyArt.has(query))return query;
  const aliases:Record<string,string>={handsome:'man',pretty:'woman',bunny:'rabbit',bike:'bicycle',plane:'airplane',purse:'handbag',schoolbag:'backpack',bag:'backpack',dad:'man',father:'man',mom:'woman',mother:'woman',nut:'chestnut',ball:'basketball',table:'desk',shelves:'shelf'};
  if(pos==='adjective'&&['intelligent','smart','clever'].includes(query)&&/intelligen|clever|smart|learn|understand|think|mental|cognitiv|intellect|bright|reason/i.test(definition))return 'openmoji-1F9E0';
  const appearance=pos==='adjective'&&['handsome','pretty'].includes(query)&&/man|woman|appearance|attractive|beautiful/i.test(definition);
  const name=pos==='noun'||appearance?aliases[query]??query:'';
  if(pos==='noun'&&readyArt.has(name))return name;
  return illustrations.find(item=>item.word===name)?.id??null;
}
export function artCredit(art:string|null){if(art?.startsWith('online-openmoji-')){const item=online.find(item=>item.id===art.slice(16));if(item)return {...item,id:art,sourceUrl:`https://github.com/hfg-gmuend/openmoji/blob/17.0.0/color/svg/${item.id}.svg`,license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'};}if(art==='shelf')return {id:'shelf',word:'shelf',author:'SVG Repo · Words for Kids adaptation',sourceUrl:'https://www.svgrepo.com/svg/251672/bookshelf',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'};const item=illustrations.find(item=>item.id===art);return item?{...item,sourceUrl:'https://openmoji.org/',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'}:undefined;}

export function illustrationWord(word:string){
 const query=word.trim().toLowerCase();
 const singular:Record<string,string>={apples:'apple',books:'book',cats:'cat',dogs:'dog',chairs:'chair',tables:'table',shelves:'shelf',pencils:'pencil',pens:'pen',balls:'ball',boxes:'box',teachers:'teacher',jars:'jar',children:'child',feet:'foot',mice:'mouse',bikes:'bike',planes:'plane'};
 return singular[query]??query;
}
