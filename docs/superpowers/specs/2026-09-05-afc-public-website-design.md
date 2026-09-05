# AFC Public Website Design

## Purpose

Build a public-facing introduction website for the Accounting & Finance Club (AFC) of the Posts and Telecommunications Institute of Technology. The site should help students, lecturers, partners, and alumni quickly understand what AFC is, how it is organized, and what it has done.

## Scope

- Three routes: Trang chủ, Cơ cấu CLB, and Hoạt động.
- Contact information appears in the shared footer, not as a separate route.
- No slogan and no recruitment form or recruitment-focused call to action in this release.
- The Gen 9 executive board is published now. Portrait areas remain neutral placeholders until photos are supplied.
- The activity archive includes the 15 confirmed public events and uses the supplied photos.
- The first deployment target is Vercel. The application remains a static React site with no backend.

## Audience And Primary Journey

The primary visitor is a PTIT student or external partner who has heard of AFC and wants a credible overview. The first viewport establishes the AFC identity through real event photography, the official name, and a short factual introduction. From there, visitors can scan headline numbers, enter the organization route, or browse the activity archive.

## Information Architecture

### Trang chủ

1. Full-width hero using PTIT Trading Challenge and Moneyverse photography.
2. Concise AFC introduction and origin story.
3. Three headline statistics: 7+ years, 60+ current members, and 40+ events/activities.
4. Preview of the four departments.
5. Preview of selected events with a route to the full activity archive.
6. Shared contact footer.

### Cơ cấu CLB

1. Short description of the operating model.
2. Ban Chủ nhiệm with three Gen 9 leaders.
3. Four department panels describing responsibilities.
4. Gen 9 leadership directory with fixed portrait placeholders.
5. Shared contact footer.

### Hoạt động

1. Compact editorial header.
2. Category filters for all, academic/professional, community/external, and internal activities.
3. Responsive event grid using one lead image per event and optional multi-image detail presentation where supplied.
4. Shared contact footer.

## Content Rules

- Official Vietnamese name: Câu lạc bộ Tài chính Kế toán PTIT.
- English name: AFC - Accounting & Finance Club.
- Former name: Câu lạc bộ Sinh viên Kế toán Học viện Công nghệ Bưu chính Viễn thông.
- Founded on 28/04/2019 and restructured/renamed on 19/08/2023.
- Parent unit: Khoa TCKT 1.
- Eligible participants: students of Khoa Tài chính Kế toán 1.
- Do not publish PTIT Financial Research Challenge, NextGen Accounting, or AIESEC as standalone event cards because their images are unavailable.
- Present the PTIT Edu Exchange continuous-ranking activity within the wider Edu Exchange/Trading Challenge program, not as a separate event.
- Normalize the supplied filename label “ACCA PROUND” to the public title “ACCA PROUD Community.”
- Do not publish an unverified date for The Moneyverse 2025.

## Visual System

The visual thesis is a contemporary annual report: precise editorial typography, strong image crops, structured dividers, and restrained motion. It should feel academic and credible without becoming corporate or sterile.

- Primary navy: `#282638`.
- Ink: `#171622`.
- White: `#FFFFFF`.
- Off-white: `#F7F7F4`.
- Cyan: `#64C7EE`.
- Pale cyan: `#B9E9FA`.
- Slate: `#4B4A5F`.
- Border gray: `#E6E8EE`.
- Display type: Be Vietnam Pro with system fallbacks.
- Body type: Inter with system fallbacks.
- Corners stay at 8px or below.
- Avoid gradients, decorative blobs, nested cards, and oversized marketing copy.
- Use supplied event photography as the dominant visual material.

## Interaction And Responsive Behavior

- Desktop navigation is horizontal and sticky.
- Mobile navigation uses an accessible menu button and collapsible panel.
- The active route is visibly marked and exposed through `aria-current`.
- Activity filters are real buttons with a clear selected state.
- Motion is subtle and disabled when `prefers-reduced-motion` is enabled.
- Fixed aspect ratios prevent images and placeholders from shifting layouts.
- All text and controls remain usable at mobile widths and at 200% text zoom.

## Data And Code Boundaries

- `src/data/siteInfo.ts` owns identity, statistics, contact details, and history.
- `src/data/departments.ts` owns the four department descriptions.
- `src/data/leadership.ts` owns Gen 9 leadership records.
- `src/data/events.ts` owns event metadata and image paths.
- Page components consume these typed data modules and contain no duplicate club facts.
- Shared header, footer, section heading, and event-card components keep route layouts consistent.

## Quality Bar

- Route-level tests cover navigation, core public content, filters, and the mobile menu.
- Data tests ensure event IDs are unique and every event has an image.
- Production build succeeds with no TypeScript errors.
- Final manual browser QA covers desktop and mobile widths, route refreshes, image rendering, menu behavior, keyboard navigation, and obvious overlap/overflow.

## Deployment

Vite builds to `dist`. `vercel.json` rewrites unknown paths to `index.html` so all three client-side routes can be refreshed directly. Initial publication may use the default `*.vercel.app` domain; a custom domain can be connected later without code changes.
