-- Execute este arquivo no SQL Editor do projeto Supabase.
-- Auth, banco, políticas e Storage ficam no mesmo projeto e são independentes da Vercel.
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('member', 'admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  avatar_url text,
  address text,
  team text,
  whatsapp text,
  gender text not null default 'indiferente',
  favorite_game text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Atualiza projetos que já possuíam a tabela profiles antes deste perfil expandido.
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists team text;
alter table public.profiles add column if not exists whatsapp text;
alter table public.profiles add column if not exists gender text not null default 'indiferente';
alter table public.profiles add column if not exists favorite_game text;
alter table public.profiles add column if not exists player_tag text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists public_profile boolean not null default true;
alter table public.profiles add column if not exists is_featured boolean not null default false;
alter table public.profiles add column if not exists featured_order integer not null default 0 check (featured_order >= 0);

do $$ begin
  alter table public.profiles add constraint profiles_gender_check check (gender in ('masculino', 'feminino', 'indiferente'));
exception when duplicate_object then null;
end $$;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  theme text not null default 'cs2' check (theme in ('cs2','valorant','lol','freefire','fc26')),
  image_url text not null,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ranking_seasons (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  label text not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  unique(game_id, label)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  city text not null default 'Piauí',
  crest_url text,
  initials text not null default 'TM',
  created_at timestamptz not null default now()
);

create table if not exists public.ranking_entries (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.ranking_seasons(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  wins integer not null default 0 check (wins >= 0),
  draws integer not null default 0 check (draws >= 0),
  losses integer not null default 0 check (losses >= 0),
  recent_form text[] not null default '{}'::text[],
  previous_position integer not null default 0 check (previous_position >= 0),
  constraint ranking_recent_form_length check (cardinality(recent_form) <= 5),
  constraint ranking_recent_form_values check (recent_form <@ array['W', 'D', 'L']::text[]),
  unique(season_id, team_id)
);

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
  constraint player_membership_team_game foreign key (team_id, game_id)
    references public.team_games(team_id, game_id) on delete restrict
);

alter table public.profiles add column if not exists team_id uuid references public.teams(id) on delete set null;
alter table public.profiles add column if not exists email text;
alter table public.ranking_entries add column if not exists wins integer not null default 0 check (wins >= 0);
alter table public.ranking_entries add column if not exists draws integer not null default 0 check (draws >= 0);
alter table public.ranking_entries add column if not exists losses integer not null default 0 check (losses >= 0);
alter table public.ranking_entries add column if not exists recent_form text[] not null default '{}'::text[];

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at date not null,
  ends_at date,
  subtitle text,
  status_label text not null default 'Em breve',
  status_tone text not null default 'inactive' check (status_tone in ('active','inactive')),
  image_url text not null,
  featured_media_url text,
  registration_url text,
  cta_label text not null default 'Saiba mais',
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text not null default 'Banner principal da FEGEPI',
  link_url text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_settings (
  id boolean primary key default true check (id),
  eyebrow text not null default 'Quem nos apoia',
  title text not null default 'Fotos do último evento',
  banner_title text not null default '',
  banner_description text not null default '',
  banner_image_url text not null default '',
  banner_image_alt text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text not null default 'Foto de evento da FEGEPI',
  download_url text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.ranking_seasons enable row level security;
alter table public.teams enable row level security;
alter table public.ranking_entries enable row level security;
alter table public.events enable row level security;
alter table public.hero_slides enable row level security;
alter table public.gallery_settings enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.team_games enable row level security;
alter table public.player_team_memberships enable row level security;

create policy "profiles visible to owner or admin" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "members update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "public reads games" on public.games for select using (true);
create policy "public reads seasons" on public.ranking_seasons for select using (true);
create policy "public reads teams" on public.teams for select using (true);
create policy "public reads ranking" on public.ranking_entries for select using (true);
create policy "public reads events" on public.events for select using (active);
create policy "public reads hero slides" on public.hero_slides for select using (active);
create policy "public reads gallery settings" on public.gallery_settings for select using (true);
create policy "public reads gallery photos" on public.gallery_photos for select using (active);
create policy "public reads team games" on public.team_games for select using (true);
create policy "public reads player memberships" on public.player_team_memberships for select using (true);

create policy "admins manage games" on public.games for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage seasons" on public.ranking_seasons for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage teams" on public.teams for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage ranking" on public.ranking_entries for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage events" on public.events for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage hero slides" on public.hero_slides for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage gallery settings" on public.gallery_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage gallery photos" on public.gallery_photos for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage team games" on public.team_games for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage player memberships" on public.player_team_memberships for all using (public.is_admin()) with check (public.is_admin());

create unique index if not exists profiles_player_tag_unique on public.profiles (lower(player_tag))
  where player_tag is not null and length(trim(player_tag)) > 0;
create unique index if not exists player_one_current_team_per_game
  on public.player_team_memberships(profile_id, game_id) where ended_at is null;
create index if not exists player_memberships_profile_idx on public.player_team_memberships(profile_id, started_at desc);
create index if not exists player_memberships_team_game_idx on public.player_team_memberships(team_id, game_id, ended_at);
create index if not exists team_games_game_idx on public.team_games(game_id, active);

insert into public.team_games (team_id, game_id, active)
select distinct entry.team_id, season.game_id, true
from public.ranking_entries entry
join public.ranking_seasons season on season.id = entry.season_id
on conflict (team_id, game_id) do update set active = true;

create or replace view public.player_directory
with (security_barrier = true)
as select id, full_name, player_tag, avatar_url, gender, favorite_game, bio, created_at, is_featured, featured_order
from public.profiles where public_profile = true;
grant select on public.player_directory to anon, authenticated;

insert into storage.buckets (id, name, public) values ('fegepi-media', 'fegepi-media', true)
on conflict (id) do update set public = true;
create policy "public reads fegepi media" on storage.objects for select using (bucket_id = 'fegepi-media');
create policy "admins upload fegepi media" on storage.objects for insert to authenticated with check (bucket_id = 'fegepi-media' and public.is_admin());
create policy "admins update fegepi media" on storage.objects for update to authenticated using (bucket_id = 'fegepi-media' and public.is_admin());
create policy "admins delete fegepi media" on storage.objects for delete to authenticated using (bucket_id = 'fegepi-media' and public.is_admin());

-- Depois de criar a primeira conta, promova-a uma única vez:
-- update public.profiles set role = 'admin' where id = 'UUID_DO_USUARIO';
