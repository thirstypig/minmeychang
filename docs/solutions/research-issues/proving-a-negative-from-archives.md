---
title: 'Proving a negative from archives — five ways a "not found" meant "never looked"'
date: 2026-08-10
category: research-issues
problem_type: vacuous_negative_result
component: research / provenance / archival-sourcing
severity: high
symptoms:
  - '46 downloaded PDFs are all bot-block pages returned with HTTP 200'
  - 'the same 46 files have three distinct MD5s, so hashing does not reveal it'
  - 'a year of index data reports "0 rows" from a zero-byte download'
  - 'a case-insensitive grep for a surname matches only No Change and onChange='
  - 'a roster page yields no names because the roster sits below the nav in the tag-stripped text'
  - 'curl without -L reports 302 and writes an empty file'
  - 'archive.org returns 429 on one endpoint while another endpoint works fine'
  - 'a live site 403s scripted requests but answers WebFetch'
stack:
  - Wayback Machine CDX API
  - IRS 990 e-file index (apps.irs.gov)
  - ProPublica Nonprofit Explorer
  - curl
  - pdftotext (poppler)
tags:
  - false-negative
  - vacuous-result
  - archival-research
  - provenance
  - bot-blocking
  - positive-control
  - silent-failure
time_to_diagnose: 'each instance 1-10 minutes once suspected; the 46-PDF block was caught only by comparing byte counts across the batch'
recurrence_risk: 'high — every family site rests on negative and absent evidence, and every failure here returned success'
related:
  - docs/solutions/build-errors/verification-that-verifies-nothing.md
  - docs/solutions/security-issues/publishing-about-a-living-person.md
---

# Proving a negative from archives

## The question

The family recalled that Min Mey Chang served on the board of Methodist Hospital
of Southern California in Arcadia — now USC Arcadia Hospital. No public roster
named her. Answering it meant reading twenty-five years of board rosters and
saying, credibly, **"she is not on these."**

That is a harder claim than it looks. A positive finding proves itself: her name
is either on the page or it isn't. A negative finding is a claim about *your own
search* — and every tool in the chain can fail in a way that looks exactly like
a genuine absence.

## The pattern

Sibling document `build-errors/verification-that-verifies-nothing.md` records
nine tools that reported success for work they never did. This is the research
counterpart, and the shape is one step nastier:

> **A tool reported "nothing found" when what actually happened was
> "nothing looked." The two are indistinguishable from the exit code, the
> status code, and often from the file itself.**

Five instances, all in one afternoon, all returning success.

---

## The five instances

### 1. Forty-six PDFs that were all the same bot-block page

Downloading every Form 990 for the hospital and its foundation, 2001–2024, from
ProPublica's `download-filing` endpoint. All 46 `curl` calls exited 0 and wrote
plausible files.

```
fdn-2001.pdf 1327348
fdn-2002.pdf 1327348
...
hosp-2024.pdf 1327396
```

Every file was a **"Security Check — ProPublica"** HTML page, served with
HTTP 200 and a `.pdf` filename. Zero rows of actual data.

**What gave it away:** not the status code, not the extension, not `file` —
the **byte counts clustering on three values within 130 bytes of each other**
across 46 supposedly different documents. Real 990s vary by hundreds of
kilobytes.

**The detail that matters:** the three files I hashed had **three different
MD5s** — `3cbb3582…`, `0f2c980c…`, `2503f3d5…`. The block page embeds
per-request state, so deduplicating by hash would have found 46 "unique"
documents and confirmed the wrong conclusion. **Size distribution caught what
hashing could not.**

`pdftotext` then produced pages of `Syntax Error: Illegal character <21> in hex
string` — which is what a bot-block page looks like to a PDF parser, and which
is easy to dismiss as a corrupt scan.

---

### 2. "0 rows" from a zero-byte download

Streaming the IRS 990 e-file index for each year and grepping for the two EINs:

```
2011: 0 rows
2012: 0 rows
...
2017: 1 rows
```

