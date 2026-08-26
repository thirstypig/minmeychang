---
title: 'Batched image reads silently misattribute photo content to the wrong filename'
date: 2026-08-25
category: verification-issues
problem_type: batch_recall_misattribution
component: photo-archive-ingest / multimodal-tool-batching
severity: critical
symptoms:
  - 'a caption describes a real photo, just not the one at that asset path'
  - 'an address-redaction target and a harmless photo appear to have swapped identities'
  - 'a bulk visual-description report is internally plausible end to end, and still wrong'
  - 're-verifying in smaller batches (4-5 images) still produces a wrong mapping'
  - 'the error is only found by chance, when a later independent look does not match'
stack:
  - Claude Code
  - multimodal Read tool (parallel invocation)
  - sharp / npm run photos ingest pipeline
time_to_diagnose: '~40 minutes across two separate discoveries in one session; each triggered by an unrelated later observation, not a targeted check'
recurrence_risk: 'high — happened twice independently in the same session, at two different batch sizes (9-10 images, then again at 4-5)'
tags:
  - batch-processing
  - multimodal
  - misattribution
  - photo-archive
  - privacy
  - redaction
  - silent-failure
related:
  - ../build-errors/verification-that-verifies-nothing.md
  - ../security-issues/publishing-about-a-living-person.md
---

# Batched image reads silently misattribute photo content to the wrong filename

## The pattern

While processing a 134-photo family archive (captioning, redacting addresses,
categorizing), photo content got attached to the wrong filename **three
separate times** in one session, at two different mechanisms:

1. **A subagent's bulk report was wrong throughout.** A fork was asked to
   view 87 images and return a table of `filename | description | caption`.
   The table was well-formed, every description was a plausible caption for
   *some* photo in the batch — and the filename-to-content mapping was wrong
   almost everywhere. It was caught only by chance: two specific files
   (flagged as containing home addresses) were spot-checked before redacting
   them, and neither showed what the report claimed.

2. **My own batched `Read` calls drifted mid-batch.** After discarding the
   subagent's report, I re-verified by issuing 9-10 `Read` calls at once and
   writing notes from the combined result. This *also* drifted — starting
   partway through one such batch, my notes described image N's content
   under image N+1's filename (or similar), for about 4-5 consecutive items,
   then self-corrected. Caught only because a later caption ("mountain
   overlook") didn't match what actually rendered under that path.

3. **Even a small-batch re-check reproduced it.** Re-verifying the same
   stretch in batches of 4-5 images — deliberately shrunk to be "safe" —
   *still* swapped two adjacent items (a banquet photo and a scenic-overlook
   photo traded places). Single-file `Read` calls, one at a time, were the
   only method that did not reproduce the error anywhere it was tried.

The unifying shape:

> **A multi-image tool result gets narrated from memory, and the
> correspondence between "this filename" and "this image's content" silently
> drifts — usually near the tail of the batch — while every individual
> description stays plausible on its own.**

This is not one tool lying (see
[`verification-that-verifies-nothing.md`](../build-errors/verification-that-verifies-nothing.md)
for that family of bug). It is the same *shape* of problem — a check that
looks like it covers the thing it claims to cover, and doesn't — but the
failure lives in cross-image recall over a long batched result, not in a
single tool's exit code.

## Why this mattered here

The archive included scanned letters with home addresses and a newspaper
clipping naming minor children. The task was to find those specific files
and redact or handle them correctly. A wrong filename-to-content mapping at
that step means either:

- redacting the wrong (harmless) file while a sensitive one ships untouched, or
- confidently reporting "no sensitive content found" because the mapping put
  the address letter under a filename that was never checked.

Neither failure would have looked like a failure. The pipeline's own
guards (EXIF/GPS stripping, the `npm run photos` metadata assertion) do not
protect against this at all — they check the *image bytes*, not whether the
right bytes got the right caption.

## Detection

The only reliable method found in this session: **read one image at a time,
and record what it shows before requesting the next one.** No batch size
above one was safe — 9-10 drifted, 4-5 drifted, only 1 was clean.

When a mismatch is found:

- **Do not assume the file changed.** Assume the earlier attribution was
  wrong, and re-verify every item from that same batch, not just the one
  that looked off. In this session, finding one wrong file in a batch of 9
  predicted (correctly) that 4 more nearby items in that batch were also
  wrong.
- **Regenerate from source rather than patching the derived file in place.**
  The original camera files were still sitting in gitignored `src-photos/`,
  so recovery was "re-decode the originals, re-`Read` them one at a time,
  re-derive the output" — not an attempt to guess which of two already-
  mislabeled derived files was the real one.

## Prevention

1. **Never trust a multi-image batched result for anything where
   file-identity carries a consequence** — redaction targets, consent
   decisions, legal/privacy-sensitive attribution. Verify those one file at
   a time before acting, even if it is slower.
2. **Treat any bulk visual-description report — a subagent's or your own —
   as a draft**, not ground truth, until a handful of entries are
   independently re-checked against the actual files. A report that is
   internally consistent is not evidence it is correct; this one was
   consistent and wrong.
3. **When one item in a batch is wrong, re-audit the whole batch it came
   from.** The errors clustered rather than appearing as isolated one-offs.
4. **Keep the untouched originals until final verification is done.** The
   only reason this was fully recoverable was that nothing had been deleted
   yet — the gitignored `src-photos/` originals let every mislabeled file be
   regenerated and re-checked from scratch rather than reasoned about after
   the fact.

## Cost

134 photos processed; misattribution found and fixed at three points across
two independent verification passes, all before anything was committed or
published. Nothing shipped incorrectly captioned or incorrectly redacted —
but only because a stray visual mismatch was noticed each time, not because
any check was designed to catch this class of error.
