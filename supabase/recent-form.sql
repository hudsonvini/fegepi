alter table public.ranking_entries
  add column if not exists recent_form text[] not null default '{}'::text[];

alter table public.ranking_entries
  drop constraint if exists ranking_recent_form_length;

alter table public.ranking_entries
  add constraint ranking_recent_form_length
  check (cardinality(recent_form) <= 5);

alter table public.ranking_entries
  drop constraint if exists ranking_recent_form_values;

alter table public.ranking_entries
  add constraint ranking_recent_form_values
  check (recent_form <@ array['W', 'D', 'L']::text[]);

comment on column public.ranking_entries.recent_form is
  'Resultados das cinco partidas mais recentes, do mais antigo ao mais recente: W, D ou L.';
