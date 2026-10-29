import {resolve} from 'node:path';
export default {envDir:false,resolve:{alias:{'@':resolve('src')}},build:{target:'node24',outDir:'.local/shadowing-smoke',emptyOutDir:false,lib:{entry:resolve('scripts/shadowing-smoke.ts'),formats:['es'],fileName:()=> 'smoke.mjs'},rollupOptions:{external:['node:fs','zod','dexie','cmu-pronouncing-dictionary']},minify:false}};
