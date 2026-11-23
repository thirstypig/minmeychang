import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// The blia fact, sourced to BLIA Los Angeles, makes her supervisor for the Los
// Angeles association (洛杉磯協會督導). The Story pages said "the Greater Los
// Angeles area" (大洛杉磯地區), a broader claim than the source; corrected
// 2026-11-23 at James's go-ahead.
const en = readFileSync('src/content/story/en.md', 'utf8').replace(/\s+/g, ' ')
const zh = readFileSync('src/content/story/zh-hant.md', 'utf8')

describe('Story pages match the sourced BLIA supervisor title', () => {
  it('English says the Los Angeles association', () => {
    expect(en).toContain('supervisor for the Los Angeles association')
    expect(en).not.toContain('Greater Los Angeles')
  })

  it('Chinese says 洛杉磯協會督導', () => {
    expect(zh).toContain('洛杉磯協會督導')
    expect(zh).not.toContain('大洛杉磯地區督導')
  })
})
