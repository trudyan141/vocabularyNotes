from pathlib import Path
import re
# Migration generator is deterministic; schema below is the source for initial tables.
entities={
'lessons':"title text not null check (length(title)<=200), learned_on date not null, source_type text not null check(source_type in ('manual','image')), source_digest text",
'vocabulary_entries':"display_text text not null check(length(display_text) between 1 and 200), canonical_key text not null, key_version integer not null default 1 check(key_version=1), language text not null default 'en' check(language='en'), case_mode text not null default 'fold' check(case_mode in ('fold','exact')), kind text not null check(kind in ('word','phrase'))",
'entry_senses':"entry_id uuid not null, pos text not null, sense_label text not null, identity_key text not null, definition_en text not null default '', meaning_vi text not null default '', origin text not null check(origin in ('source','user','ai_generated')), pronunciations jsonb not null default '[]' check(jsonb_typeof(pronunciations)='array'), content_version bigint not null default 1 check(content_version>0), learning_approval_status text not null default 'pending' check(learning_approval_status in ('pending','approved','rejected')), approved_content_version bigint, check(learning_approval_status<>'approved' or (approved_content_version is not null and approved_content_version=content_version))",
'sentences':"text_en text not null, normalized_key text not null, translation_vi text not null default '', analysis_tokens jsonb not null default '[]', pronunciations jsonb not null default '[]', origin text not null check(origin in ('source','user','ai_generated')), content_version bigint not null default 1, learning_approval_status text not null default 'pending' check(learning_approval_status in ('pending','approved','rejected')), approved_content_version bigint, check(learning_approval_status<>'approved' or (approved_content_version is not null and approved_content_version=content_version))",
'patterns':"display_pattern text not null, canonical_pattern_key text not null, slots jsonb not null default '[]', explanation_en text not null default '', explanation_vi text not null default '', content_version bigint not null default 1, learning_approval_status text not null default 'pending' check(learning_approval_status in ('pending','approved','rejected')), approved_content_version bigint, check(learning_approval_status<>'approved' or (approved_content_version is not null and approved_content_version=content_version))",
'grammar_items':"title text not null, rule_key text not null, explanation_en text not null default '', explanation_vi text not null default '', formula text not null default '', common_mistakes jsonb not null default '[]', content_version bigint not null default 1, learning_approval_status text not null default 'pending' check(learning_approval_status in ('pending','approved','rejected')), approved_content_version bigint, check(learning_approval_status<>'approved' or (approved_content_version is not null and approved_content_version=content_version))",
'source_evidence':"lesson_id uuid not null, literal_text text not null check(length(literal_text)<=2500), page_index integer not null default 0 check(page_index>=0), bbox jsonb, confidence_label text",
'source_assets':"lesson_id uuid not null, storage_mode text not null check(storage_mode in ('cloud','local')), media_key text, mime text not null check(mime in ('image/jpeg','image/png','image/webp')), width integer not null check(width>0), height integer not null check(height>0), expiry timestamptz",
'surface_forms':"entry_id uuid not null, surface text not null, variant_type text not null, user_confirmed boolean not null default false",
'examples':"sense_id uuid, pattern_id uuid, grammar_id uuid, text_en text not null, translation_vi text not null default '', origin text not null check(origin in ('source','user','ai_generated')), source_evidence_id uuid, pronunciations jsonb not null default '[]', check(num_nonnulls(sense_id,pattern_id,grammar_id)=1)",
'lesson_vocabulary':"lesson_id uuid not null, entry_id uuid not null, sense_id uuid, evidence_id uuid",
'lesson_sentences':"lesson_id uuid not null, sentence_id uuid not null, evidence_id uuid",
'lesson_patterns':"lesson_id uuid not null, pattern_id uuid not null, evidence_id uuid",
'lesson_grammar':"lesson_id uuid not null, grammar_id uuid not null, evidence_id uuid",
'notes':"sense_id uuid, lesson_id uuid, sentence_id uuid, pattern_id uuid, grammar_id uuid, text text not null check(length(text)<=10000), mnemonic_data jsonb, origin text not null default 'user' check(origin='user'), check(num_nonnulls(sense_id,lesson_id,sentence_id,pattern_id,grammar_id)=1), check(mnemonic_data is null or (jsonb_typeof(mnemonic_data)='object' and mnemonic_data->>'template' in ('word-association','sentence-chunks','grammar-transform')))",
'media_assets':"sense_id uuid not null, kind text not null check(kind in ('image','audio')), asset_key text not null, provider text not null, provider_asset_id text not null, source_page_url text not null, creator text not null, license_code text not null, license_version text, license_url text not null, attribution_text text not null, permitted_uses jsonb not null default '[]', derivative_license text, verified_at timestamptz, approval_version bigint, reviewer uuid, ready_status text not null default 'pending' check(ready_status in ('pending','ready','rejected','revoked')), content_hash text not null, dimensions jsonb, mime text not null, style text, hint_description text, check(ready_status<>'ready' or (verified_at is not null and approval_version is not null and reviewer is not null and reviewer=owner_id))",
'decks':"name text not null, query_filters jsonb, direction text not null check(direction in ('en-vi','vi-en'))",
'deck_items':"deck_id uuid not null, sense_id uuid not null",
'practice_sessions':"mode text not null check(mode in ('flashcard','picture-word','word-picture','letters','spelling')), deck_snapshot jsonb not null, position integer not null default 0 check(position>=0), completed_at timestamptz",
'review_events':"sense_id uuid not null, session_id uuid not null, rating text not null check(rating in ('Again','Hard','Good','Easy')), hints boolean not null default false, response_ms integer check(response_ms>=0), event_time timestamptz not null, accepted_sequence bigint generated always as identity",
'game_attempts':"sense_id uuid not null, session_id uuid not null, question_id uuid not null, answer text not null, is_correct boolean not null, hints boolean not null default false, accepted_sequence bigint generated always as identity",
'review_states':"sense_id uuid not null, card_type text not null, algorithm_version integer not null default 1 check(algorithm_version=1), interval_days integer not null check(interval_days between 0 and 365), ease numeric not null check(ease between 1.3 and 3), streak integer not null check(streak>=0), due_at timestamptz not null, last_event_seq bigint not null",
}
refs={'entry_id':'vocabulary_entries','sense_id':'entry_senses','lesson_id':'lessons','sentence_id':'sentences','pattern_id':'patterns','grammar_id':'grammar_items','evidence_id':'source_evidence','source_evidence_id':'source_evidence','deck_id':'decks','session_id':'practice_sessions'}
sql='''-- Words for Kids: initial relational schema. Apply only to an authorized Supabase project.
-- Google/Auth/Storage API integration is not implied by this migration.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table public.libraries (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check(length(name) between 1 and 200), locale text not null default 'vi' check(locale in ('vi','en')),
 level text not null default 'Beginner' check(level in ('Beginner','Intermediate')), preferences jsonb not null default '{}',
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 unique(owner_id), unique(owner_id,id)
);
'''
for table,fields in entities.items():
 sql+=f'''create table public.{table} (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 {fields},
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
'''
for table,fields in entities.items():
 for field,target in refs.items():
  if re.search(r'\b'+field+r' uuid',fields):
   sql+=f'alter table public.{table} add foreign key(owner_id,library_id,{field}) references public.{target}(owner_id,library_id,id) on delete cascade;\n'
   sql+=f'create index {table}_{field}_idx on public.{table}(owner_id,library_id,{field});\n'
 sql+=f'create index {table}_scope_updated_idx on public.{table}(owner_id,library_id,updated_at,id);\n'
