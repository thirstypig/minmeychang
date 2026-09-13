---
title: 'A correct favicon that nobody could see — one browser-cache bug and one missing-icon bug, both reading as "the favicon is broken"'
date: 2026-08-24
category: ui-bugs
problem_type: stale_client_cache_and_missing_platform_asset
component: favicon / apple-touch-icon / web-manifest / astro-layout
severity: medium
symptoms:
  - 'the browser tab shows the old favicon after a deploy that changed it, even after a hard reload'
  - 'curl, response headers, and a same-tab fetch(..., {cache:"no-store"}) all show the new file being served correctly'
  - 'the icon a reader reports seeing is not even the current-minus-one version — it is the very first placeholder, from before any of the recent swaps'
  - '"Add to Home Screen" on a phone shows a screenshot of the page instead of any icon at all, even though the tab favicon is correct'
stack:
  - Astro 7
  - sharp / libvips
  - GitHub Pages
  - Chrome (desktop favicon cache)
  - iOS Safari / Android Chrome (Add to Home Screen)
time_to_diagnose: '~15 minutes for the cache bug once server-vs-client was suspected; ~5 minutes for the missing-icon bug once asked directly, because the fix was already known (apple-touch-icon + manifest), just not yet applied to this repo'
recurrence_risk: 'high for the caching half — every future favicon swap re-triggers it unless the fix stays in place; low for the missing-icon half now that both assets exist, but a strong pattern for any new personal site started from scratch'
tags:
  - favicon
  - browser-cache
  - apple-touch-icon
  - web-manifest
  - add-to-home-screen
  - cache-busting
  - astro
  - client-vs-server
related:
  - ./../build-errors/verification-that-verifies-nothing.md
---

# A correct favicon that nobody could see

## The pattern

Two separate bugs produced the same user report — "I don't see the new favicon"
— and they needed opposite kinds of proof to tell apart:

1. **The server was right; the browser was wrong.** Chrome caches favicons
   separately from the rest of the page, keyed by URL, and can hold onto one
   for a very long time regardless of `Cache-Control` or a normal reload. The
   reader was looking at the *very first* typeset placeholder — from before
   any of the actual chop-scan swaps — not a one-version-stale copy.
2. **The server was also wrong, in a way curl couldn't see.** `<link
   rel="icon">` is not what iOS or Android read for "Add to Home Screen" at
   all. Without an `apple-touch-icon` link and a web manifest, both platforms
   silently fall back to a screenshot of the page. There was nothing stale to
   bust — the correct asset had simply never existed.

The unifying lesson: **"the favicon looks wrong" has at least two unrelated
root causes that require different verification, and neither is provable by
looking at the file in a code editor.**

---

## Bug 1: the desktop tab favicon

### Symptom

After merging a PR that replaced `favicon.png` with a photograph of an actual
1-character 印泥 chop (red seal, better border margin than the version
before), a reader reported still seeing the old one — in a tab that had
already been reloaded.

### Investigation

The instinct is to assume the deploy didn't land. It had:

```bash
curl -sI https://minmeychang.com/favicon.png
# etag, content-length, last-modified all matched the new file exactly
```

That ruled out "server serves the old file." It did not rule out "browser
shows the old file," because HTTP headers describe what the *server* sent on
*this* request, not what the *browser is currently displaying in the tab
chrome*. The next check had to happen inside the browser that was actually
showing the bug, not from a terminal:

```js
// executed in the page, not curl — the point is to bypass any browser cache
const res = await fetch('/favicon.png', { cache: 'no-store' })
const buf = await res.arrayBuffer()
// size matched the new file exactly, even with cache forcibly bypassed
```

At that point the HTTP layer was proven correct twice over. The only thing
left un-eliminated was Chrome's dedicated favicon cache, which is documented
to ignore `Cache-Control`, survive a page reload, and sometimes survive
clearing the ordinary HTTP cache — because it isn't keyed the way ordinary
resources are.

### Root cause

Chrome (and to varying degrees other browsers) maintain a favicon cache that
is independent of the page's HTTP cache. A reload re-fetches the HTML and even
the `<link rel="icon">` tag, but not necessarily the icon bitmap it points to,
if the browser believes it already has "the" favicon for that origin.

### The fix

The one thing that reliably invalidates a favicon cache is changing the URL.
Rather than relying on someone remembering to rename the file (or append a
manual `?v=` bump) on every future swap, the version string is now derived
from the file's own content at build time:

```js
// src/layouts/Base.astro (frontmatter)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

