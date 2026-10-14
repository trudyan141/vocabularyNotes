'use client';
import {useEffect,useState} from 'react';
import {useApp} from './provider';
import {sentenceIpa} from '@/lib/pronunciation/client';
import type {WordAudio} from '@/lib/audio/word-audio';
import {wordAudio} from '@/lib/audio/word-audio-client';
import {approximateReading,approximateIpaReading} from '@/lib/speaking/articulation';
import type {Pronunciation} from '@/data/local/types';

type Guide={text:string;ipa:string|null;sourceUrl:string|null;verified:boolean;accent:string};
export function WordPronunciation({text,pronunciations,sample}:{text:string;pronunciations:Pronunciation[];sample?:WordAudio|null}){
 const {t,preferences}=useApp();
 const [lookup,setLookup]=useState<Guide|null>(null);
 const exact=pronunciations.filter(p=>p.text===text&&p.approvedContentVersion===p.contentVersion);
 const saved=exact.find(p=>p.ipa&&p.accent==='US')??exact.find(p=>p.ipa);
 const savedHint=exact.find(p=>p.readingHintVi&&(!saved||p.accent===saved.accent))?.readingHintVi;
 const needsLookup=!saved?.ipa;
 useEffect(()=>{
  let active=true;
  if(needsLookup)void Promise.all([preferences.sound?wordAudio(text):Promise.resolve(null),sentenceIpa(text)]).then(([sample,derived])=>{
   if(!active)return;
   setLookup({text,ipa:sample?.ipa??derived?.ipa??null,sourceUrl:sample?.ipa?sample.dictionaryUrl:derived?.sourceUrl??null,verified:!!sample?.ipa,accent:'US'});
  });
  return()=>{active=false;};
 },[text,needsLookup,preferences.sound]);
 const current=saved??(lookup?.text===text?lookup:null);
 const hint=approximateReading(text,savedHint??undefined)??(current?.ipa?approximateIpaReading(current.ipa):null);
 return <div className="word-reading-guide">
  {current?.ipa?<p className="ipa" lang="en" aria-label={t('Phiên âm của từ','Word IPA')}><span>{current.ipa}</span>{' '}<small>{current.verified?current.accent:t('Tham khảo','Reading guide')+(current.accent!=='other'?` · ${current.accent}`:'')}</small></p>:<p className="reading-hint" role="status">{needsLookup&&lookup?.text!==text?t('Đang tìm phiên âm…','Finding the reading guide…'):t('Chưa có phiên âm chắc chắn cho từ này.','A reliable reading guide is not available for this word.')}</p>}
  {sample?.word===text.trim().toLowerCase()&&sample.ipa&&saved?.ipa&&saved.accent!=='US'&&<p className="ipa" lang="en"><span>{sample.ipa}</span>{' '}<small>US</small></p>}
  {hint&&<><p className="reading-hint">{t('Cách đọc gần đúng: ','Approximate reading: ')}<strong lang="vi">{hint}</strong></p><small className="reading-hint">{t('Chữ Việt chỉ để tham khảo; con nghe mẫu để luyện âm nhé.','Vietnamese spelling is a memory aid; listen to practise the sounds.')}</small></>}
  {(current?.sourceUrl||sample?.dictionaryUrl)&&<details className="pronunciation-source"><summary>{t('Nguồn IPA','IPA source')}</summary>{current?.sourceUrl&&<a href={current.sourceUrl} target="_blank" rel="noreferrer">{t('Phiên âm đã hiển thị','Displayed pronunciation')}</a>}{sample?.dictionaryUrl&&sample.dictionaryUrl!==current?.sourceUrl&&<a href={sample.dictionaryUrl} target="_blank" rel="noreferrer">Wiktionary · US</a>}</details>}
 </div>;
}
