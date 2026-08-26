# minmeychang

Static bilingual site honoring **Min Mey Chang** — educator, community leader
and cultural advocate in Arcadia, California. Published by her family.

English and Traditional Chinese, at full parity. Astro + Tailwind v4, deployed
to GitHub Pages at **minmeychang.com**.

## Status

Live and indexed. Six pages per locale — home, story, timeline, service,
talks, archive — in English and Traditional Chinese.

**Indexing is ON.** `ALLOW_INDEXING: 'true'` in the deploy workflow; set it to
`'false'` to pull the site back out of the index. `robots.txt` is generated
from the same flag as the per-page `robots` meta, so the two cannot disagree.

**The Chinese copy has never been read end-to-end by a native speaker.** Four
real errors were corrected on 2026-08-05 — including 加州眾議**會**議長, which
is not a body — but that was self-review, not proofreading. It is the locale
most of her community will actually read.

The archive holds 139 entries — 118 photographs and 21 documents — organized
into five categories (Family, The Arcadia Chinese School, Community & Civic
Life, Buddha's Light International Association, Travel), each grouped by
decade within it. One frame remains empty: a scan of the May 2001
Acupuncture Board appointment letter, still to be found and redacted. Her
calligraphy is no longer missing — several photographs of her brushwork are
published, matching the site's 印泥 palette.

## Setup

```bash
npm install
npm run dev        # http://localhost:3170
npm run build      # postbuild runs scripts/verify-css.mjs
npm test
npm run typecheck  # astro check — 71 files
```

## Asset scripts

None of these run automatically. Each one exists because its output is
committed and can therefore drift from its source.

| Command | What it does | Run it when |
|---|---|---|
| `npm run fonts` | Subsets Noto Serif TC to the glyphs actually used — 7.6MB → ~200KB | **Any time Chinese copy changes.** `tests/fonts/coverage.test.ts` fails until you do, naming the missing characters |
| `npm run photos` | Ingests `src-photos/incoming/` → `public/archive/`: bakes in EXIF orientation, resizes, strips metadata, then **asserts** no exif/gps/xmp survived | New photographs arrive |
| `npm run awards` | Rebuilds the two award certificate scans, applying the address redactions | The redaction coordinates or source files change |

`scripts/build-logos.mjs` normalizes the institutional marks to one height; it
is run by hand, since the marks change roughly never.

> **`npm run photos` strips metadata. It cannot see a home address printed on a
> certificate, a phone number on a school program, or a face whose owner has
> not agreed to appear.** Those need eyes, and redactions belong in
> `scripts/build-award-scans.mjs`, which takes explicit coordinates and is
> verified by looking at the output.

## Facts must come from source, never memory

`src/data/facts.ts` is the single source of truth for every factual claim.
Each fact carries a `status`:

| status | meaning |
|---|---|
| `confirmed` | primary source on file, named in `source` |
| `family` | stated directly by Min Mey Chang or Sheng Chang, dated |
| `unverified` | drafted but unchecked — **does not render** |

`confirmed` means a primary source or independent attestation — the Acupuncture
Board's own Sunset Report roster, the award certificates themselves, or
Chinese-language community media. `family` means testimony, attributed and
dated. Tests enforce the distinction, because it is invisible to a reader.

**Her Chinese name is 張馬敏妹** — 冠夫姓: husband's surname 張, her own maiden
surname 馬, given name 敏妹. The obvious guess, `張敏梅`, was wrong in two
independent ways: wrong given name *and* missing the maiden surname entirely.
That middle character is not recoverable from "Min Mey Chang" by any amount of
searching. The sibling project `shengchangmd` shipped an invented Chinese name
once; that is why the rule is never guess, always ask.

**She is effectively invisible to web search even under her correct name.**
`張馬敏妹` returns Hong Kong actresses named 張敏; `"Minmey Chang"` returns
nothing relevant. Every source on this site came from the family. Do not treat
an empty search as evidence that the record is thin.

Six questions remain open in the gitignored `src/data/facts.pending.ts` — mostly
years, plus one consent question. See
[`docs/solutions/security-issues/publishing-about-a-living-person.md`](docs/solutions/security-issues/publishing-about-a-living-person.md).

## The Chinese is held to Taiwan usage

Every English string on this site has a Traditional Chinese twin, and the
standard for it is **臺灣華語 at college level** — 正體字, formal 書面語, Taiwan
lexis (軟體/網路/資訊, never 软件/網絡/信息), full-width punctuation. The arbiter
for a disputed word is 教育部《重編國語辭典修訂本》.

Proper nouns come from the body itself, never from the obvious rendering. The
hospital in Arcadia calls itself **南加州美以美醫院** throughout its own Chinese
site — not 衛理醫院, which is what translating "Methodist" unchecked produces,
and which was caught one commit before it shipped.

`tests/data/chinese-copy.test.ts` enforces the mechanical parts across every
rendered string in every data module. It reads the rendered fields only:
`note` and `source` are internal prose and deliberately contain the wrong
forms as counter-examples.

## Photographs and documents

`src-photos/` and `src-documents/` are gitignored on purpose: **this repo is
public.** Originals include full-resolution personal photographs and scans that
may carry home addresses, signatures and phone numbers. Only derived,
reviewed, web-sized assets in `public/` are committed. If originals ever need
version control, make the repo private first.

## Tests

`npm test` — **117 tests across 16 files.** CI runs them, and the typecheck,
before the build, so a regression blocks the deploy rather than shipping.

**They do not yet run on a pull request.** `.github/workflows/deploy.yml`
triggers only on push to `main`, so the suite executes after a merge, not
before one — see `todos/001-pending-p2-ci-does-not-gate-the-pr.md`.

| File | Guards |
|---|---|
| `tests/i18n/locale-coverage.test.ts` | key parity between locales; no untranslated value |
| `tests/i18n/route-coverage.test.ts` | a page file exists in **both** locales for every route; unbroken reading order |
| `tests/data/facts.test.ts` | nothing `unverified` renders; every rendered fact cites a source |
| `tests/data/timeline.test.ts` | ordering; placeholder years never reach the page |
| `tests/data/figures.test.ts` | every figure cites a renderable fact; no Western numerals on Chinese pages |
| `tests/data/media.test.ts` | **the family video channel is not linked** |
| `tests/data/affiliations.test.ts` | logo permission gate; AUSD never borrows another body's mark |
| `tests/data/videos.test.ts` | third-party uploads keep their attribution |
| `tests/data/archive.test.ts` | placeholders say what is missing; no originals under `public/`; every item has a category from the defined set; every category has a bilingual label and at least one item |
| `tests/data/archive-sections.test.ts` | the category/decade grouping shown on the archive page — category order, decade dedup and sort, no empty-category sections, every item lands in exactly one section |
| `tests/data/press.test.ts` | every cited source names a fact that renders and is `confirmed`; the confirmed/family distinction holds |
| `tests/data/family.test.ts` | **no Chinese name is invented for a family member**; no record carries an age |
| `tests/fonts/coverage.test.ts` | every CJK character in source is in the committed subset |
| `tests/data/chinese-copy.test.ts` | 正體字 only; full-width punctuation; no dangling anaphor; attested proper nouns |
| `tests/docs/links.test.ts` | every relative link in README and `docs/` resolves |
| `tests/data/english-copy.test.ts` | American spelling in every rendered English string |

The suite is verified to pass **with and without** the gitignored
`src/data/facts.pending.ts`, which is absent in CI.

### Every guard is negative-tested

A guard nobody has watched fail is a hypothesis. Each of these was proven by
deliberately breaking it:

| Guard | Sabotage | Result |
|---|---|---|
| `scripts/verify-css.mjs` | empty the compiled stylesheet | exit 1 |
| fact provenance | filter to `() => true` | 3 tests fail |
| font coverage | drop a glyph from the manifest | 2 tests fail, names the glyph |
| CI typecheck | remove `@astrojs/check` | step fails on missing `Result (` |
| media consent | set the family channel `confirmed: true` | 2 tests fail |
| logo gating | give AUSD the City of Arcadia seal | 2 tests fail |
| video attribution | drop `hostChannel` from the 833K video | 1 test fails |
| archive placeholders | remove an item's `needs` | 1 test fails |
| archive categories | assign an item an unknown category | 1 test fails |
| archive section grouping | stop sorting decades in `buildArchiveSections` | 1 test fails |
| press corroboration | cite a fact id that does not exist | 3 tests fail |
| provenance ladder | mark a `family` fact `confirmed` | 3 tests fail |
| press dates | write a date as `07/03/2024` | 1 test fails |
| family names | invent a Chinese name for a grandchild | 3 tests fail |
| 正體 characters | write 亞凱迪亞 as 亚凱迪亞 | 1 test fails, names the character |
| Chinese punctuation | use `,` instead of `，` beside a Chinese word | 1 test fails |
| dangling anaphor | open a fact with 該院 | 1 test fails |
| attested proper nouns | rename the hospital 衛理醫院 | 1 test fails |
| Chinese collector | point any reader at `.en`, or drop one entirely | 1 test fails, names the source |
| testimony phrasing | promote either hospital fact to `confirmed` | 1-2 tests fail |
| doc links | typo a path in README, or either form of a `related:` entry | 1 test fails, names the link |
| American spelling | write "honoured" or "programmes" in a fact | 1 test fails, names the word |
| English collector | point **any** of the eight readers at the Chinese locale | 1 test fails, names the source |
| attribution phrasing | attribute a `confirmed` fact to "Dr. Sheng Chang (husband)" | 2 tests fail |

Re-run any of these before trusting the suite. See
[`docs/solutions/build-errors/verification-that-verifies-nothing.md`](docs/solutions/build-errors/verification-that-verifies-nothing.md)
for why: on this project, nine separate tools have reported success for work
they never performed — including a CI typecheck that ran unverified for
fourteen consecutive deploys, and a provenance test that was logically
incapable of failing.

The same failure has a research counterpart, written up in
[`docs/solutions/research-issues/proving-a-negative-from-archives.md`](docs/solutions/research-issues/proving-a-negative-from-archives.md):
tools that report *"nothing found"* when what happened was *"nothing looked."*
Before recording that a source does not name her, search that same source for
something you know it contains. On a page about a real person, an empty search
and an unread page are not the same finding.

A third variant, specific to processing photo batches, is written up in
[`docs/solutions/verification-issues/batched-image-reads-misattribute-content.md`](docs/solutions/verification-issues/batched-image-reads-misattribute-content.md):
reading multiple images in one batched call and narrating the result from
memory silently swaps which filename goes with which photo's content — even
at a batch size of 4-5. Verify file identity one image at a time whenever it
carries a consequence (redaction targets, consent, attribution).

## Build guard

`scripts/verify-css.mjs` runs as `postbuild` and fails the build if Tailwind
produced no real output. A missing Tailwind plugin does not error — utility
classes silently do nothing and the build stays green. This has actually
happened on the sibling project. The guard is negative-tested: emptying the
compiled stylesheet makes it exit 1.

## Deployment

GitHub Pages via `.github/workflows/deploy.yml`, building on push to `main`.
Build type must be **`workflow`**, not `legacy` — on legacy branch builds GitHub
would try to Jekyll-build the Astro source, and `public/CNAME` would override
the repo's custom-domain setting on every deploy. On workflow builds `CNAME` is
inert and the repo setting is authoritative; the file is kept only as
documentation.

DNS is at Squarespace. `minmeychang.com` is an **apex** domain, so it uses four
`A` records to GitHub's IPs rather than the single `CNAME` a subdomain would
use. Squarespace's "Squarespace Defaults" preset must stay deleted — it carries
an `HTTPS` (RFC 9460) record whose `ipv4hint` points at Squarespace's parking
IPs, which browsers prefer over `A` records. That one is invisible to
`dig +short A` and will silently defeat an otherwise-correct migration.

Port **3170** (block 3170–3179) per `MASTER-PORTS.md`.
