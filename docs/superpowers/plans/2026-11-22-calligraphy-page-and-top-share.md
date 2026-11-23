# Calligraphy page and top-of-page share — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a seventh page, Calligraphy / 書法, holding five photos moved out of the archive. Move the share button to the top of every page. Make photo shares carry the caption.

**Architecture:** The five photos stay in `src/data/archive.ts` under a new category, `calligraphy`. The archive page leaves that category out, and the new page renders only it. The local admin editor (`npm run admin`) keeps working unchanged: it serializes only `EDITABLE_KEYS`, so a new field would be silently dropped, but a new category value round-trips. The share script in `Base.astro` gains two optional button attributes, `data-share-url` and `data-share-text`.

**Tech Stack:** Astro 7, Tailwind v4, TypeScript, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-22-calligraphy-page-and-top-share-design.md`

## Global Constraints

- Branch `feat/calligraphy-page-top-share`, then a PR, then merge with a bare `gh pr merge N …` call. Never commit to `main`.
- STATUS.md (including its Last updated date) changes in the same PR (project CLAUDE.md).
- Load `writing-american-english-copy` and `writing-taiwan-mandarin-copy` before writing any copy. The guards in `tests/data/english-copy.test.ts` and `chinese-copy.test.ts` must pass.
- Copy is exactly as approved, apart from proper-noun renderings the Taiwan-Mandarin skill corrects:
  - EN: "Each Lunar New Year she volunteers her calligraphy. At the invitation of the Huntington Library in San Marino, the Los Angeles County Arboretum in Arcadia and Hsi Lai Temple in Hacienda Heights, she goes and writes calligraphy in front of visitors and gives the pieces to them."
  - ZH: 「每逢農曆新年，她應聖瑪利諾杭廷頓圖書館、亞凱迪亞洛杉磯郡植物園及哈仙達崗西來寺之邀，擔任志工，當場揮毫，並將作品贈送給來訪民眾。」
- The five ids to move: `calligraphy-red-blazer`, `calligraphy-costume-party`, `calligraphy`, `calligraphy-exhibition`, `art-exhibition-with-friend`. Captions stay unchanged.
- No brand icons and no third-party share widgets.
- Never run vitest with `--root /`.
- Check actual output rather than exit codes. Read the test counts and grep `dist/`.

## Review Focus

1. **Old link `/archive#calligraphy` (and `/zh-hant/archive#…`)** should land on the calligraphy page at that photo, not open a blank viewer. Pinned in Task 3, Step 6.
2. **English nav label "Calligraphy" at 360px, at normal and enlarged text,** must not clip or overflow its button. Pinned in Task 2, Step 6.
3. **The share sheet on the calligraphy page** must send that photo's `#id` link, not the bare page URL. Pinned in Task 3, Step 6.
4. **Clipboard fallback (desktop Firefox)** copies the link only, never caption + link. Messy pasted text is worse than a bare link. Pinned in Task 3, Step 6.
5. **The admin editor** still lists, and saves unchanged, the five moved items under "Calligraphy". Pinned in Task 1, Step 5.

---

### Task 1: Data — `calligraphy` category and updated fact

**Files:**
- Modify: `src/data/archive.ts` (types/labels near lines 19–37, `buildArchiveSections` ~2010, the five entries)
- Modify: `src/data/facts.ts` (`calligraphy` fact, ~line 177)
- Modify: `tests/data/archive-sections.test.ts` (test at ~line 69)
- Create: `tests/data/calligraphy.test.ts`

**Interfaces:**
- Produces:
  - `ArchiveCategory` gains `'calligraphy'`
  - `archiveCategoryOrder` gets `'calligraphy'` appended last, so admin shows it
  - `archiveCategoryLabels.calligraphy = { en: 'Calligraphy', zhHant: '書法' }`
  - `export const archivePageCategories: ArchiveCategory[]`: the order without `'calligraphy'`
  - `buildArchiveSections` iterates `archivePageCategories`
  - `export const calligraphyItems: ArchiveItem[]`: archive items with category `calligraphy`, in file order

