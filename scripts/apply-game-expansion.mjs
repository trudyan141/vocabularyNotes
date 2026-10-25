// Additive rollout with bounded locks and rollback-only isolated hosted fixtures.
import {readFile} from 'node:fs/promises';
process.loadEnvFile('.env.local');
const token=process.env.SUPABASE_ACCESS_TOKEN;
const project=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.match(/^([a-z0-9]+)\.supabase\.co$/)?.[1];
if(!token||!project)throw Error('Missing local management configuration');
async function query(sql){const response=await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(45000)});if(!response.ok){const result=await response.json();throw Error(`SQL HTTP ${response.status}: ${String(result.message).slice(0,1000)}`);}return response.json();}
const migration=await readFile('supabase/migrations/202610240014_game_expansion.sql','utf8');
const strip=sql=>sql.replace(/^begin;$/gm,'').replace(/^(commit|rollback);$/gm,'');
const fixture=strip(await readFile('tests/sql/game-expansion.sql','utf8'));
const [collision]=await query("select exists(select 1 from auth.users where id='f1000000-0000-4000-8000-000000000001' or email='games-owner@example.test') as occupied");
if(collision.occupied)throw Error('Fixture namespace occupied; stopped without changes');
const manifest="select md5(string_agg(pg_get_constraintdef(oid),E'\\n' order by conrelid,conname)) as digest from pg_constraint where conrelid in ('public.review_states'::regclass,'public.review_events'::regclass,'public.game_attempts'::regclass)";
const [before]=await query(manifest);
const [state]=await query("select exists(select 1 from pg_trigger where tgrelid='public.practice_sessions'::regclass and tgname='validate_expansion') as installed");
await query(`begin;set local lock_timeout='5s';set local statement_timeout='25s';${state.installed?'':strip(migration)}\n${fixture}\nrollback;select true as verified;`);
console.log('PASS hosted rollback fixture: expansion contracts, ownership and projections');
if(process.argv.includes('--apply')&&!state.installed){await query(migration);console.log('PASS hosted migration0014 applied');}
else if(!state.installed){console.log('Fixture only; use --apply for rollout');process.exit(0);}
const [after]=await query(manifest);
if(before.digest!==after.digest)throw Error('Legacy learning constraints changed');
const [check]=await query("select exists(select 1 from pg_trigger where tgrelid='public.practice_sessions'::regclass and tgname='validate_expansion') as installed,(select pg_get_constraintdef(oid) like '%memory-pairs%' from pg_constraint where conrelid='public.practice_sessions'::regclass and conname='practice_sessions_mode_check') as modes,not exists(select 1 from auth.users where id='f1000000-0000-4000-8000-000000000001') as clean");
if(!check.installed||!check.modes||!check.clean)throw Error('Hosted verification failed');
console.log('PASS installed trigger/modes, unchanged legacy learning constraints, no fixture records remain');
