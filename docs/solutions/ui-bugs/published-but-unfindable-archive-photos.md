---
title: 'Published but unfindable — five new photos that were live, correct, and effectively invisible'
date: 2026-09-29
category: ui-bugs
problem_type: content_undiscoverable_by_layout
component: archive page / Archive.astro / image loading
severity: medium
symptoms:
  - '"I am on minmeychang.com and I do not see the new photos", the morning after a verified deploy'
  - 'curl shows all five images in the served HTML, each returning 200'
  - 'the homepage has no reference to them at all'
  - 'scrolling straight to a photo lands on the wrong section, and the target keeps moving while the page loads'
root_cause: 'The page ordered sections by a fixed category order, oldest first within each, so the newest photos landed near the bottom. Images had no dimensions, so the layout reflowed as lazy images arrived, and nothing linked to new material.'
---

# Published but unfindable

## The pattern

A deploy can be verified four ways and still leave the reader unable to find
what was added. On 2026-09-28 five gala photos (PR #38) were checked in the
built HTML, in the live HTML, as 200 responses from GitHub Pages' own servers,
and against the committed byte counts. All four checks passed. The next
morning the family's first report was that the photos were not there.

They were there. Every check had asked **"is it served?"** None asked **"can a
reader get to it?"**

## What was measured

In a real browser against the live site:

| Measure | Value |
|---|---|
| Position of the first gala photo | image **96 of 143** |
| Page height | ~**25,900 px** |
| Gala photos' distance down the page | ~**85%** |
| Drift of the medal photo while images loaded | ~**1,200 px** (21,497 → 22,664) |
| Grid download, all photos at 1600 px | ~**32 MB** |

Three causes, each sufficient on its own to hide the photos:

1. **Order.** `buildArchiveSections()` renders a fixed category order (Family
   first) with decades oldest-first. That is right for browsing a life, and it
   guarantees that the newest additions land near the bottom. The newest
   additions are usually the ones people come looking for.
2. **Reflow.** No `<img>` had `width`/`height`. Each lazy image arriving
   pushed everything below it down, so even `scrollIntoView` on the target
   element landed on Chinese School clippings three screens above it.
3. **No path in.** No homepage entry, timeline row or fact linked to the
   archive photos, and there was no per-photo URL to share.

## Should the behavior exist?

The oldest-first order is not the bug and was kept. It is the right order for
an archive of a life. The mistake was letting that one order serve two jobs,
*browse the whole life* and *show what's new*. They need different
entry points. So the fix adds a second entry point and leaves the order alone.

## The fix (PR #40)

- **A Recently added row** comes first, driven by an optional `added` ISO date
  on each entry. "Recent" is measured from the **newest `added` date in the
  data**, not from the build date. Otherwise the row would silently empty itself
  on some later deploy just because time passed.
- **Explicit dimensions** on every image, read with `sharp` from the files at
  build time so they cannot go stale. After the fix the medal photo moves
  **0 px** while the page loads.
- **A per-photo URL**, `/archive/#<entry id>`, which opens the lightbox on load.
  This is the link to text someone.
- **A sticky section bar** with counts, and decade links under each section.
- **480 px thumbnails** for the grid (`npm run thumbs`, also run by
  `npm run photos`): 32 MB becomes **5.2 MB**. The page is ~35% shorter, not
  the 4× first estimated, because the titles under each thumbnail take room.

## Verification that verified something

- Each new guard was broken on purpose and watched fail: deleting a thumbnail
  (2 tests fail), swapping in a re-cropped thumbnail (1 fails), and removing the
  placeholder filter from `recentlyAdded` (1 fails).
- The lightbox was driven with **real key presses**, not synthetic events.
  Synthetic `keydown` events on the dialog had passed while a real reader
  arriving from a shared link could not use the arrow keys: focus sat on
  `<body>`, and a listener on the dialog never heard them. The listener moved
  to `document`.
- The browser checks also found three things no test would: Tailwind's
  preflight zeroes the margin that centers a `<dialog>`; `autofocus` on the
  dialog did not reliably stop the browser from ringing the ✕ button; and at
  390 px the ‹ button sat on top of the "98 / 143" count.
- One trap in the checking itself: changing only the `#hash` does not reload
  the page, so the first screenshot after a CSS fix showed the old CSS and the
  previously open photo.

## Prevention

- **A deploy check for new content must include a reader path.** From the
  page someone would actually start on, how many actions until they see it?
  "Served with a 200" is not that check.
- **Give every image dimensions.** Without them, any in-page link to that image
  is unreliable, because the target moves while the page loads.
- **When one ordering has to serve both "browse everything" and "what's new",
  add an entry point rather than reordering.**

## Related

- [`../verification-issues/batched-image-reads-misattribute-content.md`](../verification-issues/batched-image-reads-misattribute-content.md):
  look at each image on its own.
- [`favicon-cache-and-missing-home-screen-icons.md`](favicon-cache-and-missing-home-screen-icons.md):
  the other time a correct deploy read to its reader as "broken".
