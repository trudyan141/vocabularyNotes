import 'server-only';
import art from '@/lib/media/open-illustrations.json';
import {illustrationWord} from '@/lib/media/dictionary-art';
const aliases:Record<string,string>={brother:'boy',sister:'girl',dad:'man',father:'man',mother:'woman',mom:'woman',grandfather:'old man',grandpa:'old man',grandmother:'old woman',grandma:'old woman'};
export function openMojiPicture(word:string){const name=aliases[word.toLowerCase()]??illustrationWord(word),item=art.find(item=>item.word===name);if(!item)return null;const code=item.id.replace('openmoji-','');return {id:`openmoji:${code}`,title:`File:${name} illustration.svg`,sourceUrl:`https://openmoji.org/library/emoji-${code}/`,imageUrl:`https://openmoji.org/data/color/svg/${code}.svg`,creator:item.author,license:'CC BY-SA 4.0' as const,licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',credit:`${name} — ${item.author} — OpenMoji CC BY-SA 4.0`};}
export function openMojiById(id:string){const item=art.find(item=>`openmoji:${item.id.replace('openmoji-','')}`===id);return item?openMojiPicture(item.word):null;}
