-- Teste de integração transacional. Todas as inserções são revertidas.
begin;
do $$
declare g uuid; s uuid; c uuid; t uuid; m uuid; p uuid; actual integer[]; expected integer[] := array[250,200,100,80,60,40,20,10,0];
begin
select id into g from public.games limit 1;
insert into public.ranking_seasons(game_id,label) values(g,'__verification_rollback__') returning id into s;
insert into public.championships(season_id,name,played_at,status) values(s,'__verification_rollback__',current_date,'completed') returning id into c;
for n in 1..9 loop
insert into public.teams(name) values('__verification_'||n||'_'||s) returning id into t;
insert into public.ranking_entries(season_id,team_id) values(s,t);
insert into public.championship_results(championship_id,season_id,team_id,placement) values(c,s,t,n);
end loop;
select array_agg(cs.points order by r.placement) into actual from public.championship_standings cs join public.championship_results r on r.team_id=cs.team_id and r.season_id=cs.season_id where cs.season_id=s;
if actual is distinct from expected then raise exception 'Incorrect points: %',actual; end if;
update public.championships set status='cancelled' where id=c;
if (select sum(points) from public.championship_standings where season_id=s) <> 0 then raise exception 'Cancelled points'; end if;
insert into public.team_games(team_id,game_id) values(t,g);
insert into public.player_team_memberships(team_id,game_id,nickname) values(t,g,'TestNick') returning id into m;
begin
insert into public.player_team_memberships(team_id,game_id,nickname) values(t,g,' testnick ');
raise exception 'Duplicate nickname accepted';
exception when unique_violation then null; end;
begin
insert into public.player_team_memberships(team_id,game_id,nickname) values(t,g,' ');
raise exception 'Empty identity accepted';
exception when check_violation then null; end;
select id into p from public.profiles where not exists(select 1 from public.player_team_memberships where profile_id=profiles.id and game_id=g and ended_at is null) limit 1;
update public.player_team_memberships set profile_id=p where id=m;
if not exists(select 1 from public.player_team_memberships where id=m and nickname='TestNick' and profile_id=p) then raise exception 'Later link failed'; end if;
end $$;
rollback;
select 'PASS: 1st-9th points, cancellation, nickname-only roster, duplicate/empty rejection, later account link; all test data rolled back' as result;
