// Additive mode constraint only; no learning/history rows or RLS changes.
import {readFile} from 'node:fs/promises';
process.loadEnvFile('.env.local');
const token=process.env.SUPABASE_ACCESS_TOKEN,project=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.match(/^([a-z0-9]+)\.supabase\.co$/)?.[1];
if(!token||!project)throw Error('Missing local SQL management configuration');
async function query(sql){const response=await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(30000)});if(!response.ok){const error=await response.json();throw Error(`SQL request failed HTTP ${response.status}: ${String(error.message).slice(0,1200)}`);}return response.json();}
const migration=await readFile(new URL('../supabase/migrations/202610130009_missing_letters_game.sql',import.meta.url),'utf8');
const fixture=migration.replaceAll('public.practice_sessions','pg_temp.wfk_missing_letters_sessions').replace(/^begin;$/m,'').replace(/^commit;$/m,'');
await query(`begin; create temporary table wfk_missing_letters_sessions (id integer primary key,mode text not null constraint practice_sessions_mode_check check(mode in ('flashcard','picture-word','word-picture','letters','spelling','grammar'))); insert into wfk_missing_letters_sessions values (1,'flashcard'),(2,'letters'),(3,'spelling'),(4,'grammar'),(5,'picture-word'),(6,'word-picture'); ${fixture} insert into wfk_missing_letters_sessions values (7,'missing-letters'); do $probe$ begin begin insert into wfk_missing_letters_sessions values (8,'invalid'); raise exception 'Unknown mode was accepted'; exception when check_violation then null; end; if (select count(*) from wfk_missing_letters_sessions)<>7 then raise exception 'Fixture rows changed'; end if; end $probe$; rollback; select true as fixture_verified;`);
console.log('PASS SQL rollback fixture: retains six existing modes, accepts short spelling, rejects unknown mode');
if(process.argv.includes('--fixture-only'))process.exit(0);
const check="select pg_get_constraintdef(oid) as definition from pg_constraint where conrelid='public.practice_sessions'::regclass and conname='practice_sessions_mode_check'";
const [before]=await query(check);
if(!before?.definition?.includes("'missing-letters'"))await query(migration);
const [after]=await query(check);if(!after?.definition?.includes("'missing-letters'")||!after.definition.includes("'grammar'"))throw Error('Mode constraint verification failed');
console.log('PASS hosted migration 0009 verified; old modes and session rows retained');