// process.cwd(), not import.meta.url — Astro relocates this file into
// dist/.prerender/chunks at build time, so a path relative to the source
// file's own location stops resolving once bundled.
const faviconHash = createHash('md5')
  .update(readFileSync(join(process.cwd(), 'public/favicon.png')))
  .digest('hex')
  .slice(0, 8)
```

```html
<link rel="icon" href={`/favicon.png?v=${faviconHash}`} type="image/png" />
```

Any future edit to `favicon.png` changes the hash, which changes the URL,
which is guaranteed to be a cache miss everywhere — no manual step, no way to
forget it.

### Verification that actually verifies

A green CI build proves the file compiled in. It does not prove a human sees
it. The check that closed this out was rendering the *fetched bytes* on
screen inside the reporting browser, not just comparing file sizes:

```js
const res = await fetch('/favicon.png', { cache: 'no-store' })
const url = URL.createObjectURL(await res.blob())
const img = document.createElement('img')
img.src = url
document.body.appendChild(img) // then screenshot it
```

This is the same shape as the lesson in
[verification-that-verifies-nothing.md](./../build-errors/verification-that-verifies-nothing.md):
a check can prove a *property* ("the server returns 200 and the right byte
count") without proving the *point* ("the person asking can see the new
icon"). `curl` and a same-tab `no-store` fetch are not the same test, and
only one of them is capable of exposing a client-side cache bug at all.

---

## Bug 2: the mobile "Add to Home Screen" icon

### Symptom

Independent of the above, saving the site to a phone's home screen showed no
chop mark — just a generic screenshot-derived tile.

### Root cause

`<link rel="icon">` only controls the browser tab / bookmark icon. Home
screen icons are a completely separate contract:

- **iOS Safari** reads `<link rel="apple-touch-icon">` — full-bleed, opaque
  (no alpha channel), because iOS applies its own rounded-corner mask on top.
- **Android Chrome** reads `icons` from a linked web app manifest
  (`<link rel="manifest">`).

This repo had neither. There was nothing cached or stale — the correct asset
had simply never been generated or linked, so both platforms fell back to
their own default (a screenshot).

### The fix

Generate purpose-built icons at the sizes each platform expects, reusing the
same source scan and margin logic as the favicon so the home screen icon
reads as the same mark:

```js
// scripts/build-touch-icons.mjs
const TARGETS = [
  { out: 'public/apple-touch-icon.png', size: 180 },
  { out: 'public/icon-192.png', size: 192 },
  { out: 'public/icon-512.png', size: 512 },
]
// same crop + 18%-margin treatment as build-favicon.mjs, per target size
```

```json
// public/manifest.webmanifest
{
  "name": "張馬敏妹",
  "short_name": "張馬敏妹",
  "start_url": "/",
  "display": "browser",
  "background_color": "#ffffff",
  "theme_color": "#b02a1f",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```html
<link rel="apple-touch-icon" href={`/apple-touch-icon.png?v=${appleTouchIconHash}`} />
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#b02a1f" />
```

`display: "browser"`, deliberately, not `"standalone"` — the ask was a
correct icon, not turning the site into a full installable app experience
that hides the address bar. Widening scope to "let's make it a PWA" would
have been solving a problem nobody reported.

`apple-touch-icon` gets the same content-hash query string as `favicon.png`,
because iOS caches touch icons exactly as stubbornly — this half of the fix
was applied preemptively, from the lesson learned in Bug 1, rather than
waiting for a second stale-icon report.

---

## Prevention

- **When a "the icon looks wrong" report survives a hard reload, suspect the
  browser's icon cache before the deploy.** Verify server-side (`curl -I`,
  compare etag/content-length) *and* client-side (`fetch(..., {cache:
  "no-store"})` executed inside the reporting browser, not a terminal) as two
  separate checks — they rule out different failure classes, and passing one
  says nothing about the other.
- **A favicon/touch-icon URL should always be content-versioned, not just
  named.** Do this once, in the layout, and every future swap is
  automatically cache-safe — see the `faviconHash`/`appleTouchIconHash`
  pattern above. Retrofitting this after the second stale-icon complaint is
  the expensive way to learn it.
- **"Favicon" and "home screen icon" are different platform contracts with
  different files, different sizes, and different caching behavior.** A new
  personal/static site should ship `favicon.png` (or `.ico`), an
  `apple-touch-icon`, and a manifest with `icon-192`/`icon-512` from day one,
  not as a follow-up once someone notices Add to Home Screen looks wrong.
- **A build that emits the right bytes is not the same claim as a person
  seeing the right bytes.** For anything with a known aggressive client-side
  cache (favicons, touch icons, service workers), the verification step has
  to run inside a real client, not just against the server.
