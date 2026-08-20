---
status: pending
priority: p2
issue_id: 003
tags: [code-review, privacy, verification]
dependencies: []
---

# Nothing enforces that `note` and `source` stay out of the built site

## Problem Statement

Two copy guards added in this PR deliberately look away from `note` and
`source`, on the stated grounds that those fields are internal prose:

> `tests/data/chinese-copy.test.ts:18-21` — "It deliberately reads the RENDERED
> fields only. `note` and `source` are internal prose and legitimately contain
> counter-examples — the note on `methodist-asian-outreach` names 衛理醫院
> precisely so nobody reintroduces it."

That reasoning is correct **only while those fields are genuinely never
rendered**, and no test asserts that. A single future `{fact.note}` added to a
component would publish the research methodology — and both copy suites are
written to not look.

This PR is the first time the notes carry material that would matter if it
escaped. `methodist-hospital-board`'s note contains the phrase
"PUBLISHED AGAINST A CONTRARY SEARCH", the full roster-by-roster search record,
and the assessment that the sibling committee fact is "the likelier body". That
is honest diligence for the repository and wrong for the page.

## Findings

Verified today, twice and independently:

1. No renderer touches those fields. `src/components/FactList.astro:40` reads
   `{locale === 'en' ? fact.en : fact.zhHant}`; `StructuredData.astro` uses
   fact **ids** as gates and emits literals.
2. Built the site with `SITE_URL` and `ALLOW_INDEXING=true` and grepped `dist/`:

       'CONTRARY SEARCH' -> 0   'ProPublica'  -> 0   'relayed 2026' -> 0
       'Form 990'        -> 0   'stated by Min Mey' -> 0
       'web.archive.org' -> 0   '衛理'         -> 0
       positive control: 'Min Mey Chang' -> 13 files

   The positive control matters: without it, seven zeros prove only that the
   grep ran.

So the property **holds today**. It is simply unguarded, and it is now
load-bearing.

## Proposed Solutions

**A. A build-output test: after `npm run build`, assert no `note` or `source`
substring from `facts.ts` appears in `dist/**/*.html`.** (Recommended.)
Tests the real property — what the public receives — rather than a proxy. Must
carry a positive control (assert a string that *should* be present is found),
or a broken reader passes silently. Downside: needs a build, so it is slower
than the rest of the suite and would want its own script or a CI-only step.
Effort: Medium. Risk: low.

**B. A source-level test: assert no component references `.note` or `.source`.**
Fast, no build, runs with the unit suite. Weaker: it greps for a pattern rather
than checking the output, and a component could render the field via a rename
or a spread. Effort: Small. Risk: low, coverage partial.

**C. Move the research notes out of `facts.ts` entirely**, into a sibling doc
under `docs/`, leaving a pointer. Removes the hazard at the root rather than
guarding it. But it separates the evidence from the claim, which is exactly
what `testimony-vs-absent-record` says not to do — whoever revisits the fact
should find the afternoon's work attached to it. Effort: Medium. Risk: high to
the project's own documentation discipline.

## Recommended Action

_(blank — for triage)_

## Technical Details

- `src/data/facts.ts:203-224` — the two hospital facts and their notes.
- `src/components/FactList.astro:40` — the only fact renderer.
- `tests/data/chinese-copy.test.ts:18-21`, `tests/data/english-copy.test.ts:21-22`
  — the two suites that deliberately skip these fields.

## Acceptance Criteria

- [ ] Adding `{fact.note}` to a rendered component fails a test.
- [ ] The test carries a positive control that fails if the reader is broken.
- [ ] Negative-tested by doing exactly that and watching it go red; recorded in
      the README sabotage table.

## Work Log

- 2026-08-20 — Raised during `/ce:review` of PR #18. Confirmed the fields do not
  currently render, by build and grep with a positive control.

## Resources

- PR: https://github.com/thirstypig/minmeychang/pull/18
- `docs/solutions/security-issues/publishing-about-a-living-person.md`
