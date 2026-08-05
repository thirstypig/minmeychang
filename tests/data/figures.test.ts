import { describe, expect, it } from 'vitest'
import { figures } from '../../src/data/figures'
import { renderableFacts } from '../../src/data/facts'

// A number set in 40px type is a factual claim with its citation stripped off.
// These tests keep every figure tied to a fact that is actually renderable.

describe('figures', () => {
  it('every figure cites a renderable fact', () => {
    const renderableIds = new Set(renderableFacts.map((f) => f.id))
    for (const figure of figures) {
      expect(
        renderableIds.has(figure.factId),
        `figure '${figure.id}' cites fact '${figure.factId}', which is not renderable`
      ).toBe(true)
    }
  })

  it('has unique ids', () => {
    const ids = figures.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every figure has a value and a label in both locales', () => {
    for (const figure of figures) {
      expect(figure.value.length, `figure '${figure.id}'`).toBeGreaterThan(0)
      expect(figure.valueZhHant.length, `figure '${figure.id}'`).toBeGreaterThan(0)
      expect(figure.en.length, `figure '${figure.id}'`).toBeGreaterThan(0)
      expect(figure.zhHant.length, `figure '${figure.id}'`).toBeGreaterThan(0)
    }
  })

  it('no label is left untranslated', () => {
    for (const figure of figures) {
      expect(figure.zhHant, `figure '${figure.id}' label is untranslated`).not.toBe(
        figure.en
      )
    }
  })

  // Chinese groups large numbers by 萬 (10,000), not by thousands. A
  // comma-grouped Western numeral on a Chinese page is the numeric equivalent
  // of leaving an English string in place.
  it('no Chinese value uses thousands-separated Western numerals', () => {
    for (const figure of figures) {
      expect(
        /\d{1,3}(,\d{3})+/.test(figure.valueZhHant),
        `figure '${figure.id}' shows "${figure.valueZhHant}" on Chinese pages`
      ).toBe(false)
    }
  })
})
