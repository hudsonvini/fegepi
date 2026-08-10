-- Amplia os banners principais existentes com conteúdo editorial opcional.
-- Execute uma vez no SQL Editor do Supabase do projeto já publicado.
alter table public.hero_slides add column if not exists eyebrow text;
alter table public.hero_slides add column if not exists title text;
alter table public.hero_slides add column if not exists description text;
alter table public.hero_slides add column if not exists cta_label text;

update public.hero_slides
set
  title = coalesce(title, alt_text),
  cta_label = case when link_url is not null then coalesce(cta_label, 'Saiba mais') else cta_label end
where title is null or (link_url is not null and cta_label is null);
