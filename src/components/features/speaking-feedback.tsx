'use client';
import {Fragment} from 'react';
import {useApp} from '@/components/app/provider';
import type {InsertionFeedback,SoundStatus,WordFeedback} from '@/lib/speaking/assessment';
import {soundGroups} from '@/lib/speaking/graphemes';

export function speakingStatusLabel(status:SoundStatus,t:(vi:string,en:string)=>string){
 return status==='match'?t('Giống mẫu','Matches sample'):status==='retry'?t('Thử thêm nhé','Try again'):status==='missing'?t('Chưa nhận ra âm','Sound not detected'):status==='incorrect'?t('Âm nghe khác','Different sound'):t('Chưa nghe rõ','Unclear');
}

function ExtraSounds({items,unclear}:{items:InsertionFeedback[];unclear:boolean}){
 const {t}=useApp();
 return items.map((item,i)=><span key={i} className={`speaking-insertion ${unclear?'uncertain':'retry'}`} data-after-index={item.afterIndex} role="img" aria-label={unclear?t('Chưa nghe rõ âm thêm','Extra sound unclear'):t(`Máy nghe thêm âm /${item.heard}/`,`Extra sound /${item.heard}/`)}>{unclear?'?':`+/${item.heard}/`}</span>);
}

export function SpeakingWordSounds({word}:{word:WordFeedback}){
 const extras=word.insertions??[],unclear=word.status==='uncertain',positioned=[];let offset=0;
 for(const group of soundGroups(word)){positioned.push({group,start:offset,end:offset+group.phones.length-1});offset+=group.phones.length;}
 return <><ExtraSounds items={extras.filter(item=>item.afterIndex===-1)} unclear={unclear}/>{positioned.map(({group,start,end},i)=>{
  const insertions=extras.filter(item=>item.afterIndex>=start&&item.afterIndex<=end);
  return <Fragment key={i}><span className={`speaking-letter ${group.status}`} data-letters={group.letters}>{group.letters}</span><ExtraSounds items={insertions} unclear={unclear}/></Fragment>;
 })}</>;
}

export function SpeakingSoundTable({word}:{word:WordFeedback}){
 const {t}=useApp(),unclear=word.status==='uncertain';
 return <table className="speaking-sound-table"><thead><tr><th scope="col">{t('Âm mẫu','Reference sound')}</th><th scope="col">{t('Máy nghe được','Recognised sound')}</th></tr></thead><tbody>
 {soundGroups(word).map((group,i)=><tr key={i}><th scope="row"><span className={`speaking-letter ${group.status}`} lang="en">{group.letters}</span><span className="speaking-group-ipa" lang="en">/{group.phones.map(phone=>phone.expected).join(' ')}/</span></th><td>
 <strong className={`speaking-letter ${group.status}`}>{group.status==='match'?t('Giống mẫu','Matches sample'):group.status==='uncertain'?t('Chưa nghe rõ','Unclear'):group.phones.some(phone=>phone.heard)?`/${group.phones.map(phone=>phone.heard??'…').join(' ')}/`:t('Chưa nhận ra âm','Not detected')}</strong>
 {!unclear&&group.phones.filter(phone=>phone.status!=='match').map((phone,n)=><p key={n}><strong>{speakingStatusLabel(phone.status,t)}</strong> · {t('Âm','Sound')} /{phone.expected}/: {phone.advice}</p>)}
 {group.silentTail&&<p>{t(`Chữ ${group.silentTail} không có âm riêng ở đây.`,`The letter ${group.silentTail} has no separate sound here.`)}</p>}
 {group.letters.toLowerCase()==='le'&&<p>{t('Hai chữ l và e đi cùng nhóm âm này; e không đọc thành “e” riêng.','The letters l and e belong to this sound group; e is not a separate /e/ sound.')}</p>}
 </td></tr>)}
 {(word.insertions??[]).map((item,i)=><tr className="speaking-insertion-row" key={`extra-${i}`}><th scope="row">{t('Âm thêm','Extra sound')}<span className="speaking-group-ipa">{item.afterIndex===-1?t('Trước âm đầu','Before first sound'):t(`Sau âm ${item.afterIndex+1} /${word.expected[item.afterIndex]}/`,`After sound ${item.afterIndex+1} /${word.expected[item.afterIndex]}/`)}</span></th><td><strong className={`speaking-letter ${unclear?'uncertain':'retry'}`}>{unclear?t('Chưa nghe rõ','Unclear'):`+/${item.heard}/`}</strong>{!unclear&&item.heard!=='?'&&<p>{item.advice}</p>}</td></tr>)}
 </tbody></table>;
}
