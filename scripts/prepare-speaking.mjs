// Local installed dependency assets; lazy runtime, never in service-worker install precache.
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
const base='public/speaking';await mkdir(base+'/runtime',{recursive:true});
for(const file of ['transformers.min.js','ort-wasm-simd-threaded.jsep.mjs','ort-wasm-simd-threaded.jsep.wasm'])await copyFile('node_modules/@huggingface/transformers/dist/'+file,base+'/runtime/'+file);
for(const name of ['model','ctc'])await writeFile(`${base}/${name}.js`,ts.transpileModule(await readFile(`src/lib/speaking/${name}.ts`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);

await mkdir(base+'/hashes',{recursive:true});
for(const file of ['sha2.js','_md.js','_u64.js','utils.js','LICENSE'])await copyFile('node_modules/@noble/hashes/'+file,base+'/hashes/'+file);
