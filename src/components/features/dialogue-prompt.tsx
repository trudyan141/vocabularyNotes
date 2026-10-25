import {useState} from 'react';
import Image from 'next/image';
import {Artwork} from '@/components/app/shared';
import {useApp} from '@/components/app/provider';
import {AudioControl} from '@/components/app/audio-control';
import {SentencePronunciation} from '@/components/app/sentence-pronunciation';
import type {GameActivity} from '@/lib/learning/game-activity';

export function DialoguePrompt({activity:a,scene}:{activity:GameActivity;scene?:{art:string;label:string;meaning:string;word?:string}}){
 const {t}=useApp(),[unavailable,setUnavailable]=useState(false);
 return <div className="dialogue-prompt">
  {scene&&!unavailable?<div className="dialogue-scene" role="img" aria-label={scene.label}><Artwork art={scene.art} word={scene.word??scene.label} hideWord size={180} onUnavailable={()=>setUnavailable(true)}/></div>:a.context&&<p className="dialogue-context">{a.context}</p>}
  <div className="dialogue-question">
   <p className="dialogue-speaker"><Image src="/illustrations/fox.svg" alt="" width={40} height={40}/>{t('Cáo hỏi con:','Fox asks you:')}</p>
   <p className="grammar-english" lang="en">{a.prompt}</p>
   {scene&&<p className="dialogue-meaning" lang="vi">{scene.meaning}</p>}
   <AudioControl text={a.prompt} autoPlay/>
   <SentencePronunciation text={a.prompt} ipa={a.promptIpa} audio={false}/>
  </div>
  <p className="dialogue-instruction">{t('Con sẽ trả lời Cáo thế nào? Chọn hoặc nói một câu bên dưới.','How would you answer Fox? Choose or say one of the replies below.')}</p>
 </div>;
}
