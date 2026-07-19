-- Execute este arquivo uma vez no SQL Editor do Supabase para habilitar o perfil expandido.
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists team text;
alter table public.profiles add column if not exists whatsapp text;
alter table public.profiles add column if not exists gender text not null default 'indiferente';
alter table public.profiles add column if not exists favorite_game text;
alter table public.profiles add column if not exists email text;

do $$ begin
  alter table public.profiles add constraint profiles_gender_check check (gender in ('masculino', 'feminino', 'indiferente'));
exception when duplicate_object then null;
end $$;

-- O preenchimento do e-mail permite a gestão de usuários pelo painel.
update public.profiles profile
set email = auth_user.email
from auth.users auth_user
where profile.id = auth_user.id and profile.email is null;
