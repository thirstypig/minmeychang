---
title: 'Right numbers, wrong office — a sourced fact that was wrong for seven weeks, and the sibling site that had it right'
date: 2026-09-29
category: research-issues
problem_type: erroneous_positive_from_secondary_source
component: research / provenance / facts.ts / cross-site consistency
severity: high
symptoms:
  - 'a confirmed fact, citing a named publication with a verbatim quote, is wrong'
  - 'the error is internally consistent: the count and the years both check out'
  - 'a note on the fact asserted that a sibling site "omits" information it in fact contained'
root_cause: 'A community-press article attached the right numbers (two terms, eight years) to the wrong office (mayor instead of city council). It was the only source used, and the sibling site that had the correct, archive-cited record was never read.'
---

# Right numbers, wrong office

## What happened

From August 5 until September 28, 2026, `facts.ts` said:

> Her husband, Dr. Sheng Chang, served as Mayor of Arcadia for two terms —
> eight years.

It was `confirmed`, and it cited Merit Times 人間通訊社 verbatim:
「張勝雄曾任亞凱迪亞市市長兩任8年」. An AMTV broadcast title calling him
亞凱迪亞前市長 corroborated it.

The actual record:

- **City Council**, two terms, 1994–98 and 2000–04
- **Mayor** (Arcadia's rotating mayoralty among council members), April–July
  2003, the city's centennial year

The fact's own note said that `shengchangmd.com` "describes him only as a
family physician" and so omitted the mayorship. That site had the correct
record all along, citing Arcadia Weekly records in the Arcadia Public Library's
history collection. The note was never checked.

## Why no guard caught it

Every provenance check on this site passed, correctly:

- the source was real, named and quoted exactly
- a second, independent source agreed he had been mayor
- the `confirmed` tier was earned: a document, not testimony

The error sat inside the source. **"Two terms, eight years" was accurate. It
was his council service.** A reporter, or an editor, attached accurate numbers
to the wrong office. The corroboration was real but narrow: the AMTV title
supported "former mayor", which was true, and it said nothing about the terms.
Two sources were counted as agreeing on the whole claim when they agreed on
only part of it.

## How it was found

By accident, while adding an unrelated award to the sibling site. Its About
page already had the council terms and the mayoralty, each linked to a record.

## The general lesson

The five failures in
[`proving-a-negative-from-archives.md`](proving-a-negative-from-archives.md) are
**vacuous negatives**: "not found" that meant "never looked". This one is its
mirror image, a **vacuous positive**: "confirmed" that meant "one article said
so, and a second agreed with part of it".

## Prevention

1. **Break a claim into its parts before counting sources.** "Mayor, two terms,
   eight years" is three claims. Record which source supports which part. Here
   the office had two sources, while the count and duration rested on one
   article alone.
2. **Before writing that a sibling site omits something, grep it.** Every family
   site is a source about the same people, and often a better-researched one.
   See the family-sites mapping in the project memory.
3. **A community-press article is a strong source for "this event happened"
   and a weaker one for exact titles and terms.** Where a primary record exists
   (council minutes, a city newspaper, a roster), prefer it for titles and
   dates.

## How it was recorded

PR #39 corrected the fact and kept its id (`sheng-chang-mayor`) so nothing that
referenced it broke. It cites:

- two 2026 newspapers for the 1994 council election
- Merit Times and AMTV only for "former mayor", the part they support
- `shengchangmd.com` for the term years

The Arcadia archive returned HTTP 403 to every scripted fetch, so its two
records were not re-read directly. The note says so, as
[`proving-a-negative-from-archives.md`](proving-a-negative-from-archives.md)
recommends.
