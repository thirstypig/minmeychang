---
status: complete
priority: p1
issue_id: 007
tags: [code-review, privacy, working-tree]
dependencies: []
---

# Raw photos carrying GPS sit in the repo root, untracked and NOT gitignored

## Problem Statement

Fourteen original photographs and one PNG were placed in the repository root
during this session. `.gitignore` protects `src-photos/` and `src-documents/`
(lines 13-14) but **not the repo root**, so `git status` lists them as `??` —
untracked and stageable. A `git add -A` or `git add .` commits them.

This repo is public.

## Findings

GPS swept across every dropped file:

    IMG_3187.JPG   -> 34.08010833333334, -118.084825
    IMG_0308.HEIC  -> 34.06939716666667, -118.0636833333333

Both coordinates fall in Arcadia, California. The remaining files carry no
location data. `git check-ignore` confirms they are not ignored.

`docs/solutions/security-issues/publishing-about-a-living-person.md` is the
document this project wrote about exactly this class of mistake, and
`scripts/ingest-photos.mjs` exists to strip metadata before anything is
committed. The originals must go through it rather than being copied in.

The script's own warning also applies and is not automatable:

> it cannot see a home address on a certificate, a phone number on a program,
> or a face whose owner has not agreed to appear.

## Proposed Solutions

**A. Move the originals into `src-photos/`, run `npm run photos`, commit only
the derived output.** (Recommended.) This is the workflow the repo already
documents and tools. Effort: Small. Risk: low.

**B. Also add a belt-and-braces `.gitignore` rule** for `*.JPG/*.JPEG/*.HEIC`
at the repo root, so a stray drop is never stageable. Cheap, and this incident
is the argument for it. Effort: Small.

**C. Add a guard test** asserting no file under `public/archive/` carries GPS
or camera-make metadata. Turns a convention into something that fails loudly.
Effort: Medium.

## Recommended Action

_(blank — for triage)_

## Technical Details

- `.gitignore:8-14` — protects `src-photos/`, `src-documents/`, not the root.
- `scripts/ingest-photos.mjs` — strips metadata; reads `src-photos/`.
- Files: `IMG_3187.JPG`, `IMG_0308.HEIC`, `18 2.JPG` … `24 2.JPG`,
  `Crab Fishing.JPEG`, `Parents and young Jimmy.JPEG`,
  `Parents in San Francisco.JPEG`, `KJFLE1015.JPEG`,
  `4D7CCE54-….JPEG`, `minmeychangchop.png`.

## Acceptance Criteria

- [ ] No original photograph is tracked by git.
- [ ] Every published derivative is free of GPS and camera metadata, verified
      by reading the output rather than trusting the script's exit code.
- [ ] Each image looked at by a person before commit.

## Work Log

- 2026-08-20 — Found during `/ce:review` when the files appeared mid-session.

- 2026-08-20 — RESOLVED. Originals moved to `src-photos/` and `src-logos/`,
  both gitignored; confirmed with `git check-ignore`. Twelve were run through
  `npm run photos`; only the stripped derivatives under `public/archive/` are
  committed. Verified the two GPS-bearing files independently with `mdls`
  rather than trusting the script's own check, using the untouched originals
  as a positive control to prove `mdls` reads these files at all. Two clippings
  showing children's faces and names were held back entirely — see the open
  question in the PR.
