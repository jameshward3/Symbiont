begin;

create table if not exists api_rate_limits (
  key_hash text primary key,
  request_count integer not null check (request_count >= 0),
  window_started_at timestamptz not null,
  expires_at timestamptz not null
);

alter table api_rate_limits enable row level security;
revoke all on api_rate_limits from anon, authenticated;

create or replace function consume_api_rate_limit(
  p_key text,
  p_limit integer default 10,
  p_window_seconds integer default 60
) returns table (allowed boolean, remaining integer, resets_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row api_rate_limits;
  now_at timestamptz := clock_timestamp();
begin
  if length(p_key) <> 64 or p_limit < 1 or p_limit > 1000 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit parameters';
  end if;

  insert into api_rate_limits(key_hash, request_count, window_started_at, expires_at)
  values (p_key, 1, now_at, now_at + make_interval(secs => p_window_seconds))
  on conflict (key_hash) do update set
    request_count = case when api_rate_limits.expires_at <= now_at then 1 else api_rate_limits.request_count + 1 end,
    window_started_at = case when api_rate_limits.expires_at <= now_at then now_at else api_rate_limits.window_started_at end,
    expires_at = case when api_rate_limits.expires_at <= now_at then now_at + make_interval(secs => p_window_seconds) else api_rate_limits.expires_at end
  returning * into current_row;

  return query select current_row.request_count <= p_limit,
    greatest(0, p_limit - current_row.request_count), current_row.expires_at;
end;
$$;

revoke all on function consume_api_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function consume_api_rate_limit(text, integer, integer) to service_role;

create index if not exists api_rate_limits_expiry_idx on api_rate_limits(expires_at);

commit;
