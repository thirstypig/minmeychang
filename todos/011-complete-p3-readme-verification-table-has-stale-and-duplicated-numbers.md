---
status: complete
priority: p3
issue_id: 011
tags: [code-review, docs, verification]
dependencies: [005, 006]
---

# The README's verification numbers are hand-maintained, and some are already wrong

## Problem Statement

`README.md` is this project's argument that its guards were checked by hand.
Numbers in it that drift undercut that argument more than they would in an
ordinary README.

## Findings

**Stale count.** `README.md:157` — *"provenance ladder | mark a `family` fact
`confirmed` | 2 tests fail"*. With this PR's new invariant, promoting
`chinese-name` now fails **3**. (Independently confirmed nearby: promoting
`methodist-hospital-board` fails 2, `methodist-asian-outreach` fails 1, which
matches the table's new "1-2" row exactly.)

**Overstated rows**, both covered by their own todos — `:168` (English
collector, see 005) and `:166` (`related:` links, see 006) claim coverage the
tests do not provide.

**Duplicated counts.** `README.md:34` and `README.md:117` both hardcode the
test count. On `main` they disagreed — `# 89 tests` versus
`**96 tests across 12 files**`. This PR corrected both to 106/15, which is
accurate, but nothing prevents the next drift. `astro check — 66 files` at
`:35` is the same shape (currently accurate — verified: `Result (66 files)`).

## Proposed Solutions

**A. Fix `:157` and drop the duplicate at `:34`**, keeping `:117` as the single
authoritative statement. Effort: Small.

**B. Additionally, drop hardcoded counts entirely** in favor of "the suite" —
the table's value is the sabotage/result mapping, not the totals. Loses a
little specificity; removes a whole class of drift. Effort: Small.

**C. Generate the counts.** Overkill for a README. Not recommended.

## Recommended Action

_(blank — for triage)_

## Acceptance Criteria

- [ ] `:157` says 3.
- [ ] `:168` and `:166` describe what is actually guarded (after 005 and 006).
- [ ] The test count appears in at most one place.

## Work Log

- 2026-08-20 — Found during `/ce:review` of PR #18.

- 2026-08-20 — FIXED and negative-tested on `feat/methodist-hospital-service`.
  Watched the guard fail before trusting it; sabotage recorded in the README table.
