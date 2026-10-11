'use client';
import {useLiveQuery} from 'dexie-react-hooks';
import Link from 'next/link';
import {useApp} from './provider';
import {Button} from '@/components/ui/button';
export function GuestCopyPrompt(){const {repository,t}=useApp();const candidate=useLiveQuery(async()=>{
 if(repository?.scope.kind!=='account')return null;
 const key=`guest-copy-choice:${repository.scope.ownerId}`;
 if(await repository.db.metadata.get(key))return null;
 const selected=await repository.db.metadata.get('active-guest'),guest=selected?await repository.db.libraries.get(selected.value):null;
 if(!guest||guest.scope.kind!=='guest')return null;
 const count=await repository.db.senses.where('[scopeId+id]').between([guest.scope.id,''],[guest.scope.id,'\uffff']).filter(row=>!row.deletedAt).count();
 return count?{key,count,scope:repository.scope.id}:null;
 },[repository]);
 if(!candidate||!repository||candidate.scope!==repository.scope.id)return null;
 const decide=async(value:string)=>repository.db.metadata.put({key:candidate.key,value});
 return <aside className="panel lilac page-flow guest-copy-prompt" aria-label={t('Sao chép bài trên máy','Copy device lessons')}><p>{t(`Bài lưu trên máy có ${candidate.count} từ. Bạn muốn sao chép vào tài khoản không?`,`Your device library has ${candidate.count} words. Would you like to copy them to your account?`)}</p><div className="row-wrap"><Button asChild><Link href="/profile#save-account-lessons" prefetch={false} onClick={()=>void decide('review')}>{t('Xem trước và sao chép','Preview and copy')}</Link></Button><Button variant="outline" onClick={()=>void decide('no')}>{t('Không sao chép','Do not copy')}</Button></div></aside>;
}
