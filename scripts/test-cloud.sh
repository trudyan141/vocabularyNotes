#!/bin/sh
set -eu
TASK_PG_BIN=${TASK_PG_BIN:-/usr/local/opt/postgresql@15/bin}
TASK_PG_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/wfk-postgres.XXXXXX")
cleanup(){ "$TASK_PG_BIN/pg_ctl" -D "$TASK_PG_ROOT/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$TASK_PG_ROOT"; }
trap cleanup EXIT INT TERM
"$TASK_PG_BIN/initdb" -D "$TASK_PG_ROOT/data" -U wfk_test --auth=trust --no-locale --encoding=UTF8 >/dev/null
"$TASK_PG_BIN/pg_ctl" -D "$TASK_PG_ROOT/data" -l "$TASK_PG_ROOT/server.log" -o "-k $TASK_PG_ROOT -p 54379 -c listen_addresses=''" -w start >/dev/null
run(){ "$TASK_PG_BIN/psql" -X -v ON_ERROR_STOP=1 -h "$TASK_PG_ROOT" -p 54379 -U wfk_test -d postgres -f "$1" >/dev/null; }
run tests/sql/bootstrap.sql
run supabase/migrations/202610100001_library.sql
run supabase/migrations/202610100002_storage.sql
run supabase/migrations/202610100003_keys.sql
run supabase/migrations/202610100004_sync.sql
run supabase/migrations/202610100005_lifecycle.sql
run supabase/migrations/202610100006_media.sql
run tests/sql/sync.sql
run tests/sql/ownership.sql
run tests/sql/lifecycle.sql
run tests/sql/media.sql
printf '%s\n' 'PostgreSQL ownership, constraints, immutable history and private-storage policies PASS.'
