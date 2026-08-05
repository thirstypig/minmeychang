import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { routes, readingOrder, routePath, neighbours } from '../../src/i18n/routes'
import { locales, ui, getTranslation, type UiKey } from '../../src/i18n/ui'

// Splitting the site from 4 routes to 12 tripled the surface where English can
// silently leak onto a Chinese page, or where a locale can simply be missing a
// page. That was the whole argument against splitting; these tests are the
// answer to it.

describe('route coverage', () => {
  it('every route has a label defined in every locale', () => {
    for (const route of routes) {
      for (const locale of locales) {
        const label = ui[locale][route.labelKey as UiKey]
        expect(label, `route '${route.id}' has no label in '${locale}'`).toBeTruthy()
      }
    }
  })

  it('no route label is left untranslated', () => {
    for (const route of routes) {
      expect(
        ui['zh-hant'][route.labelKey as UiKey],
        `route '${route.id}' label is identical in both locales`
      ).not.toBe(ui.en[route.labelKey as UiKey])
    }
  })

  // A page file missing for one locale is a 404 that typechecks and builds
  // cleanly — the build simply emits fewer pages, silently.
  it('every route has a page file in BOTH locales', () => {
    const files: Record<string, string> = {
      home: 'index.astro',
      story: 'story.astro',
      timeline: 'timeline.astro',
      service: 'service.astro',
      talks: 'talks.astro',
      archive: 'archive.astro',
    }
    for (const route of routes) {
      const file = files[route.id]
      expect(file, `no filename mapped for route '${route.id}'`).toBeTruthy()
      expect(
        existsSync(`src/pages/${file}`),
        `missing English page for '${route.id}'`
      ).toBe(true)
      expect(
        existsSync(`src/pages/zh-hant/${file}`),
        `missing Chinese page for '${route.id}'`
      ).toBe(true)
    }
  })

  it('English paths have no locale prefix and Chinese paths all do', () => {
    for (const route of routes) {
      const en = routePath('en', route.id)
      const zh = routePath('zh-hant', route.id)
      expect(en.startsWith('/zh-hant')).toBe(false)
      expect(zh.startsWith('/zh-hant'), `'${route.id}' zh path is ${zh}`).toBe(true)
    }
  })

  it('home resolves to / in English', () => {
    expect(routePath('en', 'home')).toBe('/')
    expect(routePath('zh-hant', 'home')).toBe('/zh-hant')
  })

  it('the reading order is a single unbroken chain', () => {
    // Walking `next` from the first page must visit every page in order and
    // terminate exactly once, or someone reading start-to-finish hits a wall.
    const visited: string[] = []
    let current = readingOrder[0]!
    for (let guard = 0; guard < 50; guard++) {
      visited.push(current.id)
      const { next } = neighbours(current.id)
      if (!next) break
      current = next
    }
    expect(visited).toEqual(readingOrder.map((r) => r.id))
  })

  it('the first page has no previous and the last has no next', () => {
    expect(neighbours(readingOrder[0]!.id).previous).toBeNull()
    expect(neighbours(readingOrder[readingOrder.length - 1]!.id).next).toBeNull()
  })

  it('home is reachable from the nav but sits outside the reading order', () => {
    expect(routes.some((r) => r.id === 'home')).toBe(true)
    expect(readingOrder.some((r) => r.id === 'home')).toBe(false)
  })

  it('getTranslation resolves every route label in every locale', () => {
    for (const route of routes) {
      for (const locale of locales) {
        const value = getTranslation(locale, route.labelKey as UiKey)
        expect(value.length).toBeGreaterThan(0)
        expect(value).not.toBe(route.labelKey)
      }
    }
  })
})
