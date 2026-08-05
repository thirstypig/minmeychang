import { describe, expect, it } from 'vitest'
import { timeline, timelineByYear } from '../../src/data/timeline'
import { renderableFacts } from '../../src/data/facts'

describe('timeline', () => {
  it('sorts oldest first', () => {
    const years = timelineByYear.map((e) => e.year)
    expect(years).toEqual([...years].sort((a, b) => a - b))
  })

  it('has unique ids', () => {
    const ids = timeline.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has copy in both locales for every event', () => {
    for (const event of timeline) {
      expect(event.en.length, `event '${event.id}' has no English`).toBeGreaterThan(0)
      expect(event.zhHant.length, `event '${event.id}' has no Chinese`).toBeGreaterThan(
        0
      )
      expect(event.zhHant, `event '${event.id}' is untranslated`).not.toBe(event.en)
    }
  })

  // The timeline must not become a side door around the provenance gate.
  it('every event backed by a fact references a renderable one', () => {
    const renderableIds = new Set(renderableFacts.map((f) => f.id))
    for (const event of timeline) {
      if (!event.factId) continue
      expect(
        renderableIds.has(event.factId),
        `event '${event.id}' cites fact '${event.factId}', which is not renderable`
      ).toBe(true)
    }
  })

  it('provides both locales whenever a display year overrides the real one', () => {
    for (const event of timeline) {
      if (!event.yearDisplay) continue
      expect(event.yearDisplay.en.length).toBeGreaterThan(0)
      expect(event.yearDisplay.zhHant.length).toBeGreaterThan(0)
    }
  })

  // 1968 is a sort key standing in for "late 1960s". Publishing it would
  // assert a precision nobody has confirmed.
  it('any event with a display year must not be shown as its raw sort year', () => {
    const arrival = timeline.find((e) => e.id === 'arrival')
    expect(arrival?.yearDisplay?.en).toBe('Late 1960s')
    expect(arrival?.yearDisplay?.en).not.toContain(String(arrival?.year))
  })
})