The clean reading is "these organisations did not e-file before 2017." The
actual reading:

```
$ curl -sS -o /dev/null -w "%{size_download}" .../index_2015.csv
0
```

The 2011–2016 index files **downloaded as zero bytes**. `grep` faithfully found
no matches in an empty stream, and the pipeline reported it as data.

A zero-byte download and a genuine absence produce identical output. Only the
size distinguishes them, and only if you ask.

---

### 3. `chang` matching `No Change`, `onChange=`, `LayoutChanges`

Six archived rosters were searched for the surname. Five "matched":

| File | The "hit" |
|---|---|
| 2002 hospital board | `value="No Change"` |
| 2002 foundation board | `value="No Change"` |
| 2010 hospital board | `MSOLayout_LayoutChanges` |
| 2019 foundation board | `window.onorientationchange` |
| 2004 / 2005 rosters | `onChange="MM_jumpMenu(...)"` |

**Every single one was a substring of an unrelated word.** A short, common
surname inside HTML is nearly guaranteed to produce false positives — and the
danger runs both ways. Counting matches would have suggested she *was* present;
skimming the counts and moving on would have suggested the search was thorough.

Chinese surnames are especially exposed: `chang`, `chen`, `hu`, `an`, `li`,
`wang`, `he`, `song` are all English substrings or words.

---

### 4. A roster page that appeared to contain no roster

The 2019 Foundation board snapshot, tag-stripped, showed 60 lines of navigation
and no names. It would have been reasonable — and wrong — to record "no Chang in
2019."

The roster was there, starting at line 138, below the entire site chrome:

```
2019 Foundation Board of Directors
Chair: Susan Woo
...
Gang Ding · Kin Hui · Sherry Wang · Jerome Yuan
```

Had this gone unchecked, the negative would have been **vacuous** — a true
statement ("no Chang appears in the text I read") masquerading as a finding
("she was not on the 2019 board").

This is the same defect as the test in this repo that passed 18/18 while being
logically incapable of failing.

---

### 5. Redirects, rate limits and 403s misread as absence

Three smaller variants in the same session:

| Symptom | Looked like | Actually |
|---|---|---|
| `curl` → `302`, empty file | endpoint has no data | missing `-L` |
| Same URL with `-L` → `irs.gov/404` | filing does not exist | IRS now ships e-file XML **only in bulk yearly zips** |
| `archive.org/wayback/available` → `429` | archive.org is down | rate limit on *one* endpoint; the CDX API answered fine throughout |
| `keckmedicine.org` → `403` to curl *and* a browser UA | page is gone | bot protection; **WebFetch retrieved it** |

The last row is the useful one: **WebFetch and scripted `curl` are blocked by
different things.** When one is refused, the other is worth trying before
concluding the source is unavailable.

---

## The control that catches all five

One cheap habit defeats every instance above:

> **Before trusting an absence, search the same artefact for something you know
> is there.**

On each roster, after finding no `Chang`, grep for a name the page must contain:

```bash
for n in Segal Tolaney Quigley Helms Beck Lucas; do
  printf "%-12s %s\n" "$n" "$(grep -ci "$n" roster.html)"
done
```

If the positive control comes back empty, the negative is worthless and you have
learned it in three seconds. If it comes back populated, the absence means
something. This is the research form of negative-testing a guard, and it is the
single technique most worth carrying forward.

---

## What actually worked

Sources that serve data rather than HTML, for the next time this comes up:

| Need | Use | Note |
|---|---|---|
| What URLs a dead site had | Wayback **CDX API** | `?url=host&matchType=domain&fl=timestamp,original,statuscode&collapse=urlkey` |
| The page as served, no archive chrome | `web.archive.org/web/<ts>id_/<url>` | the `id_` suffix is essential |
| Which nonprofit is which | ProPublica **API v2** `search.json` | returns EIN, name, city — not blocked |
| Officers and directors by year | Form 990 **Part VII** | the definitive roster source |
| Reading a ProPublica page | **WebFetch** | scripted `curl` is bot-blocked |
| Legal-name changes over time | IRS e-file index CSV | caught `METHODIST HOSPITAL OF SOUTHERN CALIFORNIA` → `USC ARCADIA HOSPITAL` between FY2020 and FY2021 |

