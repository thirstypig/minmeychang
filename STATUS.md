# STATUS — minmeychang

**Last updated:** 2026-11-23

## One-line description
Static bilingual (English / Traditional Chinese) site honoring Min Mey Chang, an educator, community leader and cultural advocate in Arcadia, California, published by her family.

## Scope / positioning
- Nine pages per locale: home, story, timeline, service, talks, school, Hsi Lai, calligraphy, archive. English and Traditional Chinese at full parity.
- Chinese held to Taiwan usage (正體字, formal written register).
- Every fact must come from a family-provided source, never from memory; unconfirmed facts stay in a gitignored pending file.
- Archive: 144 entries in `archive.ts`. The archive page shows 112 (99 photos, 13 documents) in three categories, grouped by decade. The Arcadia Chinese School (19 items), Hsi Lai Temple & Buddha's Light (10 photos) and Calligraphy (3 photos) have their own pages instead.

## Stack & hosting
- Astro 7 + Tailwind v4, `@astrojs/sitemap` (en / zh-hant i18n); TypeScript; Vitest.
- Postbuild guards: `verify-css.mjs`, `verify-no-notes.mjs`. Asset scripts for fonts, thumbnails, icons, scans.
- Local archive editor (`npm run admin`); dev port 3170.
- GitHub Pages via `deploy.yml` (typecheck → test → build → deploy on push to `main`); `ci.yml` runs the same checks on pull requests.
- DNS at Squarespace, apex A records. Search indexing ON (`ALLOW_INDEXING: 'true'`).

## URLs
- https://minmeychang.com

## Shipped (last 60 days)
- **Hsi Lai Temple & Buddha's Light page (2026-11-23):** ninth page, /hsi-lai, 西來寺與國際佛光會. Intro: her Hsi Lai membership and volunteering (new, family tier), the BLIA Arcadia chapter she founded in 1994, and her Lunar New Year calligraphy. Then all 10 former archive Buddha's Light photos, grouped by decade. Old links redirect. Menu 3+3+3 on phones, 5+4 wider.
- **Arcadia Chinese School page (2026-11-23):** eighth page, "The Arcadia Chinese School" / 亞凱迪亞中文學校. Its intro is the school's eight existing facts as a list; below that are all 19 former archive items (12 photos, 7 clippings and letters), grouped by decade, each with its own share button. Old archive links (items, the section and its decades) redirect. Menu is 3+3+2 on phones, 4+4 wider.
- **No sideways scroll at large text (2026-11-22):** at the largest text size on 320–360px phones, the archive ("multigenerational") and service ("International") pages scrolled sideways. Long words now break or hyphenate, and the institution rows put the logo above the name when the column gets narrow. Checked on all 14 pages at 4 widths and 3 text sizes.
- **Calligraphy page and top share button (2026-11-22):** new seventh page, Calligraphy / 書法, with her yearly Lunar New Year volunteering at the Huntington Library, the LA County Arboretum and Hsi Lai Temple, and three photos moved from the archive (old archive links redirect). Share button moved from the footer to the top of every page; photo shares send her name and the caption ("Min Mey Chang: …" / 「張馬敏妹：…」).
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
- 2026-11-23: the archive's Buddha's Light section became the Hsi Lai Temple & Buddha's Light page (all 10 photos, James). "Temple Supporters" confirmed by James to mean BLIA's Arcadia chapter.
- 2026-11-23: the archive's Arcadia Chinese School section became its own page (all 19 items, James). Menu order: … talks, school, calligraphy, archive.
- 2026-11-22: share button moved from the footer to the top bar; a seventh page (Calligraphy) added; the menu is 3+3+1 on phones, 4+3 on wider screens.
- 2026-11-22: the two calligraphy *exhibition* photos stay in the archive — James: they are not from her calligraphy sessions.
- 2026-11-08: CI gates every pull request, not just the deploy.
- 2026-11-08: archive section bar changed from a hidden sideways scroll to wrapping buttons.
- 2026-11-08: the empty appointment-letter archive frame was dropped; the appointment is still stated, sourced to the board's roster.
- 2026-09-12: `PORTS.md` retired; `MASTER-PORTS.md` no longer published.
