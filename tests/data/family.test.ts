import { describe, expect, it } from 'vitest'
import { family, spouse, children, grandchildren, linkedFamily } from '../../src/data/family'

// These are links to people, which makes them the highest-consequence links on
// the site. Everything else points at an organization, a video or a document.

describe('family links', () => {
  it('has unique ids and unique urls', () => {
    expect(new Set(family.map((m) => m.id)).size).toBe(family.length)
    const urls = linkedFamily.map((m) => m.url)
    expect(new Set(urls).size, 'two people point at the same site').toBe(urls.length)
  })

  // Guards the guard. Every assertion below iterates `linkedFamily`, which is
  // derived by filtering on `url` — so if that filter ever returned nothing,
  // all of them would pass vacuously. This repo has shipped that exact bug
  // once already; see docs/solutions/build-errors/verification-that-verifies-nothing.md.
  it('actually found linked members to check', () => {
    expect(linkedFamily.length).toBeGreaterThan(3)
    expect(linkedFamily.length).toBeLessThanOrEqual(family.length)
  })

  it('every url is absolute https, with no query or fragment', () => {
    // Was "no path" until 2026-08-20. James's site publishes the page the
    // family wants linked at /now/, not at the apex, so a path is now
    // legitimate — but only a clean one. A query or fragment is still the
    // signature of a copy-paste out of somewhere deeper, and still rots.
    for (const member of linkedFamily) {
      const url = new URL(member.url)
      expect(url.protocol, `'${member.id}'`).toBe('https:')
      expect(url.search, `'${member.id}' carries a query string`).toBe('')
      expect(url.hash, `'${member.id}' carries a fragment`).toBe('')
      expect(url.username + url.password, `'${member.id}' carries credentials`).toBe('')
      // A path is allowed; a path that will 404 on a trailing-slash redirect
      // is not. Store what the server actually serves.
      expect(
        member.url.endsWith('/') || url.pathname === '/',
        `'${member.id}': store the URL the server settles on, trailing slash included`
      ).toBe(true)
    }
  })

  it('every member with a url records a verification date', () => {
    for (const member of linkedFamily) {
      expect(member.verified, `'${member.id}'`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  // The rule this encodes: a son without a site is still named. Omitting him
  // would be a worse failure than the missing link, and pointing him at a
  // guessed domain would be worse still.
  it('a member without a url carries no verification date either', () => {
    for (const member of family) {
      if (member.url) continue
      expect(
        member.verified,
        `'${member.id}' has no url but records a verification date — nothing was verified`
      ).toBeUndefined()
    }
  })

  // The concrete regression: transliterating a name to fill an empty field.
  // None of the grandchildren's sites publish a Chinese name, and inventing one
  // is the exact failure that produced this project's no-guessing rule — the
  // sibling project shipped an invented Chinese name for the doctor.
  it('no Chinese name is present unless it is confirmed', () => {
    const confirmedChineseNames = new Set(['張勝雄醫師'])
    for (const member of family) {
      if (!member.nameZhHant) continue
      expect(
        confirmedChineseNames.has(member.nameZhHant),
        `'${member.id}' carries the Chinese name '${member.nameZhHant}', which is not on the confirmed list — never transliterate a name to fill a field`
      ).toBe(true)
    }
  })

  it('no grandchild has a Chinese name, because none is confirmed', () => {
    for (const member of grandchildren) {
      expect(
        member.nameZhHant,
        `'${member.id}' has a Chinese name. Their sites publish Latin names only`
      ).toBeUndefined()
    }
  })

  it('exactly one spouse, and every member has exactly one relation', () => {
    expect(family.filter((m) => m.relation === 'spouse')).toHaveLength(1)
    expect(spouse?.id).toBe('sheng-chang')
    // The three groups partition the list — no member is uncounted, which is
    // how a new relation type would otherwise slip in unrendered.
    expect(1 + children.length + grandchildren.length).toBe(family.length)
  })

  // Birth order, not alphabetical order. Peter precedes Richard by birth and
  // would be swapped by any well-meaning sort.
  it('the sons are in birth order', () => {
    expect(children.map((m) => m.name)).toEqual([
      'James Chang',
      'Peter Chang',
      'Richard Chang',
    ])
  })

  // Ages were supplied for the sons and deliberately never published. The same
  // rule applies here, and a numeric field would be the way it crept back in.
  it('no member record carries an age or a birth year', () => {
    for (const member of family) {
      const serialized = JSON.stringify(member)
      expect(
        /"(age|born|birth|dob|birthYear)"/i.test(serialized),
        `'${member.id}' records an age or birth date — never publish either`
      ).toBe(false)
    }
  })
})
