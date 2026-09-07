# Event Detail And Admin Content Design

## Goal

Build event detail pages for AFC activities and improve the event admin workflow so admins can write richer content, manage month/year metadata, preview drafts, and control image ordering.

## Public Event Detail Experience

The public route is `/hoat-dong/:slug`. It uses the same site header and footer as the existing public pages.

The detail page layout is:

1. Event title at the top as the strongest visual element.
2. Metadata row under the title: `Tháng {month}, {year}`, category label, and event label.
3. Large image slider directly under the metadata, visually close to the home hero image controls.
4. Summary block under the slider.
5. Rich event content under the summary.
6. Gallery thumbnails under the content when the event has more than one image.
7. Back link to `/hoat-dong`.

The slider uses `event.images`. The first image is the cover. Visitors can go previous/next, see `1 / N`, and use thumbnails to jump. If the event has one image, the controls are hidden.

If no event matches the slug, the page displays a calm not-found state with a link back to `/hoat-dong`.

## Data Model

The existing `EventItem` type gains:

- `month: string`
- `content: string`

Static event data uses Vietnamese month numbers as strings without leading zero, such as `'8'`. The UI formats this as `Tháng 8, 2026`.

Supabase `events` gains a `month text not null default ''` column. `content` already exists in the current migration and remains the long detail body.

Public event reads continue to fallback to static data when Supabase is unavailable.

## Admin Event Management

The existing admin event page remains the main editing surface. It gains:

- Month input next to year.
- Long-form content textarea.
- Preview button for each event.
- Image alt text editing.
- Move image left/right controls.
- Set cover button that moves an image to the first position.
- Image count in the event table.

Draft, published, hidden, and archived behavior stays based on the existing `status` field.

Preview uses `/admin/events/:slug/preview`. It is protected by the existing `AdminGuard`, and it may show draft or hidden events because it reads through admin APIs, not public APIs.

## Styling

The event detail page should feel like an editorial article, not a landing page. Use the existing dark AFC visual language for the title/slider section, then a readable content section below. Cards keep the existing 8px-or-less radius style.

The image slider should be responsive:

- Desktop: wide image area, controls overlay bottom right, thumbnails below.
- Mobile: image keeps a stable `16 / 10` or `4 / 3` ratio, controls remain tappable, text never overlaps controls.

## Testing

Tests should cover:

- Public route renders detail page for a known static event.
- Missing slug shows not-found state.
- Slider moves through event images and hides controls for one image.
- Event cards link to their detail pages while gallery arrow buttons still work.
- Supabase mapping includes `month` and `content`.
- Admin form loads/saves month and content.
- Admin image controls reorder images and set a cover.
- Preview route is protected and renders draft event data through admin APIs.
