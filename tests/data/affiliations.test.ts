import { describe, expect, it } from 'vitest'
import {
  affiliations,
  permittedLogos,
  factsCoveredByAffiliations,
} from '../../src/data/affiliations'
import { renderableFacts, confirmedFacts, pendingFacts } from '../../src/data/facts'

describe('affiliations', () => {
  it('every affiliation cites a fact that exists', () => {
    const known = new Set([...confirmedFacts, ...pendingFacts].map((f) => f.id))
    for (const a of affiliations) {
      expect(
        known.has(a.factId),
        `'${a.id}' cites fact '${a.factId}', which exists in neither facts file`
      ).toBe(true)
    }
  })

  it('has unique ids', () => {
    const ids = affiliations.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every affiliation has a name and role in both locales', () => {
    for (const a of affiliations) {
      expect(a.en.length, `'${a.id}'`).toBeGreaterThan(0)
      expect(a.zhHant.length, `'${a.id}'`).toBeGreaterThan(0)
      expect(a.roleEn.length, `'${a.id}'`).toBeGreaterThan(0)
      expect(a.roleZhHant.length, `'${a.id}'`).toBeGreaterThan(0)
      expect(a.zhHant, `'${a.id}' name is untranslated`).not.toBe(a.en)
      expect(a.roleZhHant, `'${a.id}' role is untranslated`).not.toBe(a.roleEn)
    }
  })
})

describe('logo gating', () => {
  // A mark rendering without logoPermitted is the difference between showing a
  // third party's trademark deliberately and showing it by accident.
  it('nothing appears in permittedLogos without both the flag and a file', () => {
    for (const a of permittedLogos) {
      expect(a.logoPermitted, `'${a.id}' is permitted but the flag is false`).toBe(true)
      expect(a.logo, `'${a.id}' is permitted but has no file`).toBeTruthy()
    }
  })

  it('no affiliation carries a logo path without permission', () => {
    // The component checks both, but a path sitting on an unpermitted entry is
    // one careless edit away from rendering.
    for (const a of affiliations) {
      if (a.logo) {
        expect(
          a.logoPermitted,
          `'${a.id}' has a logo path but logoPermitted is false — remove the path or grant permission`
        ).toBe(true)
      }
    }
  })

  it('every logo path points inside /logos/ and is a png', () => {
    for (const a of affiliations) {
      if (!a.logo) continue
      expect(a.logo, `'${a.id}'`).toMatch(/^\/logos\/[a-z0-9-]+\.png$/)
    }
  })

  // The concrete regression: the City of Arcadia and Arcadia Unified School
  // District are SEPARATE entities. During this feature the city's seal was
  // briefly attached to the AUSD row, which would have misstated which body
  // gave her the Golden Apple Award. AUSD publishes no mark of its own, so the
  // temptation to substitute a nearby civic one will recur.
  it('the AUSD entry never borrows another body\'s mark', () => {
    const ausd = affiliations.find((a) => a.id === 'ausd')
    expect(ausd, 'the AUSD affiliation was removed').toBeTruthy()
    expect(
      ausd!.logo,
      'AUSD has been given a logo. It publishes none — if this is the City of Arcadia seal, it names the wrong body for the Golden Apple Award.'
    ).toBeUndefined()
  })

  it('no affiliation uses the city mark', () => {
    for (const a of affiliations) {
      expect(
        a.logo ?? '',
        `'${a.id}' uses arcadia-city.png; the city is not any of these organizations`
      ).not.toContain('arcadia-city')
    }
  })
})

describe('ownership split with the achievements list', () => {
  // Without disjoint ownership the Service page said everything twice — the
  // Acupuncture Board appointment as prose AND as a row.
  it('factsCoveredByAffiliations matches the affiliations exactly', () => {
    expect([...factsCoveredByAffiliations].sort()).toEqual(
      affiliations.map((a) => a.factId).sort()
    )
  })

  it('at least one renderable fact is left for the achievements list', () => {
    const remaining = renderableFacts.filter((f) => !factsCoveredByAffiliations.has(f.id))
    expect(
      remaining.length,
      'every renderable fact is claimed by Institutions, so "What she built" would render empty'
    ).toBeGreaterThan(0)
  })
})
