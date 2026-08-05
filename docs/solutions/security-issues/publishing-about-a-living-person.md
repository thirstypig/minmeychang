---
title: 'Publishing a site about a living private person — the naming, sourcing and consent failures that nearly shipped'
date: 2026-08-05
category: security-issues
problem_type: privacy_and_provenance
component: content-pipeline / photo-ingest / research
severity: high
symptoms:
  - 'every web search for the subject returns strangers with similar names'
  - 'a guessed Chinese name is wrong in two independent ways at once'
  - 'award certificates publish a former home address in calligraphy'
  - 'iPhone photographs of documents carry the house GPS coordinates'
  - 'school photographs contain identifiable minors whose parents never consented'
  - 'unreviewed biographical claims are committed to a public repository'
  - 'force-pushing the commit away leaves it fetchable by SHA'
  - 'a superlative with no source sits on a page about a real person'
  - 'structured data repeats claims the page itself refuses to render'
stack:
  - Astro 7
  - sharp / libvips
  - GitHub Pages
  - macOS sips
time_to_diagnose: 'the naming problem cost three failed research rounds; every privacy gate was caught before publication except one, which shipped and required history rewriting'
recurrence_risk: 'certain — five sibling projects in this workspace are personal sites about real people'
tags:
  - privacy
  - consent
  - exif-gps
  - chinese-names
  - provenance
  - living-subject
  - public-repository
  - nominative-fair-use
related:
  - ./../build-errors/verification-that-verifies-nothing.md
  - https://github.com/thirstypig/shengchangmd
---

# Publishing about a living private person

A tribute site for one's mother sounds like the least risky thing an engineer
can build. It is not. Over one session this project came within a commit of
publishing a home address, a set of GPS coordinates, a child's face, and a
biography nobody had checked.

None of it was carelessness in the ordinary sense. Each near-miss came from a
reasonable default that happens to be wrong when the subject is **alive,
private, and not the person typing.**

This matters here beyond one site: `shengchangmd`, `tobinchang`, `jarrenchang`,
`rhyschang` and `theresewhite.com` are all personal sites about real people.

---

## 1. The name you can search is not the name

**The subject's Chinese name is 張馬敏妹.** The obvious guess from "Min Mey
Chang" is `張敏梅`. That guess is wrong in two independent ways:

| | Guess | Actual |
|---|---|---|
| Given name | 敏**梅** | 敏**妹** |
| Structure | 張 + given | 張 + **馬** + given |

The four-character form is **冠夫姓**: husband's surname 張, then **her own
maiden surname 馬**, then the given name. That middle character is **not
recoverable from the anglicised name by any amount of searching**, and it is
common for Taiwanese women of that generation.

### What this cost

Three rounds of research returned nothing, because they searched a name that
does not exist. Worse, the failure was *silent* — searches returned plausible
results about other people rather than an error.

### The rule

> **Never guess a Chinese name. Ask.** An anglicised name is lossy in a way
> that cannot be reversed, and a wrong character on a page about a person is
> the worst class of error a biographical site can make.

The sibling project `shengchangmd` shipped an invented Chinese name for the
doctor before this rule existed. That is why it exists.

### The second-order finding

Once the correct name was known, searching **still failed.** A search for
`張馬敏妹` returns Hong Kong actresses named 張敏. `"Minmey Chang"` returns
nothing relevant.

Yet substantial coverage exists — Merit Times, Epoch Times, the Taiwanese
American Archives, BLIA Los Angeles. **General search engines do not surface
Chinese-language community media.** Every source on the finished site came from
the family, not from research.

> **Corollary:** for a subject in a diaspora community, absence of search
> results is not evidence of absence. Ask the family for links before
> concluding the record is thin.

---

## 2. A provenance ladder, with a render gate

Every factual claim carries a status, and the status decides whether it renders:

```ts
export type FactStatus = 'confirmed' | 'family' | 'unverified'
//   'confirmed'  — primary source or independent attestation; `source` names it
//   'family'     — stated directly by the family; `source` dates it
//   'unverified' — drafted but unchecked. DOES NOT RENDER.
```

The design goal is one sentence:

> **The failure mode must be an incomplete page, never a wrong one.**

An unanswered question renders as absence. This makes the site publishable at
any level of completeness, which matters when the subject is alive and the
answers arrive over weeks.

### Facts move up the ladder

Over one day, four facts moved `family → confirmed` when the family supplied
links. One example, from `la.blia.org`:

> 亞市分會是在**1994年**由開山祖師星雲大師親臨佈達主持成立儀式…**創會會長張馬敏妹督導**

That single sentence resolved a founding year, confirmed a title that had been
a guess (督導), and closed an open question.

### Two traps

**The gate can go vacuous.** `renderableFacts` originally filtered
`confirmedFacts` — an array that contains no unverified facts by construction —
so the guard could never fail. See
[`verification-that-verifies-nothing`](./../build-errors/verification-that-verifies-nothing.md).

