---
status: complete
priority: p3
issue_id: 012
tags: [code-review, privacy, docs]
dependencies: []
---

# The new research doc names living third parties whose identities are not load-bearing

## Problem Statement

`docs/solutions/research-issues/proving-a-negative-from-archives.md` reproduces
material from archived hospital rosters in a public repository:

- `:160-162` — a 2019 Foundation board roster verbatim: `Chair: <name>`,
  four more names
- `:201` — six surnames used as grep positive controls: six surnames
- `:227-228` — the `bio_<initial><surname>.aspx` slug pattern, and "39 board
  members"

Five to eleven identifiable living people, several from the subject's own
community, named in the context of a failed search for someone else.

## Findings

The source is a public archived roster, so this is republication rather than
new exposure, and the doc says nothing adverse about anyone. Severity is
genuinely low.

But their identities carry none of the doc's meaning. The finding at :160 is
*"the roster sat below the nav in the tag-stripped text"* — it reads identically
as `Chair: [name]` plus "four more names". The positive-control point at :201
reads identically as "six surnames known to be on the page".

The project's own threat model frames the concern precisely
(`docs/solutions/security-issues/publishing-about-a-living-person.md:231`):
the case that matters is where the person harmed is from the subject's own
community.

## Proposed Solutions

**A. Redact the names, keep the structure.** (Recommended.) `Chair: [name]`,
"six surnames from the page". Preserves every methodological point. Effort:
Small. Risk: none.

**B. Leave as is**, on the grounds that the rosters are public. Defensible;
costs nothing until someone objects.

## Recommended Action

Option A, done 2026-11-08.

## Acceptance Criteria

- [x] Either the names are gone, or a decision to keep them is recorded.
- [x] Every methodological finding still reads correctly after any redaction.

## Work Log

- 2026-08-20 — Found by review agent during `/ce:review` of PR #18.
- 2026-11-08 — Option A. Roster names at :160-162 and the six control surnames
  at :201 replaced with placeholders, with a line saying why; the slug pattern
  and the count of 39 carry no names and stay. This file repeated the same
  names and was redacted too. Note: git history still holds them (a force-push
  does not remove commits from GitHub); rewriting history was judged
  disproportionate for republished public-roster names.
