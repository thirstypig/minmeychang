---
title: 'Verification that verifies nothing — nine tools that reported success for work they never did'
date: 2026-08-05
category: build-errors
problem_type: silent_verification_failure
component: ci-pipeline / dns-migration / test-suite / shell-tooling
severity: critical
symptoms:
  - 'CI reports a green typecheck on every deploy while never running one'
  - 'astro check prints a missing-dependency error and exits 0'
  - 'a test suite passes 18/18 while its central assertion is logically unfalsifiable'
  - 'curl returns 200 with a valid TLS certificate from the wrong server entirely'
  - 'dig answers confidently about a record type it cannot query'
  - 'git push --force reports success while deleting nothing'
  - 'git push exits without pushing and prints only a hint'
  - 'gh run watch exits 0 for a deploy that has not started'
  - 'grep -c reports 1 where the true count is 6'
  - 'a build emits CSS and passes its own guard with zero compiled utilities'
stack:
  - Astro 7
  - Vitest 4
  - GitHub Actions
  - GitHub Pages
  - BIND dig 9.10.6 (macOS system)
  - curl
  - git
  - gh CLI
time_to_diagnose: 'each instance 2-20 minutes once suspected; the typecheck ran unverified for 14 consecutive deploys before anyone looked'
recurrence_risk: 'high — every instance was green-on-green, and none produced a warning of any kind'
tags:
  - silent-failure
  - false-positive
  - ci-verification
  - vacuous-test
  - dns-migration
  - exit-code-zero
  - toolchain-lies
related:
  - https://github.com/thirstypig/shengchangmd/blob/main/docs/solutions/integration-issues/tailwind-v4-astro-silently-uncompiled.md
  - ../verification-issues/batched-image-reads-misattribute-content.md
---

# Verification that verifies nothing

## The pattern

Over one working session on `minmeychang`, **nine separate tools reported success
for an operation they had not performed.** None emitted a warning. Every one
returned exit code 0 or a 200. Several were themselves the guards installed to
catch other failures.

The unifying shape:

> **A tool answered a question that was never asked, and the answer looked like
> the answer to the question that was.**

This document exists because the individual fixes are cheap and the pattern is
expensive. Recognizing the shape is what compounds.

---

## The nine instances

### 1. The CI typecheck that never ran (headline)

**Symptom.** Fourteen consecutive deploys reported a green `Typecheck` step.

**Reality.** From the CI log:

```
[ERROR] [check] The `@astrojs/check` and `typescript` packages are required
        for this command to work. Please manually install them...
To continue, Astro requires the following dependency to be installed:
        @astrojs/check. Packages cannot be installed automatically in CI.
```

`npx astro check` prints that and **exits 0**. The workflow proceeds to the next
step. GitHub renders a green tick.

**What it hid.** Four real type errors across 52 files, including a
`vitest.config.ts` that had never compiled.

**Fix — two parts, and the second is the important one:**

```yaml
- name: Typecheck
  run: |
    set -o pipefail
    npx astro check --minimumSeverity error 2>&1 | tee /tmp/astro-check.log
    grep -q 'Result (' /tmp/astro-check.log || {
      echo "::error::astro check did not run — see log above"
      exit 1
    }
```

Installing `@astrojs/check` + `typescript` as devDependencies fixes it *today*.
The `grep` fixes it *permanently*: `astro check` only prints `Result (N files)`
when it actually ran, so the assertion fails loudly the moment the dependency
disappears again.

> **Generalisable rule:** when a tool can no-op, assert on its *output*, not on
> its exit code.

---

### 2. The test that could not fail

A provenance guard read:

```ts
// facts.ts
export const renderableFacts = confirmedFacts.filter(f => f.status !== 'unverified')
```

```ts
// facts.test.ts
it('no unverified fact is renderable', () => {
  for (const fact of renderableFacts) expect(fact.status).not.toBe('unverified')
})
```

`confirmedFacts` **contains no unverified facts by construction.** The filter
could never remove anything, so the assertion could never fail. Sabotaging the
filter to `() => true` left all 18 tests green.

