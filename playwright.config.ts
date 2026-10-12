import { defineConfig } from '@playwright/test';
import { workflowConfig } from './playwright.shared';

// Release discovers every spec; live-media tests remain explicitly opt-in.
export default defineConfig(workflowConfig('release'));
