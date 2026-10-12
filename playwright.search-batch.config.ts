import {defineConfig} from '@playwright/test';
import base from './playwright.ui.config';
export default defineConfig({...base,use:{...base.use,serviceWorkers:'block'},projects:base.projects!.map(project=>({...project,testMatch:['search-batch.spec.ts','capture.spec.ts','parent-ai.spec.ts','media-source-errors.spec.ts']}))});
