-- Rate limiting + prompt cache infrastructure for the AI chat edge function.
-- All access is via SECURITY DEFINER RPCs restricted to service_role, and RLS on
-- the underlying tables blocks anon/authenticated from touching them directly.

create table if not exists public.rate_limit_events (
  id bigserial primary key,
  identifier text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_identifier_created_at_idx
  on public.rate_limit_events (identifier, created_at desc);

alter table public.rate_limit_events enable row level security;

create table if not exists public.prompt_cache (
  id bigserial primary key,
  prompt_hash text not null unique,
  response jsonb not null,
  hit_count integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists prompt_cache_expires_at_idx
  on public.prompt_cache (expires_at);

alter table public.prompt_cache enable row level security;

-- Atomically checks a 3-tier sliding window (minute/hour/day) for `p_identifier`
-- and records the request if it's allowed. Uses a per-identifier advisory lock so
-- concurrent requests from the same client/IP pair can't race past the limit.
create or replace function public.check_and_record_rate_limit(
  p_identifier text,
  p_minute_limit int,
  p_hour_limit int,
  p_day_limit int
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_minute_count int;
  v_hour_count int;
  v_day_count int;
  v_oldest_minute timestamptz;
  v_oldest_hour timestamptz;
  v_oldest_day timestamptz;
  v_allowed boolean := true;
  v_retry_after int := 0;
  v_window text := null;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_identifier, 0));

  select count(*), min(created_at) into v_minute_count, v_oldest_minute
    from rate_limit_events
    where identifier = p_identifier and created_at > v_now - interval '1 minute';

  select count(*), min(created_at) into v_hour_count, v_oldest_hour
    from rate_limit_events
    where identifier = p_identifier and created_at > v_now - interval '1 hour';

  select count(*), min(created_at) into v_day_count, v_oldest_day
    from rate_limit_events
    where identifier = p_identifier and created_at > v_now - interval '1 day';

  if v_minute_count >= p_minute_limit then
    v_allowed := false;
    v_window := 'minute';
    v_retry_after := greatest(1, ceil(extract(epoch from (v_oldest_minute + interval '1 minute' - v_now)))::int);
  elsif v_hour_count >= p_hour_limit then
    v_allowed := false;
    v_window := 'hour';
    v_retry_after := greatest(1, ceil(extract(epoch from (v_oldest_hour + interval '1 hour' - v_now)))::int);
  elsif v_day_count >= p_day_limit then
    v_allowed := false;
    v_window := 'day';
    v_retry_after := greatest(1, ceil(extract(epoch from (v_oldest_day + interval '1 day' - v_now)))::int);
  end if;

  if v_allowed then
    insert into rate_limit_events (identifier) values (p_identifier);
    v_minute_count := v_minute_count + 1;
    v_hour_count := v_hour_count + 1;
    v_day_count := v_day_count + 1;
  end if;

  return jsonb_build_object(
    'allowed', v_allowed,
    'limitedWindow', v_window,
    'retryAfterSeconds', v_retry_after,
    'minute', jsonb_build_object('count', v_minute_count, 'limit', p_minute_limit, 'remaining', greatest(0, p_minute_limit - v_minute_count)),
    'hour', jsonb_build_object('count', v_hour_count, 'limit', p_hour_limit, 'remaining', greatest(0, p_hour_limit - v_hour_count)),
    'day', jsonb_build_object('count', v_day_count, 'limit', p_day_limit, 'remaining', greatest(0, p_day_limit - v_day_count))
  );
end;
$$;

create or replace function public.increment_prompt_cache_hit(p_hash text) returns void
language sql
security definer
set search_path = public
as $$
  update prompt_cache set hit_count = hit_count + 1 where prompt_hash = p_hash;
$$;

-- Deletes rate-limit events older than the widest window (1 day) and expired cache
-- entries. Scheduled hourly below via pg_cron, with an opportunistic call from the
-- edge function itself as a fallback for environments where pg_cron isn't enabled.
create or replace function public.cleanup_expired_records() returns void
language sql
security definer
set search_path = public
as $$
  delete from rate_limit_events where created_at < now() - interval '1 day';
  delete from prompt_cache where expires_at < now();
$$;

revoke execute on function public.check_and_record_rate_limit(text, int, int, int) from public, anon, authenticated;
grant execute on function public.check_and_record_rate_limit(text, int, int, int) to service_role;

revoke execute on function public.increment_prompt_cache_hit(text) from public, anon, authenticated;
grant execute on function public.increment_prompt_cache_hit(text) to service_role;

revoke execute on function public.cleanup_expired_records() from public, anon, authenticated;
grant execute on function public.cleanup_expired_records() to service_role;

-- Best-effort hourly cleanup schedule. pg_cron isn't enabled by default on every
-- Supabase project/plan, so this is wrapped to avoid failing the whole migration
-- if the extension can't be created here — enable it manually via Supabase
-- Dashboard > Database > Extensions and re-run this block if it's skipped.
do $$
begin
  create extension if not exists pg_cron;
exception when others then
  raise notice 'pg_cron extension unavailable in this environment — skipping schedule. Enable it in Supabase Dashboard > Database > Extensions, then re-run the cron.schedule call.';
end
$$;

do $$
begin
  perform cron.schedule(
    'cleanup-expired-rate-limit-and-cache',
    '0 * * * *',
    $cron$select public.cleanup_expired_records();$cron$
  );
exception when others then
  raise notice 'Could not schedule the pg_cron cleanup job (pg_cron likely not enabled yet).';
end
$$;
