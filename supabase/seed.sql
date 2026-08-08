-- Seed idempotente do conteúdo público e competitivo da FEGEPI.
-- Execute depois de supabase/schema.sql.
begin;

insert into public.hero_slides (id, image_url, alt_text, link_url, active, display_order) values
  ('10000000-0000-4000-8000-000000000001', '/images/carrosselImages/banner1.png', 'Circuito oficial FEGEPI 2026', '#eventos', true, 0),
  ('10000000-0000-4000-8000-000000000002', '/images/EventCarrosselImages/event1.webp', 'Inscrições abertas para os eventos FEGEPI', '#eventos', true, 1),
  ('10000000-0000-4000-8000-000000000003', '/images/GameShowCaseImage.webp', 'Acompanhe os rankings dos jogos oficiais', '#ranking', true, 2)
on conflict (id) do update set
  image_url = excluded.image_url,
  alt_text = excluded.alt_text,
  link_url = excluded.link_url,
  active = excluded.active,
  display_order = excluded.display_order;

insert into public.games (id, name, short_name, theme, image_url, active, display_order) values
  ('20000000-0000-4000-8000-000000000001', 'Counter-Strike 2', 'CS2', 'cs2', '/images/GameAreaImages/gameAreaCs.png', true, 0),
  ('20000000-0000-4000-8000-000000000002', 'Valorant', 'VAL', 'valorant', '/images/GameAreaImages/gameAreaValorant.png', true, 1),
  ('20000000-0000-4000-8000-000000000003', 'League of Legends', 'LoL', 'lol', '/images/GameAreaImages/gameAreaLOL.png', true, 2),
  ('20000000-0000-4000-8000-000000000004', 'Free Fire', 'FF', 'freefire', '/images/GameAreaImages/gameAreaFreeFire.png', true, 3),
  ('20000000-0000-4000-8000-000000000005', 'EA Sports FC 26', 'FC26', 'fc26', '/images/GameAreaImages/gameAreaFifa.png', true, 4)
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  theme = excluded.theme,
  image_url = excluded.image_url,
  active = excluded.active,
  display_order = excluded.display_order;

insert into public.teams (id, name, city, crest_url, initials) values
  ('30000000-0000-4000-8000-000000000001', 'Alpha Wolves', 'Teresina', '/images/GameAreaImages/times/escudoLiquid.png', 'AW'),
  ('30000000-0000-4000-8000-000000000002', 'Delta Force', 'Parnaíba', '/images/GameAreaImages/times/escudoImperial.jpg', 'DF'),
  ('30000000-0000-4000-8000-000000000003', 'Caatinga Core', 'Teresina', null, 'CC'),
  ('30000000-0000-4000-8000-000000000004', 'Nordeste Rush', 'Picos', null, 'NR'),
  ('30000000-0000-4000-8000-000000000005', 'Sertão Tactics', 'Floriano', null, 'ST'),
  ('30000000-0000-4000-8000-000000000006', 'Vortex Piauí', 'Campo Maior', null, 'VP'),
  ('30000000-0000-4000-8000-000000000007', 'Dragons Five', 'Barras', null, 'D5'),
  ('30000000-0000-4000-8000-000000000008', 'Bravos Squad', 'Piripiri', null, 'BS'),
  ('30000000-0000-4000-8000-000000000009', 'Shadow Unit', 'União', null, 'SU'),
  ('30000000-0000-4000-8000-000000000010', 'Rangers 1910', 'Esperantina', null, 'R1'),
  ('30000000-0000-4000-8000-000000000011', 'Prime Legacy', 'Altos', null, 'PL'),
  ('30000000-0000-4000-8000-000000000012', 'Arenas Club', 'José de Freitas', null, 'AC')
on conflict (id) do update set
  name = excluded.name,
  city = excluded.city,
  crest_url = excluded.crest_url,
  initials = excluded.initials;

insert into public.ranking_seasons (id, game_id, label, is_current) values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Temporada 2026', true),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'Temporada 2025', false),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', 'Temporada 2026', true),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', 'Temporada 2025', false),
  ('40000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000003', 'Temporada 2026', true),
  ('40000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000003', 'Temporada 2025', false),
  ('40000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000004', 'Temporada 2026', true),
  ('40000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000004', 'Temporada 2025', false),
  ('40000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000005', 'Temporada 2026', true),
  ('40000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000005', 'Temporada 2025', false)
on conflict (id) do update set
  game_id = excluded.game_id,
  label = excluded.label,
  is_current = excluded.is_current;

with seeded_seasons as (
  select id, row_number() over (order by id)::integer as season_number
  from public.ranking_seasons
  where id::text like '40000000-0000-4000-8000-0000000000%'
),
seeded_teams as (
  select id, row_number() over (order by id)::integer as team_position
  from public.teams
  where id::text like '30000000-0000-4000-8000-0000000000%'
)
insert into public.ranking_entries (id, season_id, team_id, points, wins, draws, losses, recent_form, previous_position)
select
  md5(season.id::text || team.id::text)::uuid,
  season.id,
  team.id,
  greatest(900, 7200 - team.team_position * 135 - (season.season_number % 2) * 95 + season.season_number * 11),
  greatest(0, 14 - team.team_position / 2),
  team.team_position % 4,
  greatest(0, team.team_position / 3),
  array[
    case when team.team_position % 3 = 0 then 'L' else 'W' end,
    case when team.team_position % 4 = 0 then 'D' else 'W' end,
    case when team.team_position % 5 = 0 then 'L' else 'W' end,
    case when team.team_position % 2 = 0 then 'D' else 'W' end,
    case when team.team_position % 4 = 1 then 'L' else 'W' end
  ]::text[],
  case
    when team.team_position = 1 then 2
    when team.team_position = 2 then 1
    when team.team_position % 3 = 0 then team.team_position + 1
    else team.team_position
  end
