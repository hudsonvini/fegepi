-- Execute após schema.sql. Impede que um membro eleve a própria permissão.
create or replace function public.prevent_unauthorized_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Somente administradores podem alterar permissões';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prevent_unauthorized_role_change on public.profiles;
create trigger prevent_unauthorized_role_change
before update on public.profiles
for each row execute procedure public.prevent_unauthorized_role_change();
