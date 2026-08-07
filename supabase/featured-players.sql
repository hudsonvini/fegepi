-- Vitrine editorial de jogadores da página inicial.
alter table public.profiles
  add column if not exists is_featured boolean not null default false;

alter table public.profiles
  add column if not exists featured_order integer not null default 0;

alter table public.profiles
  drop constraint if exists profiles_featured_order_check;

alter table public.profiles
  add constraint profiles_featured_order_check check (featured_order >= 0);

create index if not exists profiles_featured_order_idx
  on public.profiles(featured_order, full_name)
  where is_featured = true and public_profile = true;

create or replace view public.player_directory
with (security_barrier = true)
as select
  id,
  full_name,
  player_tag,
  avatar_url,
  gender,
  favorite_game,
  bio,
  created_at,
  is_featured,
  featured_order
from public.profiles
where public_profile = true;

grant select on public.player_directory to anon, authenticated;
