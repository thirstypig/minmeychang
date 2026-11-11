# STATUS — minmeychang

**Last updated:** 2026-11-11

## One-line description
Static bilingual (English / Traditional Chinese) site honoring Min Mey Chang, an educator, community leader and cultural advocate in Arcadia, California, published by her family.

## Scope / positioning
- Six pages per locale: home, story, timeline, service, talks, archive. English and Traditional Chinese at full parity.
- Chinese held to Taiwan usage (正體字, formal written register).
- Every fact must come from a family-provided source, never from memory; unconfirmed facts stay in a gitignored pending file.
- Archive: 144 entries (124 photos, 20 documents) in five categories, grouped by decade.

## Stack & hosting
- Astro 7 + Tailwind v4, `@astrojs/sitemap` (en / zh-hant i18n); TypeScript; Vitest.
- Postbuild guards: `verify-css.mjs`, `verify-no-notes.mjs`. Asset scripts for fonts, thumbnails, icons, scans.
- Local archive editor (`npm run admin`); dev port 3170.
- GitHub Pages via `deploy.yml` (typecheck → test → build → deploy on push to `main`); `ci.yml` runs the same checks on pull requests.
- DNS at Squarespace, apex A records. Search indexing ON (`ALLOW_INDEXING: 'true'`).

## URLs
- https://minmeychang.com

## Shipped (last 60 days)
- **Archive gallery (2026-09-29):** thumbnail gallery, `<dialog>` lightbox, per-photo links, "Recently added" row; more photos added.
- **Archive navigation (2026-11-08):** section bar now wrapping buttons instead of sideways scroll; floating "jump to section" and share button on phones.
- **Content:** her council and CAPTA presidencies and 1987–88 culture festivals (2026-09-12); 2026 Historymakers gala and joint lifetime achievement award (2026-09-28), plus two gala videos (2026-10-15); civic record corrected (2026-09-28); empty appointment-letter frame removed (2026-11-08).
- **Guards and CI (2026-11-08, todos 001–013):** tests run on every PR; build fails if a research note reaches the page; Chinese checked against all 3,805 simplified-only characters; doc links resolved the way GitHub does; spelling guard extended; an unverified board claim reworded as her own account; third-party names removed from a research doc.
- **Tooling:** archive editor keeps comments in `archive.ts` on save (2026-10-15).

## In progress
- None recorded. All 13 files in `todos/` are complete.

## Open bugs / known issues
- The Chinese copy has never been read end-to-end by a native speaker (README). It is the locale most of her community will read.
- Six questions still open in the gitignored pending-facts file: mostly years, plus one consent question.
- She is hard to find in web search; all sources came from the family (README warns not to read empty search results as a thin record).

## Next phases (in order)
- Unknown — not documented in repo. The open items above are the only recorded follow-ups.

## Decisions changed recently
- 2026-11-08: CI gates every pull request, not just the deploy.
- 2026-11-08: archive section bar changed from a hidden sideways scroll to wrapping buttons.
- 2026-11-08: the empty appointment-letter archive frame was dropped; the appointment is still stated, sourced to the board's roster.
- 2026-09-12: `PORTS.md` retired; `MASTER-PORTS.md` no longer published.
