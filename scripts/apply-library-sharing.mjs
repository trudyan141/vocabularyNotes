// Authorized additive rollout. Credentials stay local; hosted behavioral fixtures roll back.
import {readFile} from 'node:fs/promises';
process.loadEnvFile('.env.local');
const token=process.env.SUPABASE_ACCESS_TOKEN,project=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.match(/^([a-z0-9]+)\.supabase\.co$/)?.[1];
if(!token||!project)throw Error('Missing local management configuration');
async function query(sql){const response=await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(30000)});if(!response.ok){const result=await response.json();throw Error(`Management SQL HTTP ${response.status}: ${String(result.message).slice(0,1200)}`);}return response.json();}
const manifest="select md5(string_agg(pg_get_constraintdef(oid),E'\\n' order by conrelid,conname)) as digest from pg_constraint where conrelid in ('public.review_states'::regclass,'public.review_events'::regclass,'public.game_attempts'::regclass,'public.practice_sessions'::regclass)";
const [before]=await query(manifest);
const [preflight]=await query("select (select n.nspname from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='pgcrypto') as crypto_schema,to_regprocedure('public.wfk_share(text,jsonb)') is not null as installed");
if(preflight.crypto_schema&&preflight.crypto_schema!=='extensions')throw Error('Unexpected pgcrypto namespace; review the migration before applying');
if(!preflight.installed){await query(await readFile(new URL('../supabase/migrations/202610150011_library_sharing.sql',import.meta.url),'utf8'));console.log('PASS hosted additive sharing migration0011 applied');}
const [lifecycle]=await query("select exists(select 1 from pg_trigger where tgrelid='private.share_inbox'::regclass and tgname='share_inbox_library') as installed");if(!lifecycle.installed){await query(await readFile(new URL('../supabase/migrations/202610150012_sharing_lifecycle.sql',import.meta.url),'utf8'));console.log('PASS hosted private-sharing account lifecycle migration0012 applied');}
const [after]=await query(manifest);if(before.digest!==after.digest)throw Error('Legacy learning constraints changed');
const [permissions]=await query("select not has_table_privilege('anon','private.share_devices','select') and not has_table_privilege('authenticated','private.share_invites','select') and has_function_privilege('anon','public.wfk_share(text,jsonb)','execute') as verified");
if(!permissions.verified)throw Error('Sharing grants do not match the boundary');
console.log('PASS hosted grants and unchanged legacy learning constraints');
if(process.argv.includes('--migration-only'))process.exit(0);
const ids="'a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000003'";
const [collision]=await query(`select count(*) as count from auth.users where id in (${ids}) or email in ('owner@example.test','wife@example.test','other@example.test')`);if(Number(collision.count))throw Error('Fixture namespace occupied; no existing rows were changed');
let fixture=await readFile(new URL('../tests/sql/library-sharing.sql',import.meta.url),'utf8');
fixture=fixture.replaceAll('public.sharing_fixture','pg_temp.sharing_fixture').replace('create table pg_temp.sharing_fixture','create temporary table sharing_fixture');
fixture=fixture.replace("insert into auth.identities(user_id,provider) select id,'google' from auth.users", "insert into auth.identities(user_id,provider,provider_id,identity_data) select id,'google',id::text,jsonb_build_object('sub',id::text,'email',email,'email_verified',true) from auth.users");
const lifecycleFixture=await readFile(new URL('../tests/sql/library-sharing-lifecycle.sql',import.meta.url),'utf8');
await query(`begin;set local lock_timeout='5s';set local statement_timeout='25s';${fixture}\n${lifecycleFixture}\nrollback;select true as fixtures_rolled_back;`);
const [clean]=await query(`select count(*) as count from auth.users where id in (${ids})`);if(Number(clean.count))throw Error('Fixture cleanup did not finish');
console.log('PASS hosted rollback fixtures: A/B roles, inbox, signed-out claim, progress/SRS, projections, paging, quotas, revoke/expiry; sample accounts/data absent after rollback');
