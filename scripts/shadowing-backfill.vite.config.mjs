import {resolve} from 'node:path';
export default {envDir:false,resolve:{alias:{'@':resolve('src')}},build:{target:'node24',outDir:'.local/shadowing-ops',emptyOutDir:true,lib:{entry:resolve('scripts/shadowing-backfill.ts'),formats:['es'],fileName:()=> 'backfill.mjs'},rollupOptions:{external:['node:fs','node:path','node:crypto','zod','dexie','cmu-pronouncing-dictionary']},minify:false}};
