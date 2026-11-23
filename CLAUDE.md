# CLAUDE.md

## Status file

STATUS.md is read by Jimmy's claude.ai assistant as the source of truth. Whenever a change affects scope, stack, hosting, URLs, shipped features, open bugs, or next phases, update STATUS.md and its Last updated date in the SAME commit.

## Conventions and traps

- **Archive categories with their own page:** add one line to `categoryPages` in `src/data/archive.ts`. That removes the section from the archive, filters it out of "Recently added", and redirects old `/archive#…` links (items, the category id and `<category>-<decade>s` anchors). Pages render with `src/components/ArchivePage.astro` and `itemsForPage()`. Keep the category in `archiveCategoryOrder`, or the admin editor stops listing it.
- **One photo on two pages:** list the id in `alsoShownOn`. Never add a per-entry field for this, because the admin editor writes back only `EDITABLE_KEYS` (`scripts/admin/archive-io.mjs`), so the field would vanish on the next save.
- **Large text:** readers use enlarged text on 320–360px phones. After any layout change, run the gitignored `.playwright-mcp/page-overflow-check.js` (every page × 4 widths × 3 text sizes), plus `share-check.js` and `toprow-check.js`.
- **New Chinese characters** need `npm run fonts`, or they render as empty boxes. The font coverage test catches this.
- Run `npx vitest run` from the repo root, never with `--root /`. When reading results, grep `Test Files` as well as `Tests`, because an import-time failure only shows up in the first line.
- **Merging:** a bare `gh pr merge N --squash --delete-branch --admin`. Wait for CI on the PR's head SHA before you merge.
