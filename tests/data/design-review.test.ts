import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { archive, captionRepeatsTitle } from '../../src/data/archive'
import { getTranslation } from '../../src/i18n/ui'

// Design-review fixes (2026-11-23, James accepted items 1–6).
describe('design-review fixes', () => {
  it('labels the top share button by what it shares', () => {
    expect(getTranslation('en', 'share')).toBe('Share this page')
    expect(getTranslation('zh-hant', 'share')).toBe('分享此頁')
  })

  // Symbols like the theme toggle's ☾, so they live in the component rather
  // than ui.ts (whose locale test rejects a Chinese value equal to English).
  it('names the text-size buttons as controls, not a bare letter', () => {
    const bar = readFileSync('src/components/TopBar.astro', 'utf8')
    expect(bar).toMatch(/data-type-scale="down"[\s\S]*?>A−</)
    expect(bar).toMatch(/data-type-scale="up"[\s\S]*?>A\+</)
  })

  it('has a back-to-top label and a decade-jump label in both languages', () => {
    expect(getTranslation('en', 'backToTop')).toBe('Back to top')
    expect(getTranslation('zh-hant', 'backToTop')).toBe('回到頁首')
    expect(getTranslation('zh-hant', 'decadeJump')).not.toBe(getTranslation('en', 'decadeJump'))
  })

  it('points the Hsi Lai intro at the Calligraphy page in one line', () => {
    expect(getTranslation('en', 'templeCalligraphyLine')).toBe(
      'Each Lunar New Year she also writes calligraphy for visitors at Hsi Lai Temple; see the Calligraphy page.',
    )
    expect(getTranslation('zh-hant', 'templeCalligraphyLine')).toBe(
      '每逢農曆新年，她也在西來寺為來訪民眾當場揮毫，詳見『書法』頁。',
    )
  })

  describe('captionRepeatsTitle', () => {
    it('is true when the caption opens with the title, ignoring case', () => {
      expect(captionRepeatsTitle('Crab fishing', 'Crab fishing, with a landing net between them.')).toBe(true)
    })
    it('is false when the caption adds to the title', () => {
      expect(captionRepeatsTitle('捕蟹', '兩人一同捕蟹，手中提著撈網。')).toBe(false)
    })
    it('is false with no caption', () => {
      expect(captionRepeatsTitle('Crab fishing', '')).toBe(false)
    })
    it('matches exactly the three English captions the review found', () => {
      const hits = archive
        .filter((i) => i.caption && captionRepeatsTitle(i.en, i.caption.en))
        .map((i) => i.id)
        .sort()
      expect(hits).toEqual(['blia-certificate-from-monastic', 'crab-fishing', 'min-mey-chang-with-guests'])
    })
  })
})
