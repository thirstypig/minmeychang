import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import sharp from 'sharp'

// build-favicon.mjs and build-touch-icons.mjs only run manually (`npm run
// favicon` / `npm run touch-icons`); nothing forces them to run before a
// commit, and CI never runs them. So the thing actually shipped to readers is
// whatever PNG happens to be sitting in public/ — this suite checks that
// artifact directly, not the generator.
//
// Real regression this guards against, from the 2026-08-24 session: the
// favicon's red border used to sit edge-to-edge with the canvas, which
// anti-aliased away almost entirely at the 16-32px a browser tab actually
// renders. See docs/solutions/ui-bugs/favicon-cache-and-missing-home-screen-icons.md.

async function corners(path: string) {
  const { data, info } = await sharp(path).raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const px = (x: number, y: number) => {
    const i = (y * width + x) * channels
    return { r: data[i], g: data[i + 1], b: data[i + 2] }
  }
  const isWhitish = (p: { r: number; g: number; b: number }) => p.r > 220 && p.g > 220 && p.b > 220
  const isReddish = (p: { r: number; g: number; b: number }) =>
    p.r > 140 && p.g < 130 && p.b < 130 && p.r - p.g > 60

  return {
    width,
    height,
    cornerIsWhitish: isWhitish(px(1, 1)),
    centerIsReddish: isReddish(px(Math.floor(width / 2), Math.floor(height / 2))),
  }
}

describe('favicon.png', () => {
  const FILE = 'public/favicon.png'

  it('leaves a visible white margin around the mark', async () => {
    const { cornerIsWhitish, centerIsReddish } = await corners(FILE)
    expect(cornerIsWhitish, 'corner pixel is not white — the border runs edge-to-edge again').toBe(true)
    expect(centerIsReddish, 'center pixel is not the red seal ink').toBe(true)
  })

  it('has no alpha channel — an opaque background behaves predictably in browser chrome', async () => {
    const { hasAlpha } = await sharp(FILE).metadata()
    expect(hasAlpha).toBe(false)
  })
})

describe('apple-touch-icon.png', () => {
  const FILE = 'public/apple-touch-icon.png'

  it('is 180x180, the size iOS expects', async () => {
    const { width, height } = await sharp(FILE).metadata()
    expect(width).toBe(180)
    expect(height).toBe(180)
  })

  it('leaves a visible white margin, matching the favicon treatment', async () => {
    const { cornerIsWhitish, centerIsReddish } = await corners(FILE)
    expect(cornerIsWhitish).toBe(true)
    expect(centerIsReddish).toBe(true)
  })

  it('has no alpha channel — iOS applies its own rounded-corner mask on top', async () => {
    const { hasAlpha } = await sharp(FILE).metadata()
    expect(hasAlpha).toBe(false)
  })
})

describe('manifest.webmanifest', () => {
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'))

  it('declares icons that actually exist, at the sizes it claims', async () => {
    expect(manifest.icons.length).toBeGreaterThan(0)

    for (const icon of manifest.icons) {
      const path = `public${icon.src}`
      expect(existsSync(path), `${icon.src} referenced by manifest but missing from public/`).toBe(true)

      const [claimedW, claimedH] = icon.sizes.split('x').map(Number)
      const { width, height } = await sharp(path).metadata()
      expect(
        [width, height],
        `${icon.src} is ${width}x${height} but manifest declares ${icon.sizes}`
      ).toEqual([claimedW, claimedH])
    }
  })

  it("uses her chop's own characters as the short_name, not a transliteration", () => {
    expect(manifest.short_name).toBe('張馬敏妹')
  })
})

describe('src/layouts/Base.astro', () => {
  const source = readFileSync('src/layouts/Base.astro', 'utf8')

  // A raw-text check, not a rendered one: this repo has no Astro component
  // test harness. Weaker than rendering the page, but it still fails loudly
  // if any of these lines gets deleted in a refactor — which is exactly how
  // half of this bug happened (the icons a phone needs were simply never
  // added, and nothing would have caught their removal either).
  it('links the favicon, apple-touch-icon and manifest, each with content-hash cache-busting', () => {
    expect(source).toMatch(/rel="icon"\s+href=\{`\/favicon\.png\?v=\$\{faviconHash\}`\}/)
    expect(source).toMatch(
      /rel="apple-touch-icon"\s+href=\{`\/apple-touch-icon\.png\?v=\$\{appleTouchIconHash\}`\}/
    )
    expect(source).toContain('rel="manifest" href="/manifest.webmanifest"')
  })

  it('sets the Home Screen title to her chop characters, in both locales', () => {
    expect(source).toContain('name="apple-mobile-web-app-title" content="張馬敏妹"')
  })
})
