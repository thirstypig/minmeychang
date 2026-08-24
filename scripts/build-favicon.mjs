#!/usr/bin/env node
// Turns a scanned single-character 印泥 chop (馬) into the site's favicon.
//
// Unlike the full four-character name seal (see build-name-seal.mjs), this
// source photograph already has its own square, rounded-corner red border —
// the same frame the typeset favicon.svg placeholder drew by hand. That
// border is kept opaque here rather than keyed transparent: a favicon sits in
// browser chrome the site does not control, and an opaque paper background
// behaves predictably there, the way the solid-red placeholder always did.
//
// Run: npm run favicon

import sharp from 'sharp'
import { existsSync, mkdirSync, statSync } from 'node:fs'

const SRC = 'src-logos/minmeychangfaviconchop.png'
const OUT = 'public/favicon.png'
const SIZE = 128 // 2x the largest rendered size, for high-DPI screens

if (!existsSync(SRC)) {
  console.error(`build-favicon: ${SRC} not found. The original chop scan belongs there.`)
  process.exit(1)
}

mkdirSync('public', { recursive: true })

const meta = await sharp(SRC).metadata()
const cropSize = Math.min(meta.width, meta.height)

await sharp(SRC)
  .extract({
    left: Math.round((meta.width - cropSize) / 2),
    top: Math.round((meta.height - cropSize) / 2),
    width: cropSize,
    height: cropSize,
  })
  .resize(SIZE, SIZE)
  .png({ compressionLevel: 9 })
  .toFile(OUT)

// Assert on the output rather than on the exit code — see
// docs/solutions/build-errors/verification-that-verifies-nothing.md.
const { width, height, hasAlpha } = await sharp(OUT).metadata()
const bytes = statSync(OUT).size

if (width !== SIZE || height !== SIZE) {
  throw new Error(`build-favicon: expected ${SIZE}x${SIZE}, got ${width}x${height}`)
}

console.log(`build-favicon: ${width}x${height} alpha=${hasAlpha}  ${(bytes / 1024).toFixed(1)}KB`)
