---
status: complete
priority: p1
issue_id: 006
tags: [code-review, verification, docs]
dependencies: [002]
---

# `related:` entries in relative form are never checked — including one in the repo now

## Problem Statement

`tests/docs/links.test.ts:32`

```ts
const RELATED = /^\s*-\s+((?:docs|src|scripts|tests)\/[^\s]+)\s*$/gm
```

The prefix allowlist requires a `related:` path to begin at the repo root. The
repo uses **two** forms, and only one is matched:

- `docs/solutions/research-issues/proving-a-negative-from-archives.md:34-35` —
  `- docs/solutions/...` → matched.
- `docs/solutions/security-issues/publishing-about-a-living-person.md:35` —
  `- ./../build-errors/verification-that-verifies-nothing.md` → **never matched**.

So a live `related:` entry in the repo is outside the guard today.

## Findings

Reported by review agent with a mutation: breaking the relative-form entry to
point at a non-existent file produced **no failure**, while breaking the
repo-root-form entry in the sibling doc failed correctly.

`README.md:166` claims *"typo a path in README or a `related:` entry | 1 test
fails, names the link"* — true for one of the two forms in use.

Filed p1 alongside 005 for the same reason: the README asserts coverage the
test does not provide, and a reader trusting the table will not re-derive it.

## Proposed Solutions

**A. Drop the prefix allowlist; exclude URLs instead.** (Recommended.)

```ts
const RELATED = /^\s*-\s+(?!https?:|mailto:)([^\s]+\.md)\s*$/gm
```

Catches both forms. Effort: Small. Risk: low — could newly match unrelated
frontmatter list items ending in `.md`; verify against current docs.

**B. Normalize the docs to one form** and keep the strict regex. Tidier data,
but leaves the guard brittle to the next person who writes the other form.

## Recommended Action

_(blank — for triage)_

## Technical Details

- `tests/docs/links.test.ts:32`, `:49-51`
- Interacts with 002 — both concern how a `related:` path should resolve.
  Fix together.

## Acceptance Criteria

- [ ] Breaking a relative-form `related:` entry fails the suite.
- [ ] Breaking a repo-root-form entry still fails.
- [ ] Negative-tested and the README row corrected.

## Work Log

- 2026-08-20 — Found during `/ce:review` of PR #18.

- 2026-08-20 — FIXED and negative-tested on `feat/methodist-hospital-service`.
  Watched the guard fail before trusting it; sabotage recorded in the README table.
