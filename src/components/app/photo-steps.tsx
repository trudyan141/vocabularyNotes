'use client';
import {Check} from 'lucide-react';
import {useApp} from './provider';
export function PhotoSteps({step}:{step:1|2|3}){const {t}=useApp();return <ol className="photo-steps" aria-label={t('Các bước thêm bài','Add lesson steps')}>{[[1,t('Chọn ảnh','Choose photos')],[2,t('Đọc ảnh','Read photos')],[3,t('Kiểm và lưu','Review and save')]].map(([number,label])=><li key={number} aria-current={step===number?'step':undefined} data-complete={Number(number)<step}><span aria-hidden="true">{Number(number)<step?<Check/>:number}</span>{label}</li>)}</ol>;}
