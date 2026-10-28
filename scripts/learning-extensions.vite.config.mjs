import {resolve} from 'node:path';
export default {envDir:false,resolve:{alias:{'@':resolve('src')}},build:{target:'node24',outDir:'.local/learning-extensions-ops',emptyOutDir:true,lib:{entry:resolve('scripts/learning-extensions-hosted.ts'),formats:['es'],fileName:()=> 'hosted.mjs'},rollupOptions:{external:['node:fs','node:path','node:crypto','zod']},minify:false}};
