import { describe, expect, it } from 'vitest'
import { family, spouse, grandchildren } from '../../src/data/family'

// These are links to people, which makes them the highest-consequence links on
// the site. Everything else points at an organization, a video or a document.

describe('family links', () => {
  it('has unique ids and unique urls', () => {
    expect(new Set(family.map((m) => m.id)).size).toBe(family.length)
    expect(new Set(family.map((m) => m.url)).size).toBe(family.length)
  })

  it('every url is absolute https with no path, query or fragment', () => {
    // A link to a person should land on their home page. A stray path is
    // usually a copy-paste from somewhere deeper in a site and will rot.
    for (const member of family) {
      expect(member.url, `'${member.id}'`).toMatch(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/)
    }
  })

  it('every member records a verification date', () => {
    for (const member of family) {
      expect(member.verified, `'${member.id}'`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
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

  it('exactly one spouse, and the grandchildren are the remainder', () => {
    expect(family.filter((m) => m.relation === 'spouse')).toHaveLength(1)
    expect(spouse?.id).toBe('sheng-chang')
    expect(grandchildren.length).toBe(family.length - 1)
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
