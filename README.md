# minmeychang

Static bilingual site honouring **Min Mey Chang** — educator, community leader
and cultural advocate in Arcadia, California. Published by her family.

English and Traditional Chinese, at full parity. Astro + Tailwind v4, deployed
to GitHub Pages at **minmeychang.com**.

## Status

Holding page only. The narrative page, timeline and photo/document archive are
not built yet.

**Crawlers are blocked.** The build emits `noindex` unless `ALLOW_INDEXING=true`,
which the workflow leaves commented out. Do not enable it until Min Mey Chang
has reviewed every fact, every photograph, and her own name.

## Setup

```bash
npm install
npm run dev      # http://localhost:3170
npm run build    # postbuild runs scripts/verify-css.mjs
```

## Facts must come from source, never memory

`src/data/facts.ts` is the single source of truth for every factual claim.
Each fact carries a `status`:

| status | meaning |
|---|---|
| `confirmed` | primary source on file, named in `source` |
| `family` | stated directly by Min Mey Chang or Sheng Chang, dated |
| `unverified` | drafted but unchecked — **does not render** |

Only one fact is currently `confirmed`: the 2001 California Acupuncture Board
appointment, verified against the Board's own Sunset Report roster.

**Her Chinese name is unknown and must not be guessed.** `張敏梅` is the obvious
guess and returns no matching results anywhere online. Her husband is 張勝雄, but
her given name — and whether she uses a maiden surname — are unconfirmed. The
Chinese pages render her name in Latin script until she confirms it herself.
The sibling project `shengchangmd` shipped an invented Chinese name once; that
is why this rule exists.

Several drafted claims are also contradicted by public sources — notably whether
the Arcadia Chinese School closed, was sold, or is still operating. See the
`note` field on each fact.

## Photographs and documents

`src-photos/` and `src-documents/` are gitignored on purpose: **this repo is
public.** Originals include full-resolution personal photographs and scans that
may carry home addresses, signatures and phone numbers. Only derived,
reviewed, web-sized assets in `public/` are committed. If originals ever need
version control, make the repo private first.

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
