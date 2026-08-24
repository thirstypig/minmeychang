#!/usr/bin/env node
// Generates the icons mobile "Add to Home Screen" actually uses.
//
// <link rel="icon"> (favicon.png) is NOT what iOS or Android show on a home
// screen. iOS wants an apple-touch-icon; Android wants icons listed in a web
// manifest. Without either, both platforms fall back to a screenshot of the
// page instead of the chop mark — which is why the favicon looked right in a
// browser tab but never showed up when saved to a phone's home screen.
//
// Same source and same margin treatment as build-favicon.mjs, just bigger
// canvases, so the home screen icon reads as the same mark as the tab icon.
//
// Run: npm run touch-icons

import sharp from 'sharp'
import { existsSync, mkdirSync, statSync } from 'node:fs'

const SRC = 'src-logos/minmeychangfaviconchop.png'
const MARGIN = 0.18 // fraction of SIZE reserved as white margin on each side, matching build-favicon.mjs

const TARGETS = [
  { out: 'public/apple-touch-icon.png', size: 180 },
  { out: 'public/icon-192.png', size: 192 },
  { out: 'public/icon-512.png', size: 512 },
]

if (!existsSync(SRC)) {
  console.error(`build-touch-icons: ${SRC} not found. The original chop scan belongs there.`)
  process.exit(1)
}

mkdirSync('public', { recursive: true })

const meta = await sharp(SRC).metadata()
const cropSize = Math.min(meta.width, meta.height)
const cropped = await sharp(SRC)
  .extract({
    left: Math.round((meta.width - cropSize) / 2),
    top: Math.round((meta.height - cropSize) / 2),
    width: cropSize,
    height: cropSize,
  })
  .toBuffer()

for (const { out, size } of TARGETS) {
  const markSize = Math.round(size * (1 - MARGIN * 2))
  const pad = Math.round((size - markSize) / 2)

  await sharp(cropped)
    .resize(markSize, markSize)
    .extend({
      top: pad,
      bottom: size - markSize - pad,
      left: pad,
      right: size - markSize - pad,
      background: 'white',
    })
    .png({ compressionLevel: 9 })
    .toFile(out)

  // Assert on the output rather than on the exit code — see
  // docs/solutions/build-errors/verification-that-verifies-nothing.md.
  const { width, height, hasAlpha } = await sharp(out).metadata()
  const bytes = statSync(out).size

  if (width !== size || height !== size) {
    throw new Error(`build-touch-icons: ${out} expected ${size}x${size}, got ${width}x${height}`)
  }

  console.log(`build-touch-icons: ${out}  ${width}x${height} alpha=${hasAlpha}  ${(bytes / 1024).toFixed(1)}KB`)
}
