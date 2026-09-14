-- Aplicar após schema.sql. Pode ser reaplicado sem apagar os resultados existentes.
begin;
create table if not exists public.championships (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.ranking_seasons(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  played_at date not null,
  status text not null default 'draft' check (status in ('draft','completed','cancelled')),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  unique(id, season_id)
);
create table if not exists public.championship_results (
  championship_id uuid not null,
  season_id uuid not null,
  team_id uuid not null,
  placement integer check (placement > 0),
  primary key(championship_id, team_id),
  unique(championship_id, placement),
  foreign key(championship_id, season_id) references public.championships(id, season_id) on delete cascade,
  foreign key(season_id, team_id) references public.ranking_entries(season_id, team_id) on delete restrict
);
create index if not exists championships_season_date on public.championships(season_id, played_at desc, created_at desc);
alter table public.championships enable row level security;
alter table public.championship_results enable row level security;
drop policy if exists "read championships" on public.championships;
create policy "read championships" on public.championships for select using (true);
drop policy if exists "read championship results" on public.championship_results;
create policy "read championship results" on public.championship_results for select using (true);
grant select on public.championships, public.championship_results to anon, authenticated;
-- Escritas exclusivamente pela função transacional, inclusive para administradores.
revoke insert, update, delete on public.championships, public.championship_results from anon, authenticated;

create or replace function public.save_championship(
  p_id uuid, p_season_id uuid, p_name text, p_played_at date,
  p_status text, p_version integer, p_results jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare target_id uuid; existing public.championships; participant_count integer;
begin
  if not public.is_admin() then raise exception 'Acesso restrito a administradores'; end if;
  perform 1 from public.ranking_seasons where id = p_season_id for update;
  if not found then raise exception 'Temporada inválida'; end if;
  if jsonb_typeof(p_results) <> 'array' or p_results is null then raise exception 'Participantes inválidos'; end if;
  participant_count := jsonb_array_length(p_results);
  if p_status = 'completed' and (participant_count = 0 or exists (
    select 1 from jsonb_to_recordset(p_results) as r(team_id uuid, placement integer)
    where placement is null or placement < 1 or placement > participant_count
  )) then raise exception 'Para concluir, informe uma colocação de 1 até o total de participantes para cada time'; end if;
  if p_id is null then
    insert into public.championships(season_id, name, played_at, status)
    values(p_season_id, trim(p_name), p_played_at, p_status) returning id into target_id;
  else
    select * into existing from public.championships where id = p_id for update;
    if not found or existing.season_id <> p_season_id then raise exception 'Campeonato inválido'; end if;
    if existing.version is distinct from p_version then raise exception 'Este campeonato foi alterado. Recarregue a página antes de salvar'; end if;
    target_id := p_id;
    update public.championships set name = trim(p_name), played_at = p_played_at, status = p_status, version = version + 1 where id = target_id;
    delete from public.championship_results where championship_id = target_id;
  end if;
  insert into public.championship_results(championship_id, season_id, team_id, placement)
  select target_id, p_season_id, r.team_id, r.placement from jsonb_to_recordset(p_results) as r(team_id uuid, placement integer);
  return target_id;
end $$;
revoke all on function public.save_championship(uuid,uuid,text,date,text,integer,jsonb) from public, anon;
grant execute on function public.save_championship(uuid,uuid,text,date,text,integer,jsonb) to authenticated;

-- Pontuação sempre derivada: correções, cancelamentos e reaberturas não duplicam pontos.
create or replace view public.championship_standings with (security_invoker = true) as
select e.id, e.season_id, e.team_id,
  coalesce(s.points, 0)::integer as points,
  coalesce(s.titles, 0)::integer as titles,
  coalesce(s.participations, 0)::integer as participations,
  coalesce(h.recent_placements, '[]'::jsonb) as recent_placements
from public.ranking_entries e
left join lateral (
  select sum(case r.placement when 1 then 250 when 2 then 125 when 3 then 70 when 4 then 50 else 0 end) as points,
    count(*) filter(where r.placement = 1) as titles, count(*) as participations
  from public.championship_results r join public.championships c on c.id = r.championship_id
  where r.team_id = e.team_id and c.season_id = e.season_id and c.status = 'completed'
) s on true
left join lateral (
  select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'placement', r.placement)
    order by c.played_at desc, c.created_at desc, c.id) as recent_placements
  from (select * from public.championships where season_id = e.season_id and status = 'completed'
    order by played_at desc, created_at desc, id limit 5) c
  left join public.championship_results r on r.championship_id = c.id and r.team_id = e.team_id
) h on true;
grant select on public.championship_standings to anon, authenticated;
notify pgrst, 'reload schema';
commit;
