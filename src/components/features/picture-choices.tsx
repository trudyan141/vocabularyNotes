'use client';
import {useState} from 'react';
import {useApp} from '@/components/app/provider';
import {Artwork} from '@/components/app/shared';
import {Input} from '@/components/ui/input';
import {readyArt} from '@/lib/media/catalog';
import {openIllustrations} from '@/lib/media/dictionary-art';
const choices=[...Array.from(readyArt,word=>({id:word,word})),...openIllustrations];
export function PictureChoices({onChoose}:{onChoose:(art:string)=>void}){
 const {t}=useApp(),[query,setQuery]=useState('');
 return <details><summary>{t('Chọn hình có sẵn','Choose a picture')}</summary><label>{t('Tìm hình bằng tiếng Anh','Find a picture in English')}<Input value={query} onChange={event=>setQuery(event.target.value)} placeholder="apple, book, rabbit…"/></label><div className="art-choices">{choices.filter(item=>item.word.includes(query.trim().toLowerCase())).slice(0,12).map(item=><button type="button" key={item.id} aria-label={item.word} onClick={()=>onChoose(item.id)}><Artwork art={item.id} word={item.word} size={64}/><span>{item.word}</span></button>)}</div></details>;
}
