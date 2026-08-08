begin;

drop policy if exists "public reads events" on public.events;
create policy "public reads events" on public.events for select
  using (active or coalesce(ends_at, starts_at) < current_date);

commit;
