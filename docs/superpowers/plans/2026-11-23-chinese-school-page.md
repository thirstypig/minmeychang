# Arcadia Chinese School page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An eighth page, The Arcadia Chinese School, built on the Calligraphy pattern: the school's facts as an intro, then all 19 archive items (each large, with caption and share button) grouped by decade.

**Architecture:** Generalize "an archive category shown on its own page" from the single `calligraphy` case to a map, `categoryPages: Partial<Record<ArchiveCategory, RouteId>>`, in `src/data/archive.ts`. The archive excludes those categories, recently-added filters them out, and the redirect reads the map. `Calligraphy.astro` becomes `ArchivePage.astro` with props `items`, `factIds` and `groupByDecade`.

**Tech Stack:** Astro 7, Tailwind v4, TypeScript, Vitest; Playwright check scripts in `.playwright-mcp/`.

**Spec:** `docs/superpowers/specs/2026-11-23-chinese-school-page-design.md`

## Global Constraints

- Branch `feat/chinese-school-page`, then a PR, then `gh pr merge N --squash --delete-branch --admin` (bare call).
- STATUS.md changes in the same PR.
- No new facts. The intro fact ids, in this order: `chinese-school-founded`, `afternoon-classes`, `students-taught`, `ausd-relationship`, `i20`, `ausd-delegations`, `teachers-association`, `chinese-school-outcome`.
- Route `{ id: 'school', segment: '/school', labelKey: 'schoolHeading', navLabelKey: 'navSchool', descKey: 'descSchool' }`.
  - Headings: "The Arcadia Chinese School" / 「亞凱迪亞中文學校」.
  - Nav labels: "School" / 「中文學校」.
- Route order: home, story, timeline, service, talks, school, calligraphy, archive.
- Captions unchanged. Admin save stays byte-identical.

## Review Focus

1. **Old links:** `/archive#chinese-school`, `/archive#chinese-school-1990s` and `/archive#school-founding` each land on the school page at the matching place. Pinned in Task 3.
2. **The archive's section bar** no longer offers "The Arcadia Chinese School", and its counts add up. Pinned in Task 1 (data) and Task 3 (browser).
3. **Eight-button menu:** nothing clips, and there's no single-column collapse at 360px, 1.6x. Pinned in Task 2 (nav measurement).
4. **Tall newspaper documents** shown full width don't overflow at 1.6x. Pinned in Task 3 (page-overflow check).
5. **Calligraphy** behaves exactly as before after the refactor (share-check 37/37). Pinned in Task 3.

---

### Task 1: Data — category → page map

**Files:** `src/data/archive.ts`; tests `tests/data/chinese-school.test.ts` (new), `tests/data/calligraphy.test.ts`, `tests/data/archive-sections.test.ts`

**Produces:**
- `categoryPages = { calligraphy: 'calligraphy', 'chinese-school': 'school' }`
- `archivePageCategories` = `archiveCategoryOrder` minus the keys of `categoryPages`
- `itemsForCategory(c): ArchiveItem[]`
- `calligraphyItems` is kept

- [ ] Write the failing tests:
  - `itemsForCategory('chinese-school')` has 19 items; no `buildArchiveSections()` section is `chinese-school`.
  - `archivePageCategories` equals `['family','community','buddhist','travel']`.
  - `recentlyAdded` excludes school items even when they're newest.
  - Pages shown in the archive total 122 (122 = 144 − 3 − 19).
- [ ] Run them and confirm RED, then implement, then confirm GREEN with `npm test`.
- [ ] Admin round-trip: GET `/api/archive`, POST it back to `/api/save`, then `cmp` the file. Expect identical.
- [ ] Commit.

### Task 2: Shared page component, School page, eight-button menu

**Files:** `src/components/Calligraphy.astro` → `src/components/ArchivePage.astro`; `src/pages/{,zh-hant/}calligraphy.astro`; `src/pages/{,zh-hant/}school.astro` (new); `src/i18n/routes.ts`, `src/i18n/ui.ts`; `src/styles/global.css`; `tests/i18n/route-coverage.test.ts`

- [ ] Add the route, keys and the route-test filename mapping (`school: 'school.astro'`). Confirm RED: missing page files.
- [ ] Build `ArchivePage.astro` with props `{ locale, items, factIds: string[], groupByDecade?: boolean }`.
  - It renders the renderable facts as paragraphs.
  - Each item renders as Calligraphy does today (eager first image, `photoShareText`, aria-label).
  - With `groupByDecade`, add an `<h2 id="chinese-school-<decade>s">` decade heading. The id is built from the item's category, so old decade anchors land on it.
  - The page root carries `id="chinese-school"`, so `#chinese-school` lands at the top.
- [ ] Wire both page pairs, then confirm GREEN with `npm test`.
- [ ] Nav CSS: delete the `max-width: 39.99rem` last-child span rule and its comment, and update the `.nav-grid` comment to eight pages. Measure with the 48-combination nav script: no clipping; expect 3+3+2 on phones (2+2+2+2 enlarged) and 4+4 from 640px.
- [ ] Commit.

### Task 3: Redirect map; verification

**Files:** `src/components/Archive.astro`; `STATUS.md`; `README.md`

- [ ] Extend `.playwright-mcp/share-check.js` (RED first):
  - `/archive#school-founding` → `/school#school-founding`
  - `/archive#chinese-school-1990s` → `/school#chinese-school-1990s`
  - `/archive#chinese-school` → `/school#chinese-school`
  - all in both locales
- [ ] Redirect: build `data-moved` as a JSON map `{ id → path }` covering:
  - every item in `categoryPages` categories
  - each such category id, and every `<category>-<decade>s` id
  The inline script replaces to `map[id] + '#' + id`.
- [ ] Run share-check (all pass), `page-overflow-check.js` (all pass, now 8 pages × 2 locales) and `toprow-check.js`.
- [ ] README and STATUS: eight pages; the archive page shows 122 (count photos and documents from the data); 19 items on the School page.
- [ ] Commit, push, open the PR; merge after CI. Verify the live site.
