import { defineConfig } from '@playwright/test';
import { workflowConfig } from './playwright.shared';

// Compatibility entry for existing focused configs. Prefer pnpm test:ui.
export default defineConfig(workflowConfig('ui'));
