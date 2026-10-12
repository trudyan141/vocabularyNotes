'use client';
import {useEffect,useRef,useState} from 'react';
import {useApp} from '@/components/app/provider';

/** Image paste only. Ordinary text paste remains owned by the focused field. */
export function useImagePaste(enabled:boolean,onFiles:(files:File[])=>Promise<void>,onError:(message:string)=>void){
 const {t}=useApp();const [reading,setReading]=useState(false);const lock=useRef(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>{
  const paste=(event:ClipboardEvent)=>{
   if(!enabled||lock.current)return;const clipboard=event.clipboardData;if(!clipboard)return;
   const files=Array.from(clipboard.files).filter(file=>file.type.startsWith('image/'));
   if(!files.length)for(const item of Array.from(clipboard.items)){if(item.kind==='file'&&item.type.startsWith('image/')){const file=item.getAsFile();if(file)files.push(file);}}
   if(!files.length)return;event.preventDefault();lock.current=true;
   void onFiles(files).catch(()=>{if(mounted.current)onError(t('Chưa thêm được ảnh. Thử dán lại nhé.','Could not add the photo. Try pasting again.'));}).finally(()=>{lock.current=false;});
  };
  document.addEventListener('paste',paste);return()=>document.removeEventListener('paste',paste);
 },[enabled,onFiles,onError,t]);
 async function pasteImages(){
  if(!enabled||lock.current)return;
  if(!navigator.clipboard?.read){onError(t('Máy này chưa dán được ảnh trực tiếp. Dùng Ctrl+V / ⌘V hoặc chọn ảnh từ máy.','Use Ctrl+V / ⌘V or choose photos from your device.'));return;}
  lock.current=true;setReading(true);
  try{
   const items=await navigator.clipboard.read(),files:File[]=[];
   for(const item of items){const type=item.types.find(type=>['image/png','image/jpeg','image/webp'].includes(type))??item.types.find(type=>type.startsWith('image/'));if(type){const blob=await item.getType(type);files.push(new File([blob],`${t('Ảnh đã dán','Pasted photo')}.${type.split('/')[1]}`,{type}));}}
   if(!mounted.current)return;
   if(!files.length){onError(t('Bộ nhớ sao chép chưa có ảnh. Sao chép hình ảnh rồi dán lại nhé.','Copy an image, then paste again.'));return;}
   await onFiles(files);
  }catch{if(mounted.current)onError(t('Chưa đọc được ảnh đã sao chép. Cho phép dán nếu máy hỏi, hoặc chọn ảnh từ máy.','Allow image pasting if prompted, or choose photos from your device.'));}
  finally{lock.current=false;if(mounted.current)setReading(false);}
 }
 return {reading,pasteImages};
}
