-- Um exemplo editável, em rascunho: não altera os pontos oficiais.
-- Aplicar depois de championships.sql. Reaplicação não duplica o exemplo.
begin;
do $$
declare selected_season uuid; example_id uuid;
begin
  select s.id into selected_season from public.ranking_seasons s
  join public.games g on g.id = s.game_id
  order by s.is_current desc, g.active desc, g.display_order, s.created_at desc limit 1;
  if selected_season is null then return; end if;
  if exists(select 1 from public.championships where name = 'Exemplo — Copa FEGEPI') then return; end if;
  insert into public.championships(season_id,name,played_at,status)
  values(selected_season,'Exemplo — Copa FEGEPI',current_date,'draft') returning id into example_id;
  insert into public.championship_results(championship_id,season_id,team_id,placement)
  select example_id, selected_season, e.team_id, row_number() over(order by t.name,e.team_id)::integer
  from public.ranking_entries e join public.teams t on t.id=e.team_id
  where e.season_id=selected_season order by t.name,e.team_id limit 5;
end $$;
commit;
