-- Execute este arquivo uma vez após profile-upgrade.sql para liberar o dashboard administrativo ampliado.
alter table public.profiles add column if not exists team_id uuid references public.teams(id) on delete set null;
alter table public.profiles add column if not exists email text;
alter table public.ranking_entries add column if not exists wins integer not null default 0 check (wins >= 0);
alter table public.ranking_entries add column if not exists draws integer not null default 0 check (draws >= 0);
alter table public.ranking_entries add column if not exists losses integer not null default 0 check (losses >= 0);

update public.profiles profile
set email = auth_user.email
from auth.users auth_user
where profile.id = auth_user.id and profile.email is null;
