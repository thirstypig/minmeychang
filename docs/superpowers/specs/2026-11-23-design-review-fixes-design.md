# Design-review fixes: design

Date: 2026-11-23 · Size: small change · Source: the senior UI/UX review at session wrap (#65)

## Decided by James (2026-11-23)

He accepted items 1–6 of the review: "make those buttons a little bit smaller for mobile", "fix the text size" (taken to mean item 2, the header controls), and 3, 4, 5 and 6 as proposed.

## What changes

1. **Phone menu, smaller.** Below 40rem the menu's text is capped at 0.875em and 16px, and the buttons are 40px tall instead of 44, so nine buttons stay 3 + 3 + 3 at any text size from 360px up (2 columns on a 320px phone at 1.6x). Page content still grows with the text-size control and browser zoom. Only the menu stops growing.
2. **Header controls.** Sized in px, with text capped at 16px like the menu. Grown with the text-size control, the four didn't fit a 320px phone at 1.6x.
   - "A−", "A+", ☾ and the language link become bordered buttons, at least 40×44, in the same hairline style as the menu.
   - The two A buttons say A− / A+ so they read as controls.
3. **Previous / next page.** The bottom links become two bordered buttons, side by side, each half the width.
4. **Long pages.** Pages grouped by decade (School, Hsi Lai) get:
   - a row of decade buttons under the intro (1980s · 1990s …);
   - a "Back to top" / 「回到頁首」 link after each decade.
5. **Top Share button.**
   - Label "Share this page" / 「分享此頁」.
   - No border (quiet), so the page title and the current menu button lead.
   - Same 44px height.
6. **Smaller fixes.**
   - Calligraphy's one-paragraph intro gets the same rule above it as the list intros.
   - Hsi Lai's third intro item is no longer the full calligraphy paragraph. It is now one line linking to the Calligraphy page, "Each Lunar New Year she also writes calligraphy for visitors at Hsi Lai Temple; see the Calligraphy page." / 「每逢農曆新年，她也在西來寺為來訪民眾當場揮毫，詳見『書法』頁。」, sourced by the existing `calligraphy` fact.
   - When a caption begins with its own title (3 English items: crab-fishing, min-mey-chang-with-guests, blia-certificate-from-monastic), the lightbox and the page layout show the caption alone. Captions themselves are unchanged, because share text uses them and must stay self-explanatory.
   - Lightbox arrows: labeled "‹ Previous" / "Next ›" buttons on a phone, with the count between them.
   - "Link copied" on the copy fallback: already shown, for 2s. It is raised to 3s.

## Approaches

- **Menu:** capping the menu's font size was chosen over folding the menu behind a "Menu" button. A hidden menu was replaced in 2026-11 because readers didn't find the pages behind it.
- **Repeated captions:** a display rule was chosen over editing the three captions, because the edited captions would make shared messages like "Min Mey Chang: With a landing net between them." meaningless.
