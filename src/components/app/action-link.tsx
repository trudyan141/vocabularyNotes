import Link from 'next/link';
import type {ComponentProps,ReactElement} from 'react';
import {Button} from '@/components/ui/button';
/** A normal navigation action. Content review and data permissions are separate. */
export function ActionLink({href,children}:{href:string;children:ReactElement<ComponentProps<typeof Button>>}){
 if(children.props.disabled)return <Button {...children.props}/>;
 return <Button {...children.props} asChild><Link prefetch={false} href={href}>{children.props.children}</Link></Button>;
}
