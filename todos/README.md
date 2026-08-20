# Findings

One file per finding, from `/ce:review`. The `file-todos` skill is not installed
in this workspace, so the convention is kept here instead.

    {id}-{status}-{priority}-{slug}.md

`status`: `pending` (needs a decision) → `ready` (approved) → `complete`.
`priority`: `p1` blocks merge · `p2` should fix · `p3` nice to have.

Rename the file as the status changes; the name is the index.

**House rule, inherited from `docs/solutions/build-errors/verification-that-verifies-nothing.md`:**
a finding here is only worth acting on if someone watched it happen. Each file
records how it was proven, or says plainly that it was not.
