import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,execFile} from 'node:child_process';
import {promisify} from 'node:util';
const bin=process.env.TASK_PG_BIN??'/usr/local/opt/postgresql@15/bin';
const root=await mkdtemp(join(tmpdir(),'wfk-sharing-sql-'));
const run=(tool,args)=>execFileSync(join(bin,tool),args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});
try{
 run('initdb',['-D',join(root,'data'),'-U','wfk_test','--auth=trust','--no-locale','--encoding=UTF8']);
 run('pg_ctl',['-D',join(root,'data'),'-l',join(root,'server.log'),'-o',`-k ${root} -p 54377 -c listen_addresses=''`,'-w','start']);
 const query=sql=>run('psql',['-X','-v','ON_ERROR_STOP=1','-h',root,'-p','54377','-U','wfk_test','-d','postgres','-c',sql]);
 const file=p=>run('psql',['-X','-v','ON_ERROR_STOP=1','-h',root,'-p','54377','-U','wfk_test','-d','postgres','-f',p]);
 file('tests/sql/bootstrap.sql');file('tests/sql/realtime-bootstrap.sql');
 const migrations=['202610100001_library','202610100002_storage','202610100003_keys','202610100004_sync','202610100005_lifecycle','202610100006_media','202610110007_realtime','202610120008_grammar_practice','202610130009_missing_letters_game','202610140010_grammar_cards','202610150011_library_sharing','202610150012_sharing_lifecycle','202610190013_practice_coverage','202610240014_game_expansion'];
 for(const name of migrations)file(`supabase/migrations/${name}.sql`);
 console.log('PASS SQL sharing migration applied on isolated PostgreSQL15');
 if(process.argv.includes('--migration-only'))process.exitCode=0;
 else {
  file('tests/sql/library-sharing.sql');
  const asyncRun=promisify(execFile),args=['-X','-v','ON_ERROR_STOP=1','-h',root,'-p','54377','-U','wfk_test','-d','postgres'];
  const claim=letter=>asyncRun(join(bin,'psql'),[...args,'-c',`set role anon;set request.jwt.claim.sub='';select public.wfk_share('claim',jsonb_build_object('code',(select value->'results'->0->>'code' from public.sharing_fixture where key='notifiedPair'),'binding',repeat('${letter}',64),'label','Race TV'));`]);
  const race=await Promise.allSettled([claim('c'),claim('d')]);
  if(race.filter(result=>result.status==='fulfilled'&&!result.value.stdout.includes('pairing-used')).length!==1||!race.some(result=>result.status==='fulfilled'&&result.value.stdout.includes('pairing-used')))throw new Error('Two-device claim race did not produce one winner');
  file('tests/sql/practice-coverage.sql');file('tests/sql/game-expansion.sql');
  file('tests/sql/library-sharing-lifecycle.sql');
  console.log('PASS SQL sharing roles, concurrent two-device claim, expiry, projection and shared progress');
 }
 void query;
}catch(error){console.error(error.stderr?.toString()??error.message);process.exitCode=1;}
finally{try{run('pg_ctl',['-D',join(root,'data'),'-m','immediate','stop']);}catch{}await rm(root,{recursive:true,force:true});}
