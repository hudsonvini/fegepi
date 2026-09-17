begin;
do $$
declare t uuid; g uuid; m uuid;
begin
  select id into g from public.games limit 1;
  insert into public.teams(name) values ('__team_status_test_' || gen_random_uuid()) returning id into t;
  insert into public.team_games(team_id, game_id) values(t, g);
  insert into public.player_team_memberships(team_id, game_id, nickname) values(t, g, 'StatusTest') returning id into m;
  begin
    delete from public.teams where id=t;
    raise exception 'Deletion should have been blocked';
  exception when foreign_key_violation then null;
  end;
  update public.teams set active=false where id=t;
  if not exists(select 1 from public.teams where id=t and not active)
    or not exists(select 1 from public.player_team_memberships where id=m)
    or not exists(select 1 from public.team_games where team_id=t and active)
  then raise exception 'Deactivation lost data'; end if;
  update public.teams set active=true where id=t;
  if not exists(select 1 from public.teams where id=t and active) then raise exception 'Reactivation failed'; end if;
  insert into public.teams(name) values ('__empty_team_test_' || gen_random_uuid()) returning id into t;
  insert into public.team_games(team_id, game_id) values(t, g);
  delete from public.teams where id=t;
  if exists(select 1 from public.team_games where team_id=t) then raise exception 'Empty team cleanup failed'; end if;
end $$;
rollback;
select 'PASS: deletion protection, status, preserved roster/modalities, reactivation, empty team deletion; rolled back' as result;
