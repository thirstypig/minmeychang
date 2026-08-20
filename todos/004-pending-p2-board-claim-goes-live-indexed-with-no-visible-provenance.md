---
status: pending
priority: p2
issue_id: 004
tags: [code-review, provenance, privacy, decision]
dependencies: []
---

# The board claim ships indexed, with no visible provenance signal

## Problem Statement

**Not a request to reconsider publishing.** That was decided — both facts,
without years, at the `family` tier, revisable later. This is a different
question, and one that has not been put yet: *how the stronger-sounding of the
two claims will appear to a stranger who finds it through a search engine.*

`FactList.astro` renders `confirmed` and `family` facts **identically**. A
reader sees:

> Served on the board of Methodist Hospital of Southern California in Arcadia,
> now USC Arcadia Hospital.

flat, in the same type as the Acupuncture Board appointment, which is backed by
a state roster PDF. Every mitigating detail — no years given, twenty-five years
of rosters that do not name her, the Asian Outreach committee being the likelier
body — lives in `facts.ts:211`, which no reader will ever see.

## Findings

This is the first fact on the site that a public record affirmatively **fails
to corroborate**, which makes the invisible `confirmed`/`family` distinction
load-bearing in a way it was not before.

And it will be indexed. An earlier read of a local build suggested the site was
still closed; that was an artifact of building without `ALLOW_INDEXING`.
Production says otherwise:

    curl https://minmeychang.com/robots.txt   -> User-agent: *  Allow: /
    curl https://minmeychang.com/ | grep robots
      -> <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">

`.github/workflows/deploy.yml` sets `ALLOW_INDEXING: 'true'`, and both locales
are `reviewed: true` in `src/i18n/ui.ts`. So on merge, this sentence becomes a
publicly indexed, unhedged assertion attached to a named living person — and
the hospital is a real institution whose actual directors are a matter of
record.

The project's own threat model already anticipates the shape of this:
`docs/solutions/security-issues/publishing-about-a-living-person.md` requires
that every claim carry a status. It does, in the data. It does not on the page.

## Proposed Solutions

**A. Hedge the wording of the board fact only.**
"She recalls serving on the board of…" or "By her own account, served on…".
One string, honest, and it degrades gracefully if a roster ever surfaces —
which is exactly the revisability the original decision assumed. Does not touch
the committee fact, which needs no hedge: nothing contradicts it. Effort:
Small. Risk: low.

**B. Render a visible provenance marker for every `family`-tier fact.**
A small "family account" label or footnote across the list. Systematic, and it
makes the ladder legible to readers rather than only to maintainers. But it
marks ten-plus existing facts that nobody has questioned, and risks reading as
a disclaimer on her whole life. Effort: Medium. Risk: medium — a design and
tone decision, not just a code one.

**C. Leave both as they are.**
Defensible: the ladder exists, the note is thorough, and no reader has been
misled about anything the family does not believe to be true. The cost lands
only if someone with a roster ever objects, and the note tells whoever answers
exactly what to run first. Effort: none.

## Recommended Action

_(blank — this one is the family's call, not a technical fix)_

## Technical Details

- `src/data/facts.ts:203-213` — `methodist-hospital-board`, `status: 'family'`.
- `src/components/FactList.astro:40` — renders all statuses identically.
- `src/layouts/Base.astro:40-41` — `indexable = allowIndexing && reviewed[locale]`.
- `src/i18n/ui.ts:16` — both locales reviewed.
- If A is chosen, the zh-Hant string needs the matching hedge; `曾任` asserts
  plainly and would want something like `據其本人表述`.

## Acceptance Criteria

- [ ] A decision is recorded, even if the decision is "leave it".
- [ ] If the wording changes, English and zh-Hant change together, and
      `tests/data/chinese-copy.test.ts` still passes.

## Work Log

- 2026-08-20 — Raised during `/ce:review` of PR #18. Confirmed production is
  indexable against the live site, correcting an earlier local-build reading.

## Resources

- PR: https://github.com/thirstypig/minmeychang/pull/18
- `docs/solutions/research-issues/proving-a-negative-from-archives.md`
