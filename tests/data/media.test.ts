import { describe, expect, it } from 'vitest'
import { mediaAccounts, linkableAccounts } from '../../src/data/media'

// The regression this prevents, concretely: someone flips `confirmed` to true
// on the family channel — by tidying, by copy-paste, by assuming the flags
// should match — and a channel holding "Chang family", "Oregon trip" and
// "Peter chang speeches" at 46-100 views becomes linked from an indexed
// tribute site. Nothing else in the build would object.
//
// This is a consent gate, not a config value. It is the only account she has
// not agreed to publish.

const FAMILY_CHANNEL = 'youtube-family'

describe('media accounts', () => {
  it('the family video channel is NOT linkable', () => {
    const linked = linkableAccounts.map((a) => a.id)
    expect(
      linked,
      'the @minmeychang9273 family channel is being linked from the site — she has not consented to this'
    ).not.toContain(FAMILY_CHANNEL)
  })

  it('the family channel still exists in the data, so the question stays visible', () => {
    // Deleting it would "fix" the test while losing the open consent question.
    const family = mediaAccounts.find((a) => a.id === FAMILY_CHANNEL)
    expect(family, 'the family channel entry was removed rather than left unconfirmed').toBeTruthy()
    expect(family!.confirmed).toBe(false)
    expect(family!.note, 'the consent rationale was dropped').toBeTruthy()
  })

  it('linkableAccounts contains only confirmed accounts', () => {
    for (const account of linkableAccounts) {
      expect(account.confirmed, `'${account.id}' is linkable but not confirmed`).toBe(true)
    }
  })

  it('every account has a label in both locales', () => {
    for (const account of mediaAccounts) {
      expect(account.en.length, `'${account.id}' has no English label`).toBeGreaterThan(0)
      expect(account.zhHant.length, `'${account.id}' has no Chinese label`).toBeGreaterThan(0)
    }
  })

  it('account ids are unique', () => {
    const ids = mediaAccounts.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every url is absolute https', () => {
    for (const account of mediaAccounts) {
      expect(account.url, `'${account.id}' url is not https`).toMatch(/^https:\/\//)
    }
  })
})