- [ ] **Step 1: Write failing tests** in `tests/data/calligraphy.test.ts`:
  - `calligraphyItems.map(i => i.id)` equals, as a set, the five ids in Global Constraints.
  - Every `calligraphyItems` entry has an `asset` and a `caption`.
  - No section from `buildArchiveSections()` contains any of the five ids.
  - `facts.find(f => f.id === 'calligraphy').en` equals the approved EN copy exactly, and `.status === 'family'`.
  - In `archive-sections.test.ts`, change "every item … appears in exactly one section" to cover items whose category is in `archivePageCategories`. Add: items with category `calligraphy` appear in no section.
- [ ] **Step 2:** Run `npx vitest run tests/data/calligraphy.test.ts tests/data/archive-sections.test.ts`. Expect FAIL (`calligraphyItems` not exported).
- [ ] **Step 3: Implement.** Add the category, labels, `archivePageCategories` and `calligraphyItems`. Set `category: 'calligraphy'` on the five entries. Move them to the end of the array, so its order still matches render order. Update the `calligraphy` fact:
  - `en` / `zhHant`: the approved copy
  - `source`: `'confirmed by James Chang (son), 2026-08-05; volunteering, invitation and giving the pieces away stated by James Chang, 2026-11-22'`
  - `note`: replace the stale "Still no photograph…" with one line saying five photographs are on the calligraphy page
- [ ] **Step 4:** Run `npm test`. Expect all files to pass, the copy guards included. Read the pass count; don't trust the exit code.
- [ ] **Step 5: Admin check.** Run `npm run admin`, open http://localhost:4170, and confirm a "Calligraphy" section lists the five. Save without edits; `git diff src/data/archive.ts` should show no change from the save.
- [ ] **Step 6: Commit** — `Move five calligraphy photos to their own category; update the calligraphy fact`

### Task 2: The Calligraphy page and the seven-button menu

**Files:**
- Modify: `src/i18n/routes.ts` (add a `RouteId` and a route, last in `routes`)
- Modify: `src/i18n/ui.ts` (keys in both locales)
- Create: `src/components/Calligraphy.astro`, `src/pages/calligraphy.astro`, `src/pages/zh-hant/calligraphy.astro`
- Modify: `src/styles/global.css` (`.nav-grid`, ~lines 215–234, and its comment)

**Interfaces:**
- Consumes: `calligraphyItems`, the `calligraphy` fact
- Produces:
  - route `{ id: 'calligraphy', segment: '/calligraphy', labelKey: 'calligraphyHeading', navLabelKey: 'navCalligraphy', descKey: 'descCalligraphy', inReadingOrder: true }`
  - ui keys: `navCalligraphy` ('Calligraphy' / '書法'), `calligraphyHeading` (same), `descCalligraphy` (one sentence, both locales)
  - each photo is a `<figure id={item.id}>`, so `#<id>` anchors work

- [ ] **Step 1:** Run `npx vitest run tests/i18n`. Note the baseline. The route and locale coverage tests should go red once the route exists and the pages don't.
- [ ] **Step 2:** Add the route and ui keys, then rerun `tests/i18n`. Expect FAIL on the missing page files.
- [ ] **Step 3: Implement** `Calligraphy.astro` (props: `locale`), with page files modeled on `src/pages/service.astro`.
  - Body: the fact's text as an intro paragraph, then each item as a large `<img>` (`asset`, alt = label, `loading="lazy"`).
  - Under each image: label, caption, and a share button (`class="share-button text-sm"`, `data-share`, `data-share-url={'#' + item.id}`, `data-share-text={caption}`, `data-label-copied`, label `t('sharePhoto')`).
  - Render the fact through the same renderable-fact filter as `Figures.astro`, so it disappears if its fact ever stops being renderable.
- [ ] **Step 4:** Run `npm test`. Expect PASS.
- [ ] **Step 5: Menu layout.** In `.nav-grid`, keep the 3-across (2-across when enlarged) em-floor logic below 40rem, and have the 7th button span the full row (`li:last-child:nth-child(3n+1)` → `grid-column: 1 / -1`, plus the 2-column equivalent). From 40rem use `repeat(4, 1fr)` (4 + 3). Raise the em floor from 5em to whatever "Calligraphy" needs, and update the comment's measurements.
  - Why not 4 across on phones: "Calligraphy" needs ~6.3em with padding, and a quarter of a 360px row is ~4.5em. [Likely, estimate; Step 6 measures it.]
