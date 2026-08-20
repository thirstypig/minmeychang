---
status: pending
priority: p2
issue_id: 001
tags: [code-review, ci, verification]
dependencies: []
---

# The 106 tests never run on a pull request

## Problem Statement

`.github/workflows/deploy.yml` is the only workflow, and it triggers on
`push: branches: [main]` and `workflow_dispatch`. Nothing runs on
`pull_request`. Typecheck, the 106-test suite, and the build therefore execute
only **after** a merge, as the first act of the deploy.

This PR adds four guards whose entire purpose is to block a regression. On a
PR, they block nothing.

## Findings

Verified on this branch, asserting on output rather than exit codes:

    gh pr view 18 --json statusCheckRollup -q '.statusCheckRollup | length'   -> 0
    gh run list --branch feat/methodist-hospital-service --json databaseId -q length -> 0

Zero checks, zero runs, ever, for this branch.

The failure mode is not "a bad merge is caught late" — it is that a bad merge
**breaks `main` and fails the deploy**, so the site stops updating and the
signal arrives detached from the change that caused it. This repo has already
lived the version of this problem where CI reported green for fourteen deploys
while checking nothing (`docs/solutions/build-errors/verification-that-verifies-nothing.md`).
A guard that runs only post-merge is a milder shape of the same thing: the
review checkpoint reports nothing about the code under review.

This matters more here than in most repos because the PR *is* the review
checkpoint — see the project's own branch → PR → merge convention.

## Proposed Solutions

**A. Add `pull_request` to the existing workflow's triggers.**
Cheapest possible change. But `deploy.yml` also uploads a Pages artifact and
runs a `deploy` job; triggering the whole thing on a PR would attempt a deploy
from a branch. Would need job-level `if: github.event_name == 'push'` on
`deploy`. Effort: Small. Risk: medium — easy to get the guard condition wrong
and deploy from a PR.

**B. Split a `ci.yml` that runs typecheck + test + build on `pull_request`,
leaving `deploy.yml` to deploy on `main`.** (Recommended.)
Clean separation: one workflow answers "is this correct?", the other "ship it".
The typecheck step's `grep -q 'Result ('` assertion should be copied verbatim —
it is the thing that makes the step honest. Effort: Small. Risk: low.

**C. Leave as is and rely on running `npm test` locally.**
This is the status quo, and it is what happened for this PR — the suite was run
by hand. It works right up until it doesn't, and it does not survive a
contributor who is not you. Effort: none. Risk: high.

## Recommended Action

_(blank — for triage)_

## Technical Details

- `.github/workflows/deploy.yml` — triggers at lines 3–6; `build` job runs
  typecheck/test/build; `deploy` job needs `build`.
- Branch protection is not currently requiring any check (there are none to
  require). If a `ci.yml` lands, consider requiring it on `main`.

## Acceptance Criteria

- [ ] Opening a PR produces at least one check run.
- [ ] The check runs typecheck, `npm test`, and `npm run build`.
- [ ] The typecheck step still asserts on `astro check`'s own `Result (` line.
- [ ] No deploy is attempted from a pull-request event.
- [ ] Negative-tested: push a commit that breaks one test, confirm the PR check
      goes red **before** merge. Record the sabotage in the README table.

## Work Log

- 2026-08-20 — Found during `/ce:review` of PR #18. Confirmed zero checks and
  zero workflow runs for the branch.

## Resources

- PR: https://github.com/thirstypig/minmeychang/pull/18
- `docs/solutions/build-errors/verification-that-verifies-nothing.md`
