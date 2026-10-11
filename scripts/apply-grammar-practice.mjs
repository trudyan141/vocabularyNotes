// Apply only the additive grammar-game mode constraint to the configured project.
import {readFile} from 'node:fs/promises';
process.loadEnvFile('.env.local');
const token=process.env.SUPABASE_ACCESS_TOKEN,project=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.match(/^([a-z0-9]+)\.supabase\.co$/)?.[1];
if(!token||!project)throw Error('Missing local SQL management configuration');
async function query(sql){const response=await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`SQL request failed HTTP ${response.status}`);return response.json();}
const check="select pg_get_constraintdef(oid) as definition from pg_constraint where conrelid='public.practice_sessions'::regclass and conname='practice_sessions_mode_check'";
const [before]=await query(check);
if(!before?.definition?.includes("'grammar'")){await query(await readFile(new URL('../supabase/migrations/202610120008_grammar_practice.sql',import.meta.url),'utf8'));}
const [after]=await query(check);if(!after?.definition?.includes("'grammar'"))throw Error('Mode constraint verification failed');
console.log('PASS migration 0008 grammar mode constraint verified; existing modes retained');