Discovering the per-member bio-page slug pattern
(`/Foundation/board/Pages/bio_<initial><surname>.aspx`) was worth more than any
single roster: it enumerated 39 board members from a single CDX query, with no
page fetches at all.

---

## What the search established, and what it did not

Graded honestly, because the fact that shipped depends on it:

| Body | Years read | Evidence grade |
|---|---|---|
| Hospital Board of Directors | 1999, 2002, 2003, 2004, 2005, 2010 | strong — read the rosters, positive control passed |
| Hospital Board of Directors | 2019–2024 | **weaker** — a WebFetch summary of Part VII, not a roster read by hand |
| Foundation Board of Directors | 2002, 2003, 2004, 2005, 2019 | strong |
| Foundation board bio pages | ~2010–11, 39 slugs | strong |
| **Never checked** | pre-1999, 2006–2009, 2012–2018 | none |

She appears on none of them. **That is not the same as "she did not serve."**

The finding that reframed the question: the Foundation ran a standing **Asian
Outreach committee** whose remit — advising on cultural matters, planning the
annual Asian Health Fair — matches her record closely, and **whose membership
was never published in any year sampled**. A family memory of serving "the
board" is well explained by a seat there, and no roster contradicts it.

## How it was recorded

Both claims shipped as `status: 'family'` — her own statement, which is exactly
what that tier is for — with **no years**, and with the entire search written
into the fact's `note` field: years read, years not read, and the one source
that would settle it. See `src/data/facts.ts`, `methodist-hospital-board` and
`methodist-asian-outreach`.

The point of putting it there rather than in a commit message: whoever revisits
this in five years gets the evidence without redoing the afternoon.

---

## Prevention

### 1. Run a positive control before reporting an absence
Grep the same artefact for a name you know it contains. Three seconds, defeats
instances 3 and 4 outright.

### 2. Compare sizes across a batch, not hashes
Identical or tightly-clustered byte counts across supposedly different documents
means one page served many times. Per-request nonces defeat hash comparison;
they do not defeat the size distribution.

### 3. Treat `0` bytes as an error, never as an empty result
Assert `size_download > 0` before letting a stream reach `grep`.

### 4. Grade the evidence, and write the grade down
"A model summarised the page" and "I read the roster" are different findings.
Record which one you have.

### 5. When a source refuses you, change fetcher before concluding
WebFetch and `curl` are blocked by different systems. A `403`, `429` or `302` is
a statement about the request, not about the data.

### 6. Never let a negative search silently become a positive claim
Absence of evidence for a *published roster* is not evidence of absence from an
*unpublished committee*. Say which one you have.

---

## Quick reference

| Symptom | Do not conclude | Check |
|---|---|---|
| Batch of files, similar sizes | downloads succeeded | `ls -la`, read one as text |
| `grep` count 0 | not present | positive control; `size_download` |
| `grep` count > 0 | present | print the matching line — read it |
| Tag-stripped page shows no names | roster absent | grep a name that must be there |
| `302` + empty file | no data | add `-L` |
| `403` / `429` | source gone | try the other fetcher; try another endpoint |
| Model summary says "not listed" | not listed | read the primary artefact |

## Cost

Roughly two hours, of which about forty minutes went to the 990 route that never
yielded a byte of data. Two conclusions were nearly recorded wrongly: "she was
not on the 2019 board" from a page whose roster had not been read, and "these
organisations did not e-file before 2017" from six zero-byte downloads.

Both would have been stated confidently, and both would have been wrong in the
same way — not false, exactly, but **empty**: true statements about a search
that never happened, dressed as facts about a person.
