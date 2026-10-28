#!/bin/sh
set -eu
TASK_PG_BIN=${TASK_PG_BIN:-/usr/local/opt/postgresql@15/bin}
TASK_EXT_PG_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/wfk-extensions-pg.XXXXXX")
cleanup(){ "$TASK_PG_BIN/pg_ctl" -D "$TASK_EXT_PG_ROOT/data" -m immediate stop >/dev/null 2>&1 || true; }
trap cleanup EXIT INT TERM
"$TASK_PG_BIN/initdb" -D "$TASK_EXT_PG_ROOT/data" -U wfk_test --auth=trust --no-locale --encoding=UTF8 >"$TASK_EXT_PG_ROOT/init.log" 2>&1
"$TASK_PG_BIN/pg_ctl" -D "$TASK_EXT_PG_ROOT/data" -l "$TASK_EXT_PG_ROOT/server.log" -o "-k $TASK_EXT_PG_ROOT -p 54377 -c listen_addresses=''" -w start >/dev/null
run(){ "$TASK_PG_BIN/psql" -X -v ON_ERROR_STOP=1 -h "$TASK_EXT_PG_ROOT" -p 54377 -U wfk_test -d postgres -f "$1" >>"$TASK_EXT_PG_ROOT/sql.log" 2>&1; }
run tests/sql/bootstrap.sql
for migration in supabase/migrations/*.sql; do
 case "$migration" in *0007*) run tests/sql/realtime-bootstrap.sql;; esac
 run "$migration"
done
run tests/sql/learning-extensions.sql
printf 'PASS learning extensions SQL; output: %s\n' "$TASK_EXT_PG_ROOT"
