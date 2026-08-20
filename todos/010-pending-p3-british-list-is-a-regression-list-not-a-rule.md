---
status: pending
priority: p3
issue_id: 010
tags: [code-review, copy, i18n]
dependencies: [005]
---

# The BRITISH table catches the 78 forms found, not the class — and has no escape hatch

## Problem Statement

Two related gaps in `tests/data/english-copy.test.ts:73-105`.

**Coverage.** The list reads as a principled rule but is an enumeration of one
sweep's findings. Inflections of its own stems miss: `favoured`, `honourable`,
`colourful`, `neighbouring`, `organises`, `recognises`, `realisation`,
`theatres`, `metres`, `licences`, `storeys`, `travellers`, `counsellors`.
Whole classes are absent: `analyse`, `apologise`, `emphasise`, `criticise`,
`utilise`, `cheque`, `manoeuvre`, `draught`, `towards`, `paediatric`.

**False positives with no remedy.** `writing-american-english-copy` says
official names keep their own spelling and quotations are never altered. The
guard has no exemption mechanism, so when a legitimate name trips it the only
in-band fix is the one the standard forbids. Live collision candidates for
this corpus: `theatre` (LA venues register as "Theatre"), `centre` (Fo Guang
Shan / BLIA branches outside the US use "Centre", and this site covers BLIA),
`catalogue`, `grey` (matched case-insensitively, so the surname "Grey" trips),
`honour` in an award name.

No current string trips any of them — this is prospective.

## Findings

Also worth recording, because it looks like a gap and is not: `press[].outlet`
and `press[].title` are **rendered** (`src/components/Press.astro`) but
deliberately **not** collected. That is correct — `title` is a headline as
published (a quotation) and `outlet` is a proper noun in its own language.
Neither may be Americanized. Nothing in the test says so, so a future
maintainer could "close the gap" and turn the guard into something that demands
altering a published headline.

Verified not a bug, so nobody churns it: `PATTERN` is a module-level `g`-flagged
regex, but every consumer is `String.prototype.matchAll`, which clones the
regex and never advances the original's `lastIndex`. Alternation ordering is
also fine — the trailing `\b` forces backtracking, so `honours` reports as
`honours`, not `honour`.

## Proposed Solutions

**A. Extend the failure message to name the escape hatch.** (Recommended
first step, and YAGNI-correct.) At :133-135, add: if this is an official name
or a quotation it must not be Americanized — see the copy standard. Costs one
string, prevents the guard from pushing an author into violating the project's
own rule. Effort: trivial.

**B. Add a pattern arm** — `/\b\w+(?:our|ise|ised|ising|isation|iser)\b/i`
minus an explicit allowlist (`four/pour/tour/flour/hour`,
`advertise/exercise/supervise/revise/promise/franchise/compromise/surprise/expertise/otherwise/enterprise`).
Converts the table from a list into a rule. Effort: Medium. Risk: medium —
raises false-positive rate, which makes A a prerequisite.

**C. Add a keyed `EXEMPT` set** of `where` values. Only once something needs it.

**D. Document why `outlet` and `title` are excluded**, in the header comment.
Effort: trivial. Do this regardless.

## Recommended Action

_(blank — for triage)_

## Acceptance Criteria

- [ ] The failure message tells an author what to do when the word is a name.
- [ ] The header comment records why `outlet`/`title` are out of scope.

## Work Log

- 2026-08-20 — Found during `/ce:review` of PR #18.
