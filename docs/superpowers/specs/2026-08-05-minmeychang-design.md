---
date: 2026-08-05
status: approved
component: minmeychang — static bilingual tribute site
owner: James Chang
---

# minmeychang — design

A static bilingual site honouring **Min Mey Chang**, published by her family.
English and Traditional Chinese at full parity. Astro + Tailwind v4, deployed to
GitHub Pages at `minmeychang.com`.

She is living. This is a tribute and a record, not a memorial.

---

## Purpose

A family-published legacy record. Third person, warm but dignified. The audience
is family, the Arcadia community members who knew her, and her grandchildren
later. It is not a CV she hands out, and not a community-history archive that
happens to feature her — those were considered and rejected.

## Scope

Two pages per locale, four routes total:

| Route | Contents |
|---|---|
| `/` | Long-form narrative: hero portrait, story, timeline, selected photographs, family |
| `/archive` | Photo collection by decade, scanned documents |
| `/zh-hant/` | As `/` |
| `/zh-hant/archive` | As `/archive` |

A single scrolling page was rejected because the photo archive and documents are
real and multi-decade; a six-page site was rejected because twelve routes of
bilingual content is where locale drift becomes unmanageable.

**Currently built:** the holding page only (`/` and `/zh-hant/`). The narrative,
timeline and archive are not implemented.

---

## Architecture

```
src/
  content/story/{en,zh-hant}.md   long-form narrative, authored per language
  data/
    facts.ts                      confirmed claims + provenance types (tracked)
    facts.pending.ts              unverified claims + notes (GITIGNORED)
    timeline.ts                   dated events, bilingual
    archive.ts                    photos + documents, bilingual captions
  i18n/ui.ts                      chrome strings, locale metadata
  layouts/Base.astro              head, hreflang, noindex gate, language toggle
  pages/                          the four routes above
scripts/verify-css.mjs            postbuild guard
```

### Fact provenance

Every factual claim carries a status:

| status | meaning | renders? |
|---|---|---|
| `confirmed` | primary source on file, named in `source` | yes |
| `family` | stated directly by Min Mey Chang or Sheng Chang, dated | yes |
| `unverified` | drafted but unchecked | **no** |

The design goal is that **the failure mode is an incomplete page, never a wrong
one.** An unanswered question renders as absence. This makes the site
publishable at any level of completeness.

Four facts currently render. One is `confirmed` from a primary source: the May
2001 California Acupuncture Board appointment, verified against the Board's own
Sunset Report roster (`MIN M. CHANG (Public Member) July 2004 / Appointed by the
Speaker of the Assembly, May 2001`). Three are `family`, confirmed by James
Chang on 2026-08-05: her Chinese name; that the school she founded was
transferred to new leadership and is no longer running; and that she came to the
United States in the late 1960s with Dr. Sheng Chang.

The school answer resolves a contradiction in public sources. The
PrivateSchoolReview listing at 823 S. First Ave showing an open "Arcadia Chinese
School" with 184 students is stale or a different entity, and must not be cited.

Unverified claims live in `facts.pending.ts`, which is **gitignored**. This
repository is public, and the `noindex` gate covers only the rendered site — not
the repo, which GitHub serves and indexes. Keeping unreviewed assertions about a
living private person in tracked source would publish exactly the material the
review gate exists to withhold. `facts.ts` loads the pending file via
`import.meta.glob`, so a clone without it builds cleanly.

### Bilingual model

Full parity. `/` is English, `/zh-hant/` is Traditional Chinese, with a visible
toggle. Every string exists in both locales.

`reviewed` in `ui.ts` tracks whether a locale's copy has been checked by a
fluent reader. `zh-hant` is `false`, so it stays `noindex` even when indexing is
switched on globally.

**Her Chinese name is 張馬敏妹**, confirmed by James Chang (son) on 2026-08-05.
Four-character 冠夫姓 form: husband's surname 張 + her maiden surname 馬 + given
name 敏妹.

This is the case for the no-guessing rule, not against it. The obvious guess was
`張敏梅` — wrong given name (敏妹, not 敏梅) *and* structurally wrong, dropping
the 馬 entirely. The maiden surname is not recoverable from the anglicized "Min
Mey Chang" by any amount of searching. The sibling project `shengchangmd`
shipped an invented Chinese name once; had this one been guessed, it would have
been wrong in two independent ways on the page carrying his mother's name.

---

## Visual direction

**Colour.** The red is 印泥, the cinnabar seal paste used to stamp a chop on
Chinese calligraphy — drawn from her own practice rather than a generic festive
red.

| token | light | dark |
|---|---|---|
| `--brand` | `#B02A1F` | `#E8837C` |
| `--brand-contrast` | `#FDF6F2` | `#241615` |
| `--text-strong` | `#1A1614` | `#F2ECE7` |
| `--text-soft` | `#5C534E` | `#B3A9A2` |
| `--surface` | `#FDFBF8` | `#141110` |

All eight foreground/background pairs verified at **AA or better in both
themes** (brand on paper 6.36:1; brand on dark surface 7.13:1).

**Colour rule, inherited from `shengchangmd` where breaking it caused two real
bugs:** never hardcode `#000`/`#fff` or any fixed text colour on a branded
surface. Set the surface's own `color` to `--brand-contrast` and let descendants
inherit. Headings stay `color: inherit` on purpose.

Red is used sparingly — headings, rules, the seal motif — never as a background
wash, which would fight the archive photographs.

**Typography.** The two scripts have different needs and do not share settings:

