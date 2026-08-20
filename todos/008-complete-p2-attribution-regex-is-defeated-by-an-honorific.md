---
status: complete
priority: p2
issue_id: 008
tags: [code-review, provenance, verification]
dependencies: []
---

# The new attribution guard is defeated by "Dr."

## Problem Statement

`tests/data/press.test.ts:146`

```ts
/\b(stated|confirmed|told|recalled|supplied|relayed)\b[^.]{0,80}\((son|daughter|family|husband|wife)\)/i
```

`[^.]{0,80}` cannot cross a period. Any honorific or suffix between the verb
and the relationship breaks the match — so a fact could be promoted from
`family` to `confirmed` and pass.

This guard was written *because* the previous one was anchored to a single
phrasing (see the comment at :124). It is itself anchored to the absence of a
period.

## Findings

Verified directly:

    CAUGHT  confirmed by James Chang (son), 2026-08-05
    CAUGHT  stated by Min Mey Chang to James Chang (son), relayed 2026-08-10
    EVADES  confirmed by Dr. Sheng Chang (husband), 2026-08-05
    EVADES  stated by Min Mey Chang to Dr. James Chang (son), 2026-08-19
    EVADES  confirmed by James Chang Jr. (son)

No current `source` field contains an honorific, so nothing is mis-tiered
today. But this site writes "Dr. Sheng Chang" in its rendered copy in three
places (`src/data/facts.ts:50, 151, 170`), and he is the most likely `(husband)`
attribution the project will ever add — the evasion is squarely on the path
this data is heading down.

## Proposed Solutions

**A. `[^.]` → `[^\n]`, widen the bound to `{0,120}`.** (Recommended.)
Verified as a pure widening: run across the live data, **zero** facts change
verdict. Effort: trivial. Risk: low.

**B. Same fix at `press.test.ts:103`**, the pre-existing
`/^confirmed by [^.]+\(...\)[^.]*$/i`, which has the same flaw and is not
introduced by this PR. Should be done in the same change.

## Recommended Action

_(blank — for triage)_

## Acceptance Criteria

- [ ] `confirmed by Dr. Sheng Chang (husband), 2026-08-05` on a `confirmed`
      fact fails the suite.
- [ ] No currently-passing fact changes verdict.
- [ ] Negative-tested; README row updated.

## Work Log

- 2026-08-20 — Found by review agent, independently reproduced against the
  five phrasings above.

- 2026-08-20 — FIXED and negative-tested on `feat/methodist-hospital-service`.
  Watched the guard fail before trusting it; sabotage recorded in the README table.
