-- Ecossistema competitivo: jogos dos times, elencos por jogo e histórico dos jogadores.
-- Execute no SQL Editor do Supabase depois de supabase/schema.sql.

alter table public.profiles add column if not exists player_tag text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists public_profile boolean not null default true;

create unique index if not exists profiles_player_tag_unique
  on public.profiles (lower(player_tag))
  where player_tag is not null and length(trim(player_tag)) > 0;

create table if not exists public.team_games (
  team_id uuid not null references public.teams(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (team_id, game_id)
);

create table if not exists public.player_team_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null,
  game_id uuid not null,
  role text not null default 'player' check (role in ('player', 'captain', 'coach', 'reserve')),
  started_at date not null default current_date,
  ended_at date,
  created_at timestamptz not null default now(),
  constraint player_membership_dates check (ended_at is null or ended_at >= started_at),
  constraint player_membership_team_game
    foreign key (team_id, game_id)
    references public.team_games(team_id, game_id)
    on delete restrict
);

create unique index if not exists player_one_current_team_per_game
  on public.player_team_memberships(profile_id, game_id)
  where ended_at is null;

create index if not exists player_memberships_profile_idx
  on public.player_team_memberships(profile_id, started_at desc);
create index if not exists player_memberships_team_game_idx
  on public.player_team_memberships(team_id, game_id, ended_at);
create index if not exists team_games_game_idx
  on public.team_games(game_id, active);

-- Times que já disputaram uma temporada passam automaticamente a atuar naquele jogo.
insert into public.team_games (team_id, game_id, active)
select distinct entry.team_id, season.game_id, true
from public.ranking_entries entry
join public.ranking_seasons season on season.id = entry.season_id
on conflict (team_id, game_id) do update set active = true;

alter table public.team_games enable row level security;
alter table public.player_team_memberships enable row level security;

drop policy if exists "public reads team games" on public.team_games;
create policy "public reads team games"
  on public.team_games for select using (true);
drop policy if exists "admins manage team games" on public.team_games;
create policy "admins manage team games"
  on public.team_games for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads player memberships" on public.player_team_memberships;
create policy "public reads player memberships"
  on public.player_team_memberships for select using (true);
drop policy if exists "admins manage player memberships" on public.player_team_memberships;
create policy "admins manage player memberships"
  on public.player_team_memberships for all using (public.is_admin()) with check (public.is_admin());

-- A API pública consulta somente estes campos seguros; e-mail, endereço e WhatsApp não são expostos.
drop view if exists public.player_directory;
create view public.player_directory
with (security_barrier = true)
as
select
  id,
  full_name,
  player_tag,
  avatar_url,
  gender,
  favorite_game,
  bio,
  created_at
from public.profiles
where public_profile = true;

grant select on public.player_directory to anon, authenticated;