**Fix.** Derive from the union, so `status` is what actually decides:

```ts
export const renderableFacts = [...confirmedFacts, ...pendingFacts]
  .filter(f => f.status !== 'unverified')
```

The same sabotage now fails 3 tests. A further test asserts the derivation
itself, so the guard cannot quietly go vacuous again.

> **Generalisable rule:** a test you have never seen fail is a hypothesis, not a
> test. Break the thing on purpose and watch it fail before you trust it.

---

### 3. `curl` returning 200 from the wrong server

After an apex-domain migration, DNS was verified correct at `8.8.8.8` and
`1.1.1.1`. Then:

```
$ curl -sS -o /dev/null -w "%{http_code}" https://minmeychang.com/
200
```

That 200 came from **Squarespace's parking page**, over Squarespace's own valid
certificate. The local macOS resolver still held the pre-migration IPs on their
original 4-hour TTL. Two 200s and a valid cert, all of it the wrong site.

**The tells:**

```bash
curl -o /dev/null -w "connected to: %{remote_ip}\n" https://minmeychang.com/
curl -sSI https://minmeychang.com/ | grep -i '^server:'
```

**Fix — bypass the resolver entirely:**

```bash
curl --resolve minmeychang.com:443:185.199.108.153 https://minmeychang.com/
```

> **Generalisable rule:** a status code says nothing about *which* server
> answered. During any DNS migration, verify with `--resolve` against the target
> IP, never against whatever the local resolver believes.

---

### 4. `dig` answering a question it never asked

Checking for an RFC 9460 `HTTPS` record:

```
$ dig @nsd3.squarespacedns.com minmeychang.com HTTPS +noall +answer
;; QUESTION SECTION:
;minmeychang.com.    IN  A          <-- note: A, not HTTPS
minmeychang.com. 14400 IN A 185.199.111.153
```

macOS ships BIND **9.10.6**, which predates RFC 9460. Given an unknown type it
**silently downgrades to `A`** and answers confidently. The output looked like a
positive finding; it was an artifact of the tool.

**Fix — query by numeric type, which old dig handles correctly:**

```bash
dig -t TYPE65 minmeychang.com        # HTTPS/SVCB is type 65
```

> **Generalisable rule:** read the QUESTION SECTION. If it does not echo the
> type you asked for, the answer is about something else.

---

### 5. `git push --force` deleting nothing

An early commit contained unreviewed personal material and had been pushed to a
public repo. History was rewritten via an orphan branch and force-pushed. `main`
became clean.

**The old commit remained fully fetchable:**

```bash
gh api "repos/OWNER/REPO/contents/src/data/facts.ts?ref=c14acf4" --jq '.size'
# 6548
```

Force-push **moves a branch ref. It deletes nothing.** GitHub retains
unreachable objects and serves them by SHA indefinitely, via both the API and
the web UI.

**Fix.** Only deleting the repository destroys the objects — and only when it
has **0 forks**, since forks place objects in a shared network that is never
garbage-collected.

> **Generalisable rule:** rewriting history does not unpublish anything. Treat a
> pushed secret as disclosed.

---

### 6. `git push` that pushed nothing

After the orphan-branch rename, upstream tracking was gone:

```
$ git push
upstream, see 'push.autoSetupRemote' in 'git help config'
```

No error, no non-zero exit visible in the pipeline — just a hint. The commit
existed locally and nowhere else.

**Fix.** Compare local and remote explicitly rather than trusting the push:

```bash
echo "local:  $(git rev-parse --short HEAD)"
echo "remote: $(gh api repos/OWNER/REPO/commits/main --jq '.sha[0:7]')"
```

---

### 7. `gh run watch` watching the wrong run

```bash
gh run list --limit 1 --json databaseId --jq '.[0].databaseId' | xargs gh run watch
```

Executed immediately after `git push`, this selects the **previous, already-
completed** run — GitHub has not created the new one yet — and `watch` returns
success instantly for a deploy that has not started. Reported `deploy exit: 0`
against stale content.

**Fix — select by commit, not by recency:**