- [ ] **Step 6: Measure** in a browser at 360, 390 and 430px, and at text-size min and max, in both locales. Assert `scrollWidth <= clientWidth` on every `.nav-button`, and that the rows read 3+3+1 (2+2+2+1 enlarged) on phone and 4+3 at ≥640px. Screenshot 360px at 1× for the PR.
- [ ] **Step 7: Commit** — `Add the Calligraphy page; seven-button menu`

### Task 3: Share at the top; photo shares carry captions; old links redirect

**Files:**
- Modify: `src/components/TopBar.astro` (utility row)
- Modify: `src/layouts/Base.astro` (remove the footer share `<p>` ~lines 175–189; share script ~304–315)
- Modify: `src/components/Archive.astro` (lightbox share button ~225; caption fill ~459; redirect at the top of its script)
- Modify: `src/i18n/ui.ts` (`share`: 'Share' / '分享')

**Interfaces:**
- Consumes: `calligraphyItems`, `routePath(locale, 'calligraphy')`
- Produces:
  - share-button contract: `data-share` (required)
  - `data-share-url` (optional, resolved against `location.href`; default `location.href`)
  - `data-share-text` (optional; passed as `text` to `navigator.share` only, never copied)

- [ ] **Step 1: TopBar.** Change the utility row to `justify-between`. Put a share button on the left (same SVG, 16px, label `t('share')`, `data-share`, `data-label-copied`, `share-button text-sm`). Controls stay on the right. Delete the footer share block and its comment, and move the comment's reasoning onto the new button.
- [ ] **Step 2: Share script.** Read `data-share-url` and `data-share-text`. `data` = `{ title, url, text? }`. The `canShare` check and the copy fallback both use the resolved `url`.
- [ ] **Step 3: Lightbox.** Where the caption is filled (~459), also set the lightbox share button's `data-share-text` to that caption, and remove it when the caption is empty.
- [ ] **Step 4: Redirect.** Put `data-moved-ids={JSON.stringify(calligraphyItems.map(i => i.id))}` and `data-moved-to={routePath(locale, 'calligraphy')}` on the archive root. Before the viewer's open-from-hash logic runs, if the hash is a moved id, call `location.replace(movedTo + location.hash)`.
- [ ] **Step 5:** Run `npm run typecheck && npm test && npm run build`. Read the output. Then confirm `grep -c 'data-share' dist/index.html` is ≥ 1, and that `grep -o 'data-moved-ids="[^"]*"' dist/archive/index.html` lists the five ids.
- [ ] **Step 6: Browser verification** (`npm run preview`, Playwright, both locales):
  - `/archive#calligraphy` ends at `/calligraphy#calligraphy`, with that figure in view.
  - On the calligraphy page, stub `navigator.share` and click photo 2's share. It receives `url` ending `/calligraphy#calligraphy-costume-party` and `text` equal to its caption.
  - In the archive viewer, the stub receives the open photo's caption.
  - Top-bar share on `/story` receives `url` ending `/story`, with no `text`.
  - With `navigator.share` deleted, clicking a photo share puts only the URL on the clipboard, and the label flips to "Link copied".
  - The footer has no share button.
- [ ] **Step 7: Commit** — `Share button at the top of every page; photo shares include the caption; redirect moved archive links`

### Task 4: Docs, status, PR

**Files:** `README.md` (archive paragraph ~line 23), `STATUS.md`, memory files `archive-project-state.md` and `site-state-2026-11.md`

- [ ] **Step 1:** README and STATUS:
  - "144 entries: 139 on the archive page (119 photographs, 20 documents) in five categories; 5 calligraphy photographs on the Calligraphy page."
  - Seven pages per locale; the share button is at the top.
  - Bump Last updated to the merge date.
- [ ] **Step 2:** Run `npm test`. The docs links test must pass.
- [ ] **Step 3:** Commit, push, and open a PR with the 360px screenshot and the verification results from Task 3, Step 6. Merge only when James says to.
- [ ] **Step 4:** After the merge, check the live site: the `/calligraphy` page, the top share button, and the old-link redirect. Update both memory files.
