# AFC Admin Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Supabase-backed admin area that lets AFC manage banners, activities, department content, and leadership records without editing source code.

**Architecture:** The existing React/Vite app gains Supabase client modules, typed repositories, protected `/admin` routes, and admin CRUD screens. Public pages read from Supabase through a fallback-aware data layer, while static data remains available when Supabase is not configured or public reads fail.

**Tech Stack:** React, TypeScript, Vite, React Router, Supabase JavaScript client, Supabase Auth, Supabase Storage, Postgres RLS, Vitest, Testing Library, CSS.

**Spec:** `docs/superpowers/specs/2026-09-06-afc-admin-supabase-design.md`

## Global Constraints

- Do not add public registration. Admin users are created manually in Supabase Authentication.
- Do not expose Supabase `service_role` or secret keys in frontend code.
- Admin actions hide, unpublish, archive, or restore records; the admin UI does not permanently delete records.
- Uploaded images must satisfy `50KB <= size <= 500KB`.
- Uploaded images must use MIME type `image/jpeg`, `image/png`, or `image/webp`.
- Public queries return only `status = 'published'`; leadership also requires `is_active = true`.
- Existing static data remains as fallback content for public routes.
- Use Vietnamese admin labels: `Ẩn`, `Bỏ khỏi web`, `Lưu nháp`, `Xuất bản`, `Lưu thay đổi`, `Khôi phục`.

---

## File Structure

- Create `supabase/migrations/202609060001_admin_content.sql`: tables, indexes, triggers, RLS policies, and storage policies.
- Create `src/lib/supabase/client.ts`: browser Supabase client creation from Vite env.
- Create `src/lib/supabase/env.ts`: Supabase env detection and typed config.
- Create `src/lib/supabase/types.ts`: database row and insert/update types used by repositories.
- Create `src/lib/storage/imageValidation.ts`: shared upload validation rules.
- Create `src/lib/storage/imageValidation.test.ts`: tests for file size and MIME validation.
- Create `src/lib/storage/uploadImage.ts`: authenticated Storage upload helper.
- Create `src/lib/content/publicContent.ts`: fallback-aware reads for public pages.
- Create `src/lib/content/adminContent.ts`: authenticated admin CRUD functions.
- Create `src/lib/content/contentMapping.ts`: map Supabase rows to current UI types.
- Create `src/lib/content/contentMapping.test.ts`: mapping and fallback tests.
- Create `src/lib/auth/adminAuth.ts`: sign in, sign out, session reads, and active admin profile check.
- Create `src/components/admin/AdminLayout.tsx`: admin shell, nav, and route outlet.
- Create `src/components/admin/AdminGuard.tsx`: protected route guard.
- Create `src/components/admin/AdminForm.tsx`: shared form section layout and inline errors.
- Create `src/components/admin/ImageUploadField.tsx`: reusable validated image uploader.
- Create `src/pages/admin/AdminLoginPage.tsx`: email/password login screen.
- Create `src/pages/admin/AdminDashboardPage.tsx`: overview and quick links.
- Create `src/pages/admin/BannerAdminPage.tsx`: banner list and editor.
- Create `src/pages/admin/EventAdminPage.tsx`: activity list, editor, images, and homepage pin.
- Create `src/pages/admin/DepartmentAdminPage.tsx`: department text and responsibilities editor.
- Create `src/pages/admin/LeaderAdminPage.tsx`: leadership records editor.
- Modify `src/App.tsx`: add admin routes and data-provider boundaries.
- Modify `src/pages/HomePage.tsx`: consume public banners, events, and departments.
- Modify `src/pages/ActivitiesPage.tsx`: consume public events.
- Modify `src/pages/StructurePage.tsx`: consume public departments and leaders.
- Modify `src/components/HomeHero.tsx`: accept banner data as props.
- Modify `src/components/DepartmentPreview.tsx`: accept department data as props.
- Modify `src/components/EventCard.tsx`: accept mapped event records from Supabase or static fallback.
- Modify `.env.example`: document Supabase env vars.
- Modify `README.md`: add Supabase setup, admin creation, storage constraints, and local QA instructions.

---

### Task 1: Supabase Environment And Client

**Files:**
- Create: `src/lib/supabase/env.ts`
- Create: `src/lib/supabase/client.ts`
- Test: `src/lib/supabase/env.test.ts`
- Modify: `.env.example`
- Modify: `package.json`

**Interfaces:**
- Produces: `getSupabaseConfig(): SupabaseConfig | null`
- Produces: `getSupabaseClient(): SupabaseClient | null`
- Produces env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

- [ ] **Step 1: Write the failing env test**

```ts
import { describe, expect, it, vi } from 'vitest'
import { getSupabaseConfig } from './env'

describe('supabase env', () => {
  it('returns null when public Supabase env is missing', () => {
    expect(getSupabaseConfig({})).toBeNull()
  })

  it('returns browser-safe Supabase config from Vite env', () => {
    expect(
      getSupabaseConfig({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
      }),
    ).toEqual({
      url: 'https://example.supabase.co',
      publishableKey: 'publishable-key',
    })
  })
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm.cmd run test:run -- src/lib/supabase/env.test.ts`

Expected: FAIL because `src/lib/supabase/env.ts` does not exist.

- [ ] **Step 3: Install Supabase client**

Run: `npm.cmd install @supabase/supabase-js`

Expected: `package.json` and `package-lock.json` include `@supabase/supabase-js`.

- [ ] **Step 4: Implement env and client modules**

