'use client';
import {ExtensionSection} from './learning-extensions';
import {useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '@/components/app/provider';
import {DatabaseLoading,ReadFailure} from '@/components/app/database-boundary';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {Back} from '@/components/app/shared';
import {SentencePronunciation} from '@/components/app/sentence-pronunciation';
import {learningItems,type LearningItem} from '@/data/local/learning-library';
import {GrammarSteps} from './grammar-steps';
import {GameActivityEditor} from './game-activity-editor';
import {DeleteControl} from './delete-control';

export function LearningCard({item,mode='grammar'}:{item:LearningItem;mode?:'grammar';removable?:boolean}) {
 return <Link className="learning-summary" href={`/library/${mode}/${encodeURIComponent(item.id)}?table=${item.table}`}><strong lang="en">{item.textEn}</strong>{item.example&&item.example!==item.textEn&&<span lang="en">{item.example}</span>}</Link>;
}
export function LearningDetail({id,mode}:{id:string;mode:'grammar'}) {
 const {repository,t}=useApp();
 const data=useLiveQuery(async()=>{if(!repository)return null;try{return {scope:repository.scope.id,item:(await learningItems(repository,mode,'',null,0,Number.MAX_SAFE_INTEGER)).items.find(item=>item.id===id||item.related?.some(child=>child.id===id)),error:false};}catch{return {scope:repository.scope.id,error:true,item:undefined};}},[repository,mode,id]);
 if(!data||data.scope!==repository?.scope.id)return <DatabaseLoading/>;if(data.error)return <ReadFailure/>;
 const item=data.item;if(!item)return <div className="page-flow"><Back href={`/library?mode=${mode}`}/><p>{t('Mục này không còn trong thư viện.','This item is no longer in the library.')}</p></div>;
 const examples=[item,...(item.related??[]),...(item.variants??[]).map(variant=>({...item,id:`${item.id}:${variant.example}`,related:undefined,variants:undefined,textEn:variant.formula,textVi:variant.conditions??'',example:variant.example,exampleVi:variant.exampleVi,exampleIpa:variant.exampleIpa,analysis:variant.analysis,mistake:variant.commonError,mistakeIpa:variant.commonErrorIpa,correction:variant.correction,correctionIpa:variant.correctionIpa}))];
 const title=item.family==='be-it-yes-no'?t('Hỏi và trả lời với “Is it…?”','Ask and answer with “Is it…?”'):item.title;
 const targets=[item,...(item.related??[])].map(row=>({table:row.table,id:row.id,version:row.version}));
 return <article className="reading-page page-flow learning-detail"><div className="learning-detail-toolbar"><Back href={`/library?mode=${mode}`}/><DeleteControl iconOnly target={targets[0]} targets={targets} label={t('Xóa mục này','Delete item')} description={t('Xóa bài này? Từ và các bài khác vẫn giữ.','Delete this lesson? Words and other lessons are kept.')}/></div><h1>{title}</h1>
 <section className="grammar-lead"><p lang="en">{item.example||item.textEn}</p><SentencePronunciation text={item.example||item.textEn} pronunciations={item.pronunciations} ipa={item.exampleIpa}/><p>{item.exampleVi||item.textVi}</p></section>
 {mode==='grammar'&&<GrammarSteps pattern={item.family==='be-it-yes-no'?'Is + it':item.textEn} conditions={item.textVi} analysis={item.analysis} examples={examples.map(row=>({textEn:row.example||row.textEn,textVi:row.exampleVi||row.textVi,ipa:row.exampleIpa,formula:row.textEn,analysis:row.analysis||row.textVi}))}/>}
 <details className="grammar-more"><summary>{t("Ví dụ thêm và giải thích","More examples and explanations")}</summary><div className="page-flow">{examples.map(row=><section className="grammar-example-section page-flow" key={row.id}>{row.example&&row.textEn!==row.example&&<p className="grammar-formula" lang="en">{row.textEn}</p>}<p className="grammar-english" lang="en">{row.example||row.textEn}</p><SentencePronunciation text={row.example||row.textEn} pronunciations={row.pronunciations} ipa={row.exampleIpa}/><p>{row.exampleVi||row.textVi}</p>{row.example&&row.textVi!==row.exampleVi&&<p>{row.textVi}</p>}{row.analysis&&<p>{row.analysis}</p>}
 {row.mistake&&<div className="grammar-mistake"><strong>{t('Dễ nhầm','Watch out')}</strong><p lang="en">{row.mistake}</p><SentencePronunciation text={row.mistake} ipa={row.mistakeIpa}/></div>}
 {row.correction&&<div className="grammar-correction"><strong>{t('Câu đúng','Correct sentence')}</strong><p lang="en">{row.correction}</p><SentencePronunciation text={row.correction} ipa={row.correctionIpa}/></div>}
 </section>)}
 </div></details><ExtensionSection kind="grammar" targetId={item.id}/>{[item,...(item.related??[])].filter(row=>row.table==='sentences').map(row=><GameActivityEditor key={row.id} id={row.id}/>)}</article>;
}

export function ContentLibrary({mode,query,lesson}:{mode:'grammar';query:string;lesson:string|null}) {
 const {repository,t}=useApp();const [offset,setOffset]=useState(0);
 const data=useLiveQuery(async()=>{if(!repository)return null;try{return {scope:repository.scope.id,error:false,...await learningItems(repository,mode,query,lesson,offset,12)};}catch{return {scope:repository.scope.id,error:true,total:0,items:[]};}},[repository,mode,query,lesson,offset]);
 if(!data||data.scope!==repository?.scope.id)return <DatabaseLoading/>;if(data.error)return <ReadFailure/>;
 return <section className="page-flow"><p role="status">{data.total} {t('mục','items')}</p>{!data.total&&<div className="empty-learning"><p>{query?t('Không tìm thấy ngữ pháp này. Thử xóa tìm kiếm nhé.','No matching grammar. Try clearing your search.'):t('Thêm bài để học ngữ pháp cùng Cáo.','Add a lesson to learn grammar with Fox.')}</p><Button asChild variant="outline"><Link href={query?'/library?mode=grammar':'/capture'}>{query?t('Xóa tìm kiếm','Clear search'):t('Thêm bài từ ảnh','Add a photo lesson')}</Link></Button></div>}
 {data.items.map(item=><LearningCard key={`${item.table}:${item.id}`} item={item} mode="grammar"/>)}
 {data.total>12&&<nav className="picker-pagination"><Button disabled={!offset} variant="secondary" onClick={()=>setOffset(Math.max(0,offset-12))}>{t('Trước','Previous')}</Button><span>{offset/12+1} / {Math.ceil(data.total/12)}</span><Button disabled={offset+12>=data.total} variant="secondary" onClick={()=>setOffset(offset+12)}>{t('Sau','Next')}</Button></nav>}
 </section>;
}
