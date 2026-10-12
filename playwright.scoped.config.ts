import { defineConfig } from '@playwright/test';
import { workflowConfig } from './playwright.shared';

const scope = process.env.WFK_E2E_SCOPE ?? 'ui';
if (!['ui', 'no-demo', 'cloud', 'release'].includes(scope)) throw new Error('Invalid workflow test scope');
export default defineConfig(workflowConfig(scope as 'ui' | 'no-demo' | 'cloud' | 'release'));
