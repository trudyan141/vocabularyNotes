// Isolated fallback for hosts where native PostgreSQL cannot allocate shared memory.
// Supply an installed @electric-sql/pglite module path; no app dependency is added.
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
if(!process.env.TASK_PGLITE_MODULE)throw new Error('Set TASK_PGLITE_MODULE to the PGlite dist/index.js path');
const {PGlite}=await import(pathToFileURL(process.env.TASK_PGLITE_MODULE).href);
const db=new PGlite();
const files=['tests/sql/bootstrap.sql',...['library','storage','keys','sync','lifecycle','media'].map((name,index)=>`supabase/migrations/20261010000${index+1}_${name}.sql`),'tests/sql/realtime-bootstrap.sql','supabase/migrations/202610110007_realtime.sql','tests/sql/realtime.sql'];
try{for(const file of files){try{await db.exec(await readFile(file,'utf8'));console.log('PASS',file);}catch(error){console.error('FAIL',file,error.message);process.exitCode=1;break;}}}finally{await db.close();}
