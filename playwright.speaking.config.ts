import {defineConfig,devices} from '@playwright/test';
import base from './playwright.ui.config';
export default defineConfig({...base,workers:2,use:{...base.use,serviceWorkers:'block'},projects:[
 ...base.projects!.map(project=>({...project,testMatch:'speaking-refresh.spec.ts'})),
 {name:'mobile-webkit',testMatch:'speaking-refresh.spec.ts',use:{...devices['iPhone 13'],viewport:{width:390,height:844}}},
]});
