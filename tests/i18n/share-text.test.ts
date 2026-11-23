import { describe, expect, it } from 'vitest'
import { photoShareText } from '../../src/i18n/ui'

// Messages and LINE often drop the share sheet's `title`, so the message text
// is all a recipient may see besides the link. It must say whose photo it is
// (James, 2026-11-22).
describe('photoShareText', () => {
  it('leads with her name in English, colon and space', () => {
    expect(photoShareText('en', 'Writing calligraphy at a table.')).toBe(
      'Min Mey Chang: Writing calligraphy at a table.',
    )
  })

  it('leads with her name in Chinese, full-width colon, no space', () => {
    expect(photoShareText('zh-hant', '與張勝雄醫師同坐揮毫。')).toBe('張馬敏妹：與張勝雄醫師同坐揮毫。')
  })

  it('is just her name when there is no caption', () => {
    expect(photoShareText('en', '')).toBe('Min Mey Chang')
    expect(photoShareText('zh-hant', '   ')).toBe('張馬敏妹')
  })
})
