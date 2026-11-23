# CLAUDE.md

## Status file

STATUS.md is read by Jimmy's claude.ai assistant as the source of truth. Whenever a change affects scope, stack, hosting, URLs, shipped features, open bugs, or next phases, update STATUS.md and its Last updated date in the SAME commit.

## Conventions and traps

- **Archive categories with their own page:** add one line to `categoryPages` in `src/data/archive.ts`. That removes the section from the archive, filters it out of "Recently added", and redirects old `/archive#…` links (items, the category id and `<category>-<decade>s` anchors). Pages render with `src/components/ArchivePage.astro` and `itemsForPage()`. Keep the category in `archiveCategoryOrder`, or the admin editor stops listing it.
- **One photo on two pages:** list the id in `alsoShownOn`. Never add a per-entry field for this, because the admin editor writes back only `EDITABLE_KEYS` (`scripts/admin/archive-io.mjs`), so the field would vanish on the next save.
- **Large text:** readers use enlarged text on 320–360px phones. After any layout change, run the gitignored `.playwright-mcp/page-overflow-check.js` (every page × 4 widths × 3 text sizes), plus `share-check.js` and `toprow-check.js`. The phone menu (`.nav-grid`) and header controls (`.control-button`) are capped at 16px text on purpose, so they stay 3 columns and fit at 1.6×. Sizing them in rem lets them grow with `--type-scale` and overflow at 320–360px.
- **CSS cascade:** `src/styles/global.css` is unlayered, so it beats Tailwind v4's utilities (which live in a layer) whatever the specificity. A Tailwind class on an element `global.css` also styles, such as `justify-end` on a `.page-nav-button`, silently loses; put that rule in `global.css`. A modifier class such as `.share-button--quiet` has the same specificity as its base rule, so it must come after the base rule and after the base rule's `:hover`.
- **Sharing a photo:** share buttons send `/photo/<id>/`, built by `photoSharePath()` in `src/data/photo-links.ts`, never `/<page>#<id>`. Messaging apps drop the `#…` part, so every preview would fall back to the generic site card. Those pages forward to the photo and stay noindex and out of the sitemap.
- **Facts and sources:** a `confirmed` fact's `source` must lead with a document. The press test fails any confirmed source that attributes the claim to a family member ("confirmed by … (son)"); that is the `family` tier. Facts may differ from the family's first account when the family adopts a document instead (as in #70): record the old wording and why in `note`.
- **New Chinese characters** need `npm run fonts`, or they render as empty boxes. The font coverage test catches this.
- Run `npx vitest run` from the repo root, never with `--root /`. When reading results, grep `Test Files` as well as `Tests`, because an import-time failure only shows up in the first line.
- **Merging:** a bare `gh pr merge N --squash --delete-branch --admin`. Wait for CI on the PR's head SHA before you merge.
