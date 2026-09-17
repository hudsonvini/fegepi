-- Preserva vínculos e resultados ao desativar equipes.
alter table public.teams add column if not exists active boolean not null default true;
comment on column public.teams.active is 'Equipes inativas preservam o histórico e não recebem novas inscrições ou entradas no elenco pela administração.';
