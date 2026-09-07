alter table public.events
add column if not exists month text not null default '';

create index if not exists events_slug_status_idx
on public.events (slug, status);
