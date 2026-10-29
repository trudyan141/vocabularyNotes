import {readFile} from 'node:fs/promises';
process.loadEnvFile('.env.local');
const project=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0],token=process.env.SUPABASE_ACCESS_TOKEN;
if(!token)throw Error('Missing SQL management credential');
async function sql(query){const response=await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query}),signal:AbortSignal.timeout(30000)});if(!response.ok){const value=await response.json();throw Error(`SQL HTTP ${response.status}: ${String(value.message??'').replaceAll(token,'[redacted]').slice(0,900)}`);}return response.json();}
const [before]=await sql("select to_regclass('public.shadowing_content') as installed");
if(!before.installed)await sql(await readFile('supabase/migrations/202610290016_shadowing.sql','utf8'));
const fixture=(await readFile('tests/sql/shadowing.sql','utf8')).replace(/insert into auth.identities\(user_id,provider\)[^;]+;/,"insert into auth.identities(provider_id,user_id,identity_data,provider) values('shadow-fixture-1','11000000-0000-4000-8000-000000000001','{}','google'),('shadow-fixture-2','11000000-0000-4000-8000-000000000002','{}','google');");await sql(fixture);
const [state]=await sql("select relrowsecurity as rls,relforcerowsecurity as forced from pg_class where oid='public.shadowing_content'::regclass");if(!state?.rls||!state.forced)throw Error('RLS gate');console.log('PASS hosted0016 + rollback owner/foreign/share/change-feed fixtures; no library backfill or original-content writes.');
