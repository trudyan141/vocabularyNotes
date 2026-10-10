'use client';
import {useApp} from '@/components/app/provider';
import {cloudFailureText} from '@/lib/account-profile';
export type CloudIssue={code:string;status?:number;stage:string};
export function CloudFailure({issue}:{issue:CloudIssue|null}){const {t}=useApp();if(!issue)return null;return <div className="operation-status" data-error="true"><p role="alert">{t(cloudFailureText(issue.code),cloudFailureText(issue.code,true))}</p></div>;}
