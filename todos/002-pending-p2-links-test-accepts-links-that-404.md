---
status: pending
priority: p2
issue_id: 002
tags: [code-review, verification, docs, false-negative]
dependencies: []
---

# `links.test.ts` passes links that 404 on GitHub

## Problem Statement

`tests/docs/links.test.ts` resolves each relative link **two ways** and passes
if *either* succeeds:

```ts
const fromRepoRoot = resolve(target)
const fromDocDir = resolve(dirname(file), target)
return !existsSync(fromRepoRoot) && !existsSync(fromDocDir)
```

GitHub only ever resolves a markdown link relative to the containing file's
directory. So a repo-root-style link written inside a nested doc — the exact
mistake a person makes after copying a path out of README — resolves from the
repo root, passes the test, and **404s for every reader**.

The test's own docstring says the first person to find a dead link is a
stranger. This is the case where that still happens with the guard green.

## Findings

Proven, not theorized. I wrote `docs/superpowers/specs/zz-probe.md` containing:

    See [the verification doc](docs/solutions/build-errors/verification-that-verifies-nothing.md).

- GitHub would resolve that to
  `docs/superpowers/specs/docs/solutions/build-errors/verification-that-verifies-nothing.md`,
  which does not exist → 404.
- `npx vitest run tests/docs/links.test.ts` → **2 passed**.

The probe file was removed afterwards; the tree is clean.

No live instance exists today — every doc-internal link currently uses a `../`
form, and the two repo-root-style paths are `related:` frontmatter entries,
which are not clickable links and for which repo-root resolution is correct.
So this is a latent hole, not a present breakage. It is filed as p2 rather than
p3 because the guard's value is entirely in catching the mistake nobody
noticed, and this is that mistake.

## Proposed Solutions

**A. Resolve `[text](path)` links doc-relative only; keep repo-root resolution
for `related:` entries alone.** (Recommended.)
Matches how each syntax is actually consumed: GitHub renders the markdown link,
a human reads the frontmatter path from the repo root. The two cases are
already collected separately in `relativeLinks()`, so this is a matter of
tagging each `Link` with its kind and branching. Effort: Small. Risk: low —
would need a check that no existing README link breaks under the stricter rule
(README sits at the repo root, so doc-relative and repo-root coincide there).

**B. Keep dual resolution but warn when only the repo-root form resolves.**
Non-breaking, surfaces the ambiguity without failing the build. But a warning
in a test run nobody reads is not a guard. Effort: Small. Risk: low, value low.

**C. Leave it, and document the hole** the way the case-sensitivity limitation
is already documented (see 003). Honest, and costs nothing. But this hole is
cheap to actually close, unlike the case one. Effort: none.

## Recommended Action

_(blank — for triage)_

## Technical Details

- `tests/docs/links.test.ts:76-84` — the dual-resolution filter.
- `tests/docs/links.test.ts:38-48` — `relativeLinks()`, where `LINK` and
  `RELATED` matches are already distinguishable and then flattened into one
  shape.
- Note `resolve(target)` resolves against `process.cwd()`, which is the repo
  root only because vitest is run from there.

## Acceptance Criteria

- [ ] A repo-root-style `[text](docs/...)` link inside a nested doc fails.
- [ ] All existing links still pass.
- [ ] `related:` frontmatter entries still resolve from the repo root.
- [ ] Negative-tested by re-running the probe above; add it to the README
      sabotage table.

## Work Log

- 2026-08-20 — Found and proven during `/ce:review` of PR #18 with a temporary
  probe file, since removed.

## Resources

- PR: https://github.com/thirstypig/minmeychang/pull/18
- `docs/solutions/build-errors/verification-that-verifies-nothing.md`
