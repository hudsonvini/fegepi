-- Histórico de resultados e classificação automática.
-- Execute este arquivo uma vez no SQL Editor do Supabase.

alter table public.ranking_entries
  add column if not exists recent_form text[] not null default '{}'::text[];

alter table public.ranking_entries
  drop constraint if exists ranking_recent_form_length;
alter table public.ranking_entries
  add constraint ranking_recent_form_length check (cardinality(recent_form) <= 5);

alter table public.ranking_entries
  drop constraint if exists ranking_recent_form_values;
alter table public.ranking_entries
  add constraint ranking_recent_form_values
  check (recent_form <@ array['W', 'D', 'L']::text[]);

create table if not exists public.ranking_results (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.ranking_entries(id) on delete cascade,
  result text not null check (result in ('W', 'D', 'L')),
  played_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists ranking_results_entry_history_idx
  on public.ranking_results(entry_id, played_at desc, created_at desc);

-- Preserva os totais já existentes como histórico inicial.
insert into public.ranking_results (entry_id, result, played_at, created_at)
select
  entry.id,
  source.result,
  current_date - (source.offset_days * interval '1 day'),
  now() - (source.offset_days * interval '1 second')
from public.ranking_entries entry
cross join lateral (
  select 'W'::text as result, series as offset_days
  from generate_series(1, entry.wins) series
  union all
  select 'D'::text, entry.wins + series
  from generate_series(1, entry.draws) series
  union all
  select 'L'::text, entry.wins + entry.draws + series
  from generate_series(1, entry.losses) series
) source
where not exists (
  select 1 from public.ranking_results existing where existing.entry_id = entry.id
);

create or replace function public.refresh_ranking_entry_from_results(target_entry_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_season_id uuid;
begin
  select season_id into target_season_id
  from public.ranking_entries
  where id = target_entry_id;

  if target_season_id is null then
    return;
  end if;

  -- Guarda a posição anterior de todos os participantes antes do recálculo.
  with positions as (
    select
      id,
      row_number() over (
        order by points desc, wins desc, id
      )::integer as position
    from public.ranking_entries
    where season_id = target_season_id
  )
  update public.ranking_entries entry
  set previous_position = positions.position
  from positions
  where entry.id = positions.id;

  update public.ranking_entries entry
  set
    wins = stats.wins,
    draws = stats.draws,
    losses = stats.losses,
    points = stats.wins * 3 + stats.draws,
    recent_form = stats.recent_form
  from (
    select
      count(*) filter (where result = 'W')::integer as wins,
      count(*) filter (where result = 'D')::integer as draws,
      count(*) filter (where result = 'L')::integer as losses,
      coalesce((
        select array_agg(recent.result order by recent.played_at, recent.created_at)
        from (
          select history.result, history.played_at, history.created_at
          from public.ranking_results history
          where history.entry_id = target_entry_id
          order by history.played_at desc, history.created_at desc
          limit 5
        ) recent
      ), '{}'::text[]) as recent_form
    from public.ranking_results
    where entry_id = target_entry_id
  ) stats
  where entry.id = target_entry_id;
end;
$$;

create or replace function public.handle_ranking_result_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_ranking_entry_from_results(coalesce(new.entry_id, old.entry_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists ranking_result_changed on public.ranking_results;
create trigger ranking_result_changed
after insert or update or delete on public.ranking_results
for each row execute function public.handle_ranking_result_change();

-- Normaliza os participantes existentes após o histórico inicial.
do $$
declare
  ranking_entry record;
begin
  for ranking_entry in select id from public.ranking_entries loop
    perform public.refresh_ranking_entry_from_results(ranking_entry.id);
  end loop;
end;
$$;

alter table public.ranking_results enable row level security;

drop policy if exists "public reads ranking results" on public.ranking_results;
create policy "public reads ranking results"
  on public.ranking_results for select using (true);

drop policy if exists "admins manage ranking results" on public.ranking_results;
create policy "admins manage ranking results"
  on public.ranking_results for all
  using (public.is_admin())
  with check (public.is_admin());

grant execute on function public.refresh_ranking_entry_from_results(uuid) to authenticated;

