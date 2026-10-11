import {defineConfig} from '@playwright/test';
import base from './playwright.ui.config';
export default defineConfig({...base,use:{...base.use,serviceWorkers:'block'},projects:base.projects!.map(project=>({...project,testMatch:['two-learning-types.spec.ts','group-picker-pictures.spec.ts','edit-and-feedback.spec.ts','grammar-polish.spec.ts','review-grammar.spec.ts','simple-lessons.spec.ts','cloud-refresh.spec.ts','compact-games-groups.spec.ts','simple-cards.spec.ts','compact-home.spec.ts','parent-ai.spec.ts','learning.spec.ts']}))});
