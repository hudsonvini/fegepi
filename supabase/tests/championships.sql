-- SOMENTE em banco PostgreSQL descartável chamado fegepi_championship_test.
\set ON_ERROR_STOP on
do $$ begin
  if current_database() <> 'fegepi_championship_test' then raise exception 'Use um banco de testes descartável'; end if;
end $$;
create role anon;
create role authenticated;
create table public.ranking_seasons(id uuid primary key);
create table public.ranking_entries(id uuid primary key, season_id uuid references public.ranking_seasons(id), team_id uuid, unique(season_id,team_id));
create table public.profiles(id uuid primary key, full_name text, player_tag text, avatar_url text, gender text, favorite_game text, bio text, created_at timestamptz default now(), public_profile boolean default false);
create function public.is_admin() returns boolean language sql as $$ select coalesce(current_setting('test.admin',true),'false') = 'true' $$;
grant select on public.ranking_entries to anon, authenticated;
grant select,insert,update on public.profiles to authenticated;
\ir ../championships.sql
\ir ../championships.sql
\ir ../featured-players.sql
\ir ../featured-players.sql
insert into public.ranking_seasons values(md5('season')::uuid), (md5('other-season')::uuid);
insert into public.ranking_entries select md5('entry' || n)::uuid, md5('season')::uuid, md5('team' || n)::uuid from generate_series(1,10) n;
select set_config('test.admin','true',false);
do $$ declare cid uuid; results jsonb; total integer; ver integer; begin
  select jsonb_agg(jsonb_build_object('team_id',md5('team' || n)::uuid,'placement',n)) into results from generate_series(1,9) n;
  cid := public.save_championship(null,md5('season')::uuid,'Copa teste','2026-01-01','draft',0,results);
  if (select sum(points) from public.championship_standings) <> 0 then raise exception 'Rascunho pontuou'; end if;
  perform public.save_championship(cid,md5('season')::uuid,'Copa teste','2026-01-01','completed',1,results);
  if (select array_agg(points order by team_id) from public.championship_standings) is distinct from
     (select array_agg(case n when 1 then 250 when 2 then 200 when 3 then 100 when 4 then 80 when 5 then 60 when 6 then 40 when 7 then 20 when 8 then 10 else 0 end order by md5('team' || n)::uuid) from generate_series(1,10) n) then raise exception 'Pontuação incorreta'; end if;
  if (select participations from public.championship_standings where team_id=md5('team10')::uuid) <> 0 then raise exception 'Não participante contado'; end if;
  if (select recent_placements->0->>'placement' from public.championship_standings where team_id=md5('team10')::uuid) is not null then raise exception 'Não participante com colocação'; end if;
  perform public.save_championship(cid,md5('season')::uuid,'Copa teste','2026-01-01','completed',2,results);
  if (select sum(points) from public.championship_standings) <> 760 then raise exception 'Duplicação de pontos'; end if;
  begin
    perform public.save_championship(cid,md5('season')::uuid,'Conflito','2026-01-01','completed',2,results);
    raise exception using errcode='XX000', message='Versão obsoleta aceita';
  exception when raise_exception then null; end;
  begin
    perform public.save_championship(cid,md5('season')::uuid,'Duplicado','2026-01-01','completed',3,jsonb_set(results,'{1,placement}','1'));
    raise exception using errcode='XX000', message='Colocação duplicada aceita';
  exception when unique_violation then null; end;
  if (select version from public.championships where id=cid) <> 3 then raise exception 'Falha não foi revertida'; end if;
  begin
    perform public.save_championship(cid,md5('season')::uuid,'Incompleto','2026-01-01','completed',3,jsonb_set(results,'{1,placement}','null'));
    raise exception using errcode='XX000', message='Conclusão incompleta aceita';
  exception when raise_exception then null; end;
  begin
    perform public.save_championship(null,md5('other-season')::uuid,'Outra temporada','2026-01-01','completed',0,results);
    raise exception using errcode='XX000', message='Time de outra temporada aceito';
  exception when foreign_key_violation then null; end;
  perform public.save_championship(cid,md5('season')::uuid,'Cancelado','2026-01-01','cancelled',3,results);
  if (select sum(points) from public.championship_standings) <> 0 then raise exception 'Cancelado pontuou'; end if;
  perform public.save_championship(cid,md5('season')::uuid,'Reaberto','2026-01-01','draft',4,results);
  if (select sum(points) from public.championship_standings) <> 0 then raise exception 'Reaberto pontuou'; end if;
  -- Correção troca campeão e vice sem conflito transitório nas posições.
  results := jsonb_set(jsonb_set(results,'{0,placement}','2'),'{1,placement}','1');
  perform public.save_championship(cid,md5('season')::uuid,'Corrigido','2026-01-01','completed',5,results);
  if (select points from public.championship_standings where team_id=md5('team2')::uuid) <> 250 then raise exception 'Correção não aplicada'; end if;
  for n in 2..7 loop
    perform public.save_championship(null,md5('season')::uuid,'Etapa ' || n,('2026-01-01'::date+n),'completed',0,results);
  end loop;
  if (select jsonb_array_length(recent_placements) from public.championship_standings limit 1) <> 5 then raise exception 'Histórico não limitado'; end if;
  if (select recent_placements->0->>'name' from public.championship_standings limit 1) <> 'Etapa 7' then raise exception 'Ordem histórica incorreta'; end if;
  if (select sum(points) from public.championship_standings) <> 5320 then raise exception 'Soma entre etapas incorreta'; end if;
end $$;
set role anon;
select count(*) from public.championship_standings;
do $$ begin
  begin
    perform public.save_championship(null,md5('season')::uuid,'Intruso',current_date,'draft',0,'[]');
    raise exception using errcode='XX000', message='Anônimo escreveu';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('test.admin','false',false);
set role authenticated;
do $$ begin
  begin
    perform public.save_championship(null,md5('season')::uuid,'Intruso',current_date,'draft',0,'[]');
    raise exception using errcode='XX000', message='Membro escreveu';
  exception when raise_exception then null; end;
  begin
    insert into public.profiles(id,is_featured) values(md5('intruso')::uuid,true);
    raise exception using errcode='XX000', message='Membro criou destaque';
  exception when raise_exception then null; end;
end $$;
reset role;
select set_config('test.admin','true',false);
insert into public.profiles(id,full_name,public_profile,is_featured,featured_order) values(md5('player')::uuid,'Jogador teste',true,true,3);
do $$ begin
  if (select count(*) from public.player_directory where is_featured) <> 1 then raise exception 'Destaque ausente'; end if;
end $$;
select set_config('test.admin','false',false);
set role authenticated;
do $$ begin
  begin
    update public.profiles set featured_order=0 where id=md5('player')::uuid;
    raise exception using errcode='XX000', message='Membro reordenou destaque';
  exception when raise_exception then null; end;
end $$;
reset role;
select set_config('test.admin','true',false);
update public.profiles set featured_order=2 where id=md5('player')::uuid;
update public.profiles set is_featured=false where id=md5('player')::uuid;
do $$ begin
  if (select count(*) from public.player_directory where is_featured) <> 0 then raise exception 'Destaque não removido'; end if;
end $$;
\echo 'PASS: migrações reaplicáveis, pontos, correção, cancelamento, reabertura, histórico, concorrência, validação e permissões.'