sql+='''alter table public.entry_senses add unique(owner_id,library_id,entry_id,id);
alter table public.lesson_vocabulary add foreign key(owner_id,library_id,entry_id,sense_id) references public.entry_senses(owner_id,library_id,entry_id,id) on delete cascade;
create unique index vocabulary_active_key on public.vocabulary_entries(library_id,language,canonical_key,case_mode) where deleted_at is null;
create unique index sense_identity on public.entry_senses(library_id,entry_id,identity_key);
create unique index sentence_active_key on public.sentences(library_id,normalized_key) where deleted_at is null;
create unique index pattern_active_key on public.patterns(library_id,canonical_pattern_key) where deleted_at is null;
create unique index lesson_vocabulary_unique on public.lesson_vocabulary(library_id,lesson_id,entry_id,coalesce(sense_id,'00000000-0000-0000-0000-000000000000'::uuid));
create unique index lesson_sentence_unique on public.lesson_sentences(library_id,lesson_id,sentence_id);
create unique index lesson_pattern_unique on public.lesson_patterns(library_id,lesson_id,pattern_id);
create unique index lesson_grammar_unique on public.lesson_grammar(library_id,lesson_id,grammar_id);
create unique index deck_sense_unique on public.deck_items(library_id,deck_id,sense_id);
create unique index review_state_unique on public.review_states(library_id,sense_id,card_type);
create unique index attempt_question_unique on public.game_attempts(library_id,session_id,question_id);
create function private.stamp_record() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if NEW.id<>OLD.id or NEW.owner_id<>OLD.owner_id then raise exception 'immutable ownership'; end if;
  if TG_TABLE_NAME<>'libraries' and to_jsonb(NEW)->>'library_id'<>to_jsonb(OLD)->>'library_id' then raise exception 'immutable library'; end if;
  NEW.created_at:=OLD.created_at; NEW.version:=OLD.version+1;
 else NEW.created_at:=now(); NEW.version:=1; end if;
 NEW.updated_at:=now();return NEW;
end $$;
revoke all on function private.stamp_record() from public,anon,authenticated;
'''
for table in ['libraries']+list(entities):
 sql+=f'''alter table public.{table} enable row level security;
alter table public.{table} force row level security;
create policy owner_select on public.{table} for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.{table} for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.{table} from public,anon,authenticated;
grant select,insert on public.{table} to authenticated;
'''
 if table not in ['review_events','game_attempts','review_states']:
  sql+=f'''create policy owner_update on public.{table} for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.{table} for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.{table} to authenticated;
create trigger stamp before insert or update on public.{table} for each row execute function private.stamp_record();
'''
 else:
  # Schedule is written by a future authorized event reducer, never by the browser.
  if table=='review_states':sql+=f'revoke insert on public.{table} from authenticated;\n'
  sql+=f'create trigger stamp before insert on public.{table} for each row execute function private.stamp_record();\n'
sql+='''grant usage on schema public to authenticated;
grant usage,select on sequence public.review_events_accepted_sequence_seq,public.game_attempts_accepted_sequence_seq to authenticated;
create table private.sync_receipts(owner_id uuid not null references auth.users(id) on delete cascade,operation_id uuid not null,payload_hash text not null,result jsonb not null,created_at timestamptz not null default now(),primary key(owner_id,operation_id));
create table private.transfer_maps(owner_id uuid not null references auth.users(id) on delete cascade,transfer_id uuid not null,local_id uuid not null,remote_id uuid not null,payload_hash text not null,primary key(owner_id,transfer_id,local_id));
revoke all on all tables in schema private from public,anon,authenticated;
commit;
'''
Path('supabase/migrations/202610100001_library.sql').write_text(sql)
