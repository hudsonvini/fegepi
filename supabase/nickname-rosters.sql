-- Elencos por nick; contas são opcionais. Aplicar depois de game-team-ecosystem.sql.
begin;
alter table public.player_team_memberships alter column profile_id drop not null;
alter table public.player_team_memberships add column if not exists nickname text;
alter table public.player_team_memberships drop constraint if exists roster_identity_required;
alter table public.player_team_memberships add constraint roster_identity_required
  check ((profile_id is not null or nullif(btrim(nickname), '') is not null)
    and (nickname is null or length(btrim(nickname)) between 1 and 60));
create unique index if not exists roster_unique_active_nickname
  on public.player_team_memberships(team_id, game_id, lower(btrim(nickname)))
  where ended_at is null and nickname is not null;
-- Mantém as políticas existentes: leitura pública e escrita apenas administrativa.
notify pgrst, 'reload schema';
commit;
