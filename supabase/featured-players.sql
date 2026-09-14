-- Vitrine editorial de jogadores da página inicial.
begin;
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

-- O membro pode editar seu perfil, mas nunca a curadoria da home.
create or replace function public.protect_featured_player_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      if new.is_featured or new.featured_order <> 0 then
        raise exception 'Somente administradores podem destacar jogadores';
      end if;
    elsif new.is_featured is distinct from old.is_featured
       or new.featured_order is distinct from old.featured_order then
      raise exception 'Somente administradores podem alterar destaques';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists protect_featured_player_fields on public.profiles;
create trigger protect_featured_player_fields before insert or update on public.profiles
for each row execute function public.protect_featured_player_fields();
notify pgrst, 'reload schema';
commit;
