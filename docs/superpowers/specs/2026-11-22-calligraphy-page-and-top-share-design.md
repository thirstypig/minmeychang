# Calligraphy page and top-of-page share — design

Date: 2026-11-22 · Size: small change (short design)

> **Changed during the build (James, 2026-11-22):** `calligraphy-exhibition` and
> `art-exhibition-with-friend` are exhibition photos, not her calligraphy
> sessions, so they stay in the archive. The page has three photographs; the
> archive page shows 141. On phones the menu is 3+3+1, not 4+3: "Calligraphy"
> does not fit a quarter-width button.

## Intent

Family and friends mostly read the site on phones and want to pass a page or a
photo to someone by text message or LINE. The share button exists (PR #47) but
sits at the bottom of every page, where few phone readers reach it. Separately,
her calligraphy (毛筆字) deserves its own page: she volunteers it at Lunar New
Year at the invitation of three local institutions and gives the pieces away.

## Goals

- One share button at the top of every page, in the utility row; footer button removed.
- A seventh page, Calligraphy / 書法, with short copy and five photos.
- Each photo on that page shown large with caption and its own share button.
- Photo shares (calligraphy page and archive viewer) include the caption text.

## Non-goals / anti-goals

- No brand-icon rows (LINE, WhatsApp…), no third-party widgets — the phone's own
  share sheet already lists Messages and LINE.
- No new facts beyond what James stated on 2026-11-22.
- Failure even if it works: a phone reader still can't see the share button
  without scrolling; a previously shared archive link to one of the five photos
  lands on nothing.

## Approaches (James picked A and A)

Share placement — **A: utility row** (icon + "Share" / 分享, every page, same
spot). B: larger button under each page title — more visible, but inside the
content and competes with the archive's section buttons.

Calligraphy photos — **A: five photos shown large, caption + share under each,
per-photo anchor `/calligraphy#<id>`.** B: reuse the archive's thumbnail +
lightbox — consistent, but means extracting it from a 521-line component, and
adds a tap for five photos.

## Decided

- **Photos moved out of the archive** (archive 144 → 139): `calligraphy-red-blazer`,
  `calligraphy-costume-party`, `calligraphy` (Lunar New Year 福),
  `calligraphy-exhibition`, `art-exhibition-with-friend`. Captions move unchanged.
  The 2025 Buddha's Light group photo stays in the archive.
- **Old links:** `/archive#<one of the five>` (both locales) redirects to the
  calligraphy page's anchor.
- **Nav:** seven buttons; phone layout 4 + 3 rather than 3 + 3 + 1; desktop
  still fits one row or wraps cleanly at enlarged text.
- **Copy (draft, family tier, source: James Chang, 2026-11-22):**
  - EN: "Each Lunar New Year she volunteers her calligraphy. At the invitation of
    the Huntington Library in San Marino, the Los Angeles County Arboretum in
    Arcadia and Hsi Lai Temple in Hacienda Heights, she goes and writes
    calligraphy in front of visitors and gives the pieces to them."
  - 中文：「每逢農曆新年，她應聖瑪利諾杭廷頓圖書館、亞凱迪亞洛杉磯郡植物園及哈仙達崗西來寺之邀，擔任志工，當場揮毫，並將作品贈送給來訪民眾。」
  - The existing `calligraphy` fact's stale note ("Still no photograph…") is updated.
- STATUS.md, README archive counts and memory updated in the same PR.

## Left to the builder

Exact page layout and image sizes; whether the share script reads the caption
from a `data-share-text` attribute; test additions (route coverage already
enforces nav parity; add a test that the five ids are absent from the archive and
present on the page, and that the redirect map covers them).