from seeded_seasons season
cross join seeded_teams team
on conflict (season_id, team_id) do update set
  points = excluded.points,
  wins = excluded.wins,
  draws = excluded.draws,
  losses = excluded.losses,
  recent_form = excluded.recent_form,
  previous_position = excluded.previous_position;

insert into public.events (
  id, title, starts_at, ends_at, subtitle, status_label, status_tone,
  image_url, featured_media_url, registration_url, cta_label, active, display_order
) values
  ('50000000-0000-4000-8000-000000000001', 'Cyber League Piauí', '2026-08-14', '2026-08-16', 'Final presencial em Teresina', 'Inscrições abertas', 'active', '/images/EventCarrosselImages/event1.webp', '/images/EventCarrosselImages/event1.webp', '#', 'Inscrever-se', true, 0),
  ('50000000-0000-4000-8000-000000000002', 'Arena Cup', '2026-09-05', '2026-09-06', 'Eliminatórias online', 'Últimas vagas', 'active', '/images/EventCarrosselImages/event2.webp', '/images/EventCarrosselImages/event2.webp', '#', 'Ver regulamento', true, 1),
  ('50000000-0000-4000-8000-000000000003', 'Masters Showdown', '2026-10-10', '2026-10-12', 'Evento especial com convidados', 'Em breve', 'inactive', '/images/EventCarrosselImages/event3.webp', '/images/EventCarrosselImages/event3.webp', '#', 'Quero participar', true, 2),
  ('50000000-0000-4000-8000-000000000004', 'Campus Clash', '2026-11-21', '2026-11-22', 'Confrontos universitários regionais', 'Em breve', 'inactive', '/images/EventCarrosselImages/event1.webp', '/images/EventCarrosselImages/event1.webp', '#', 'Saiba mais', true, 3)
on conflict (id) do update set
  title = excluded.title,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  subtitle = excluded.subtitle,
  status_label = excluded.status_label,
  status_tone = excluded.status_tone,
  image_url = excluded.image_url,
  featured_media_url = excluded.featured_media_url,
  registration_url = excluded.registration_url,
  cta_label = excluded.cta_label,
  active = excluded.active,
  display_order = excluded.display_order;

insert into public.gallery_settings (
  id, eyebrow, title, banner_title, banner_description, banner_image_url, banner_image_alt, drive_url, updated_at
) values (
  true,
  'Memórias da comunidade',
  'Fotos do último evento',
  'CYBER LEAGUE PIAUÍ',
  'Os melhores momentos, as equipes e a torcida que fizeram parte da última etapa oficial da FEGEPI.',
  '/images/EventCarrosselImages/event1.webp',
  'Equipe celebrando no palco da Cyber League Piauí',
  null,
  now()
)
on conflict (id) do update set
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  banner_title = excluded.banner_title,
  banner_description = excluded.banner_description,
  banner_image_url = excluded.banner_image_url,
  banner_image_alt = excluded.banner_image_alt,
  drive_url = excluded.drive_url,
  updated_at = excluded.updated_at;

insert into public.gallery_photos (id, image_url, alt_text, download_url, display_order, active) values
  ('60000000-0000-4000-8000-000000000001', '/images/EventCarrosselImages/event1.webp', 'Equipe comemorando durante a final', '/images/EventCarrosselImages/event1.webp', 0, true),
  ('60000000-0000-4000-8000-000000000002', '/images/EventCarrosselImages/event2.webp', 'Jogadores durante uma partida em equipe', '/images/EventCarrosselImages/event2.webp', 1, true),
  ('60000000-0000-4000-8000-000000000003', '/images/EventCarrosselImages/event3.webp', 'Arena principal com público e equipes', '/images/EventCarrosselImages/event3.webp', 2, true),
  ('60000000-0000-4000-8000-000000000004', '/images/EventCarrosselImages/event1.webp', 'Atleta concentrado durante a competição', '/images/EventCarrosselImages/event1.webp', 3, true),
  ('60000000-0000-4000-8000-000000000005', '/images/EventCarrosselImages/event2.webp', 'Participantes reunidos entre as partidas', '/images/EventCarrosselImages/event2.webp', 4, true),
  ('60000000-0000-4000-8000-000000000006', '/images/EventCarrosselImages/event3.webp', 'Premiação no encerramento do torneio', '/images/EventCarrosselImages/event3.webp', 5, true)
on conflict (id) do update set
  image_url = excluded.image_url,
  alt_text = excluded.alt_text,
  download_url = excluded.download_url,
  display_order = excluded.display_order,
  active = excluded.active;

commit;
