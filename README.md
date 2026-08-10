# minmeychang

Static bilingual site honouring **Min Mey Chang** — educator, community leader
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

The archive is the visible gap: two award certificates are published, seven
frames are still empty. Her calligraphy is the highest-value missing image —
the site's entire palette is 印泥, the seal paste used to stamp a chop on
calligraphy, and there is no photograph of her brushwork to earn it.

## Setup

```bash
npm install
npm run dev        # http://localhost:3170
npm run build      # postbuild runs scripts/verify-css.mjs
npm test           # 89 tests
npm run typecheck  # astro check — 61 files
```

## Asset scripts

None of these run automatically. Each one exists because its output is
committed and can therefore drift from its source.

| Command | What it does | Run it when |
|---|---|---|
| `npm run fonts` | Subsets Noto Serif TC to the glyphs actually used — 7.6MB → ~200KB | **Any time Chinese copy changes.** `tests/fonts/coverage.test.ts` fails until you do, naming the missing characters |
| `npm run photos` | Ingests `src-photos/incoming/` → `public/archive/`: bakes in EXIF orientation, resizes, strips metadata, then **asserts** no exif/gps/xmp survived | New photographs arrive |
| `npm run awards` | Rebuilds the two award certificate scans, applying the address redactions | The redaction coordinates or source files change |

`scripts/build-logos.mjs` normalises the institutional marks to one height; it
is run by hand, since the marks change roughly never.

> **`npm run photos` strips metadata. It cannot see a home address printed on a
> certificate, a phone number on a school programme, or a face whose owner has
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

## Photographs and documents

`src-photos/` and `src-documents/` are gitignored on purpose: **this repo is
public.** Originals include full-resolution personal photographs and scans that
may carry home addresses, signatures and phone numbers. Only derived,
reviewed, web-sized assets in `public/` are committed. If originals ever need
version control, make the repo private first.

## Tests

`npm test` — **96 tests across 12 files.** CI runs them, and the typecheck,
before the build, so a regression blocks the deploy rather than shipping.

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
| `tests/data/archive.test.ts` | placeholders say what is missing; no originals under `public/` |
| `tests/data/press.test.ts` | every cited source names a fact that renders and is `confirmed`; the confirmed/family distinction holds |
| `tests/data/family.test.ts` | **no Chinese name is invented for a family member**; no record carries an age |
| `tests/fonts/coverage.test.ts` | every CJK character in source is in the committed subset |

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
| press corroboration | cite a fact id that does not exist | 3 tests fail |
| provenance ladder | mark a `family` fact `confirmed` | 2 tests fail |
| press dates | write a date as `07/03/2024` | 1 test fails |
| family names | invent a Chinese name for a grandchild | 3 tests fail |

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
