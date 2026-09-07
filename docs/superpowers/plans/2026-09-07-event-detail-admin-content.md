# Event Detail And Admin Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add event detail pages with top title, month metadata, hero-style image slider, and a fuller admin workflow for content, preview, and image management.

**Architecture:** Extend the existing event model instead of creating a second content system. Public pages use `EventItem` plus `getPublicEvents()` fallback behavior, while admin pages use Supabase rows and existing `adminContent` APIs. The image slider is a reusable presentational component shared by public detail and admin preview.

**Tech Stack:** React 19, React Router 7, TypeScript, Vite, Vitest, Testing Library, Supabase.

**Spec:** `docs/superpowers/specs/2026-09-07-event-detail-admin-design.md`

## Global Constraints

- Public event detail route is `/hoat-dong/:slug`.
- Admin preview route is `/admin/events/:slug/preview`.
- Event detail title appears at the top, before the image slider.
- Event detail metadata displays month and year as `Tháng {month}, {year}`.
- Image slider sits directly under title metadata and uses `event.images`.
- The first image is the cover image.
- Public data falls back to `src/data/events.ts` when Supabase is unavailable.
- Draft preview reads admin data and stays behind `AdminGuard`.
- Existing `status` semantics remain: `draft`, `published`, `hidden`, `archived`.
- No new UI framework dependency.

---

## File Structure

- Create `src/components/EventImageSlider.tsx`: reusable event image slider with previous/next controls, count, optional thumbnails, and stable responsive markup.
- Create `src/components/EventImageSlider.test.tsx`: slider behavior tests.
- Create `src/pages/EventDetailPage.tsx`: public detail route that loads event by slug and renders title, metadata, slider, summary, content, thumbnails, and back link.
- Create `src/pages/EventDetailPage.test.tsx`: public detail tests.
- Create `src/pages/admin/EventPreviewPage.tsx`: admin-only preview route for draft/hidden/published events.
- Create `src/pages/admin/EventPreviewPage.test.tsx`: preview route tests.
- Modify `src/App.tsx`: add public and admin preview routes.
- Modify `src/data/events.ts`: add `month` and `content` to `EventItem` and static events.
- Modify `src/lib/supabase/types.ts`: add `month` to event row and insert types.
- Modify `src/lib/content/contentMapping.ts`: map `month` and `content` from Supabase rows.
- Modify `src/lib/content/publicContent.ts`: add `getPublicEventBySlug()`.
- Modify `src/lib/content/adminContent.ts`: add `getAdminEventBySlug()` and preserve month/content in event create/update payloads.
- Modify `src/pages/ActivitiesPage.tsx`: pass route-aware cards and preserve filter behavior.
- Modify `src/components/EventCard.tsx`: make cards link to detail pages without breaking inline gallery controls.
- Modify `src/pages/admin/EventAdminPage.tsx`: month/content inputs, preview links, image count, image alt editing, reorder, set cover.
- Modify `src/styles/global.css`: public event detail and slider styles.
- Modify `src/styles/admin.css`: admin event image management and preview styles.
- Create `supabase/migrations/202609070001_event_month_preview.sql`: add `month` column and index if useful.

---

