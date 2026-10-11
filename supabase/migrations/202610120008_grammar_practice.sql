-- Add the sentence-building game to the existing account session stream.
-- No lesson/content rows or RLS policies are changed.
begin;
set local lock_timeout = '5s';
alter table public.practice_sessions drop constraint if exists practice_sessions_mode_check;
alter table public.practice_sessions add constraint practice_sessions_mode_check
  check (mode in ('flashcard','picture-word','word-picture','letters','spelling','grammar')) not valid;
alter table public.practice_sessions validate constraint practice_sessions_mode_check;
commit;
