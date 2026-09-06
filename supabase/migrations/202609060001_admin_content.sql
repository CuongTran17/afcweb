create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_active_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and is_active = true
  );
$$;

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  link_url text,
  image_url text not null,
  storage_path text not null,
  alt text not null,
  object_position text not null default 'center center',
  file_size integer not null check (file_size between 51200 and 512000),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  year text not null,
  category text not null check (category in ('academic', 'community', 'internal')),
  label text not null,
  summary text not null,
  content text not null default '',
  featured_home boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  alt text not null,
  file_size integer not null check (file_size between 51200 and 512000),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon_key text not null,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.department_responsibilities (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  content text not null,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leaders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  department_id uuid references public.departments(id) on delete set null,
  department_name text not null,
  generation text not null,
  photo_url text,
  storage_path text,
  file_size integer check (file_size is null or file_size between 51200 and 512000),
  mime_type text check (mime_type is null or mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  term_start text,
  term_end text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists banners_public_idx on public.banners (status, sort_order);
create index if not exists events_public_idx on public.events (status, featured_home, sort_order, published_at);
create index if not exists event_images_public_idx on public.event_images (event_id, status, sort_order);
create index if not exists departments_public_idx on public.departments (status, sort_order);
create index if not exists department_responsibilities_public_idx on public.department_responsibilities (department_id, status, sort_order);
create index if not exists leaders_public_idx on public.leaders (status, is_active, generation, sort_order);

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at before update on public.admin_profiles for each row execute function public.set_updated_at();

drop trigger if exists set_banners_updated_at on public.banners;
create trigger set_banners_updated_at before update on public.banners for each row execute function public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at before update on public.events for each row execute function public.set_updated_at();

drop trigger if exists set_event_images_updated_at on public.event_images;
create trigger set_event_images_updated_at before update on public.event_images for each row execute function public.set_updated_at();

drop trigger if exists set_departments_updated_at on public.departments;
create trigger set_departments_updated_at before update on public.departments for each row execute function public.set_updated_at();

drop trigger if exists set_department_responsibilities_updated_at on public.department_responsibilities;
create trigger set_department_responsibilities_updated_at before update on public.department_responsibilities for each row execute function public.set_updated_at();

drop trigger if exists set_leaders_updated_at on public.leaders;
create trigger set_leaders_updated_at before update on public.leaders for each row execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.banners enable row level security;
alter table public.events enable row level security;
alter table public.event_images enable row level security;
alter table public.departments enable row level security;
alter table public.department_responsibilities enable row level security;
alter table public.leaders enable row level security;

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles" on public.admin_profiles for select to authenticated using (public.is_active_admin());

drop policy if exists "Public can read published banners" on public.banners;
create policy "Public can read published banners" on public.banners for select to anon, authenticated using (status = 'published');

drop policy if exists "Admins can manage banners" on public.banners;
create policy "Admins can manage banners" on public.banners for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events" on public.events for select to anon, authenticated using (status = 'published');

drop policy if exists "Admins can manage events" on public.events;
create policy "Admins can manage events" on public.events for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

drop policy if exists "Public can read published event images" on public.event_images;
create policy "Public can read published event images" on public.event_images for select to anon, authenticated using (status = 'published');

drop policy if exists "Admins can manage event images" on public.event_images;
create policy "Admins can manage event images" on public.event_images for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

drop policy if exists "Public can read published departments" on public.departments;
create policy "Public can read published departments" on public.departments for select to anon, authenticated using (status = 'published');

drop policy if exists "Admins can manage departments" on public.departments;
create policy "Admins can manage departments" on public.departments for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

drop policy if exists "Public can read published responsibilities" on public.department_responsibilities;
create policy "Public can read published responsibilities" on public.department_responsibilities for select to anon, authenticated using (status = 'published');

drop policy if exists "Admins can manage responsibilities" on public.department_responsibilities;
create policy "Admins can manage responsibilities" on public.department_responsibilities for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

drop policy if exists "Public can read active published leaders" on public.leaders;
create policy "Public can read active published leaders" on public.leaders for select to anon, authenticated using (status = 'published' and is_active = true);

drop policy if exists "Admins can manage leaders" on public.leaders;
create policy "Admins can manage leaders" on public.leaders for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'afc-media',
  'afc-media',
  true,
  512000,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read AFC media" on storage.objects;
create policy "Public can read AFC media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'afc-media');

drop policy if exists "Admins can upload AFC media" on storage.objects;
create policy "Admins can upload AFC media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'afc-media' and public.is_active_admin());

drop policy if exists "Admins can update AFC media" on storage.objects;
create policy "Admins can update AFC media"
on storage.objects for update
to authenticated
using (bucket_id = 'afc-media' and public.is_active_admin())
with check (bucket_id = 'afc-media' and public.is_active_admin());

grant usage on schema public to anon, authenticated;

grant select on public.admin_profiles to authenticated;

grant select on public.banners to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select on public.event_images to anon, authenticated;
grant select on public.departments to anon, authenticated;
grant select on public.department_responsibilities to anon, authenticated;
grant select on public.leaders to anon, authenticated;

grant insert, update on public.banners to authenticated;
grant insert, update on public.events to authenticated;
grant insert, update on public.event_images to authenticated;
grant insert, update on public.departments to authenticated;
grant insert, update on public.department_responsibilities to authenticated;
grant insert, update on public.leaders to authenticated;

insert into public.departments (slug, name, description, icon_key, sort_order, status)
values
  ('chuyen-mon', 'Ban Chuyên môn', 'Phụ trách nội dung học thuật và chuyên môn của CLB.', 'BookOpenCheck', 1, 'published'),
  ('truyen-thong', 'Ban Truyền thông', 'Xây dựng hình ảnh và truyền tải các hoạt động của AFC.', 'Megaphone', 2, 'published'),
  ('su-kien', 'Ban Sự kiện', 'Lên kế hoạch và triển khai các chương trình, sự kiện của CLB.', 'CalendarCheck2', 3, 'published'),
  ('doi-ngoai', 'Ban Đối ngoại', 'Kết nối đối tác và mở rộng nguồn lực cho các hoạt động của AFC.', 'Handshake', 4, 'published')
on conflict (slug) do update
set name = excluded.name,
    description = coalesce(nullif(public.departments.description, ''), excluded.description),
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order,
    status = case
      when public.departments.status = 'archived' then public.departments.status
      else excluded.status
    end;

insert into public.department_responsibilities (department_id, content, sort_order, status)
select d.id, seed.content, seed.sort_order, 'published'
from (
  values
    ('chuyen-mon', 'Xây dựng nội dung học thuật, tài liệu và các chủ đề chuyên môn cho CLB.', 1),
    ('chuyen-mon', 'Phối hợp phát triển nội dung cho các chương trình, cuộc thi và hoạt động của Khoa.', 2),
    ('chuyen-mon', 'Hỗ trợ thành viên nâng cao kiến thức và kỹ năng chuyên môn.', 3),
    ('truyen-thong', 'Xây dựng nội dung và hình ảnh truyền thông cho các hoạt động của AFC.', 1),
    ('truyen-thong', 'Quản lý các kênh truyền thông và duy trì hình ảnh của CLB.', 2),
    ('truyen-thong', 'Phụ trách thiết kế, chụp ảnh, quay phim và sản xuất nội dung truyền thông.', 3),
    ('su-kien', 'Lập kế hoạch và triển khai các chương trình, sự kiện của CLB.', 1),
    ('su-kien', 'Xây dựng kịch bản, timeline và phương án vận hành chương trình.', 2),
    ('su-kien', 'Phụ trách hậu cần, nhân sự và phối hợp các bộ phận trong quá trình tổ chức.', 3),
    ('doi-ngoai', 'Tìm kiếm và kết nối với đối tác, diễn giả và các đơn vị bên ngoài.', 1),
    ('doi-ngoai', 'Phối hợp xây dựng quyền lợi và duy trì mối quan hệ với các đối tác.', 2),
    ('doi-ngoai', 'Hỗ trợ huy động nguồn lực cho các chương trình và hoạt động của AFC.', 3)
) as seed(department_slug, content, sort_order)
join public.departments d on d.slug = seed.department_slug
where not exists (
  select 1
  from public.department_responsibilities existing
  where existing.department_id = d.id
    and existing.content = seed.content
    and existing.status <> 'archived'
);
