---
status: complete
priority: p1
issue_id: 005
tags: [code-review, verification, vacuous-test]
dependencies: []
---

# The English collector guard does not guard 7 of its 8 sources

## Problem Statement

`tests/data/english-copy.test.ts:113-126` copies the *shape* of its Chinese
sibling's anti-vacuity check but not the *check*. The sibling counts strings
**containing CJK** per source (`chinese-copy.test.ts:88-90`). The English
version counts strings of `length > 0` — which any string satisfies, including
a Chinese one.

So pointing a reader at the wrong locale removes that source from the spelling
sweep entirely, and the suite stays green.

## Findings

Verified by mutation, restored afterwards:

    line 43  f.en -> f.zhHant   ->  vitest: 2 passed   (facts silently unswept)

Only the `ui` reader is genuinely anchored, by the `siteName` equality at
:122-125. The other seven sources — fact, affiliation, archive, figure, media,
press, timeline — are unprotected.

The consequence is precise: with the facts reader mispointed, **both new
hospital facts and every other rendered fact leave the American-spelling
sweep**, and `npm test` reports 106/106.

`README.md:168` states this guard exists —
*"English collector | point a reader at the Chinese locale | 1 test fails, names the source"*.
That is false for seven of eight sources, so the README currently overstates
the protection.

This is the exact failure documented in
`docs/solutions/build-errors/verification-that-verifies-nothing.md`, and the
comment at :110-112 asserts the lesson was applied. The per-source split was
copied; the language assertion was not.

## Proposed Solutions

**A. Mirror the sibling's shape — require Latin-script, non-CJK content per
source.** (Recommended.)

```ts
const isCjk = (ch: string) => { /* as chinese-copy.test.ts:70-73 */ }
for (const source of SOURCES) {
  const latin = strings.filter(
    (s) => s.source === source && /[A-Za-z]/.test(s.text) && ![...s.text].some(isCjk)
  )
  expect(latin.length, `no English collected from '${source}'`).toBeGreaterThan(0)
}
```

Effort: Small. Risk: low. Note some English strings legitimately embed CJK
(the meta description contains 張馬敏妹), so the predicate must be "has Latin
and no CJK" per string, with the floor over the count — not "no string has CJK".

**B. Add a per-source content anchor** (one known English substring per source),
as `ui` already has. More precise, more maintenance, brittle as copy changes.
Effort: Medium.

## Recommended Action

_(blank — for triage)_

## Technical Details

- `tests/data/english-copy.test.ts:113-126`
- Compare `tests/data/chinese-copy.test.ts:86-95`, which is correct.
- `README.md:168` needs correcting either way.

## Acceptance Criteria

- [ ] Mutating **each** of the eight readers to its `zhHant` counterpart fails.
- [ ] Verified one at a time, all eight, and recorded.
- [ ] README row updated to match what is actually guarded.

## Work Log

- 2026-08-20 — Found by review agent, independently reproduced: facts reader
  mispointed → 2 passed.

- 2026-08-20 — FIXED and negative-tested on `feat/methodist-hospital-service`.
  Watched the guard fail before trusting it; sabotage recorded in the README table.
