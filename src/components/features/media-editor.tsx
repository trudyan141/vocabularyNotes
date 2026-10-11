'use client';
import {useState} from 'react';
import {useApp} from '@/components/app/provider';
import type {LibraryWord} from '@/data/local/types';
import {WordPictureSearch} from './word-picture-search';
export function MediaEditor({word,onSaved}:{word:LibraryWord;onSaved?:(result:{revision:string;art:string})=>void}){const {t}=useApp();const [saved,setSaved]=useState(false);return <details><summary>{t('Đổi hình','Change picture')}</summary><WordPictureSearch key={word.revision} word={word} onSaved={value=>{setSaved(true);onSaved?.(value);}}/>{saved&&<p role="status">{t("Đã lưu hình.","Picture saved.")}</p>}</details>;}
