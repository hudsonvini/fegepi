-- Migração incremental para projetos FEGEPI que já executaram schema.sql.
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text not null default 'Banner principal da FEGEPI',
  eyebrow text,
  title text,
  description text,
  cta_label text,
  link_url text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.hero_slides add column if not exists eyebrow text;
alter table public.hero_slides add column if not exists title text;
alter table public.hero_slides add column if not exists description text;
alter table public.hero_slides add column if not exists cta_label text;

alter table public.hero_slides enable row level security;

drop policy if exists "public reads hero slides" on public.hero_slides;
create policy "public reads hero slides"
on public.hero_slides for select
using (active);

drop policy if exists "admins manage hero slides" on public.hero_slides;
create policy "admins manage hero slides"
on public.hero_slides for all
using (public.is_admin())
with check (public.is_admin());