- **Measure.** English reads at 65–75 characters; full-width Han characters read
  at 35–40. The locales get different `max-width` values, not a shared one.
- **Leading.** ~1.9 for Chinese against ~1.6 for English.
- **Weight.** 宋體 renders visually heavier than a Latin serif at the same
  nominal weight; the Chinese page compensates with lighter weight or size.

**Fonts.** Target pairing is **Source Serif 4** with **Noto Serif TC** — similar
stroke modulation and vertical proportions, so the two locales read as one
document. A full Noto Serif TC is ~10MB, which is unshippable; because this
site's copy is finite and known at build time, subsetting to used glyphs brings
it to ~50–150KB. Until that is wired, a system stack (`PingFang TC`,
`Songti TC`) renders correctly at zero cost. This is an upgrade, not a blocker.

**Layout.** Single column, editorial, generous margins, photo-led.

---

## Photographs and documents

`src-photos/` and `src-documents/` are gitignored. Only derived, reviewed,
web-sized assets reach `public/`. If originals ever need version control, the
repo must be made private first.

Two gates before anything is published:

- **EXIF.** Re-encoding normally strips it, but phone photographs carry GPS
  coordinates. Assert on the built output rather than trusting pipeline
  defaults — publishing her home's coordinates is a real failure mode.
- **Documents.** Award certificates and the 2001 appointment letter will carry a
  home address, a phone number and a handwritten signature. Crop or redact
  signatures and addresses before the file enters `public/`. A clean scan of a
  real signature is a forgery input.

---

## Testing

Two narrow suites. Every test prevents a defect that has actually shipped on the
sibling project, and all of them are for defects that typecheck and build
cleanly.

**Locale coverage** — a key present in `en` but missing from a Chinese locale
makes `getTranslation` return the key itself, so a visitor sees the literal text
`siteTagline`. Tests assert: every key in both locales; no Chinese value left
byte-identical to its English counterpart; both fallback paths return something
renderable.

**Fact provenance** — nothing with `status: 'unverified'` reaches
`renderableFacts`; every `confirmed` fact carries a `source`.

**Build guard** — `scripts/verify-css.mjs` runs as `postbuild` and fails the
build if Tailwind produced no real output. A missing Tailwind plugin does not
error; utility classes silently do nothing and the build stays green. The guard
asserts on Preflight's reset plus evidence of generated utilities, and is
negative-tested: emptying the compiled stylesheet makes it exit 1.

CI runs typecheck then tests before the build, so a regression blocks the deploy
rather than shipping.

---

## Deployment

GitHub Pages via `.github/workflows/deploy.yml`, building on push to `main`.

**Build type must be `workflow`, not `legacy`.** New Pages repos default to
`legacy`, which inverts the `CNAME` rule: on legacy branch builds the `CNAME`
file is authoritative and overwrites the repo's custom-domain setting on every
deploy, and GitHub would try to Jekyll-build the Astro source. On `workflow`
builds `CNAME` is inert and the repo setting rules; the file is kept only as
documentation.

Required order — the custom-domain field 404s until Pages has built once:
push → first successful deploy → set `cname` → enable `https_enforced`.

**DNS.** `minmeychang.com` is an apex domain on Squarespace, so it uses four `A`
records to GitHub's IPs rather than the single `CNAME` a subdomain would use,
plus `www` CNAME → `thirstypig.github.io`.

Squarespace's "Squarespace Defaults" preset **must stay deleted.** It bundles
the parking `A` records, the `www` CNAME, and an `HTTPS` (RFC 9460) record whose
`ipv4hint` lists the parking IPs. Browsers query HTTPS records in parallel with
`A` and prefer those hints, so Chrome and Safari keep reaching Squarespace even
with perfect `A` records — while `dig +short A` reports success.

**Indexing is off.** The build emits `noindex` unless `ALLOW_INDEXING=true`,
which the workflow leaves commented out. Do not enable it until she has reviewed
every fact, every photograph, and her own name. Unreviewed locales stay
`noindex` regardless.

Port **3170** (block 3170–3179), claimed in `MASTER-PORTS.md` before the dev
server was ever run.

---

## Verification discipline

Four times in the session that produced this design, a tool reported success for
an operation it had not performed. Each is a standing rule:

- **`dig` 9.10.6 cannot query `HTTPS`/`SVCB`.** It silently downgrades to an `A`
  query — the QUESTION SECTION returns `IN A` — and answers confidently. Use
  `dig -t TYPE65`.
- **A `200` proves nothing about which server answered.** A stale local resolver
  returned Squarespace's parking page over a valid certificate. Check
  `%{remote_ip}` and the `server:` header, and verify with
  `curl --resolve <host>:443:<target-ip>`.
- **`git push --force` does not delete anything on GitHub.** It moves the branch
  ref; old commits stay reachable by SHA and served by the API indefinitely.
  Only deleting the repository (with no forks) destroys them.
- **A build that emits CSS has not necessarily compiled Tailwind.** Assert on
  the content, and negative-test the assertion.

---

## Open questions — owner: Min Mey Chang

Twelve items sit in `facts.pending.ts` awaiting her answers. They are
deliberately not reproduced here, because this file is tracked and the repo is
public. The blocking one is her Chinese name; the most consequential unknown is
whether the Arcadia Chinese School closed, was sold, or is still operating,
where public sources contradict the draft bio.

## Outstanding work, not part of this design

- Commit `c14acf4` remains reachable by SHA and contains an earlier tracked copy
  of the unverified claims. Removing it requires deleting and recreating the
  repository; `delete_repo` scope was not granted.
