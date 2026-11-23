---
title: 'Shared photo links previewed as the generic site card'
date: 2026-11-23
category: ui-bugs
problem_type: link_preview
component: src/data/photo-links.ts / src/components/PhotoForward.astro / share buttons
severity: medium
symptoms:
  - 'every "Share this photo" link shows the same site card in LINE, WhatsApp, iMessage, Facebook'
root_cause: 'The share link was /<page>#<id>. Link-preview fetchers drop the fragment, so they only ever saw the page, whose og:image is the site card.'
---

## Problem

The photo share buttons sent `/school#school-founding`. A browser jumps to the photo,
but a messaging app's preview fetcher requests `/school`, because fragments never
reach the server. It reads that page's `og:image`, which is `/og.png`. So all 144
photos previewed identically, and the preview picture is most of what a recipient
sees.

## Fix (#68)

- **One page per published item, per locale:** `/photo/<id>/` and `/zh-hant/photo/<id>/` (`src/pages/photo/[id].astro`). Each renders
  `PhotoForward.astro`, which carries:
  - `og:image`, set to the full photo with its real width and height;
  - title and caption.
- **Forwarding:** the page sends the visitor straight to `/<home page>#<id>` with a meta refresh, then
  `location.replace`, with a visible link as the last fallback.
- **The home page** is `categoryPages[category] ?? 'archive'`. Photos shown on a second page (`alsoShownOn`) go to their home page.
- **Kept out of search:** `noindex`, canonical set to the home page, and filtered out of the sitemap.
- **Trailing slash:** share links end in `/`, because GitHub Pages would otherwise add a 301 hop.

## Traps hit

- `photoSharePath(locale, '')` was first used as the viewer's base, and gave
  `/photo//` once the trailing slash was added. The viewer now uses
  `photoShareBase()`. A unit test pins base + id + `/` to `photoSharePath()`.
- The archive viewer changes photo without reloading, so its share link must be
  recomputed in `show()`. `share-check.js` asserts the link follows Next.
- Query strings don't help: GitHub Pages serves the same HTML for every query string.

## Limits

WeChat largely ignores Open Graph tags. WhatsApp may skip very large preview images:
7 of 144 photos are over 500 KB.