```ts
export type SupabaseConfig = {
  url: string
  publishableKey: string
}

type EnvShape = Record<string, string | undefined>

export function getSupabaseConfig(env: EnvShape = import.meta.env): SupabaseConfig | null {
  const url = env.VITE_SUPABASE_URL?.trim()
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !publishableKey) return null

  return { url, publishableKey }
}
```

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from './env'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig()
  if (!config) return null
  if (!client) client = createClient(config.url, config.publishableKey)
  return client
}
```

- [ ] **Step 5: Update `.env.example`**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

- [ ] **Step 6: Verify**

Run: `npm.cmd run test:run -- src/lib/supabase/env.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .env.example src/lib/supabase
git commit -m "feat: add Supabase client configuration"
```

---

### Task 2: Database Schema, RLS, And Storage Policies

**Files:**
- Create: `supabase/migrations/202609060001_admin_content.sql`
- Modify: `README.md`

**Interfaces:**
- Produces tables: `admin_profiles`, `banners`, `events`, `event_images`, `departments`, `department_responsibilities`, `leaders`
- Produces storage bucket: `afc-media`
- Produces helper function: `public.is_active_admin() returns boolean`

- [ ] **Step 1: Create migration SQL**

```sql
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

create table public.admin_profiles (
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

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
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

create table public.events (
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

create table public.event_images (
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

create table public.departments (
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

create table public.department_responsibilities (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  content text not null,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leaders (
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
```

- [ ] **Step 2: Add indexes, triggers, and RLS**

```sql
create index banners_public_idx on public.banners (status, sort_order);
create index events_public_idx on public.events (status, featured_home, sort_order, published_at);
create index event_images_public_idx on public.event_images (event_id, status, sort_order);
create index departments_public_idx on public.departments (status, sort_order);
create index department_responsibilities_public_idx on public.department_responsibilities (department_id, status, sort_order);
create index leaders_public_idx on public.leaders (status, is_active, generation, sort_order);

create trigger set_admin_profiles_updated_at before update on public.admin_profiles for each row execute function public.set_updated_at();
create trigger set_banners_updated_at before update on public.banners for each row execute function public.set_updated_at();
create trigger set_events_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger set_event_images_updated_at before update on public.event_images for each row execute function public.set_updated_at();
create trigger set_departments_updated_at before update on public.departments for each row execute function public.set_updated_at();
create trigger set_department_responsibilities_updated_at before update on public.department_responsibilities for each row execute function public.set_updated_at();
create trigger set_leaders_updated_at before update on public.leaders for each row execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.banners enable row level security;
alter table public.events enable row level security;
alter table public.event_images enable row level security;
alter table public.departments enable row level security;
alter table public.department_responsibilities enable row level security;
alter table public.leaders enable row level security;

create policy "Admins can read admin profiles" on public.admin_profiles for select to authenticated using (public.is_active_admin());

create policy "Public can read published banners" on public.banners for select to anon, authenticated using (status = 'published');
create policy "Admins can manage banners" on public.banners for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "Public can read published events" on public.events for select to anon, authenticated using (status = 'published');
create policy "Admins can manage events" on public.events for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "Public can read published event images" on public.event_images for select to anon, authenticated using (status = 'published');
create policy "Admins can manage event images" on public.event_images for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "Public can read published departments" on public.departments for select to anon, authenticated using (status = 'published');
create policy "Admins can manage departments" on public.departments for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "Public can read published responsibilities" on public.department_responsibilities for select to anon, authenticated using (status = 'published');
create policy "Admins can manage responsibilities" on public.department_responsibilities for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "Public can read active published leaders" on public.leaders for select to anon, authenticated using (status = 'published' and is_active = true);
create policy "Admins can manage leaders" on public.leaders for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
```

- [ ] **Step 3: Add storage bucket and policies**

```sql
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

create policy "Public can read AFC media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'afc-media');

create policy "Admins can upload AFC media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'afc-media' and public.is_active_admin());

create policy "Admins can update AFC media"
on storage.objects for update
to authenticated
using (bucket_id = 'afc-media' and public.is_active_admin())
with check (bucket_id = 'afc-media' and public.is_active_admin());
```

- [ ] **Step 4: Document manual admin creation**

Add this to `README.md`:

````md
## Creating an admin user

1. In Supabase Dashboard, open Authentication > Users.
2. Add a user with email and password.
3. Copy the user's UUID.
4. Insert a matching row in `public.admin_profiles`:

```sql
insert into public.admin_profiles (id, display_name, role, is_active)
values ('USER_UUID', 'AFC Admin', 'admin', true);
```
````

- [ ] **Step 5: Verify migration syntax locally or in Supabase SQL editor**

Run in the Supabase SQL editor or through Supabase CLI:

```bash
supabase db push
```

Expected: migration applies without SQL errors, and `afc-media` exists.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/202609060001_admin_content.sql README.md
git commit -m "feat: add Supabase admin content schema"
```

---

### Task 3: Shared Image Validation And Upload Helper

**Files:**
- Create: `src/lib/storage/imageValidation.ts`
- Create: `src/lib/storage/imageValidation.test.ts`
- Create: `src/lib/storage/uploadImage.ts`

**Interfaces:**
- Produces: `validateAdminImageFile(file: Pick<File, 'size' | 'type'>): ImageValidationResult`
- Produces: `buildStoragePath(folder: 'banners' | 'events' | 'leaders', slug: string, file: File): string`
- Produces: `uploadAdminImage(args: UploadAdminImageArgs): Promise<UploadedImage>`

- [ ] **Step 1: Write the failing validation test**

```ts
import { describe, expect, it } from 'vitest'
import { validateAdminImageFile } from './imageValidation'

const file = (size: number, type: string) => ({ size, type })

describe('validateAdminImageFile', () => {
  it('rejects images below 50KB', () => {
    expect(validateAdminImageFile(file(49 * 1024, 'image/jpeg'))).toEqual({
      valid: false,
      reason: 'Ảnh quá nhẹ. Vui lòng dùng ảnh từ 50KB đến 500KB.',
    })
  })

  it('rejects images above 500KB', () => {
    expect(validateAdminImageFile(file(501 * 1024, 'image/webp'))).toEqual({
      valid: false,
      reason: 'Ảnh quá nặng. Vui lòng nén ảnh xuống dưới 500KB.',
    })
  })

  it('rejects unsupported MIME types', () => {
    expect(validateAdminImageFile(file(120 * 1024, 'image/gif'))).toEqual({
      valid: false,
      reason: 'Định dạng ảnh chưa được hỗ trợ. Vui lòng dùng JPG, PNG hoặc WEBP.',
    })
  })

  it('accepts JPG, PNG, and WEBP images between 50KB and 500KB', () => {
    expect(validateAdminImageFile(file(120 * 1024, 'image/jpeg'))).toEqual({ valid: true })
    expect(validateAdminImageFile(file(120 * 1024, 'image/png'))).toEqual({ valid: true })
    expect(validateAdminImageFile(file(120 * 1024, 'image/webp'))).toEqual({ valid: true })
  })
})
```

- [ ] **Step 2: Run focused validation test**

Run: `npm.cmd run test:run -- src/lib/storage/imageValidation.test.ts`

Expected: FAIL because the validation module is missing.

- [ ] **Step 3: Implement validation constants and function**

```ts
export const MIN_ADMIN_IMAGE_BYTES = 50 * 1024
export const MAX_ADMIN_IMAGE_BYTES = 500 * 1024
export const ALLOWED_ADMIN_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export type ImageValidationResult = { valid: true } | { valid: false; reason: string }

export function validateAdminImageFile(file: Pick<File, 'size' | 'type'>): ImageValidationResult {
  if (file.size < MIN_ADMIN_IMAGE_BYTES) {
    return { valid: false, reason: 'Ảnh quá nhẹ. Vui lòng dùng ảnh từ 50KB đến 500KB.' }
  }

  if (file.size > MAX_ADMIN_IMAGE_BYTES) {
    return { valid: false, reason: 'Ảnh quá nặng. Vui lòng nén ảnh xuống dưới 500KB.' }
  }

  if (!ALLOWED_ADMIN_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_ADMIN_IMAGE_TYPES)[number])) {
    return { valid: false, reason: 'Định dạng ảnh chưa được hỗ trợ. Vui lòng dùng JPG, PNG hoặc WEBP.' }
  }

  return { valid: true }
}
```

- [ ] **Step 4: Implement upload helper**

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { validateAdminImageFile } from './imageValidation'

export type UploadFolder = 'banners' | 'events' | 'leaders'

export type UploadedImage = {
  imageUrl: string
  storagePath: string
  fileSize: number
  mimeType: string
}

export type UploadAdminImageArgs = {
  client: SupabaseClient
  bucket: 'afc-media'
  folder: UploadFolder
  slug: string
  file: File
}

export function buildStoragePath(folder: UploadFolder, slug: string, file: File): string {
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  return `${folder}/${slug}/${Date.now()}-${slug}.${extension}`
}

export async function uploadAdminImage({ client, bucket, folder, slug, file }: UploadAdminImageArgs): Promise<UploadedImage> {
  const validation = validateAdminImageFile(file)
  if (!validation.valid) throw new Error(validation.reason)

  const storagePath = buildStoragePath(folder, slug, file)
  const { error } = await client.storage.from(bucket).upload(storagePath, file, { upsert: false, contentType: file.type })
  if (error) throw error

  const { data } = client.storage.from(bucket).getPublicUrl(storagePath)
  return { imageUrl: data.publicUrl, storagePath, fileSize: file.size, mimeType: file.type }
}
```

- [ ] **Step 5: Verify**

Run: `npm.cmd run test:run -- src/lib/storage/imageValidation.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/storage
git commit -m "feat: validate admin image uploads"
```

---

### Task 4: Supabase Types And Content Mapping

**Files:**
- Create: `src/lib/supabase/types.ts`
- Create: `src/lib/content/contentMapping.ts`
- Create: `src/lib/content/contentMapping.test.ts`

**Interfaces:**
- Produces: `SupabaseEventWithImages`
- Produces: `mapEventRowsToEventItems(rows: SupabaseEventWithImages[]): EventItem[]`
- Produces: `mapDepartmentRowsToDepartments(rows: SupabaseDepartmentWithResponsibilities[]): Department[]`
- Produces: `mapLeaderRowsToLeadership(rows: SupabaseLeaderRow[]): Leader[]`

- [ ] **Step 1: Write failing mapping tests**

```ts
import { describe, expect, it } from 'vitest'
import { mapEventRowsToEventItems } from './contentMapping'

describe('content mapping', () => {
  it('maps a published event with ordered images into the current EventItem shape', () => {
    expect(
      mapEventRowsToEventItems([
        {
          id: 'event-id',
          slug: 'trading-challenge',
          title: 'Chung kết PTIT Trading Challenge',
          year: '2026',
          category: 'academic',
          label: 'Học thuật',
          summary: 'Dấu mốc đưa kiến thức tài chính vào thử thách thực tế.',
          content: '',
          featured_home: true,
          sort_order: 1,
          status: 'published',
          published_at: '2026-01-01T00:00:00Z',
          event_images: [
            { image_url: '/two.jpg', alt: 'Ảnh hai', sort_order: 2, status: 'published' },
            { image_url: '/one.jpg', alt: 'Ảnh một', sort_order: 1, status: 'published' },
          ],
        },
      ]),
    ).toEqual([
      {
        id: 'trading-challenge',
        title: 'Chung kết PTIT Trading Challenge',
        year: '2026',
        category: 'academic',
        label: 'Học thuật',
        summary: 'Dấu mốc đưa kiến thức tài chính vào thử thách thực tế.',
        images: ['/one.jpg', '/two.jpg'],
        featured: true,
      },
    ])
  })
})
```

- [ ] **Step 2: Run focused mapping test**

Run: `npm.cmd run test:run -- src/lib/content/contentMapping.test.ts`

Expected: FAIL because mapping modules are missing.

- [ ] **Step 3: Add Supabase row types**

```ts
import type { EventCategory } from '../../data/events'

export type ContentStatus = 'draft' | 'published' | 'hidden' | 'archived'

export type SupabaseEventImageRow = {
  image_url: string
  alt: string
  sort_order: number
  status: ContentStatus
}

export type SupabaseEventWithImages = {
  id: string
  slug: string
  title: string
  year: string
  category: EventCategory
  label: string
  summary: string
  content: string
  featured_home: boolean
  sort_order: number
  status: ContentStatus
  published_at: string | null
  event_images: SupabaseEventImageRow[]
}
```

- [ ] **Step 4: Implement mapping**

```ts
import type { EventItem } from '../../data/events'
import type { SupabaseEventWithImages } from '../supabase/types'

export function mapEventRowsToEventItems(rows: SupabaseEventWithImages[]): EventItem[] {
  return rows
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((event) => ({
      id: event.slug,
      title: event.title,
      year: event.year,
      category: event.category,
      label: event.label,
      summary: event.summary,
      images: event.event_images
        .filter((image) => image.status === 'published')
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => image.image_url),
      featured: event.featured_home,
    }))
}
```

- [ ] **Step 5: Verify**

Run: `npm.cmd run test:run -- src/lib/content/contentMapping.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/types.ts src/lib/content/contentMapping.ts src/lib/content/contentMapping.test.ts
git commit -m "feat: map Supabase content for public pages"
```

---

### Task 5: Public Content Repository With Static Fallbacks

**Files:**
- Create: `src/lib/content/publicContent.ts`
- Create: `src/lib/content/publicContent.test.ts`
- Modify: `src/lib/content/contentMapping.ts`

**Interfaces:**
- Produces: `getPublicBanners(): Promise<BannerSlide[]>`
- Produces: `getPublicEvents(): Promise<EventItem[]>`
- Produces: `getFeaturedHomeEvents(): Promise<EventItem[]>`
- Produces: `getPublicDepartments(): Promise<Department[]>`
- Produces: `getPublicLeadership(): Promise<Leader[]>`

- [ ] **Step 1: Write failing fallback test**

```ts
import { describe, expect, it } from 'vitest'
import { getPublicEventsFromClient } from './publicContent'

describe('public content repository', () => {
  it('returns fallback events when Supabase client is not configured', async () => {
    const events = await getPublicEventsFromClient(null)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0]).toHaveProperty('images')
  })
})
```

- [ ] **Step 2: Run focused test**

Run: `npm.cmd run test:run -- src/lib/content/publicContent.test.ts`

Expected: FAIL because `publicContent.ts` is missing.

- [ ] **Step 3: Implement fallback-aware reads**

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { departments as fallbackDepartments } from '../../data/departments'
import { events as fallbackEvents } from '../../data/events'
import { leadership as fallbackLeadership } from '../../data/leadership'
import { getSupabaseClient } from '../supabase/client'
import { mapEventRowsToEventItems } from './contentMapping'

export async function getPublicEventsFromClient(client: SupabaseClient | null = getSupabaseClient()) {
  if (!client) return fallbackEvents

  const { data, error } = await client
    .from('events')
    .select('*, event_images(image_url, alt, sort_order, status)')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (error || !data) return fallbackEvents
  return mapEventRowsToEventItems(data)
}

export async function getFeaturedHomeEventsFromClient(client: SupabaseClient | null = getSupabaseClient()) {
  const events = await getPublicEventsFromClient(client)
  return events.filter((event) => event.featured).slice(0, 3)
}
```

- [ ] **Step 4: Implement department, leadership, and banner reads**

Use these signatures:

```ts
export type BannerSlide = {
  id: string
  title: string
  image: string
  alt: string
  position: string
}

export async function getPublicBannersFromClient(client: SupabaseClient | null = getSupabaseClient()): Promise<BannerSlide[]>
export async function getPublicDepartmentsFromClient(client: SupabaseClient | null = getSupabaseClient()): Promise<Department[]>
export async function getPublicLeadershipFromClient(client: SupabaseClient | null = getSupabaseClient()): Promise<Leader[]>
```

- [ ] **Step 5: Verify**

Run: `npm.cmd run test:run -- src/lib/content/publicContent.test.ts src/lib/content/contentMapping.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/content
git commit -m "feat: read public content from Supabase with fallbacks"
```

---

### Task 6: Public Pages Use Dynamic Content

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/ActivitiesPage.tsx`
- Modify: `src/pages/StructurePage.tsx`
- Modify: `src/components/HomeHero.tsx`
- Modify: `src/components/DepartmentPreview.tsx`
- Modify: `src/components/EventCard.tsx`
- Test: `src/pages/HomePage.test.tsx`
- Test: `src/pages/ActivitiesPage.test.tsx`
- Test: `src/pages/StructurePage.test.tsx`

**Interfaces:**
- Consumes: repository functions from `src/lib/content/publicContent.ts`
- Produces: public pages that render fallback content immediately and hydrate Supabase content after async load

- [ ] **Step 1: Write failing homepage repository test**

Add to `src/pages/HomePage.test.tsx`:

```ts
it('renders featured events supplied by the public content loader', async () => {
  render(
    <MemoryRouter>
      <HomePage
        contentLoader={{
          getBanners: async () => [],
          getEvents: async () => [
            {
              id: 'custom-event',
              title: 'Sự kiện AFC từ Admin',
              year: '2026',
              category: 'academic',
              label: 'Học thuật',
              summary: 'Nội dung được quản lý từ Supabase.',
              images: ['/images/events/trading-challenge-2.jpg'],
              featured: true,
            },
          ],
          getDepartments: async () => [],
        }}
      />
    </MemoryRouter>,
  )

  expect(await screen.findByRole('heading', { name: 'Sự kiện AFC từ Admin' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run focused route tests**

Run: `npm.cmd run test:run -- src/pages/HomePage.test.tsx src/pages/ActivitiesPage.test.tsx src/pages/StructurePage.test.tsx`

Expected: FAIL because pages do not accept injected content loaders.

- [ ] **Step 3: Refactor page data loading**

Use this prop shape for testable injection:

```ts
type HomePageContentLoader = {
  getBanners: () => Promise<BannerSlide[]>
  getEvents: () => Promise<EventItem[]>
  getDepartments: () => Promise<Department[]>
}

const defaultHomePageContentLoader: HomePageContentLoader = {
  getBanners: getPublicBannersFromClient,
  getEvents: getFeaturedHomeEventsFromClient,
  getDepartments: getPublicDepartmentsFromClient,
}
```

- [ ] **Step 4: Add user-facing states**

Use these visible strings:

```ts
const loadingText = 'Đang tải nội dung AFC'
const fallbackNotice = 'Đang dùng dữ liệu dự phòng'
const emptyEventsText = 'Chưa có hoạt động được xuất bản'
```

- [ ] **Step 5: Verify**

Run: `npm.cmd run test:run -- src/pages/HomePage.test.tsx src/pages/ActivitiesPage.test.tsx src/pages/StructurePage.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages src/components
git commit -m "feat: load public AFC content from Supabase"
```

---

### Task 7: Admin Auth And Protected Routes

**Files:**
- Create: `src/lib/auth/adminAuth.ts`
- Create: `src/lib/auth/adminAuth.test.ts`
- Create: `src/components/admin/AdminGuard.tsx`
- Create: `src/components/admin/AdminLayout.tsx`
- Create: `src/pages/admin/AdminLoginPage.tsx`
- Create: `src/pages/admin/AdminDashboardPage.tsx`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `signInAdmin(email: string, password: string): Promise<void>`
- Produces: `signOutAdmin(): Promise<void>`
- Produces: `getActiveAdminSession(): Promise<AdminSession | null>`

- [ ] **Step 1: Write failing auth tests**

```ts
import { describe, expect, it } from 'vitest'
import { isAdminProfileActive } from './adminAuth'

describe('admin auth', () => {
  it('accepts only active admin profiles', () => {
    expect(isAdminProfileActive({ is_active: true })).toBe(true)
    expect(isAdminProfileActive({ is_active: false })).toBe(false)
    expect(isAdminProfileActive(null)).toBe(false)
  })
})
```

- [ ] **Step 2: Write failing route guard test**

Add to `src/App.test.tsx`:

```ts
it('shows the admin login route', () => {
  render(
    <MemoryRouter initialEntries={['/admin/login']}>
      <App />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { name: 'Đăng nhập Admin AFC' })).toBeInTheDocument()
})
```

- [ ] **Step 3: Run tests**

Run: `npm.cmd run test:run -- src/lib/auth/adminAuth.test.ts src/App.test.tsx`

Expected: FAIL because admin auth and routes are missing.

- [ ] **Step 4: Implement auth module**

```ts
export type AdminProfile = { is_active: boolean }

export function isAdminProfileActive(profile: AdminProfile | null): boolean {
  return profile?.is_active === true
}
```

Implement Supabase calls with these method names:

```ts
export async function signInAdmin(email: string, password: string): Promise<void>
export async function signOutAdmin(): Promise<void>
export async function getActiveAdminSession(): Promise<AdminSession | null>
```

- [ ] **Step 5: Implement admin routes**

Add routes:

```tsx
<Route path="/admin/login" element={<AdminLoginPage />} />
<Route
  path="/admin"
  element={
    <AdminGuard>
      <AdminLayout />
    </AdminGuard>
  }
>
  <Route index element={<AdminDashboardPage />} />
</Route>
```

- [ ] **Step 6: Verify**

Run: `npm.cmd run test:run -- src/lib/auth/adminAuth.test.ts src/App.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth src/components/admin src/pages/admin src/App.tsx src/App.test.tsx
git commit -m "feat: add admin authentication routes"
```

---

### Task 8: Shared Admin UI And Image Upload Field

**Files:**
- Create: `src/components/admin/AdminForm.tsx`
- Create: `src/components/admin/ImageUploadField.tsx`
- Create: `src/components/admin/ImageUploadField.test.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: `<ImageUploadField label value onUploaded folder slug />`
- Consumes: `validateAdminImageFile` and `uploadAdminImage`

- [ ] **Step 1: Write failing upload-field test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ImageUploadField } from './ImageUploadField'

describe('ImageUploadField', () => {
  it('shows a clear error when an image is below 50KB', async () => {
    const user = userEvent.setup()
    render(<ImageUploadField label="Ảnh banner" folder="banners" slug="hero" onUploaded={() => undefined} />)

    const input = screen.getByLabelText('Ảnh banner')
    const file = new File(['x'.repeat(49 * 1024)], 'small.jpg', { type: 'image/jpeg' })
    await user.upload(input, file)

    expect(screen.getByText('Ảnh quá nhẹ. Vui lòng dùng ảnh từ 50KB đến 500KB.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run focused component test**

Run: `npm.cmd run test:run -- src/components/admin/ImageUploadField.test.tsx`

Expected: FAIL because `ImageUploadField` is missing.

- [ ] **Step 3: Implement shared admin components**

Use this minimal API:

```tsx
type ImageUploadFieldProps = {
  label: string
  folder: 'banners' | 'events' | 'leaders'
  slug: string
  onUploaded: (image: UploadedImage) => void
}
```

- [ ] **Step 4: Add admin CSS**

Add styles for:

```css
.admin-shell
.admin-sidebar
.admin-main
.admin-form
.admin-field
.admin-error
.admin-upload-preview
```

- [ ] **Step 5: Verify**

Run: `npm.cmd run test:run -- src/components/admin/ImageUploadField.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin src/styles/global.css
git commit -m "feat: add shared admin form controls"
```

---

### Task 9: Banner Admin

**Files:**
- Create: `src/pages/admin/BannerAdminPage.tsx`
- Create: `src/pages/admin/BannerAdminPage.test.tsx`
- Modify: `src/lib/content/adminContent.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `listAdminBanners(): Promise<AdminBanner[]>`
- Produces: `saveBanner(input: SaveBannerInput): Promise<void>`
- Produces: `setBannerStatus(id: string, status: ContentStatus): Promise<void>`

- [ ] **Step 1: Write failing banner admin test**

```tsx
it('offers banner upload and hide controls', async () => {
  render(
    <MemoryRouter initialEntries={['/admin/banners']}>
      <BannerAdminPage
        repository={{
          list: async () => [{ id: '1', title: 'Hero AFC', image_url: '/hero.jpg', status: 'published', sort_order: 1 }],
          save: async () => undefined,
          setStatus: async () => undefined,
        }}
      />
    </MemoryRouter>,
  )

  expect(await screen.findByText('Hero AFC')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Bỏ khỏi web' })).toBeInTheDocument()
  expect(screen.getByLabelText('Ảnh banner')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run focused test**

Run: `npm.cmd run test:run -- src/pages/admin/BannerAdminPage.test.tsx`

Expected: FAIL because `BannerAdminPage` is missing.

- [ ] **Step 3: Implement repository functions**

Use Supabase table `banners` and never hard-delete rows:

```ts
export async function setBannerStatus(id: string, status: ContentStatus) {
  const client = requireSupabaseClient()
  const { error } = await client.from('banners').update({ status }).eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 4: Implement page**

Controls:
- `Lưu thay đổi`
- `Xuất bản`
- `Ẩn`
- `Bỏ khỏi web`
- `Khôi phục`

- [ ] **Step 5: Add route**

```tsx
<Route path="banners" element={<BannerAdminPage />} />
```

- [ ] **Step 6: Verify**

Run: `npm.cmd run test:run -- src/pages/admin/BannerAdminPage.test.tsx src/App.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/BannerAdminPage.tsx src/pages/admin/BannerAdminPage.test.tsx src/lib/content/adminContent.ts src/App.tsx
git commit -m "feat: add banner admin management"
```

---

### Task 10: Event Admin With Homepage Pin And Multi-Image Upload

**Files:**
- Create: `src/pages/admin/EventAdminPage.tsx`
- Create: `src/pages/admin/EventAdminPage.test.tsx`
- Modify: `src/lib/content/adminContent.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `listAdminEvents(): Promise<AdminEvent[]>`
- Produces: `saveEvent(input: SaveEventInput): Promise<void>`
- Produces: `setEventStatus(id: string, status: ContentStatus): Promise<void>`
- Produces: `setEventFeaturedHome(id: string, featured: boolean): Promise<void>`
- Produces: `addEventImage(eventId: string, image: UploadedImage, alt: string): Promise<void>`

- [ ] **Step 1: Write failing event admin test**

```tsx
it('lets admins pin a published event to the homepage', async () => {
  const setFeaturedHome = vi.fn().mockResolvedValue(undefined)

  render(
    <EventAdminPage
      repository={{
        list: async () => [{ id: '1', title: 'Trading Challenge', status: 'published', featured_home: false }],
        save: async () => undefined,
        setStatus: async () => undefined,
        setFeaturedHome,
        addImage: async () => undefined,
      }}
    />,
  )

  await userEvent.click(await screen.findByRole('checkbox', { name: 'Ghim lên Trang chủ' }))
  expect(setFeaturedHome).toHaveBeenCalledWith('1', true)
})
```

- [ ] **Step 2: Run focused test**

Run: `npm.cmd run test:run -- src/pages/admin/EventAdminPage.test.tsx`

Expected: FAIL because `EventAdminPage` is missing.

- [ ] **Step 3: Implement event repository**

Important update behavior:

```ts
export async function setEventFeaturedHome(id: string, featured: boolean) {
  const client = requireSupabaseClient()
  const { error } = await client.from('events').update({ featured_home: featured }).eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 4: Implement event form**

Fields:
- `Tiêu đề`
- `Slug`
- `Năm`
- `Danh mục`
- `Nhãn`
- `Tóm tắt`
- `Nội dung`
- `Ghim lên Trang chủ`
- `Trạng thái`
- `Ảnh hoạt động`

- [ ] **Step 5: Add route**

```tsx
<Route path="events" element={<EventAdminPage />} />
```

- [ ] **Step 6: Verify**

Run: `npm.cmd run test:run -- src/pages/admin/EventAdminPage.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/EventAdminPage.tsx src/pages/admin/EventAdminPage.test.tsx src/lib/content/adminContent.ts src/App.tsx
git commit -m "feat: add activity admin management"
```

---

### Task 11: Department Admin

**Files:**
- Create: `src/pages/admin/DepartmentAdminPage.tsx`
- Create: `src/pages/admin/DepartmentAdminPage.test.tsx`
- Modify: `src/lib/content/adminContent.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `listAdminDepartments(): Promise<AdminDepartment[]>`
- Produces: `saveDepartment(input: SaveDepartmentInput): Promise<void>`
- Produces: `saveDepartmentResponsibilities(departmentId: string, lines: ResponsibilityInput[]): Promise<void>`
- Produces: `setDepartmentStatus(id: string, status: ContentStatus): Promise<void>`

- [ ] **Step 1: Write failing department admin test**

```tsx
it('edits department description and responsibility lines', async () => {
  const saveResponsibilities = vi.fn().mockResolvedValue(undefined)

  render(
    <DepartmentAdminPage
      repository={{
        list: async () => [{
          id: 'dept-1',
          name: 'Ban Chuyên môn',
          description: 'Mô tả cũ',
          responsibilities: [{ id: 'r1', content: 'Nhiệm vụ cũ', sort_order: 1 }],
          status: 'published',
        }],
        save: async () => undefined,
        saveResponsibilities,
        setStatus: async () => undefined,
      }}
    />,
  )

  await userEvent.clear(await screen.findByDisplayValue('Nhiệm vụ cũ'))
  await userEvent.type(screen.getByLabelText('Nhiệm vụ 1'), 'Nhiệm vụ mới')
  await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

  expect(saveResponsibilities).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run focused test**

Run: `npm.cmd run test:run -- src/pages/admin/DepartmentAdminPage.test.tsx`

Expected: FAIL because `DepartmentAdminPage` is missing.

- [ ] **Step 3: Implement department repository**

Saving responsibilities may archive removed lines and upsert current lines:

```ts
export async function saveDepartmentResponsibilities(departmentId: string, lines: ResponsibilityInput[]) {
  const client = requireSupabaseClient()
  const rows = lines.map((line, index) => ({
    id: line.id,
    department_id: departmentId,
    content: line.content,
    sort_order: index + 1,
    status: 'published',
  }))
  const { error } = await client.from('department_responsibilities').upsert(rows)
  if (error) throw error
}
```

- [ ] **Step 4: Implement department page**

Show exactly the department records from Supabase, ordered by `sort_order`. The UI must not assume there are always four rows, but the seed data creates four.

- [ ] **Step 5: Add route**

```tsx
<Route path="departments" element={<DepartmentAdminPage />} />
```

- [ ] **Step 6: Verify**

Run: `npm.cmd run test:run -- src/pages/admin/DepartmentAdminPage.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/DepartmentAdminPage.tsx src/pages/admin/DepartmentAdminPage.test.tsx src/lib/content/adminContent.ts src/App.tsx
git commit -m "feat: add department admin management"
```

---

### Task 12: Leadership Admin

**Files:**
- Create: `src/pages/admin/LeaderAdminPage.tsx`
- Create: `src/pages/admin/LeaderAdminPage.test.tsx`
- Modify: `src/lib/content/adminContent.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `listAdminLeaders(): Promise<AdminLeader[]>`
- Produces: `saveLeader(input: SaveLeaderInput): Promise<void>`
- Produces: `setLeaderStatus(id: string, status: ContentStatus): Promise<void>`
- Produces: `setLeaderActive(id: string, active: boolean): Promise<void>`

- [ ] **Step 1: Write failing leadership admin test**

```tsx
it('adds a new active leader for a generation', async () => {
  const save = vi.fn().mockResolvedValue(undefined)

  render(
    <LeaderAdminPage
      repository={{
        list: async () => [],
        save,
        setStatus: async () => undefined,
        setActive: async () => undefined,
      }}
    />,
  )

  await userEvent.type(screen.getByLabelText('Họ và tên'), 'Nguyễn Minh Anh')
  await userEvent.type(screen.getByLabelText('Vai trò'), 'Chủ nhiệm')
  await userEvent.type(screen.getByLabelText('Gen'), 'Gen 10')
  await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

  expect(save).toHaveBeenCalledWith(expect.objectContaining({
    name: 'Nguyễn Minh Anh',
    role: 'Chủ nhiệm',
    generation: 'Gen 10',
    is_active: true,
  }))
})
```

- [ ] **Step 2: Run focused test**

Run: `npm.cmd run test:run -- src/pages/admin/LeaderAdminPage.test.tsx`

Expected: FAIL because `LeaderAdminPage` is missing.

- [ ] **Step 3: Implement leader repository**

```ts
export async function setLeaderActive(id: string, active: boolean) {
  const client = requireSupabaseClient()
  const { error } = await client.from('leaders').update({ is_active: active }).eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 4: Implement leadership form**

Fields:
- `Họ và tên`
- `Vai trò`
- `Ban phụ trách`
- `Gen`
- `Nhiệm kỳ bắt đầu`
- `Nhiệm kỳ kết thúc`
- `Đang hiển thị`
- `Ảnh chân dung`
- `Trạng thái`

- [ ] **Step 5: Add route**

```tsx
<Route path="leaders" element={<LeaderAdminPage />} />
```

- [ ] **Step 6: Verify**

Run: `npm.cmd run test:run -- src/pages/admin/LeaderAdminPage.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/LeaderAdminPage.tsx src/pages/admin/LeaderAdminPage.test.tsx src/lib/content/adminContent.ts src/App.tsx
git commit -m "feat: add leadership admin management"
```

---

### Task 13: Seed Current Static Content Into Supabase

**Files:**
- Create: `supabase/seed.sql`
- Create: `scripts/exportStaticContentSeed.mjs`
- Modify: `README.md`

**Interfaces:**
- Produces seed rows matching current static `events`, `departments`, `leadership`, and default banners.

- [ ] **Step 1: Write seed export script**

Use this command shape:

```bash
node scripts/exportStaticContentSeed.mjs > supabase/seed.sql
```

The script reads current TypeScript data through a small JSON mirror or hard-coded export object and writes SQL inserts for:
- `banners`
- `events`
- `event_images`
- `departments`
- `department_responsibilities`
- `leaders`

- [ ] **Step 2: Include idempotent upserts**

Generated SQL should use slug conflict updates:

```sql
insert into public.events (slug, title, year, category, label, summary, featured_home, sort_order, status)
values ('trading-challenge-2026', 'Chung kết PTIT Trading Challenge', '2026', 'academic', 'Học thuật', '...', true, 1, 'published')
on conflict (slug) do update
set title = excluded.title,
    year = excluded.year,
    category = excluded.category,
    label = excluded.label,
    summary = excluded.summary,
    featured_home = excluded.featured_home,
    sort_order = excluded.sort_order,
    status = excluded.status;
```

- [ ] **Step 3: Document seed flow**

Add to `README.md`:

````md
## Seeding existing AFC content

Run:

```bash
node scripts/exportStaticContentSeed.mjs > supabase/seed.sql
supabase db reset
```
````

- [ ] **Step 4: Verify script output**

Run: `node scripts/exportStaticContentSeed.mjs`

Expected: output contains inserts for `trading-challenge-2026`, `chuyen-mon`, and the current Gen leadership records.

- [ ] **Step 5: Commit**

```bash
git add scripts/exportStaticContentSeed.mjs supabase/seed.sql README.md
git commit -m "feat: seed Supabase with current AFC content"
```

---

### Task 14: Final QA And Documentation

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Test: existing test suite

**Interfaces:**
- Produces documented setup and a verified production build.

- [ ] **Step 1: Document local Supabase setup**

Add commands:

```bash
supabase start
supabase db push
npm.cmd run dev
```

- [ ] **Step 2: Document admin acceptance checklist**

```md
## Admin QA checklist

- Login at `/admin/login` with a manually created Supabase user.
- Confirm a user without `admin_profiles.is_active = true` cannot access `/admin`.
- Upload rejects images below 50KB.
- Upload rejects images above 500KB.
- Upload accepts JPG, PNG, and WEBP between 50KB and 500KB.
- Banner published in admin appears in homepage hero.
- Event with `Ghim lên Trang chủ` appears in homepage "Dấu ấn hoạt động".
- Hidden and archived events do not appear on public routes.
- Department description changes appear on homepage and `/co-cau`.
- Leadership changes appear on `/co-cau` only when active and published.
```

- [ ] **Step 3: Run full automated verification**

Run: `npm.cmd run test:run`

Expected: all tests pass with zero failures.

- [ ] **Step 4: Run production build**

Run: `npm.cmd run build`

Expected: TypeScript and Vite build exit with code 0.

- [ ] **Step 5: Manual browser QA**

Run: `npm.cmd run dev`

Verify:
- `/`
- `/hoat-dong`
- `/co-cau`
- `/admin/login`
- `/admin`
- `/admin/banners`
- `/admin/events`
- `/admin/departments`
- `/admin/leaders`

- [ ] **Step 6: Commit**

```bash
git add README.md .env.example
git commit -m "docs: add Supabase admin setup guide"
```

---

## Self-Review

- Spec coverage: the plan covers Supabase schema, RLS, Storage, manual admin users, upload size and MIME constraints, public fallback behavior, admin auth, banner management, activity management, department management, leadership management, seed data, tests, and documentation.
- Placeholder scan: no task depends on unspecified "later" work; every interface names concrete files and functions.
- Type consistency: `ContentStatus`, `BannerSlide`, `EventItem`, `Department`, `Leader`, `UploadedImage`, and repository function names are defined before later tasks consume them.
