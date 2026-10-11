import {defineConfig} from '@playwright/test';
import base from './playwright.config';
// Scoped local UI checks need only the app; PostgreSQL/cloud integration uses the main config.
export default defineConfig({...base,projects:base.projects?.filter(project=>['desktop-chromium','mobile-chromium'].includes(project.name??'')),webServer:{command:'pnpm start --port 4320',url:'http://127.0.0.1:4320',reuseExistingServer:false,env:{APP_DEMO_MODE:'true',AI_PROVIDER:'none'},timeout:30000}});
