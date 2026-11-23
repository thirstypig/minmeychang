---
title: 'Giving an archive category its own page without breaking links or the editor'
date: 2026-11-23
category: ui-bugs
problem_type: content_restructure
component: src/data/archive.ts (categoryPages, alsoShownOn) / ArchivePage.astro / Archive.astro redirect
severity: medium
symptoms:
  - 'family asks for "a page for X" whose photos already live in an archive section'
  - 'old shared links (/archive#photo-id) would 404-in-place after the move'
  - 'a photo needs to appear on two pages'
root_cause: 'The first page (Calligraphy, #57) special-cased one category. Repeating that for School (#60) and Hsi Lai (#61) would have copied exclusion, recently-added filtering and redirect logic three times.'
---

# Archive category → its own page

## What works now

`categoryPages` in `src/data/archive.ts` maps a category to a route.
Everything else follows from that one line:

- `archivePageCategories` and `buildArchiveSections()` leave the category out of the archive.
- `recentlyAdded` filters it out, so a moved photo doesn't send readers to a page that no longer shows it.
- `Archive.astro` builds a JSON redirect map: every item id, the category id, and each `<category>-<decade>s` anchor. A tiny inline script reads it through `document.currentScript` and calls `location.replace(page + '#' + id)`. That keeps old shared links working, which matters because family share these over LINE and text.

`ArchivePage.astro` renders any such page: the fact ids as an intro, each item large with its own share button, optional decade grouping, and decade ids that match the old anchors.

## Two traps

1. **Don't add per-entry fields for page placement.** The local admin editor (`scripts/admin/archive-io.mjs`) writes back only `EDITABLE_KEYS`, so an extra field would be dropped silently on the next caption fix. Second appearances live in the side table `alsoShownOn`, and `itemsForPage()` throws on an unknown id.
2. **Keep the category in `archiveCategoryOrder`.** The editor's category dropdown reads from it. Exclusion from the archive happens through `archivePageCategories`, not by deleting the category.

## Verify

- `share-check.js`: redirects in both locales, including a fresh navigation from `about:blank`, because a same-document hash change doesn't re-run the script.
- `page-overflow-check.js`: new pages at 320–1440px and up to 1.6× text.
- Admin round-trip: GET `/api/archive`, POST it back to `/api/save`, then `cmp` against the file. It must be byte-identical.
