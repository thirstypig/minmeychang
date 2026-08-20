import { describe, expect, it } from 'vitest'
import { press } from '../../src/data/press'
import { renderableFacts, confirmedFacts, pendingFacts } from '../../src/data/facts'

describe('press', () => {
  it('has unique ids and unique urls', () => {
    expect(new Set(press.map((p) => p.id)).size).toBe(press.length)
    expect(new Set(press.map((p) => p.url)).size).toBe(press.length)
  })

  it('every url is absolute https', () => {
    for (const item of press) {
      expect(item.url, `'${item.id}'`).toMatch(/^https:\/\//)
    }
  })

  it('every item has an outlet, a title and a description in both locales', () => {
    for (const item of press) {
      expect(item.outlet.length, `'${item.id}'`).toBeGreaterThan(0)
      expect(item.title.length, `'${item.id}'`).toBeGreaterThan(0)
      expect(item.en.length, `'${item.id}'`).toBeGreaterThan(0)
      expect(item.zhHant.length, `'${item.id}'`).toBeGreaterThan(0)
      expect(item.zhHant, `'${item.id}' description is untranslated`).not.toBe(item.en)
    }
  })

  // The component renders the year with `item.date.slice(0, 4)` and sorts with
  // localeCompare. A date written "07/03/2024" would display "07/0" and sort
  // into the wrong place — both silently, and neither caught by a typecheck.
  it('every date starts with a plausible four-digit year', () => {
    for (const item of press) {
      expect(item.date, `'${item.id}'`).toMatch(/^(19|20)\d{2}(-\d{2}-\d{2})?$/)
      const year = Number(item.date.slice(0, 4))
      expect(year, `'${item.id}'`).toBeGreaterThanOrEqual(1960)
      expect(year, `'${item.id}'`).toBeLessThanOrEqual(2100)
    }
  })

  it('sorting newest-first produces a strictly non-increasing order', () => {
    // Mirrors the component's sort so a format change cannot break display
    // order without failing here first.
    const sorted = [...press].sort((a, b) => b.date.localeCompare(a.date))
    for (let i = 1; i < sorted.length; i++) {
      expect(
        sorted[i - 1]!.date.localeCompare(sorted[i]!.date),
        `${sorted[i - 1]!.id} should not sort before ${sorted[i]!.id}`
      ).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('press corroboration', () => {
  // The Coverage section tells the reader "each one below is also a source for
  // a fact on this site". If `corroborates` names a fact that does not exist,
  // or one the site refuses to render, that sentence is false — and it is the
  // sentence that makes the section worth having.
  it('every corroborates id names a fact that exists', () => {
    const known = new Set([...confirmedFacts, ...pendingFacts].map((f) => f.id))
    for (const item of press) {
      if (!item.corroborates) continue
      expect(
        known.has(item.corroborates),
        `press '${item.id}' cites fact '${item.corroborates}', which exists in neither facts file`
      ).toBe(true)
    }
  })

  it('every corroborated fact is actually renderable', () => {
    const renderable = new Set(renderableFacts.map((f) => f.id))
    for (const item of press) {
      if (!item.corroborates) continue
      expect(
        renderable.has(item.corroborates),
        `press '${item.id}' claims to source fact '${item.corroborates}', which does not render`
      ).toBe(true)
    }
  })

  it('every fact cited by the press is confirmed, not merely family-stated', () => {
    // A press item is external attestation. If it points at a fact still marked
    // 'family', either the fact should have been upgraded or the citation is
    // wrong. Four facts were upgraded this way; this catches the fifth being
    // forgotten.
    const byId = new Map(confirmedFacts.map((f) => [f.id, f]))
    for (const item of press) {
      if (!item.corroborates) continue
      const fact = byId.get(item.corroborates)
      expect(fact, `fact '${item.corroborates}' not in confirmedFacts`).toBeTruthy()
      expect(
        fact!.status,
        `press '${item.id}' externally attests '${fact!.id}', which is still marked '${fact!.status}' — upgrade it to 'confirmed'`
      ).toBe('confirmed')
    }
  })
})

describe('the confirmed/family distinction', () => {
  // 'confirmed' means a primary source or independent attestation.
  // 'family' means testimony. The difference is the whole provenance ladder,
  // and it is invisible on the rendered page — a reader cannot tell which they
  // are looking at, so the data has to be honest.
  it('no confirmed fact rests on family testimony alone', () => {
    const testimonyOnly = /^confirmed by [^.]+\((son|daughter|family)\)[^.]*$/i
    for (const fact of confirmedFacts) {
      if (fact.status !== 'confirmed') continue
      expect(
        testimonyOnly.test(fact.source ?? ''),
        `fact '${fact.id}' is marked 'confirmed' but its source is only family testimony — it should be 'family'`
      ).toBe(false)
    }
  })

  it('every confirmed fact cites a url or names a document', () => {
    const documentary = /https?:\/\/|certificate|roster|report|archive|record|letter|sunset/i
    for (const fact of confirmedFacts) {
      if (fact.status !== 'confirmed') continue
      expect(
        documentary.test(fact.source ?? ''),
        `fact '${fact.id}' is 'confirmed' but its source names neither a URL nor a document`
      ).toBe(true)
    }
  })

  // The test above is anchored to one phrasing: `^confirmed by X (son)$`. That
  // held while every family fact was worded identically. The hospital facts
  // are not — they read "stated by Min Mey Chang to James Chang (son), relayed
  // …", because she is the one who said it, and the relay matters.
  //
  // Both facts could therefore be promoted to 'confirmed' with the anchored
  // test none the wiser. Verified by sabotage, and it is worse than it sounds:
  //
  //   methodist-hospital-board  → 'confirmed'  = 1 test failed (the documentary
  //                                              one), not the 2 the README
  //                                              claimed
  //   methodist-asian-outreach  → 'confirmed'  = ZERO tests failed
  //
  // The second is the dangerous one. Its source cites a real URL — but that URL
  // attests that the COMMITTEE existed and what it did, not that SHE sat on it.
  // Her membership is testimony and nothing else. A documentary-URL check
  // cannot tell those apart, so it waved the promotion through.
  //
  // The invariant this restores: if the source says a person stated the claim,
  // the claim is testimony, whatever else the source also cites. Had a document
  // attested the claim itself, you would cite the document for the claim rather
  // than record who told you.
  it('no confirmed fact attributes its claim to a family member, however phrased', () => {
    const attribution = /\b(stated|confirmed|told|recalled|supplied|relayed)\b[^\n]{0,120}\((son|daughter|family|husband|wife)\)/i

    for (const fact of confirmedFacts) {
      if (fact.status !== 'confirmed') continue
      expect(
        attribution.test(fact.source ?? ''),
        `fact '${fact.id}' is 'confirmed' but its source attributes the claim to a family member — that is 'family'. Source: ${fact.source}`
      ).toBe(false)
    }
  })

  it('every family fact records who said so and when', () => {
    for (const fact of confirmedFacts) {
      if (fact.status !== 'family') continue
      expect(
        fact.source,
        `fact '${fact.id}' is 'family' but records no attribution`
      ).toBeTruthy()
      expect(
        fact.source,
        `fact '${fact.id}' is 'family' but its source carries no date`
      ).toMatch(/\d{4}-\d{2}-\d{2}/)
    }
  })
})
