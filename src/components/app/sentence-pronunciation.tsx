'use client';
import {useEffect,useState} from 'react';
import {useApp} from './provider';
import {preparedSentenceIpa} from '@/lib/pronunciation/prepared';
import {sentenceIpa} from '@/lib/pronunciation/client';
import type {Pronunciation} from '@/data/local/types';
import type {SentenceIpa} from '@/lib/pronunciation/sentence';
import {AudioControl} from './audio-control';
export function SentencePronunciation({text,pronunciations=[],ipa,audio=true}:{text:string;pronunciations?:Pronunciation[];ipa?:string;audio?:boolean}){
 const {t}=useApp();const [lookup,setLookup]=useState<{text:string;result:SentenceIpa|null}|null>(null);
 const stored=pronunciations.filter(p=>p.text===text&&p.ipa&&p.approvedContentVersion===p.contentVersion);
 const authored=ipa?.trim();const prepared=preparedSentenceIpa[text];const needsLookup=!!text.trim()&&!authored&&!stored.length&&!prepared;
 useEffect(()=>{let active=true;if(needsLookup)void sentenceIpa(text).then(value=>{if(active)setLookup({text,result:value});});return()=>{active=false;};},[text,needsLookup]);
 const derived=lookup?.text===text?lookup.result:null;
 const rows=stored.length?stored.map(p=>({ipa:p.ipa!,accent:p.accent,verified:p.verified})):authored?[{ipa:authored,accent:'other',verified:false}]:prepared?[{ipa:prepared,accent:'US',verified:false}]:derived?.text===text&&derived.ipa?[derived]:[];
 if(!text.trim())return null;
 return <div className="sentence-reading">{rows.length?rows.map((row,i)=><p key={i} className="ipa sentence-ipa" lang="en" aria-label={t('Phiên âm cả câu','Whole-sentence IPA')}><span>{row.ipa}</span><small>{row.verified?row.accent!=='other'?row.accent:'':t('Tham khảo','Reading guide')+(row.accent!=='other'?` · ${row.accent}`:'')}</small></p>):<p className="sentence-ipa muted" role="status">{needsLookup&&lookup?.text!==text?t('Đang tìm phiên âm…','Finding the reading guide…'):t('Chưa có phiên âm chắc chắn cho câu này.','A reliable reading guide is not available for this sentence.')}</p>}{audio&&<AudioControl text={text}/>}</div>;
}
