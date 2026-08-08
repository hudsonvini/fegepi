begin;

alter table public.gallery_settings
  add column if not exists drive_url text;

commit;
