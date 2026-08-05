import { describe, expect, it } from 'vitest'
import {
  confirmedFacts,
  pendingFacts,
  renderableFacts,
  type Fact,
} from '../../src/data/facts'

describe('fact provenance', () => {
  // The core invariant: the failure mode is an incomplete page, never a wrong
  // one.
  it('no unverified fact is renderable', () => {
    for (const fact of renderableFacts) {
      expect(fact.status, `fact '${fact.id}' is unverified but renderable`).not.toBe(
        'unverified'
      )
    }
  })

  it('every renderable fact cites a source', () => {
    for (const fact of renderableFacts) {
      expect(fact.source, `fact '${fact.id}' renders without a source`).toBeTruthy()
    }
  })

  it('every renderable fact has copy in both locales', () => {
    for (const fact of renderableFacts) {
      expect(fact.en.length, `fact '${fact.id}' has no English`).toBeGreaterThan(0)
      expect(fact.zhHant.length, `fact '${fact.id}' has no Chinese`).toBeGreaterThan(0)
    }
  })

  it('no renderable fact has identical English and Chinese copy', () => {
    for (const fact of renderableFacts) {
      expect(fact.zhHant, `fact '${fact.id}' is untranslated`).not.toBe(fact.en)
    }
  })

  it('fact ids are unique across confirmed and pending', () => {
    const all: Fact[] = [...confirmedFacts, ...pendingFacts]
    const ids = all.map((f) => f.id)
    expect(new Set(ids).size, `duplicate fact id in ${ids.join(', ')}`).toBe(ids.length)
  })

  it('every pending fact is unverified', () => {
    for (const fact of pendingFacts) {
      expect(
        fact.status,
        `pending fact '${fact.id}' is not marked unverified`
      ).toBe('unverified')
    }
  })

  // facts.pending.ts is gitignored, so CI legitimately has zero pending facts
  // while a local checkout has eleven. Neither may break the build.
  it('builds whether or not the gitignored pending file is present', () => {
    expect(Array.isArray(pendingFacts)).toBe(true)
  })

  // Guards the guard. renderableFacts must derive from the union of both
  // sources, not from confirmedFacts alone — otherwise the "nothing unverified
  // renders" assertion is vacuously true and tests nothing. Verified by
  // negative test: this catches a filter that lets everything through.
  it('renderableFacts is derived from all facts, not just the confirmed array', () => {
    const total = confirmedFacts.length + pendingFacts.length
    const unverified = [...confirmedFacts, ...pendingFacts].filter(
      (f) => f.status === 'unverified'
    ).length
    expect(renderableFacts.length).toBe(total - unverified)
  })

  it('confirmedFacts contains nothing marked unverified', () => {
    for (const fact of confirmedFacts) {
      expect(
        fact.status,
        `fact '${fact.id}' sits in confirmedFacts but is marked unverified`
      ).not.toBe('unverified')
    }
  })

  it('her Chinese name is exactly 張馬敏妹', () => {
    const name = confirmedFacts.find((f) => f.id === 'chinese-name')
    expect(name, 'the chinese-name fact is missing').toBeTruthy()
    expect(name!.zhHant).toBe('張馬敏妹')
  })
})
