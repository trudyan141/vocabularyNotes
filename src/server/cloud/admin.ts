import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {cloudConfig} from './auth';
import {getServerEnv} from '@/server/env';
export function adminClient(){const config=cloudConfig(),env=getServerEnv();const key=env.SUPABASE_SECRET_KEY??env.SUPABASE_SERVICE_ROLE_KEY;if(!config||!key)return null;return createClient(config.url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,init)=>fetch(url,{...init,signal:AbortSignal.timeout(10000),cache:'no-store'})}});}
