import { describe, expect, it } from 'vitest'
import {
  ui,
  locales,
  getTranslation,
  alternatePath,
  reviewed,
  htmlLang,
  localeNames,
  type UiKey,
} from '../../src/i18n/ui'

const enKeys = Object.keys(ui.en) as UiKey[]

describe('locale coverage', () => {
  // A key present in `en` but missing from a Chinese locale makes
  // getTranslation return the key itself, so a visitor sees the literal text
  // `siteTagline`. This has shipped on the sibling project shengchangmd.
  it('every English key exists in every other locale', () => {
    for (const locale of locales) {
      for (const key of enKeys) {
        expect(ui[locale][key], `ui['${locale}']['${key}'] is missing`).toBeTruthy()
      }
    }
  })

  it('no locale has keys English lacks', () => {
    for (const locale of locales) {
      for (const key of Object.keys(ui[locale])) {
        expect(enKeys, `ui['${locale}'] has orphan key '${key}'`).toContain(key)
      }
    }
  })

  // A Chinese value byte-identical to its English counterpart means an
  // untranslated string shipped to a Chinese page.
  it('no Chinese value is byte-identical to its English counterpart', () => {
    for (const locale of locales) {
      if (locale === 'en') continue
      for (const key of enKeys) {
        expect(ui[locale][key], `ui['${locale}']['${key}'] is untranslated`).not.toBe(
          ui.en[key]
        )
      }
    }
  })

  it('getTranslation returns a non-empty string for every key and locale', () => {
    for (const locale of locales) {
      for (const key of enKeys) {
        const value = getTranslation(locale, key)
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      }
    }
  })

  it('getTranslation falls back to English rather than returning undefined', () => {
    const missing = 'doesNotExist' as UiKey
    const value = getTranslation('zh-hant', missing)
    expect(value).toBeDefined()
    expect(typeof value).toBe('string')
  })

  it('every locale has a display name and an html lang code', () => {
    for (const locale of locales) {
      expect(localeNames[locale]).toBeTruthy()
      expect(htmlLang[locale]).toBeTruthy()
    }
  })

  // Unreviewed locales must stay noindex regardless of ALLOW_INDEXING.
  it('reviewed has an explicit boolean for every locale', () => {
    for (const locale of locales) {
      expect(typeof reviewed[locale]).toBe('boolean')
    }
  })
})

describe('alternatePath', () => {
  it('maps the English root to the Chinese root', () => {
    expect(alternatePath('en', '/')).toBe('/zh-hant')
  })

  it('maps the Chinese root back to the English root', () => {
    expect(alternatePath('zh-hant', '/zh-hant')).toBe('/')
  })

  it('round-trips a nested path', () => {
    const en = '/archive'
    const zh = alternatePath('en', en)
    expect(zh).toBe('/zh-hant/archive')
    expect(alternatePath('zh-hant', zh)).toBe(en)
  })
})
