'use client';
import {useEffect,useState} from 'react';
import {useApp} from './provider';
import {preparedSentenceIpa} from '@/lib/pronunciation/prepared';
import {sentenceIpa} from '@/lib/pronunciation/client';
import type {Pronunciation} from '@/data/local/types';
import type {SentenceIpa} from '@/lib/pronunciation/sentence';
export function SentencePronunciation({text,pronunciations=[],ipa}:{text:string;pronunciations?:Pronunciation[];ipa?:string}){
 const {t}=useApp();const [derived,setDerived]=useState<SentenceIpa|null>(null);
 const stored=pronunciations.filter(p=>p.text===text&&p.ipa&&p.approvedContentVersion===p.contentVersion);
 const authored=ipa?.trim();const prepared=preparedSentenceIpa[text];const needsLookup=!authored&&!stored.length&&!prepared;
 useEffect(()=>{let active=true;if(needsLookup)void sentenceIpa(text).then(value=>{if(active)setDerived(value);});return()=>{active=false;};},[text,needsLookup]);
 const rows=stored.length?stored.map(p=>({ipa:p.ipa!,accent:p.accent,verified:p.verified})):authored?[{ipa:authored,accent:'other',verified:false}]:prepared?[{ipa:prepared,accent:'US',verified:false}]:derived?.text===text&&derived.ipa?[derived]:[];
 return <>{rows.map((row,i)=><p key={i} className="ipa sentence-ipa" lang="en" aria-label={t('Phiên âm cả câu','Whole-sentence IPA')}><span>{row.ipa}</span><small>{row.verified?row.accent!=='other'?row.accent:'':t('Tham khảo','Reading guide')+(row.accent!=='other'?` · ${row.accent}`:'')}</small></p>)}</>;
}
