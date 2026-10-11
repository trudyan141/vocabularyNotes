-- Local Realtime contract fixture. Actual hosted websocket delivery is a separate gate.
create schema realtime;
create table realtime.messages(id bigint generated always as identity,topic text,extension text,payload jsonb);
alter table realtime.messages enable row level security;
grant usage on schema realtime to authenticated;
grant select on realtime.messages to authenticated;
create function realtime.topic() returns text language sql stable as $$select current_setting('realtime.topic',true)$$;
create function realtime.send(payload jsonb,event text,topic text,private boolean) returns void language sql as $$insert into realtime.messages(topic,extension,payload) values(topic,'broadcast',payload)$$;