**Enriched facts can become invisible.** Two facts were upgraded with new
detail (1994, 星雲大師, 2016–17) but were *owned* by a summary list that renders
only a short role string. The improvement shipped and displayed nothing. If a
fact has two renderers, enriching one does not enrich the page.

---

## 3. Privacy gates, all of them exercised

Every one of these fired on real material.

### GPS in photographs of documents

Two award certificates were photographed on an iPhone **at the house**:

```
kMDItemLatitude  = 34.15xxxxxxxxxxxx      <- redacted; the real values
kMDItemLongitude = -118.06xxxxxxx            resolve to the family's home
```

*(Those digits are redacted here for the same reason the photographs were
processed. An earlier draft of this very document printed them in full — the
write-up about not publishing coordinates was publishing coordinates. Caught by
grepping the doc before committing, which is now a step in the checklist below.)*

Publishing them unprocessed publishes the family's home coordinates. The
counter-intuitive part: these were photos of *paper*, which feels like scanning,
not photography.

**Strip and then assert.** Omitting `.withMetadata()` in sharp is the strip;
checking afterwards is what makes it true:

```js
const meta = await sharp(out).metadata()
if (meta.exif || meta.gps || meta.xmp) { /* fail loudly */ }
```

### Addresses printed on the artefact itself

Both certificates print a former home address in calligraphy — **two different
addresses, because the family moved between the awards.** No metadata strip
touches ink on paper.

Redact with an **opaque bar, not a blur**. Gaussian blur over large legible text
is frequently recoverable, and a bar is honest that something was removed.
Redaction coordinates are estimates, so **look at the output before committing.**

### Faces of children

School photographs supplied by the family showed identifiable students.

> **Copyright is not consent.** Owning the photograph settles who may copy it.
> It does not settle whether the people in it agreed to appear on a public,
> search-indexed site. Those parents agreed to a photo at a graduation ceremony.

Options, in descending safety: solo shots of the subject; group shots with faces
blurred; publish as-is with the family's informed decision. The decision belongs
to the family — the engineer's job is to make sure it is *made*, not defaulted.

### Naming living family members

Three sons were named at the family's direction. **Ages were supplied and
deliberately omitted** — they go stale immediately and add nothing. Grandchildren
remain a count: not named by the family, and several are likely minors.

### Unreviewed claims in a public repository

The largest actual failure. Draft claims and working notes were committed to a
**public** repo in a data file. The rendered site was `noindex`; the repository
was not.

> **A `noindex` meta tag protects the rendered site. It does nothing for the
> repository, which GitHub serves and indexes.**

Fix: unreviewed material lives in a gitignored file, loaded through
`import.meta.glob` so a clone without it still builds.

And the sting: **`git push --force` does not delete anything.** The old commit
stayed fetchable by SHA. Only deleting the repository destroys the objects, and
only when it has no forks.

---

## 4. A rights ladder for third-party material

Four categories, four different answers. Conflating them produces either
paralysis or infringement.

| Material | Position |
|---|---|
| **Her own videos, photos, writing** | Free to use. Link or host as preferred |
| **Marks of organisations she led** | Nominative fair use: truthful, no more of the mark than needed, no implied endorsement. Say so explicitly on the page |
| **Government seals** | Read the statute rather than assuming. Cal. Gov Code §402 prohibits use *"maliciously or for commercial purposes"* — a non-commercial family tribute is neither. **Modifying a seal makes it worse, not better** |
| **Other people's photographs** | Theirs. Ask; do not take. This is the one case where the person harmed is from the subject's own community |

I over-warned on the government seals three times before reading §402 closely
enough to notice it is conditional. Overstating a legal risk is its own failure
— it costs the user real material for no benefit.

---

## Prevention checklist

Before publishing anything about a living private person:

- [ ] **Ask for the subject's name in their own script.** Never derive it
- [ ] **Ask the family for links before concluding the record is thin** — community media is largely invisible to search engines
- [ ] Every claim carries a status; **unverified claims do not render**
- [ ] Unreviewed claims live **outside version control** if the repo is public
- [ ] Photographs: strip metadata, then **assert** it is gone
- [ ] Documents: check the artefact itself for addresses, phone numbers, signatures
- [ ] Third-party faces: copyright ≠ consent. Surface the decision
- [ ] Living relatives: names only with permission; **never ages**
- [ ] No superlative without a source. "Trailblazer" beats "first in the nation"
- [ ] Structured data obeys the same provenance rule as the page
- [ ] Nothing is indexed until the subject has read their own page
- [ ] **Grep the write-up itself** before committing it. Documentation about a
      privacy failure is an excellent place to reproduce one

---

## The one that is not an engineering problem

Every remaining gap on this site needs a person: her photographs, her
calligraphy, her dates, her voice. Thirteen pull requests produced a complete
container and an almost empty archive.

That is the correct shape. But it is worth saying plainly in a document like
this, because the temptation at every step was to fill a gap with something
plausible — a guessed name, a nearby civic logo, a superlative, a stock
sentiment. **Every one of those would have been worse than the empty frame.**
