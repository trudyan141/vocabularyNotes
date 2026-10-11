// Apply only migration 0007 to the Supabase project configured in this checkout.
import {readFile} from 'node:fs/promises';
try {process.loadEnvFile('.env.local');} catch {}
const token=process.env.SUPABASE_ACCESS_TOKEN;
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
if(!token||!url){console.error('Missing local SUPABASE_ACCESS_TOKEN or NEXT_PUBLIC_SUPABASE_URL. No SQL was run.');process.exit(1);}
const project=new URL(url).hostname.match(/^([a-z0-9]+)\.supabase\.co$/)?.[1];
if(!project){console.error('Unsupported project URL. No SQL was run.');process.exit(1);}
async function query(sql){const response=await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error(`Management SQL request failed (HTTP ${response.status})`);return response.json();}
try {
 const check="select to_regprocedure('public.wfk_update_preferences(uuid,jsonb)') is not null as preferences, exists(select 1 from pg_trigger where tgname='preferences_changed' and tgrelid='public.libraries'::regclass) as notification";
 const [before]=await query(check);
 if(before.preferences&&before.notification){console.log('Migration 0007 already present; no changes.');process.exit(0);}
 if(before.preferences||before.notification)throw Error('Partial migration detected; inspect before applying.');
 if(!process.argv.includes('--apply')){console.log('Migration 0007 missing. Pass --apply to apply the checked file.');process.exit(0);}
 await query(await readFile(new URL('../supabase/migrations/202610110007_realtime.sql',import.meta.url),'utf8'));
 const [after]=await query(check);if(!after.preferences||!after.notification)throw Error('Post-apply verification failed.');
 await query("notify pgrst, 'reload schema'");console.log('PASS migration 0007 applied; preference RPC and notification trigger verified.');
} catch(error){console.error(error.message);process.exitCode=1;}
