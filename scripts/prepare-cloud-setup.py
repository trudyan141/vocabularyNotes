"""Build a guarded, atomic first-time Supabase setup from canonical migrations.

Usage: python3 scripts/prepare-cloud-setup.py /tmp/words-for-kids-setup.sql
Run the output in the intended project's SQL Editor. Never use on an already
initialized database; reconcile its migration history before using the CLI.
"""
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
if len(sys.argv) != 2:
    raise SystemExit("Specify the output .sql path; this script does not connect to a database.")
files = sorted((root / "supabase/migrations").glob("*.sql"))
parts = []
for path in files:
    sql = path.read_text()
    sql = re.sub(r"(?m)^begin;[ \t]*$", "", sql)
    sql = re.sub(r"(?m)^commit;[ \t]*$", "", sql)
    parts.append(f"-- {path.name}\n{sql}")
sql = """-- Words for Kids: first-time setup only. Existing tables are never overwritten.
begin;
do $$ begin
 if to_regclass('public.libraries') is not null then
  raise exception 'Already initialized: reconcile migration history before retrying';
 end if;
end $$;
""" + "\n".join(parts) + """
notify pgrst, 'reload schema';
commit;
select count(*) as tables_ready from pg_tables where schemaname='public';
"""
output = Path(sys.argv[1]).expanduser().resolve()
if output in files:
    raise SystemExit("Output must not replace a source migration.")
output.write_text(sql)
print(f"Prepared {len(files)} migrations in one transaction: {output}")
