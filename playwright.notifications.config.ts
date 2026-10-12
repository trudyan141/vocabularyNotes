import {defineConfig} from '@playwright/test';
import base from './playwright.ui.config';
export default defineConfig({...base, use:{...base.use,serviceWorkers:'block'}, projects:base.projects!.map(project => ({...project,testMatch:'notifications.spec.ts'}))});
