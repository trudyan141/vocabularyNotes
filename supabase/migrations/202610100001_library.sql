-- Words for Kids: initial relational schema. Apply only to an authorized Supabase project.
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
create table public.lessons (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 title text not null check (length(title)<=200), learned_on date not null, source_type text not null check(source_type in ('manual','image')), source_digest text,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.vocabulary_entries (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 display_text text not null check(length(display_text) between 1 and 200), canonical_key text not null, key_version integer not null default 1 check(key_version=1), language text not null default 'en' check(language='en'), case_mode text not null default 'fold' check(case_mode in ('fold','exact')), kind text not null check(kind in ('word','phrase')),
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.entry_senses (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 entry_id uuid not null, pos text not null, sense_label text not null, identity_key text not null, definition_en text not null default '', meaning_vi text not null default '', origin text not null check(origin in ('source','user','ai_generated')), pronunciations jsonb not null default '[]' check(jsonb_typeof(pronunciations)='array'), content_version bigint not null default 1 check(content_version>0), learning_approval_status text not null default 'pending' check(learning_approval_status in ('pending','approved','rejected')), approved_content_version bigint, check(learning_approval_status<>'approved' or (approved_content_version is not null and approved_content_version=content_version)),
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.sentences (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 text_en text not null, normalized_key text not null, translation_vi text not null default '', analysis_tokens jsonb not null default '[]', pronunciations jsonb not null default '[]', origin text not null check(origin in ('source','user','ai_generated')), content_version bigint not null default 1, learning_approval_status text not null default 'pending' check(learning_approval_status in ('pending','approved','rejected')), approved_content_version bigint, check(learning_approval_status<>'approved' or (approved_content_version is not null and approved_content_version=content_version)),
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.patterns (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 display_pattern text not null, canonical_pattern_key text not null, slots jsonb not null default '[]', explanation_en text not null default '', explanation_vi text not null default '', content_version bigint not null default 1, learning_approval_status text not null default 'pending' check(learning_approval_status in ('pending','approved','rejected')), approved_content_version bigint, check(learning_approval_status<>'approved' or (approved_content_version is not null and approved_content_version=content_version)),
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.grammar_items (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 title text not null, rule_key text not null, explanation_en text not null default '', explanation_vi text not null default '', formula text not null default '', common_mistakes jsonb not null default '[]', content_version bigint not null default 1, learning_approval_status text not null default 'pending' check(learning_approval_status in ('pending','approved','rejected')), approved_content_version bigint, check(learning_approval_status<>'approved' or (approved_content_version is not null and approved_content_version=content_version)),
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.source_evidence (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 lesson_id uuid not null, literal_text text not null check(length(literal_text)<=2500), page_index integer not null default 0 check(page_index>=0), bbox jsonb, confidence_label text,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.source_assets (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 lesson_id uuid not null, storage_mode text not null check(storage_mode in ('cloud','local')), media_key text, mime text not null check(mime in ('image/jpeg','image/png','image/webp')), width integer not null check(width>0), height integer not null check(height>0), expiry timestamptz,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.surface_forms (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 entry_id uuid not null, surface text not null, variant_type text not null, user_confirmed boolean not null default false,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.examples (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 sense_id uuid, pattern_id uuid, grammar_id uuid, text_en text not null, translation_vi text not null default '', origin text not null check(origin in ('source','user','ai_generated')), source_evidence_id uuid, pronunciations jsonb not null default '[]', check(num_nonnulls(sense_id,pattern_id,grammar_id)=1),
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.lesson_vocabulary (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 lesson_id uuid not null, entry_id uuid not null, sense_id uuid, evidence_id uuid,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.lesson_sentences (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 lesson_id uuid not null, sentence_id uuid not null, evidence_id uuid,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.lesson_patterns (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 lesson_id uuid not null, pattern_id uuid not null, evidence_id uuid,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.lesson_grammar (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 lesson_id uuid not null, grammar_id uuid not null, evidence_id uuid,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.notes (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 sense_id uuid, lesson_id uuid, sentence_id uuid, pattern_id uuid, grammar_id uuid, text text not null check(length(text)<=10000), mnemonic_data jsonb, origin text not null default 'user' check(origin='user'), check(num_nonnulls(sense_id,lesson_id,sentence_id,pattern_id,grammar_id)=1), check(mnemonic_data is null or (jsonb_typeof(mnemonic_data)='object' and mnemonic_data->>'template' in ('word-association','sentence-chunks','grammar-transform'))),
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.media_assets (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 sense_id uuid not null, kind text not null check(kind in ('image','audio')), asset_key text not null, provider text not null, provider_asset_id text not null, source_page_url text not null, creator text not null, license_code text not null, license_version text, license_url text not null, attribution_text text not null, permitted_uses jsonb not null default '[]', derivative_license text, verified_at timestamptz, approval_version bigint, reviewer uuid, ready_status text not null default 'pending' check(ready_status in ('pending','ready','rejected','revoked')), content_hash text not null, dimensions jsonb, mime text not null, style text, hint_description text, check(ready_status<>'ready' or (verified_at is not null and approval_version is not null and reviewer is not null and reviewer=owner_id)),
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.decks (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 name text not null, query_filters jsonb, direction text not null check(direction in ('en-vi','vi-en')),
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.deck_items (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 deck_id uuid not null, sense_id uuid not null,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.practice_sessions (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 mode text not null check(mode in ('flashcard','picture-word','word-picture','letters','spelling')), deck_snapshot jsonb not null, position integer not null default 0 check(position>=0), completed_at timestamptz,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.review_events (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 sense_id uuid not null, session_id uuid not null, rating text not null check(rating in ('Again','Hard','Good','Easy')), hints boolean not null default false, response_ms integer check(response_ms>=0), event_time timestamptz not null, accepted_sequence bigint generated always as identity,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.game_attempts (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 sense_id uuid not null, session_id uuid not null, question_id uuid not null, answer text not null, is_correct boolean not null, hints boolean not null default false, accepted_sequence bigint generated always as identity,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create table public.review_states (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 sense_id uuid not null, card_type text not null, algorithm_version integer not null default 1 check(algorithm_version=1), interval_days integer not null check(interval_days between 0 and 365), ease numeric not null check(ease between 1.3 and 3), streak integer not null check(streak>=0), due_at timestamptz not null, last_event_seq bigint not null,
 unique(owner_id,library_id,id), foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create index lessons_scope_updated_idx on public.lessons(owner_id,library_id,updated_at,id);
create index vocabulary_entries_scope_updated_idx on public.vocabulary_entries(owner_id,library_id,updated_at,id);
alter table public.entry_senses add foreign key(owner_id,library_id,entry_id) references public.vocabulary_entries(owner_id,library_id,id) on delete cascade;
create index entry_senses_entry_id_idx on public.entry_senses(owner_id,library_id,entry_id);
create index entry_senses_scope_updated_idx on public.entry_senses(owner_id,library_id,updated_at,id);
create index sentences_scope_updated_idx on public.sentences(owner_id,library_id,updated_at,id);
create index patterns_scope_updated_idx on public.patterns(owner_id,library_id,updated_at,id);
create index grammar_items_scope_updated_idx on public.grammar_items(owner_id,library_id,updated_at,id);
alter table public.source_evidence add foreign key(owner_id,library_id,lesson_id) references public.lessons(owner_id,library_id,id) on delete cascade;
create index source_evidence_lesson_id_idx on public.source_evidence(owner_id,library_id,lesson_id);
create index source_evidence_scope_updated_idx on public.source_evidence(owner_id,library_id,updated_at,id);
alter table public.source_assets add foreign key(owner_id,library_id,lesson_id) references public.lessons(owner_id,library_id,id) on delete cascade;
create index source_assets_lesson_id_idx on public.source_assets(owner_id,library_id,lesson_id);
create index source_assets_scope_updated_idx on public.source_assets(owner_id,library_id,updated_at,id);
alter table public.surface_forms add foreign key(owner_id,library_id,entry_id) references public.vocabulary_entries(owner_id,library_id,id) on delete cascade;
create index surface_forms_entry_id_idx on public.surface_forms(owner_id,library_id,entry_id);
create index surface_forms_scope_updated_idx on public.surface_forms(owner_id,library_id,updated_at,id);
alter table public.examples add foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade;
create index examples_sense_id_idx on public.examples(owner_id,library_id,sense_id);
alter table public.examples add foreign key(owner_id,library_id,pattern_id) references public.patterns(owner_id,library_id,id) on delete cascade;
create index examples_pattern_id_idx on public.examples(owner_id,library_id,pattern_id);
alter table public.examples add foreign key(owner_id,library_id,grammar_id) references public.grammar_items(owner_id,library_id,id) on delete cascade;
create index examples_grammar_id_idx on public.examples(owner_id,library_id,grammar_id);
alter table public.examples add foreign key(owner_id,library_id,source_evidence_id) references public.source_evidence(owner_id,library_id,id) on delete cascade;
create index examples_source_evidence_id_idx on public.examples(owner_id,library_id,source_evidence_id);
create index examples_scope_updated_idx on public.examples(owner_id,library_id,updated_at,id);
alter table public.lesson_vocabulary add foreign key(owner_id,library_id,entry_id) references public.vocabulary_entries(owner_id,library_id,id) on delete cascade;
create index lesson_vocabulary_entry_id_idx on public.lesson_vocabulary(owner_id,library_id,entry_id);
alter table public.lesson_vocabulary add foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade;
create index lesson_vocabulary_sense_id_idx on public.lesson_vocabulary(owner_id,library_id,sense_id);
alter table public.lesson_vocabulary add foreign key(owner_id,library_id,lesson_id) references public.lessons(owner_id,library_id,id) on delete cascade;
create index lesson_vocabulary_lesson_id_idx on public.lesson_vocabulary(owner_id,library_id,lesson_id);
alter table public.lesson_vocabulary add foreign key(owner_id,library_id,evidence_id) references public.source_evidence(owner_id,library_id,id) on delete cascade;
create index lesson_vocabulary_evidence_id_idx on public.lesson_vocabulary(owner_id,library_id,evidence_id);
create index lesson_vocabulary_scope_updated_idx on public.lesson_vocabulary(owner_id,library_id,updated_at,id);
alter table public.lesson_sentences add foreign key(owner_id,library_id,lesson_id) references public.lessons(owner_id,library_id,id) on delete cascade;
create index lesson_sentences_lesson_id_idx on public.lesson_sentences(owner_id,library_id,lesson_id);
alter table public.lesson_sentences add foreign key(owner_id,library_id,sentence_id) references public.sentences(owner_id,library_id,id) on delete cascade;
create index lesson_sentences_sentence_id_idx on public.lesson_sentences(owner_id,library_id,sentence_id);
alter table public.lesson_sentences add foreign key(owner_id,library_id,evidence_id) references public.source_evidence(owner_id,library_id,id) on delete cascade;
create index lesson_sentences_evidence_id_idx on public.lesson_sentences(owner_id,library_id,evidence_id);
create index lesson_sentences_scope_updated_idx on public.lesson_sentences(owner_id,library_id,updated_at,id);
alter table public.lesson_patterns add foreign key(owner_id,library_id,lesson_id) references public.lessons(owner_id,library_id,id) on delete cascade;
create index lesson_patterns_lesson_id_idx on public.lesson_patterns(owner_id,library_id,lesson_id);
alter table public.lesson_patterns add foreign key(owner_id,library_id,pattern_id) references public.patterns(owner_id,library_id,id) on delete cascade;
create index lesson_patterns_pattern_id_idx on public.lesson_patterns(owner_id,library_id,pattern_id);
alter table public.lesson_patterns add foreign key(owner_id,library_id,evidence_id) references public.source_evidence(owner_id,library_id,id) on delete cascade;
create index lesson_patterns_evidence_id_idx on public.lesson_patterns(owner_id,library_id,evidence_id);
create index lesson_patterns_scope_updated_idx on public.lesson_patterns(owner_id,library_id,updated_at,id);
alter table public.lesson_grammar add foreign key(owner_id,library_id,lesson_id) references public.lessons(owner_id,library_id,id) on delete cascade;
create index lesson_grammar_lesson_id_idx on public.lesson_grammar(owner_id,library_id,lesson_id);
alter table public.lesson_grammar add foreign key(owner_id,library_id,grammar_id) references public.grammar_items(owner_id,library_id,id) on delete cascade;
create index lesson_grammar_grammar_id_idx on public.lesson_grammar(owner_id,library_id,grammar_id);
alter table public.lesson_grammar add foreign key(owner_id,library_id,evidence_id) references public.source_evidence(owner_id,library_id,id) on delete cascade;
create index lesson_grammar_evidence_id_idx on public.lesson_grammar(owner_id,library_id,evidence_id);
create index lesson_grammar_scope_updated_idx on public.lesson_grammar(owner_id,library_id,updated_at,id);
alter table public.notes add foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade;
create index notes_sense_id_idx on public.notes(owner_id,library_id,sense_id);
alter table public.notes add foreign key(owner_id,library_id,lesson_id) references public.lessons(owner_id,library_id,id) on delete cascade;
create index notes_lesson_id_idx on public.notes(owner_id,library_id,lesson_id);
alter table public.notes add foreign key(owner_id,library_id,sentence_id) references public.sentences(owner_id,library_id,id) on delete cascade;
create index notes_sentence_id_idx on public.notes(owner_id,library_id,sentence_id);
alter table public.notes add foreign key(owner_id,library_id,pattern_id) references public.patterns(owner_id,library_id,id) on delete cascade;
create index notes_pattern_id_idx on public.notes(owner_id,library_id,pattern_id);
alter table public.notes add foreign key(owner_id,library_id,grammar_id) references public.grammar_items(owner_id,library_id,id) on delete cascade;
create index notes_grammar_id_idx on public.notes(owner_id,library_id,grammar_id);
create index notes_scope_updated_idx on public.notes(owner_id,library_id,updated_at,id);
alter table public.media_assets add foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade;
create index media_assets_sense_id_idx on public.media_assets(owner_id,library_id,sense_id);
create index media_assets_scope_updated_idx on public.media_assets(owner_id,library_id,updated_at,id);
create index decks_scope_updated_idx on public.decks(owner_id,library_id,updated_at,id);
alter table public.deck_items add foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade;
create index deck_items_sense_id_idx on public.deck_items(owner_id,library_id,sense_id);
alter table public.deck_items add foreign key(owner_id,library_id,deck_id) references public.decks(owner_id,library_id,id) on delete cascade;
create index deck_items_deck_id_idx on public.deck_items(owner_id,library_id,deck_id);
create index deck_items_scope_updated_idx on public.deck_items(owner_id,library_id,updated_at,id);
create index practice_sessions_scope_updated_idx on public.practice_sessions(owner_id,library_id,updated_at,id);
alter table public.review_events add foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade;
create index review_events_sense_id_idx on public.review_events(owner_id,library_id,sense_id);
alter table public.review_events add foreign key(owner_id,library_id,session_id) references public.practice_sessions(owner_id,library_id,id) on delete cascade;
create index review_events_session_id_idx on public.review_events(owner_id,library_id,session_id);
create index review_events_scope_updated_idx on public.review_events(owner_id,library_id,updated_at,id);
alter table public.game_attempts add foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade;
create index game_attempts_sense_id_idx on public.game_attempts(owner_id,library_id,sense_id);
alter table public.game_attempts add foreign key(owner_id,library_id,session_id) references public.practice_sessions(owner_id,library_id,id) on delete cascade;
create index game_attempts_session_id_idx on public.game_attempts(owner_id,library_id,session_id);
create index game_attempts_scope_updated_idx on public.game_attempts(owner_id,library_id,updated_at,id);
alter table public.review_states add foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade;
create index review_states_sense_id_idx on public.review_states(owner_id,library_id,sense_id);
create index review_states_scope_updated_idx on public.review_states(owner_id,library_id,updated_at,id);
alter table public.entry_senses add unique(owner_id,library_id,entry_id,id);
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
alter table public.libraries enable row level security;
alter table public.libraries force row level security;
create policy owner_select on public.libraries for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.libraries for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.libraries from public,anon,authenticated;
grant select,insert on public.libraries to authenticated;
create policy owner_update on public.libraries for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.libraries for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.libraries to authenticated;
create trigger stamp before insert or update on public.libraries for each row execute function private.stamp_record();
alter table public.lessons enable row level security;
alter table public.lessons force row level security;
create policy owner_select on public.lessons for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.lessons for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.lessons from public,anon,authenticated;
grant select,insert on public.lessons to authenticated;
create policy owner_update on public.lessons for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.lessons for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.lessons to authenticated;
create trigger stamp before insert or update on public.lessons for each row execute function private.stamp_record();
alter table public.vocabulary_entries enable row level security;
alter table public.vocabulary_entries force row level security;
create policy owner_select on public.vocabulary_entries for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.vocabulary_entries for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.vocabulary_entries from public,anon,authenticated;
grant select,insert on public.vocabulary_entries to authenticated;
create policy owner_update on public.vocabulary_entries for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.vocabulary_entries for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.vocabulary_entries to authenticated;
create trigger stamp before insert or update on public.vocabulary_entries for each row execute function private.stamp_record();
alter table public.entry_senses enable row level security;
alter table public.entry_senses force row level security;
create policy owner_select on public.entry_senses for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.entry_senses for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.entry_senses from public,anon,authenticated;
grant select,insert on public.entry_senses to authenticated;
create policy owner_update on public.entry_senses for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.entry_senses for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.entry_senses to authenticated;
create trigger stamp before insert or update on public.entry_senses for each row execute function private.stamp_record();
alter table public.sentences enable row level security;
alter table public.sentences force row level security;
create policy owner_select on public.sentences for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.sentences for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.sentences from public,anon,authenticated;
grant select,insert on public.sentences to authenticated;
create policy owner_update on public.sentences for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.sentences for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.sentences to authenticated;
create trigger stamp before insert or update on public.sentences for each row execute function private.stamp_record();
alter table public.patterns enable row level security;
alter table public.patterns force row level security;
create policy owner_select on public.patterns for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.patterns for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.patterns from public,anon,authenticated;
grant select,insert on public.patterns to authenticated;
create policy owner_update on public.patterns for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.patterns for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.patterns to authenticated;
create trigger stamp before insert or update on public.patterns for each row execute function private.stamp_record();
alter table public.grammar_items enable row level security;
alter table public.grammar_items force row level security;
create policy owner_select on public.grammar_items for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.grammar_items for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.grammar_items from public,anon,authenticated;
grant select,insert on public.grammar_items to authenticated;
create policy owner_update on public.grammar_items for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.grammar_items for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.grammar_items to authenticated;
create trigger stamp before insert or update on public.grammar_items for each row execute function private.stamp_record();
alter table public.source_evidence enable row level security;
alter table public.source_evidence force row level security;
create policy owner_select on public.source_evidence for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.source_evidence for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.source_evidence from public,anon,authenticated;
grant select,insert on public.source_evidence to authenticated;
create policy owner_update on public.source_evidence for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.source_evidence for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.source_evidence to authenticated;
create trigger stamp before insert or update on public.source_evidence for each row execute function private.stamp_record();
alter table public.source_assets enable row level security;
alter table public.source_assets force row level security;
create policy owner_select on public.source_assets for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.source_assets for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.source_assets from public,anon,authenticated;
grant select,insert on public.source_assets to authenticated;
create policy owner_update on public.source_assets for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.source_assets for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.source_assets to authenticated;
create trigger stamp before insert or update on public.source_assets for each row execute function private.stamp_record();
alter table public.surface_forms enable row level security;
alter table public.surface_forms force row level security;
create policy owner_select on public.surface_forms for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.surface_forms for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.surface_forms from public,anon,authenticated;
grant select,insert on public.surface_forms to authenticated;
create policy owner_update on public.surface_forms for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.surface_forms for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.surface_forms to authenticated;
create trigger stamp before insert or update on public.surface_forms for each row execute function private.stamp_record();
alter table public.examples enable row level security;
alter table public.examples force row level security;
create policy owner_select on public.examples for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.examples for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.examples from public,anon,authenticated;
grant select,insert on public.examples to authenticated;
create policy owner_update on public.examples for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.examples for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.examples to authenticated;
create trigger stamp before insert or update on public.examples for each row execute function private.stamp_record();
alter table public.lesson_vocabulary enable row level security;
alter table public.lesson_vocabulary force row level security;
create policy owner_select on public.lesson_vocabulary for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.lesson_vocabulary for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.lesson_vocabulary from public,anon,authenticated;
grant select,insert on public.lesson_vocabulary to authenticated;
create policy owner_update on public.lesson_vocabulary for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.lesson_vocabulary for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.lesson_vocabulary to authenticated;
create trigger stamp before insert or update on public.lesson_vocabulary for each row execute function private.stamp_record();
alter table public.lesson_sentences enable row level security;
alter table public.lesson_sentences force row level security;
create policy owner_select on public.lesson_sentences for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.lesson_sentences for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.lesson_sentences from public,anon,authenticated;
grant select,insert on public.lesson_sentences to authenticated;
create policy owner_update on public.lesson_sentences for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.lesson_sentences for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.lesson_sentences to authenticated;
create trigger stamp before insert or update on public.lesson_sentences for each row execute function private.stamp_record();
alter table public.lesson_patterns enable row level security;
alter table public.lesson_patterns force row level security;
create policy owner_select on public.lesson_patterns for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.lesson_patterns for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.lesson_patterns from public,anon,authenticated;
grant select,insert on public.lesson_patterns to authenticated;
create policy owner_update on public.lesson_patterns for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.lesson_patterns for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.lesson_patterns to authenticated;
create trigger stamp before insert or update on public.lesson_patterns for each row execute function private.stamp_record();
alter table public.lesson_grammar enable row level security;
alter table public.lesson_grammar force row level security;
create policy owner_select on public.lesson_grammar for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.lesson_grammar for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.lesson_grammar from public,anon,authenticated;
grant select,insert on public.lesson_grammar to authenticated;
create policy owner_update on public.lesson_grammar for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.lesson_grammar for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.lesson_grammar to authenticated;
create trigger stamp before insert or update on public.lesson_grammar for each row execute function private.stamp_record();
alter table public.notes enable row level security;
alter table public.notes force row level security;
create policy owner_select on public.notes for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.notes for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.notes from public,anon,authenticated;
grant select,insert on public.notes to authenticated;
create policy owner_update on public.notes for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.notes for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.notes to authenticated;
create trigger stamp before insert or update on public.notes for each row execute function private.stamp_record();
alter table public.media_assets enable row level security;
alter table public.media_assets force row level security;
create policy owner_select on public.media_assets for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.media_assets for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.media_assets from public,anon,authenticated;
grant select,insert on public.media_assets to authenticated;
create policy owner_update on public.media_assets for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.media_assets for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.media_assets to authenticated;
create trigger stamp before insert or update on public.media_assets for each row execute function private.stamp_record();
alter table public.decks enable row level security;
alter table public.decks force row level security;
create policy owner_select on public.decks for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.decks for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.decks from public,anon,authenticated;
grant select,insert on public.decks to authenticated;
create policy owner_update on public.decks for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.decks for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.decks to authenticated;
create trigger stamp before insert or update on public.decks for each row execute function private.stamp_record();
alter table public.deck_items enable row level security;
alter table public.deck_items force row level security;
create policy owner_select on public.deck_items for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.deck_items for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.deck_items from public,anon,authenticated;
grant select,insert on public.deck_items to authenticated;
create policy owner_update on public.deck_items for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.deck_items for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.deck_items to authenticated;
create trigger stamp before insert or update on public.deck_items for each row execute function private.stamp_record();
alter table public.practice_sessions enable row level security;
alter table public.practice_sessions force row level security;
create policy owner_select on public.practice_sessions for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.practice_sessions for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.practice_sessions from public,anon,authenticated;
grant select,insert on public.practice_sessions to authenticated;
create policy owner_update on public.practice_sessions for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy owner_delete on public.practice_sessions for delete to authenticated using(owner_id=(select auth.uid()));
grant update,delete on public.practice_sessions to authenticated;
create trigger stamp before insert or update on public.practice_sessions for each row execute function private.stamp_record();
alter table public.review_events enable row level security;
alter table public.review_events force row level security;
create policy owner_select on public.review_events for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.review_events for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.review_events from public,anon,authenticated;
grant select,insert on public.review_events to authenticated;
create trigger stamp before insert on public.review_events for each row execute function private.stamp_record();
alter table public.game_attempts enable row level security;
alter table public.game_attempts force row level security;
create policy owner_select on public.game_attempts for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.game_attempts for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.game_attempts from public,anon,authenticated;
grant select,insert on public.game_attempts to authenticated;
create trigger stamp before insert on public.game_attempts for each row execute function private.stamp_record();
alter table public.review_states enable row level security;
alter table public.review_states force row level security;
create policy owner_select on public.review_states for select to authenticated using (owner_id=(select auth.uid()));
create policy owner_insert on public.review_states for insert to authenticated with check (owner_id=(select auth.uid()));
revoke all on public.review_states from public,anon,authenticated;
grant select,insert on public.review_states to authenticated;
revoke insert on public.review_states from authenticated;
create trigger stamp before insert on public.review_states for each row execute function private.stamp_record();
grant usage on schema public to authenticated;
grant usage,select on sequence public.review_events_accepted_sequence_seq,public.game_attempts_accepted_sequence_seq to authenticated;
create table private.sync_receipts(owner_id uuid not null references auth.users(id) on delete cascade,operation_id uuid not null,payload_hash text not null,result jsonb not null,created_at timestamptz not null default now(),primary key(owner_id,operation_id));
create table private.transfer_maps(owner_id uuid not null references auth.users(id) on delete cascade,transfer_id uuid not null,local_id uuid not null,remote_id uuid not null,payload_hash text not null,primary key(owner_id,transfer_id,local_id));
revoke all on all tables in schema private from public,anon,authenticated;
commit;
