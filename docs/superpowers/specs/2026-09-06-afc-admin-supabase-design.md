# AFC Admin Supabase Design

## Purpose

Add an admin area backed by Supabase so AFC can update homepage banners, featured activities, the activity archive, department descriptions and responsibilities, and leadership records without editing source code.

## Scope

- Add admin routes under `/admin`.
- Add `/admin/login` for email and password login.
- Do not add public registration. Admin users are created manually in Supabase Authentication.
- Public routes `/`, `/hoat-dong`, and `/co-cau` read published content from Supabase.
- Existing static data remains as fallback content when Supabase environment variables are missing or a public query fails.
- Admin actions hide, unpublish, archive, or restore content. The admin UI does not permanently delete records.
- Uploaded images must be at least `50KB` and at most `500KB`.
- Uploaded images must be `image/jpeg`, `image/png`, or `image/webp`.
- Supabase `service_role` keys are never used in browser code.

## Admin Capabilities

### Banner Management

Admins can upload, reorder, activate, hide, and edit homepage hero banner images. Active banners appear in the homepage hero carousel.

### Activity Management

Admins can create and edit activity posts, upload multiple images, choose category and label, set publication status, and toggle `featured_home`. Published activities appear on `/hoat-dong`. Published activities with `featured_home = true` appear in the homepage "Dấu ấn hoạt động" section.

### Department Management

Admins can edit the four department names, descriptions, icon keys, display order, and responsibility lines. Published department data appears in homepage department previews and the `/co-cau` department popup.

### Leadership Management

Admins can add and edit leadership members by generation, department, title, term, display order, and active state. Active records appear on `/co-cau`.

## Data Model

### `admin_profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text not null`
- `role text not null default 'admin'`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `banners`

- `id uuid primary key default gen_random_uuid()`
- `title text not null`
- `image_url text not null`
- `storage_path text not null`
- `alt text not null`
- `object_position text not null default 'center center'`
- `file_size integer not null`
- `mime_type text not null`
- `sort_order integer not null default 0`
- `status text not null default 'published'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `events`

- `id uuid primary key default gen_random_uuid()`
- `slug text not null unique`
- `title text not null`
- `year text not null`
- `category text not null`
- `label text not null`
- `summary text not null`
- `content text not null default ''`
- `featured_home boolean not null default false`
- `sort_order integer not null default 0`
- `status text not null default 'draft'`
- `published_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `event_images`

- `id uuid primary key default gen_random_uuid()`
- `event_id uuid not null references events(id) on delete cascade`
- `image_url text not null`
- `storage_path text not null`
- `alt text not null`
- `file_size integer not null`
- `mime_type text not null`
- `sort_order integer not null default 0`
- `status text not null default 'published'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `departments`

- `id uuid primary key default gen_random_uuid()`
- `slug text not null unique`
- `name text not null`
- `description text not null`
- `icon_key text not null`
- `sort_order integer not null default 0`
- `status text not null default 'published'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `department_responsibilities`

- `id uuid primary key default gen_random_uuid()`
- `department_id uuid not null references departments(id) on delete cascade`
- `content text not null`
- `sort_order integer not null default 0`
- `status text not null default 'published'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `leaders`

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `role text not null`
- `department_id uuid references departments(id) on delete set null`
- `department_name text not null`
- `generation text not null`
- `photo_url text`
- `storage_path text`
- `file_size integer`
- `mime_type text`
- `term_start text`
- `term_end text`
- `is_active boolean not null default true`
- `sort_order integer not null default 0`
- `status text not null default 'published'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

## Status Rules

- `draft`: editable in admin, hidden from public routes.
- `published`: visible on public routes.
- `hidden`: intentionally hidden from public routes, visible in admin.
- `archived`: removed from ordinary public/admin lists unless the admin selects the archived filter.

Public queries only return `status = 'published'`, and leadership queries also require `is_active = true`.

## Storage Rules

- Bucket name: `afc-media`.
- Folder convention:
  - `banners/<timestamp>-<slug>.<ext>`
  - `events/<event-slug>/<timestamp>-<slug>.<ext>`
  - `leaders/<generation>/<timestamp>-<slug>.<ext>`
- Public read is allowed for uploaded images.
- Authenticated active admins can upload images.
- Admin UI validates file size before upload: `50KB <= size <= 500KB`.
- Admin UI validates MIME type before upload: `image/jpeg`, `image/png`, or `image/webp`.
- No permanent image deletion is exposed in this release. Images are hidden or detached in database records.

## Security

- Supabase publishable key is allowed in the frontend.
- Supabase `service_role` and secret keys are not used in frontend code.
- RLS is enabled on all public tables.
- Anonymous users can read only published public data.
- Authenticated users can read and write admin data only when an active `admin_profiles` row exists for `auth.uid()`.
- Admin users are manually created in Supabase Authentication, then added to `admin_profiles`.

## Public Site Behavior

- Homepage hero uses active published `banners`, ordered by `sort_order`.
- Homepage featured activities use published `events` where `featured_home = true`, with visible event images ordered by `sort_order`.
- `/hoat-dong` lists published events and visible event images.
- Homepage department previews and `/co-cau` popups use published `departments` and `department_responsibilities`.
- `/co-cau` leadership lists active published `leaders`, ordered by generation, department, and sort order.
- If Supabase is not configured, public routes use current static data.
- If a public Supabase query fails, public routes show static fallback data and do not expose raw errors.

## Admin UX

- Admin layout uses a restrained dashboard style, not a landing-page style.
- Admin routes have clear empty, loading, success, and error states.
- Destructive wording is avoided. Use "Ẩn", "Bỏ khỏi web", "Lưu nháp", "Xuất bản", "Lưu thay đổi", and "Khôi phục".
- Image upload errors explain the exact problem: too small, too large, unsupported type, upload failed.
- Forms validate required fields before writing to Supabase.

## Quality Bar

- Unit tests cover file validation, Supabase data mapping, public fallback behavior, and protected route behavior.
- Component tests cover each admin module's primary form flow with mocked data access functions.
- Production build succeeds with no TypeScript errors.
- Manual QA covers admin login, upload validation, publish/hide/archive/restore, public route refreshes, desktop and mobile admin layout, and keyboard focus.
