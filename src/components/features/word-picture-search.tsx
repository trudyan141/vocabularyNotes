'use client';
import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
import {ClipboardPaste,Globe,ImagePlus,Upload} from 'lucide-react';
import {useApp} from '@/components/app/provider';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {SubmitButton} from '@/components/ui/submit-button';
import {mediaCandidate,mediaAsset,type MediaCandidate,type MediaAsset} from '@/lib/media/contracts';
import {saveMedia} from '@/data/local/media';
import type {LibraryWord} from '@/data/local/types';
import {pictureAttempt,pictureAttemptText,pictureSourceNames,type PictureAttempt} from '@/lib/media/search-report';
class PictureRequestError extends Error{constructor(public data:{source?:string;sources?:PictureAttempt[];code?:string},public status:number){super('picture-request');}}
export function WordPictureSearch({word,onSaved,onPrepared,onBusyChange,autoSearch=false,saveMessage}:{word:Pick<LibraryWord,'id'|'word'|'en'|'vi'|'sense'|'pos'|'revision'|'art'>;autoSearch?:boolean;saveMessage?:string;onBusyChange?:(busy:boolean)=>void;onPrepared?:(asset:MediaAsset)=>void;onSaved?:(result:{revision:string;art:string})=>void}) {
 const {repository,t}=useApp();const [busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false),[candidates,setCandidates]=useState<MediaCandidate[]>([]);
 const [source,setSource]=useState('');const [webFallback,setWebFallback]=useState(false);const [operation,setOperation]=useState<'search'|'picture'|null>(null);const [found,setFound]=useState(false);const fileInput=useRef<HTMLInputElement|null>(null);
 const [attempts,setAttempts]=useState<PictureAttempt[]>([]);
 const controller=useRef<AbortController|null>(null);
 const uploadLock=useRef(false),clipboardLock=useRef(false),mounted=useRef(true),dragDepth=useRef(0);
 const [readingClipboard,setReadingClipboard]=useState(false),[dragging,setDragging]=useState(false);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>()=>controller.current?.abort(),[]);
 useEffect(()=>{onBusyChange?.(busy);},[busy,onBusyChange]);
 async function request(operation:'search'|'import'|'upload',body:unknown,signal:AbortSignal){
  const response=await fetch(`/api/media/${operation}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  const data=await response.json();if(!response.ok)throw new PictureRequestError(data,response.status);return data;
 }
 async function search(attach=false){
  if(busy)return;setOperation('search');setFound(false);setSaved(false);setAttempts([]);const worker=new AbortController();controller.current=worker;setBusy(true);setError('');
  try{const data=await request('search',{word:word.word,sense:word.en||word.sense,consent:true},AbortSignal.any([worker.signal,AbortSignal.timeout(25000)]));
   const rows=mediaCandidate.array().max(5).parse(data.candidates);const checked=pictureAttempt.array().max(8).safeParse(data.sources);setAttempts(checked.success?checked.data:[]);setCandidates(rows);setFound(rows.length>0);setWebFallback(rows.length===0);if(attach&&rows.length&&onPrepared)await choose(rows[0]);if(!rows.length)setError(t('Các nguồn đã thử chưa có hình phù hợp. Bạn có thể tìm lại hoặc chọn ảnh khác bên dưới.','The searched sources have no suitable image. Try again or choose another image below.'));
  }catch(cause){if(!worker.signal.aborted){if(!candidates.length)setWebFallback(true);if(cause instanceof PictureRequestError){const checked=pictureAttempt.array().max(8).safeParse(cause.data.sources);if(checked.success)setAttempts(checked.data);const failed=checked.success?[...new Set(checked.data.filter(row=>row.state==='error').map(row=>pictureSourceNames[row.source]))]:[];setError(t(failed.length?`Chưa tải được hình từ ${failed.join(', ')}. Các nguồn khác đã được thử; xem kết quả bên dưới hoặc thử lại.`:'Chưa tải được hình. Thử lại nhé.','Could not load pictures from the searched sources. Review the source results below or retry.'));}else setError(t('Chưa tải được hình. Thử lại nhé.','Could not load pictures. Please retry.'));}}
  finally{if(!worker.signal.aborted)setBusy(false);}
 }
 async function choose(candidate:MediaCandidate){
  if(busy||!repository)return;setOperation('picture');const worker=new AbortController();controller.current=worker;setBusy(true);setError('');
  try{const data=await request('import',{id:candidate.id,title:candidate.title,consent:true},AbortSignal.any([worker.signal,AbortSignal.timeout(25000)]));
   if(worker.signal.aborted)return;
   const asset=mediaAsset.parse({...data,senseId:word.id,word:word.word,revision:word.revision,status:'ready',approved:true});if(onPrepared){onPrepared(asset);setSaved(true);setCandidates([]);return;}const art=await saveMedia(repository,asset);onSaved?.({art,revision:`${word.revision.split(':')[0]}:${Number(word.revision.split(':')[1])+1}`});setSaved(true);setCandidates([]);
  }catch{if(!worker.signal.aborted){const provider=candidate.id.split(':')[0];const name=pictureSourceNames[provider as keyof typeof pictureSourceNames]??'Wikimedia Commons';setError(t(`Chưa lưu được hình từ ${name}. Chọn hình từ nguồn khác hoặc thử lại; hình hiện tại vẫn giữ.`,`Could not save the ${name} image. Choose another source or retry; your current image is kept.`));}}
  finally{if(!worker.signal.aborted)setBusy(false);}
 }
 async function upload(file:File){
  if(busy||!repository||uploadLock.current)return;setSaved(false);setOperation('picture');if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4_000_000){setError(t('Chọn ảnh JPG, PNG hoặc WebP dưới 4 MB nhé.','Choose a JPG, PNG or WebP under 4 MB.'));return;}
  uploadLock.current=true;const worker=new AbortController();controller.current=worker;setBusy(true);setError('');
  try{const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));const data=await request('upload',{base64:btoa(binary),filename:file.name.slice(0,160),source:source.trim()},AbortSignal.any([worker.signal,AbortSignal.timeout(25000)]));if(worker.signal.aborted)return;const asset=mediaAsset.parse({...data,senseId:word.id,word:word.word,revision:word.revision,status:'ready',approved:true});if(onPrepared){onPrepared(asset);setSaved(true);setCandidates([]);return;}const art=await saveMedia(repository,asset);onSaved?.({art,revision:`${word.revision.split(':')[0]}:${Number(word.revision.split(':')[1])+1}`});setSaved(true);setCandidates([]);
  }catch{if(!worker.signal.aborted)setError(t('Chưa lưu được ảnh. Kiểm tra ảnh và đường dẫn nguồn rồi thử lại.','Could not save the image. Check the image and source URL and retry.'));}finally{uploadLock.current=false;if(!worker.signal.aborted)setBusy(false);if(fileInput.current)fileInput.current.value='';}
 }
 async function intake(files:File[]) {
  if(busy||!repository||uploadLock.current)return;
  setOperation('picture');setError('');
  if(files.length!==1){setError(t('Chọn hoặc dán một ảnh cho mỗi từ nhé.','Choose or paste one image per word.'));return;}
  await upload(files[0]);
 }
 async function pasteImage() {
  if(busy||!repository||clipboardLock.current||uploadLock.current)return;
  setOperation('picture');setError('');
  if(!navigator.clipboard?.read){setError(t('Máy này chưa dán ảnh trực tiếp được. Dùng Ctrl+V / ⌘V hoặc chọn ảnh trên máy.','Use Ctrl+V / ⌘V or choose an image from your device.'));return;}
  clipboardLock.current=true;setReadingClipboard(true);
  try {
   const items=await navigator.clipboard.read();const files:File[]=[];
   for(const item of items){const type=item.types.find(type=>['image/png','image/jpeg','image/webp'].includes(type))??item.types.find(type=>type.startsWith('image/'));if(type){const blob=await item.getType(type);files.push(new File([blob],`pasted-image.${type.split('/')[1]}`,{type}));}}
   if(!mounted.current)return;
   if(!files.length){setError(t('Chưa có ảnh trong bộ nhớ sao chép. Sao chép hình ảnh rồi dán lại nhé.','Copy an image, then paste again.'));return;}
   await intake(files);
  } catch {if(mounted.current)setError(t('Chưa đọc được ảnh đã sao chép. Cho phép dán nếu máy hỏi, hoặc chọn ảnh trên máy.','Allow image pasting if prompted, or choose an image from your device.'));}
  finally {clipboardLock.current=false;if(mounted.current)setReadingClipboard(false);}
 }
 const initialSearch=useRef(()=>search(true));
 useEffect(()=>{if(!autoSearch)return;const timer=setTimeout(()=>void initialSearch.current(),350);return()=>clearTimeout(timer);},[autoSearch]);
 return <section className="page-flow word-picture-search" onPaste={event=>{
  const files=Array.from(event.clipboardData.files);
  if(!files.length)for(const item of Array.from(event.clipboardData.items)){if(item.kind==='file'){const file=item.getAsFile();if(file)files.push(file);}}
  if(!files.length)return;
  event.preventDefault();if(!busy&&!readingClipboard&&!clipboardLock.current)void intake(files);
 }}>
 {saved?<p className="picture-saved" role="status">{onPrepared?saveMessage??t('Đã chọn hình. Bấm Lưu chỉnh sửa bên dưới để lưu.','Picture selected. Save your edits below to keep it.'):t('Đã lưu hình.','Picture saved.')}</p>:<SubmitButton type="button" variant="secondary" state={operation==='search'?(busy?'pending':error?'error':found?'success':'idle'):'idle'} error={operation==='search'?error:undefined} successLabel={t('Đã tìm thấy hình · tìm lại','Pictures found · search again')} disabled={busy||readingClipboard} onClick={()=>void search()}><ImagePlus aria-hidden="true"/>{busy?t('Đang tải hình…','Loading pictures…'):t('Tìm hình gợi ý','Find suggested pictures')}</SubmitButton>}
 <Button asChild variant="outline"><a href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(word.word)}`} target="_blank" rel="noreferrer" onClick={()=>{setWebFallback(true);setSaved(false);}}><Globe aria-hidden="true"/>{t('Mở Google tìm ảnh','Open Google image search')}</a></Button>
 {error&&operation==='picture'&&<p className="submit-error" role="alert">{error}</p>}
 {attempts.length>0&&<details className="picture-source-results"><summary>{t('Kết quả từng nguồn hình','Results by image source')}</summary><ul>{attempts.map((attempt,index)=><li key={index}>{pictureAttemptText(attempt)}</li>)}</ul></details>}
 <div className="picture-results">{candidates.map(candidate=><article key={candidate.id}>
  <button type="button" disabled={busy||readingClipboard} data-submit-state={operation==='picture'?(busy?'pending':error?'error':saved?'success':'idle'):'idle'} aria-label={t(`Dùng hình cho ${word.word}: ${candidate.title}`,`Use picture for ${word.word}: ${candidate.title}`)} onClick={()=>void choose(candidate)}><Image unoptimized src={candidate.imageUrl||""} alt={candidate.title} width={160} height={160}/></button>
  <a href={candidate.sourceUrl} target="_blank" rel="noreferrer">{candidate.id.startsWith('noto:')?'Google Noto':candidate.id.startsWith('fluent:')?'Microsoft Fluent':candidate.id.startsWith('twemoji:')?'Twemoji':candidate.id.startsWith('openmoji:')?'OpenMoji':candidate.creator} · {candidate.license}</a>
 </article>)}</div>
 {!saved&&<details className="picture-intake-tools" open={webFallback}><summary>{t("Dán hoặc chọn ảnh khác","Paste or choose another image")}</summary><div className={`picture-image-intake${dragging?' is-dragging':''}`} role="region" aria-label={t(`Thêm ảnh cho ${word.word}`,`Add an image for ${word.word}`)} tabIndex={0}
 onDragEnter={event=>{if(!event.dataTransfer.types.includes('Files'))return;event.preventDefault();dragDepth.current++;setDragging(true);}}
 onDragLeave={()=>{dragDepth.current=Math.max(0,dragDepth.current-1);if(!dragDepth.current)setDragging(false);}}
 onDragOver={event=>{if(event.dataTransfer.types.includes('Files'))event.preventDefault();}}
 onDrop={event=>{const files=Array.from(event.dataTransfer.files);if(!files.length)return;event.preventDefault();dragDepth.current=0;setDragging(false);if(!readingClipboard&&!clipboardLock.current)void intake(files);}}>
 <p>{t('Kéo thả ảnh vào đây, hoặc bấm vùng này rồi Ctrl+V / ⌘V.','Drop an image here, or focus this area and paste with Ctrl+V / ⌘V.')}</p>
 <div className="row-wrap"><SubmitButton type="button" variant="outline" state={operation==='picture'?(busy?'pending':error?'error':'idle'):'idle'} disabled={busy||readingClipboard||!repository} onClick={()=>fileInput.current?.click()}><Upload aria-hidden="true"/>{t('Chọn ảnh trên máy','Choose image from device')}</SubmitButton><Button type="button" variant="outline" disabled={busy||readingClipboard||!repository} onClick={()=>void pasteImage()}><ClipboardPaste aria-hidden="true"/>{readingClipboard?t('Đang đọc ảnh…','Reading image…'):t('Dán ảnh','Paste image')}</Button></div>
 <small>{t('JPG, PNG, WebP · dưới 4 MB · một ảnh mỗi lần','JPG, PNG, WebP · under 4 MB · one image at a time')}</small>
 </div></details>}
 <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden aria-label={t('Chọn hình cho từ','Choose word image')} onChange={event=>{const files=Array.from(event.target.files??[]);if(files.length)void intake(files);event.target.value='';}}/>
 {!saved&&<details className="picture-upload" open={webFallback} onToggle={event=>setWebFallback(event.currentTarget.open)}><summary>{t('Dùng ảnh khác','Use another image')}</summary><div className="page-flow"><p>{t('Tìm ảnh trên web, sao chép hình rồi bấm Dán ảnh ở trên. Bạn cũng có thể chọn ảnh đã tải về.','Find an image on the web, copy it, then use Paste image above. You can also choose a downloaded image.')}</p><a href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(word.word)}`} target="_blank" rel="noreferrer">{t('Tìm ảnh trên Google','Search Google Images')}</a><label>{t('Nguồn hình','Image source')}<Input type="url" value={source} onChange={event=>setSource(event.target.value)} placeholder="https://…" maxLength={500}/></label></div></details>}
 </section>;
}
