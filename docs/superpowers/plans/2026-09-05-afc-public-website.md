# AFC Public Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive three-route AFC introduction website ready for Vercel deployment.

**Architecture:** A static React + Vite application uses React Router for client-side routes, typed local data modules for editable club content, and shared presentational components for navigation, contact, statistics, departments, and event cards. Supplied photographs live under `public/images` and no backend is introduced.

**Tech Stack:** React, TypeScript, Vite, React Router, Lucide React, Vitest, Testing Library, CSS.

**Spec:** `docs/superpowers/specs/2026-09-05-afc-public-website-design.md`

## Global Constraints

- Routes are exactly `/`, `/co-cau`, and `/hoat-dong`.
- Contact information appears only in the shared footer.
- No slogan, recruitment form, backend, or standalone recruitment route.
- Use supplied AFC logo and event photography; BĐH portraits remain fixed placeholders.
- Public statistics are `7+`, `60+`, and `40+`.
- Production output must be compatible with Vercel static hosting and SPA refreshes.

---

### Task 1: Project Foundation And Asset Pipeline

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`
- Create: `src/test/setup.ts`
- Create: `public/images/logo/*`, `public/images/events/*`

**Interfaces:**
- Produces: Vite scripts `dev`, `build`, `test`, and `test:run`; static asset paths rooted at `/images`.

- [ ] Create the React/Vite/TypeScript package configuration and test environment.
- [ ] Install React, React Router, Lucide React, Vite, TypeScript, Vitest, jsdom, and Testing Library.
- [ ] Copy and normalize the supplied logo and event image filenames into `public/images`.
- [ ] Run `npm.cmd run test:run` and confirm the harness starts even though feature imports are still absent.

### Task 2: Typed Content Model And Shared Shell

**Files:**
- Test: `src/data/events.test.ts`, `src/App.test.tsx`
- Create: `src/data/siteInfo.ts`, `src/data/departments.ts`, `src/data/leadership.ts`, `src/data/events.ts`
- Create: `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, `src/components/SectionHeading.tsx`
- Create: `src/App.tsx`, `src/main.tsx`

**Interfaces:**
- Produces: `EventItem`, `EventCategory`, `events`, `departments`, `leadership`, `siteInfo`; shared layout wrapped around router pages.

- [ ] Write a failing data test asserting unique event IDs and at least one image per event.
- [ ] Write a failing app test asserting the three navigation destinations and footer contact links.
- [ ] Run `npm.cmd run test:run` and confirm failures are caused by missing production modules.
- [ ] Implement typed data modules with the approved AFC content and 15 events.
- [ ] Implement the shared header/footer/router shell and minimal route placeholders.
- [ ] Run `npm.cmd run test:run` and confirm the new tests pass.

### Task 3: Home Route

**Files:**
- Test: `src/pages/HomePage.test.tsx`
- Create: `src/pages/HomePage.tsx`
- Create: `src/components/StatStrip.tsx`, `src/components/DepartmentPreview.tsx`, `src/components/EventCard.tsx`

**Interfaces:**
- Consumes: `siteInfo`, `departments`, `events`.
- Produces: route component `HomePage` with hero, introduction, statistics, department preview, and selected activities.

- [ ] Write a failing page test for the official name, all three statistics, and links to organization and activities.
- [ ] Run the focused test and confirm it fails because `HomePage` is absent.
- [ ] Implement the complete home route with the two approved hero images and accessible links.
- [ ] Run the focused test and then the full suite.

### Task 4: Organization Route

**Files:**
- Test: `src/pages/StructurePage.test.tsx`
- Create: `src/pages/StructurePage.tsx`, `src/components/LeaderPlaceholder.tsx`

**Interfaces:**
- Consumes: `departments`, `leadership`.
- Produces: route component `StructurePage` with Ban Chủ nhiệm, four departments, and Gen 9 directory.

- [ ] Write a failing page test for four department headings, the three Ban Chủ nhiệm names, and a leader placeholder.
- [ ] Run the focused test and confirm the expected missing-module failure.
- [ ] Implement the structure route and fixed-aspect portrait placeholders.
- [ ] Run the focused test and then the full suite.

### Task 5: Activity Archive And Filters

**Files:**
- Test: `src/pages/ActivitiesPage.test.tsx`
- Create: `src/pages/ActivitiesPage.tsx`
- Modify: `src/components/EventCard.tsx`

**Interfaces:**
- Consumes: `events`, `EventCategory`.
- Produces: route component `ActivitiesPage`; category filter state that changes the visible event cards.

- [ ] Write a failing interaction test that switches to the internal category and excludes an academic event.
- [ ] Run the focused test and confirm it fails for the missing page behavior.
- [ ] Implement accessible category filters and the responsive event archive.
- [ ] Run the focused test and then the full suite.

### Task 6: Brand Styling, Accessibility, And Vercel Delivery

**Files:**
- Create: `src/styles/global.css`, `vercel.json`, `.gitignore`, `README.md`
- Modify: all route and shared components as required for responsive classes and metadata.

**Interfaces:**
- Produces: stable responsive layouts, keyboard-visible controls, reduced-motion handling, social/document metadata, and Vercel SPA rewrites.

- [ ] Apply the approved tokens, typography, image ratios, responsive breakpoints, focus states, and restrained transitions.
- [ ] Add the Vercel rewrite and concise local/deployment documentation.
- [ ] Run `npm.cmd run test:run` and require zero failing tests.
- [ ] Run `npm.cmd run build` and require exit code 0.
- [ ] Start the development server, verify all three direct route URLs return successfully, and open the local preview.
- [ ] Inspect desktop and mobile layouts for image loading, overflow, menu behavior, active navigation, filter behavior, and keyboard focus.