### Task 1: Extend Event Types And Static Data

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/lib/supabase/types.ts`
- Modify: `src/lib/content/contentMapping.ts`
- Test: `src/lib/content/contentMapping.test.ts`

**Interfaces:**
- Produces: `EventItem.month: string`
- Produces: `EventItem.content: string`
- Produces: `SupabaseEventRow.month: string`
- Produces: `SupabaseEventInsert.month?: string`

- [ ] **Step 1: Write the failing mapping test**

Add this assertion to the existing event mapping test in `src/lib/content/contentMapping.test.ts` using a Supabase event fixture:

```ts
expect(mapped[0]).toMatchObject({
  id: 'sample-event',
  month: '8',
  year: '2026',
  content: 'Noi dung chi tiet cua su kien.',
})
```

The fixture row must include:

```ts
month: '8',
content: 'Noi dung chi tiet cua su kien.',
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/content/contentMapping.test.ts --run`

Expected: FAIL because `month` and `content` are not returned in `EventItem`.

- [ ] **Step 3: Update event types**

Change `EventItem` in `src/data/events.ts`:

```ts
export type EventItem = {
  id: string
  title: string
  month: string
  year: string
  category: EventCategory
  label: string
  summary: string
  content: string
  images: string[]
  featured?: boolean
}
```

Change `SupabaseEventRow` in `src/lib/supabase/types.ts`:

```ts
month: string
```

Add to `SupabaseEventInsert`:

```ts
month?: string
```

- [ ] **Step 4: Update mapper**

In `mapEventRowsToEventItems`, include:

```ts
month: event.month || '',
content: event.content || '',
```

- [ ] **Step 5: Update static event objects**

For every object in `src/data/events.ts`, add:

```ts
month: '8',
content: 'Noi dung chi tiet dang duoc AFC cap nhat cho hoat dong nay.',
```

Use reasonable month values based on the event title when obvious:

```ts
{ id: 'youth-camp-2026', month: '3', ... }
{ id: 'freshmen-welcome-2026', month: '9', ... }
{ id: 'money-day-2025', month: '10', ... }
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- src/lib/content/contentMapping.test.ts --run`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/events.ts src/lib/supabase/types.ts src/lib/content/contentMapping.ts src/lib/content/contentMapping.test.ts
git commit -m "feat: extend event content metadata"
```

---

### Task 2: Add Supabase Month Migration

**Files:**
- Create: `supabase/migrations/202609070001_event_month_preview.sql`
- Test: `npm run build`

**Interfaces:**
- Consumes: `SupabaseEventRow.month`
- Produces: database column `public.events.month text not null default ''`

- [ ] **Step 1: Create migration**

Create `supabase/migrations/202609070001_event_month_preview.sql`:

```sql
alter table public.events
add column if not exists month text not null default '';

create index if not exists events_slug_status_idx
on public.events (slug, status);
```

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/202609070001_event_month_preview.sql
git commit -m "feat: add event month metadata"
```

---

### Task 3: Build Reusable Event Image Slider

**Files:**
- Create: `src/components/EventImageSlider.tsx`
- Create: `src/components/EventImageSlider.test.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `images: string[]`
- Consumes: `title: string`
- Produces: `EventImageSlider({ images, title, showThumbnails = true })`

- [ ] **Step 1: Write failing slider tests**

Create `src/components/EventImageSlider.test.tsx`:

```ts
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventImageSlider } from './EventImageSlider'

describe('EventImageSlider', () => {
  it('shows the first image, count, and lets visitors move through images', async () => {
    const user = userEvent.setup()
    render(<EventImageSlider title="Sự kiện mẫu" images={['/one.jpg', '/two.jpg']} />)

    expect(screen.getByRole('img', { name: 'Sự kiện mẫu - ảnh 1' })).toHaveAttribute('src', '/one.jpg')
    expect(screen.getByText('1 / 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ảnh tiếp theo của Sự kiện mẫu' }))

    expect(screen.getByRole('img', { name: 'Sự kiện mẫu - ảnh 2' })).toHaveAttribute('src', '/two.jpg')
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('hides controls when there is only one image', () => {
    render(<EventImageSlider title="Một ảnh" images={['/only.jpg']} />)

    expect(screen.getByRole('img', { name: 'Một ảnh - ảnh 1' })).toHaveAttribute('src', '/only.jpg')
    expect(screen.queryByRole('button', { name: 'Ảnh tiếp theo của Một ảnh' })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/EventImageSlider.test.tsx --run`

Expected: FAIL because `EventImageSlider` does not exist.

- [ ] **Step 3: Implement component**

Create `src/components/EventImageSlider.tsx`:

