import type {ReactNode} from 'react';
import {getServerEnv} from '@/server/env';
import {AppProvider} from '@/components/app/provider';
import {CloudBackground} from '@/components/app/cloud-background';
import {OfflineRegistration} from '@/components/app/offline';
import {AppShell} from '@/components/app/shell';
export const dynamic='force-dynamic';
export default function LearningLayout({children}:{children:ReactNode}){return <AppProvider demo={getServerEnv().APP_DEMO_MODE}><OfflineRegistration/><CloudBackground/><AppShell>{children}</AppShell></AppProvider>;}
