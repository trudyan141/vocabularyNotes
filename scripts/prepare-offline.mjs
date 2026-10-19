import ts from 'typescript';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const source=await readFile('src/lib/learning/srs.ts','utf8');
const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});
await writeFile('public/offline-srs.js',result.outputText);

await mkdir("public/fonts",{recursive:true});
await copyFile("src/app/fonts/nunito-variable.woff2","public/fonts/nunito.woff2");
await copyFile("src/app/fonts/OFL.txt","public/fonts/OFL.txt");

for(const [input,output] of [['src/domain/identity.ts','public/offline-identity.js'],['src/lib/pronunciation/prepared.ts','public/offline-prepared-ipa.js'],['src/lib/audio/voices.ts','public/offline-voices.js'],['src/lib/learning/missing-letters.ts','public/offline-missing-letters.js'],['src/lib/learning/coverage.ts','public/offline-coverage.js']]){const source=await readFile(input,'utf8');await writeFile(output,ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);}

const online=JSON.parse(await readFile('src/lib/media/online-illustrations.json','utf8'));
const illustrations=JSON.parse(await readFile('src/lib/media/open-illustrations.json','utf8'));
await writeFile('public/open-illustrations.js',`export const openIllustrations=${JSON.stringify(illustrations)};
const onlineIds=${JSON.stringify(online.map(item=>item.id))};
export const illustrationPath=value=>value?.startsWith('online-openmoji-')&&onlineIds.includes(value.slice(16))?'/illustrations/online/'+value.slice(16):openIllustrations.some(item=>item.id===value)?'/illustrations/openmoji/'+value.slice(9)+'.svg':'/illustrations/'+value+'.svg';
`);