```tsx
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type EventImageSliderProps = {
  images: string[]
  title: string
  showThumbnails?: boolean
}

export function EventImageSlider({ images, title, showThumbnails = true }: EventImageSliderProps) {
  const safeImages = images.length > 0 ? images : ['/images/events/biggame-2026-2.jpg']
  const [activeIndex, setActiveIndex] = useState(0)
  const hasGallery = safeImages.length > 1

  const showPreviousImage = () => {
    setActiveIndex((current) => (current - 1 + safeImages.length) % safeImages.length)
  }

  const showNextImage = () => {
    setActiveIndex((current) => (current + 1) % safeImages.length)
  }

  return (
    <div className="event-slider">
      <div className="event-slider__stage">
        <img src={safeImages[activeIndex]} alt={`${title} - ảnh ${activeIndex + 1}`} />
        {hasGallery ? (
          <div className="event-slider__controls" role="group" aria-label={`Điều khiển ảnh ${title}`}>
            <button type="button" aria-label={`Ảnh trước của ${title}`} onClick={showPreviousImage}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <span aria-live="polite">{activeIndex + 1} / {safeImages.length}</span>
            <button type="button" aria-label={`Ảnh tiếp theo của ${title}`} onClick={showNextImage}>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
      {showThumbnails && hasGallery ? (
        <div className="event-slider__thumbs" aria-label={`Chọn ảnh của ${title}`}>
          {safeImages.map((image, index) => (
            <button
              type="button"
              key={image}
              className={index === activeIndex ? 'event-slider__thumb event-slider__thumb--active' : 'event-slider__thumb'}
              aria-label={`Xem ảnh ${index + 1} của ${title}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 4: Add slider CSS**

Add to `src/styles/global.css`:

```css
.event-slider { display: grid; gap: 1rem; }
.event-slider__stage { position: relative; overflow: hidden; aspect-ratio: 16 / 9; border-radius: var(--radius-md); background: var(--ink); }
.event-slider__stage > img { width: 100%; height: 100%; object-fit: cover; }
.event-slider__controls { position: absolute; right: 1rem; bottom: 1rem; display: flex; align-items: center; gap: .35rem; padding: .25rem; border: 1px solid rgba(255,255,255,.16); border-radius: var(--radius-sm); background: rgba(23,22,34,.72); backdrop-filter: blur(10px); }
.event-slider__controls button { width: 36px; height: 36px; display: grid; place-items: center; padding: 0; border: 0; border-radius: var(--radius-sm); color: var(--white); background: transparent; }
.event-slider__controls button:hover { color: var(--ink); background: var(--cyan); }
.event-slider__controls svg { width: 18px; height: 18px; }
.event-slider__controls span { min-width: 52px; color: var(--white); text-align: center; font-size: .85rem; font-weight: 800; }
.event-slider__thumbs { display: grid; grid-template-columns: repeat(auto-fit, minmax(76px, 1fr)); gap: .6rem; }
.event-slider__thumb { overflow: hidden; aspect-ratio: 4 / 3; padding: 0; border: 2px solid transparent; border-radius: var(--radius-sm); background: var(--gray); cursor: pointer; }
.event-slider__thumb--active { border-color: var(--cyan); }
.event-slider__thumb img { width: 100%; height: 100%; object-fit: cover; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/components/EventImageSlider.test.tsx --run`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/EventImageSlider.tsx src/components/EventImageSlider.test.tsx src/styles/global.css
git commit -m "feat: add event image slider"
```

---

### Task 4: Add Public Event Detail Route

**Files:**
- Create: `src/pages/EventDetailPage.tsx`
- Create: `src/pages/EventDetailPage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/lib/content/publicContent.ts`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `EventImageSlider`
- Produces: `getPublicEventBySlug(slug: string, client?: SupabaseClient | null): Promise<EventItem | null>`
- Produces: route `/hoat-dong/:slug`

- [ ] **Step 1: Write failing public content test**

In `src/lib/content/publicContent.test.ts`, add:

```ts
it('returns a static event by slug when Supabase is unavailable', async () => {
  const event = await getPublicEventBySlug('trading-challenge-2026', null)

  expect(event).toMatchObject({
    id: 'trading-challenge-2026',
    title: 'Chung kết PTIT Trading Challenge',
  })
})
```

- [ ] **Step 2: Run public content test**

Run: `npm test -- src/lib/content/publicContent.test.ts --run`

Expected: FAIL because `getPublicEventBySlug` is not exported.

- [ ] **Step 3: Implement public lookup**

Add to `src/lib/content/publicContent.ts`:

```ts
export async function getPublicEventBySlug(
  slug: string,
  client?: SupabaseClient | null,
): Promise<EventItem | null> {
  const supabase = client ?? getSupabaseClient()
  const staticEvent = staticEvents.find((event) => event.id === slug) || null
  if (!supabase) return staticEvent

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_images(*)')
      .eq('status', 'published')
      .eq('slug', slug)
      .single()

    if (error || !data) return staticEvent

    return mapEventRowsToEventItems([data as SupabaseEventWithImages])[0] || staticEvent
  } catch {
    return staticEvent
  }
}
```

- [ ] **Step 4: Write failing page tests**

Create `src/pages/EventDetailPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EventDetailPage } from './EventDetailPage'

