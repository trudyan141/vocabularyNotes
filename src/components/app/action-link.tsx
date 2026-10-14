"use client";
import {useApp} from "./provider";
import {sharedMutationPath} from "./sharing-boundary";
import Link from 'next/link';
import type {ComponentProps,ReactElement} from 'react';
import {Button} from '@/components/ui/button';
/** A normal navigation action. Content review and data permissions are separate. */
export function ActionLink({href,children}:{href:string;children:ReactElement<ComponentProps<typeof Button>>}){
 const {repository}=useApp();if(repository?.readOnly&&sharedMutationPath(href))return null;
 if(children.props.disabled)return <Button {...children.props}/>;
 return <Button {...children.props} asChild><Link prefetch={false} href={href}>{children.props.children}</Link></Button>;
}
