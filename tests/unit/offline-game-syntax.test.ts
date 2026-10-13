import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {it,expect} from 'vitest';
it('offline game modules parse before any UI handlers are attached',()=>{
 for(const file of ['public/offline-games.js','public/offline-missing-letters.js']){const source=readFileSync(file,'utf8').replace(/^import .*$/mg,'').replace(/^export /mg,'');expect(()=>new Script(source,{filename:file})).not.toThrow();}
});