function renderDetail(slug: string) {
  render(
    <MemoryRouter initialEntries={[`/hoat-dong/${slug}`]}>
      <Routes>
        <Route path="/hoat-dong/:slug" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EventDetailPage', () => {
  it('renders the event title first, metadata, and image slider', async () => {
    renderDetail('trading-challenge-2026')

    expect(await screen.findByRole('heading', { level: 1, name: 'Chung kết PTIT Trading Challenge' })).toBeInTheDocument()
    expect(screen.getByText(/Tháng .*2026/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Chung kết PTIT Trading Challenge - ảnh 1/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quay lại Hoạt động' })).toHaveAttribute('href', '/hoat-dong')
  })

  it('shows a not-found state for an unknown event', async () => {
    renderDetail('khong-co-su-kien')

    expect(await screen.findByRole('heading', { level: 1, name: 'Không tìm thấy sự kiện' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quay lại Hoạt động' })).toHaveAttribute('href', '/hoat-dong')
  })
})
```

- [ ] **Step 5: Run page tests**

Run: `npm test -- src/pages/EventDetailPage.test.tsx --run`

Expected: FAIL because the page does not exist.

- [ ] **Step 6: Implement detail page**

Create `src/pages/EventDetailPage.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EventImageSlider } from '../components/EventImageSlider'
import type { EventItem } from '../data/events'
import { getPublicEventBySlug } from '../lib/content/publicContent'

function formatEventDate(event: EventItem) {
  return event.month ? `Tháng ${event.month}, ${event.year}` : event.year
}

export function EventDetailPage() {
  const { slug = '' } = useParams()
  const [event, setEvent] = useState<EventItem | null | undefined>(undefined)

  useEffect(() => {
    getPublicEventBySlug(slug).then(setEvent).catch(() => setEvent(null))
  }, [slug])

  if (event === undefined) {
    return <main id="main-content" className="event-detail"><p>Đang tải sự kiện...</p></main>
  }

  if (!event) {
    return (
      <main id="main-content" className="event-detail event-detail--empty">
        <h1>Không tìm thấy sự kiện</h1>
        <Link to="/hoat-dong" className="event-detail__back"><ArrowLeft aria-hidden="true" />Quay lại Hoạt động</Link>
      </main>
    )
  }

  return (
    <main id="main-content" className="event-detail">
      <article>
        <header className="event-detail__header">
          <h1>{event.title}</h1>
          <div className="event-detail__meta">
            <time>{formatEventDate(event)}</time>
            <span>{event.label}</span>
          </div>
          <EventImageSlider title={event.title} images={event.images} />
        </header>
        <section className="event-detail__body">
          <p className="event-detail__summary">{event.summary}</p>
          <div className="event-detail__content">
            {event.content.split('\n').filter(Boolean).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link to="/hoat-dong" className="event-detail__back"><ArrowLeft aria-hidden="true" />Quay lại Hoạt động</Link>
        </section>
      </article>
    </main>
  )
}
```

- [ ] **Step 7: Add route**

In `src/App.tsx`, import:

```ts
import { EventDetailPage } from './pages/EventDetailPage'
```

Add route after `/hoat-dong`:

```tsx
<Route
  path="/hoat-dong/:slug"
  element={
    <PublicLayout>
      <EventDetailPage />
    </PublicLayout>
  }
/>
```

- [ ] **Step 8: Add detail CSS**

Add to `src/styles/global.css`:

```css
.event-detail { padding: 7rem max(1.25rem, calc((100% - var(--content)) / 2)) var(--section-space); color: var(--ink); background: var(--paper); }
.event-detail article { display: grid; gap: 3rem; }
.event-detail__header { display: grid; gap: 1.5rem; }
.event-detail__header h1 { max-width: 980px; margin: 0; font-size: 4.2rem; line-height: 1.04; color: var(--ink); }
.event-detail__meta { display: flex; flex-wrap: wrap; gap: .75rem; color: var(--cyan-ink); font-weight: 800; }
.event-detail__meta span, .event-detail__meta time { padding: .45rem .7rem; border: 1px solid var(--gray); border-radius: var(--radius-sm); background: var(--white); }
.event-detail__body { max-width: 820px; display: grid; gap: 1.4rem; }
.event-detail__summary { margin: 0; color: var(--ink); font-size: 1.35rem; line-height: 1.6; font-weight: 600; }
.event-detail__content { display: grid; gap: 1rem; }
.event-detail__content p { margin: 0; color: var(--muted); font-size: 1.05rem; line-height: 1.85; }
.event-detail__back { display: inline-flex; align-items: center; gap: .45rem; width: fit-content; color: var(--cyan-ink); font-weight: 800; text-decoration: none; }
.event-detail__back svg { width: 18px; height: 18px; }
.event-detail--empty { min-height: 520px; display: grid; align-content: center; gap: 1.5rem; }

@media (max-width: 760px) {
  .event-detail { padding: 5rem 1rem; }
  .event-detail__header h1 { font-size: 2.4rem; }
  .event-detail__summary { font-size: 1.15rem; }
}
```

- [ ] **Step 9: Run tests**

Run:

```bash
npm test -- src/lib/content/publicContent.test.ts src/pages/EventDetailPage.test.tsx src/components/EventImageSlider.test.tsx --run
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/App.tsx src/pages/EventDetailPage.tsx src/pages/EventDetailPage.test.tsx src/lib/content/publicContent.ts src/lib/content/publicContent.test.ts src/styles/global.css
git commit -m "feat: add event detail pages"
```

---

### Task 5: Link Event Cards To Detail Pages

**Files:**
- Modify: `src/components/EventCard.tsx`
- Modify: `src/components/EventCard.test.tsx`
- Modify: `src/pages/ActivitiesPage.test.tsx`

**Interfaces:**
- Consumes: `EventItem.id` as route slug
- Produces: event title link to `/hoat-dong/${event.id}`

- [ ] **Step 1: Write failing card link test**

In `src/components/EventCard.test.tsx`, wrap render calls with `MemoryRouter` and add:

```tsx
expect(screen.getByRole('link', { name: /Xem chi tiết Sự kiện mẫu/ })).toHaveAttribute(
  'href',
  '/hoat-dong/sample-event',
)
```

- [ ] **Step 2: Run card test**

Run: `npm test -- src/components/EventCard.test.tsx --run`

Expected: FAIL because no detail link exists.

- [ ] **Step 3: Implement link**

In `src/components/EventCard.tsx`, import `Link`:

```ts
import { Link } from 'react-router-dom'
```

Wrap only the title in a link so gallery buttons do not sit inside a clickable parent:

```tsx
<h3>
  <Link to={`/hoat-dong/${event.id}`} aria-label={`Xem chi tiết ${event.title}`}>
    {event.title}
  </Link>
</h3>
```

- [ ] **Step 4: Add link CSS**

In `src/styles/global.css`, add:

```css
.event-card h3 a { color: inherit; text-decoration: none; }
.event-card h3 a:hover { color: var(--cyan-ink); }
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- src/components/EventCard.test.tsx src/pages/ActivitiesPage.test.tsx --run
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/EventCard.tsx src/components/EventCard.test.tsx src/pages/ActivitiesPage.test.tsx src/styles/global.css
git commit -m "feat: link events to detail pages"
```

---

### Task 6: Add Admin Month And Long Content Fields

**Files:**
- Modify: `src/pages/admin/EventAdminPage.tsx`
- Modify: `src/lib/content/adminContent.test.ts`
- Test: `src/lib/content/adminContent.test.ts`

**Interfaces:**
- Consumes: `SupabaseEventInsert.month`
- Produces: admin create/update payload with `month` and `content`

- [ ] **Step 1: Write failing admin content tests**

In `src/lib/content/adminContent.test.ts`, update the `createEvent` and `updateEvent` expectations to include:

```ts
month: '8',
content: 'Noi dung chi tiet cua su kien.',
```

- [ ] **Step 2: Run admin content tests**

Run: `npm test -- src/lib/content/adminContent.test.ts --run`

Expected: FAIL if current fixtures/types do not preserve `month`.

- [ ] **Step 3: Add form state**

In `EventAdminPage`, add:

```ts
const [month, setMonth] = useState('1')
const [content, setContent] = useState('')
const monthId = useId()
```

In create modal reset:

```ts
setMonth(String(new Date().getMonth() + 1))
setContent('')
```

In edit modal:

```ts
setMonth(evt.month || '1')
setContent(evt.content || '')
```

- [ ] **Step 4: Add inputs**

Place month next to year:

```tsx
<div className="admin-form-group">
  <label htmlFor={monthId} className="admin-label">Tháng tổ chức</label>
  <select id={monthId} value={month} onChange={(e) => setMonth(e.target.value)} className="admin-select">
    {Array.from({ length: 12 }, (_, index) => String(index + 1)).map((value) => (
      <option value={value} key={value}>Tháng {value}</option>
    ))}
  </select>
</div>
```

Add long content below summary:

```tsx
<div className="admin-form-group">
  <label className="admin-label">Nội dung chi tiết</label>
  <textarea
    rows={8}
    value={content}
    onChange={(e) => setContent(e.target.value)}
    className="admin-textarea"
    placeholder="Viết recap, mục tiêu, diễn biến chính và dấu ấn của sự kiện..."
  />
</div>
```

- [ ] **Step 5: Include fields in save payloads**

In both create and update payloads, add:

```ts
month,
content,
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- src/lib/content/adminContent.test.ts --run
npm test -- src/pages/admin/EventAdminPage.test.tsx --run
```

If `EventAdminPage.test.tsx` does not exist, create it only for the new visible month/content form behavior.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/EventAdminPage.tsx src/lib/content/adminContent.test.ts src/pages/admin/EventAdminPage.test.tsx
git commit -m "feat: add event month and detail content admin fields"
```

---

### Task 7: Improve Admin Image Management

**Files:**
- Modify: `src/pages/admin/EventAdminPage.tsx`
- Create or modify: `src/pages/admin/EventAdminPage.test.tsx`

**Interfaces:**
- Consumes: local `imageList`
- Produces: controls `moveImage(index, direction)`, `setCoverImage(index)`, and alt editing.

- [ ] **Step 1: Write failing admin image tests**

Create or extend `src/pages/admin/EventAdminPage.test.tsx` with behavior assertions:

```tsx
expect(screen.getByText('2 ảnh')).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Đặt ảnh 2 làm ảnh bìa' })).toBeInTheDocument()
expect(screen.getByRole('textbox', { name: 'Alt ảnh 1' })).toBeInTheDocument()
```

- [ ] **Step 2: Run test**

Run: `npm test -- src/pages/admin/EventAdminPage.test.tsx --run`

Expected: FAIL because controls do not exist.

- [ ] **Step 3: Add image helpers**

Inside `EventAdminPage`, add:

```ts
const moveImage = (index: number, direction: -1 | 1) => {
  setImageList((prev) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= prev.length) return prev
    const next = [...prev]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    return next
  })
}

const setCoverImage = (index: number) => {
  setImageList((prev) => {
    if (index <= 0) return prev
    const next = [...prev]
    const [selected] = next.splice(index, 1)
    return [selected, ...next]
  })
}

const updateImageAlt = (index: number, alt: string) => {
  setImageList((prev) => prev.map((img, idx) => (idx === index ? { ...img, alt } : img)))
}
```

- [ ] **Step 4: Add controls to each image item**

For each image card, include:

```tsx
<input
  aria-label={`Alt ảnh ${idx + 1}`}
  value={img.alt || ''}
  onChange={(e) => updateImageAlt(idx, e.target.value)}
  className="admin-input"
/>
<button type="button" onClick={() => setCoverImage(idx)} disabled={idx === 0}>
  Đặt làm ảnh bìa
</button>
<button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0}>
  Lên
</button>
<button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === imageList.length - 1}>
  Xuống
</button>
```

- [ ] **Step 5: Add image count to table**

In admin table, add a column:

```tsx
<th style={{ width: '90px' }}>Số ảnh</th>
```

And row cell:

```tsx
<td>{evt.event_images?.filter((img) => img.status === 'published').length || 0} ảnh</td>
```

- [ ] **Step 6: Run tests**

Run: `npm test -- src/pages/admin/EventAdminPage.test.tsx --run`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/EventAdminPage.tsx src/pages/admin/EventAdminPage.test.tsx
git commit -m "feat: improve event image administration"
```

---

### Task 8: Add Admin Event Preview Route

**Files:**
- Create: `src/pages/admin/EventPreviewPage.tsx`
- Create: `src/pages/admin/EventPreviewPage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/lib/content/adminContent.ts`
- Modify: `src/pages/admin/EventAdminPage.tsx`

**Interfaces:**
- Produces: `getAdminEventBySlug(client: SupabaseClient, slug: string): Promise<SupabaseEventWithImages | null>`
- Produces: route `/admin/events/:slug/preview`

- [ ] **Step 1: Write failing admin API test**

In `src/lib/content/adminContent.test.ts`, add:

```ts
it('loads an admin event by slug regardless of draft status', async () => {
  const client = createMockSupabaseClient({
    data: {
      id: 'event-id',
      slug: 'draft-event',
      title: 'Draft Event',
      month: '8',
      year: '2026',
      category: 'academic',
      label: 'Học thuật',
      summary: 'Summary',
      content: 'Draft content',
      featured_home: false,
      sort_order: 1,
      status: 'draft',
      published_at: null,
      created_at: '',
      updated_at: '',
      event_images: [],
    },
  })

  const event = await getAdminEventBySlug(client as any, 'draft-event')

  expect(event?.status).toBe('draft')
})
```

- [ ] **Step 2: Run admin API test**

Run: `npm test -- src/lib/content/adminContent.test.ts --run`

Expected: FAIL because `getAdminEventBySlug` does not exist.

- [ ] **Step 3: Implement admin lookup**

Add to `src/lib/content/adminContent.ts`:

```ts
export async function getAdminEventBySlug(
  client: SupabaseClient,
  slug: string,
): Promise<SupabaseEventWithImages | null> {
  const { data, error } = await client
    .from('events')
    .select('*, event_images(*)')
    .eq('slug', slug)
    .neq('status', 'archived')
    .single()

  if (error) throw error
  if (!data) return null

  const event = data as SupabaseEventWithImages
  return {
    ...event,
    event_images: (event.event_images || []).filter((img) => img.status !== 'archived'),
  }
}
```

- [ ] **Step 4: Create preview page**

Create `src/pages/admin/EventPreviewPage.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EventImageSlider } from '../../components/EventImageSlider'
import { mapEventRowsToEventItems } from '../../lib/content/contentMapping'
import { getAdminEventBySlug } from '../../lib/content/adminContent'
import { getSupabaseClient } from '../../lib/supabase/client'
import type { EventItem } from '../../data/events'

export function EventPreviewPage() {
  const { slug = '' } = useParams()
  const [event, setEvent] = useState<EventItem | null | undefined>(undefined)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setEvent(null)
      return
    }
    getAdminEventBySlug(supabase, slug)
      .then((row) => setEvent(row ? mapEventRowsToEventItems([row])[0] : null))
      .catch(() => setEvent(null))
  }, [slug])

  if (event === undefined) return <div className="admin-card">Đang tải bản xem trước...</div>
  if (!event) return <div className="admin-card">Không tìm thấy sự kiện để xem trước.</div>

  return (
    <div className="admin-card admin-preview">
      <Link to="/admin/events" className="admin-preview__back">Quay lại quản lý sự kiện</Link>
      <p className="admin-badge admin-badge--draft">Bản xem trước</p>
      <h2>{event.title}</h2>
      <p>{event.month ? `Tháng ${event.month}, ${event.year}` : event.year}</p>
      <EventImageSlider title={event.title} images={event.images} />
      <p>{event.summary}</p>
      {event.content.split('\n').filter(Boolean).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Add protected preview route**

In `src/App.tsx`, lazy import:

```ts
const EventPreviewPage = lazy(() =>
  import('./pages/admin/EventPreviewPage').then((m) => ({ default: m.EventPreviewPage })),
)
```

Inside the protected `/admin` route:

```tsx
<Route path="events/:slug/preview" element={<EventPreviewPage />} />
```

- [ ] **Step 6: Add preview link in event table**

In `EventAdminPage`, add a secondary button near edit:

```tsx
<Link
  to={`/admin/events/${evt.slug}/preview`}
  className="admin-btn admin-btn--secondary"
  title="Xem trước"
>
  <Eye size={14} />
</Link>
```

- [ ] **Step 7: Run tests**

Run:

```bash
npm test -- src/lib/content/adminContent.test.ts src/pages/admin/EventPreviewPage.test.tsx --run
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/pages/admin/EventPreviewPage.tsx src/pages/admin/EventPreviewPage.test.tsx src/lib/content/adminContent.ts src/lib/content/adminContent.test.ts src/pages/admin/EventAdminPage.tsx
git commit -m "feat: add admin event preview"
```

---

### Task 9: Final Verification And Polish

**Files:**
- Modify only files needed to fix failing tests or visual issues from prior tasks.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: shippable event detail and admin content workflow.

- [ ] **Step 1: Run full test suite**

Run:

```bash
npm test -- --run
```

Expected: all test files pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: TypeScript build and Vite build complete successfully.

- [ ] **Step 3: Manual browser QA**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Visit:

```text
http://127.0.0.1:5173/hoat-dong/trading-challenge-2026
http://127.0.0.1:5173/hoat-dong
http://127.0.0.1:5173/admin/events
```

Verify:

- Detail page title appears above slider.
- Metadata includes month and year.
- Slider next/previous controls work.
- Event cards link to detail pages.
- Admin event form includes month and content.
- Admin image controls can reorder images and set cover.
- Preview route works for draft events when authenticated.

- [ ] **Step 4: Commit polish fixes**

```bash
git add src docs supabase
git commit -m "chore: polish event detail admin workflow"
```

- [ ] **Step 5: Final status**

Report:

```text
npm test -- --run: PASS
npm run build: PASS
Manual QA: PASS or blocked with exact reason
```
