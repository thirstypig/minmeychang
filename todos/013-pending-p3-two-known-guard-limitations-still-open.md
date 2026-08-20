---
status: pending
priority: p3
issue_id: 013
tags: [code-review, verification]
dependencies: [002]
---

# Two known limitations in the guards, both recorded, both still open

## Problem Statement

Neither is a defect of this PR — one is documented in the code, the other was
found during review. Filed so they are not lost.

## Findings

**1. `links.test.ts` is case-blind on macOS.** Documented in the file itself at
:66-72: `existsSync` resolves `verification-that-verifies-NOTHING.md` on a
case-insensitive filesystem, while GitHub Pages serves from a case-sensitive
one. A case-mismatched link passes locally and 404s in production. The file
says the fix is to compare against `readdirSync` output rather than asking
`existsSync`, and that it is not done.

Recording it here as well because the comment is the only trace, and a comment
is not a backlog.

**2. Per-source floors are per *source*, not per *reader*.** Three sub-field
readers share a bucket with a sibling and are never separately floored:
`a.roleZhHant`, `i.needs?.zhHant`, `e.yearDisplay?.zhHant`. Mutations reported
by the review agent:

    delete the whole `figure` reader          -> 1 failed   (caught)
    delete the `timeline year` sub-reader     -> 5 passed   (missed)
    point `archive needs` at `.en`            -> 5 passed   (missed)

`README.md:164` claims *"point any reader at `.en`, or drop one entirely | 1
test fails"* — true at source granularity, false for those three. The same
shape applies to the English sibling, and compounds with 005 there.

Type safety is not the exposure: the optional chaining is correctly typed and
`astro check` catches a field rename. What slips through is a reader pointed
somewhere else.

## Proposed Solutions

**A. Floor by `where`-prefix rather than by source**, so each reader is counted
separately. Effort: Small. Risk: low.

**B. Assert an exact expected total** (`expect(strings.length).toBe(115)`).
Catches everything, including additions; needs updating whenever copy is added,
which is either a feature or a nuisance depending on taste.

**C. For the case-sensitivity limitation**, resolve against `readdirSync` as
the file's own comment prescribes. Effort: Medium.

## Recommended Action

_(blank — for triage)_

## Acceptance Criteria

- [ ] Dropping or mispointing **any** individual reader fails, including the
      three sub-field ones.
- [ ] A case-only link mismatch fails on macOS.
- [ ] README rows corrected to match.

## Work Log

- 2026-08-20 — Item 1 read from the source comment; item 2 found by review
  agent during `/ce:review` of PR #18.