```bash
SHA=$(git rev-parse HEAD)
RUN=$(gh run list --limit 10 --json databaseId,headSha \
      --jq ".[] | select(.headSha==\"$SHA\") | .databaseId" | head -1)
gh run watch "$RUN" --exit-status
```

> **Generalisable rule:** never identify an async job by "most recent". Race the
> creation and you verify the wrong thing.

---

### 8. `grep -c` on minified HTML

```bash
grep -c 'youtube.com/watch' dist/talks/index.html   # 1
```

The true count was **6**. `grep -c` counts *matching lines*, and minified HTML
is one line. Nearly filed as a rendering bug.

**Fix:**

```bash
grep -o 'youtube.com/watch' dist/talks/index.html | wc -l   # 6
```

The same class caught a second time: `grep '@font-face{...\[lang^="zh"\]'`
found nothing because the minifier had stripped the quotes to `[lang^=zh]`. The
CSS was correct; the check was not.

---

### 9. The green build with zero CSS (prior art)

Documented in the sibling project: an entire session reported
`Lighthouse 100/100/100/100` and "production ready" for a site rendering with
**zero compiled CSS**, because Tailwind had never been wired into Astro. A
missing plugin does not error — utility classes simply do nothing.

See [`shengchangmd` / `tailwind-v4-astro-silently-uncompiled.md`](https://github.com/thirstypig/shengchangmd/blob/main/docs/solutions/integration-issues/tailwind-v4-astro-silently-uncompiled.md).

The guard written in response, `scripts/verify-css.mjs`, asserts on Preflight's
reset **and** on generated utilities — because checking that a `.css` file
merely *exists* passes even when Tailwind never ran.

---

## Prevention

### 1. Negative-test every guard

A guard that has never failed is unverified. This project now has four, each
verified by deliberate sabotage:

| Guard | Sabotage | Expected |
|---|---|---|
| `verify-css.mjs` | empty the compiled stylesheet | exit 1 |
| fact provenance | filter to `() => true` | 3 tests fail |
| font coverage | drop a glyph from the manifest | 2 tests fail, names the glyph |
| CI typecheck | remove `@astrojs/check` | step fails on missing `Result (` |

Add the sabotage to the commit message or a test. Future readers need to know
the guard was proven, not merely written.

### 2. Assert on output, not exit codes

Any tool that can no-op needs an assertion on evidence it actually ran.

### 3. Verify against the invariant, not against your diff

Grepping for the strings you just fixed proves only that you fixed them. Search
for the *shape* of the defect.

### 4. Prefer identifiers over recency

Select CI runs by SHA, DNS answers by explicit IP, elements by `ref` rather than
pixel coordinate. (Pixel-coordinate browser clicks silently did nothing twice in
this session while reporting success; clicking by element reference worked first
try.)

### 5. When a check is cheap, run the inverse

`grep -c` vs `grep -o | wc -l`. `dig TYPE` vs `dig -t TYPEnn`. `curl` vs
`curl --resolve`. Two cheap checks that disagree is a finding.

---

## Quick reference

```bash
# Which server actually answered?
curl -o /dev/null -w "%{remote_ip}\n" https://HOST/
curl -sSI https://HOST/ | grep -i '^server:'
curl --resolve HOST:443:TARGET_IP https://HOST/

# Did dig ask what I think it asked?
dig HOST TYPE +noall +answer   # read the QUESTION SECTION
dig -t TYPE65 HOST             # HTTPS/SVCB on old dig

# Did the push land?
[ "$(git rev-parse HEAD)" = "$(gh api repos/O/R/commits/main --jq .sha)" ] \
  && echo in-sync || echo NOT PUSHED

# Watch the right run
SHA=$(git rev-parse HEAD)
gh run list --limit 10 --json databaseId,headSha \
  --jq ".[] | select(.headSha==\"$SHA\") | .databaseId" | head -1

# Count occurrences, not lines
grep -o 'PATTERN' file | wc -l
```

---

## Cost

Nine instances. The typecheck alone ran unverified for **14 consecutive
deploys**. Every one was green-on-green; not one produced a warning. The
expensive part was never the fix — it was the interval during which work was
built on top of a false green.
