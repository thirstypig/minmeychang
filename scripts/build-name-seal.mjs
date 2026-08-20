#!/usr/bin/env node
// Turns her scanned 印泥 chop into the site's name mark.
//
// The source is a photograph of a real seal impression: cinnabar red on white
// paper, 1254x1254, ~2MB. Two things have to happen before it can be used.
//
// 1. THE WHITE HAS TO GO. The site has a dark theme. A white-backed PNG would
//    sit on the page as a white tile in a dark surround — which is exactly the
//    bug the COLOUR RULE in global.css was written about. Keying the paper to
//    transparent lets the mark sit on any surface.
//
// 2. IT HAS TO BE SMALL. 2MB for a 56px header mark is absurd; this is the
//    first image on every page.
//
// The keying is done on luminance, not on an exact colour match: the paper is
// not one white, it is a photographed gradient, and the ink is not one red.
// Everything above the threshold becomes transparent, everything below keeps
// its own colour, so the grain and the broken edges of the impression survive.
// That grain is the point — it is a real chop, pressed by hand, not a vector.
//
// WHY NOT RECOLOUR IT TO --brand. Because the mark IS the source of the site's
// red (see global.css). Tinting the artifact to match its own derivative would
// be backwards, and it would flatten the ink variation that makes it read as a
// seal rather than a logo.
//
// Run: npm run seal

import sharp from 'sharp'
import { existsSync, mkdirSync, statSync } from 'node:fs'

const SRC = 'src-logos/minmeychangchop.png'
const OUT = 'public/name-seal.png'
const SIZE = 512 // 2x the largest rendered size, for high-DPI screens
const CUTOFF = 205 // luminance above this is paper, not ink

if (!existsSync(SRC)) {
  console.error(`build-name-seal: ${SRC} not found. The original chop scan belongs there.`)
  process.exit(1)
}

mkdirSync('public', { recursive: true })

const { data, info } = await sharp(SRC)
  .resize({ width: SIZE, height: SIZE, fit: 'contain', background: '#ffffff' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

let keyed = 0
for (let i = 0; i < data.length; i += info.channels) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  if (luma > CUTOFF) {
    data[i + 3] = 0
    keyed++
  } else {
    // Feather the rim so the impression does not get a hard cut edge.
    data[i + 3] = Math.min(255, Math.round(((CUTOFF - luma) / CUTOFF) * 255 + 90))
  }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
  .png({ compressionLevel: 9, palette: true })
  .toFile(OUT)

// Assert on the output rather than on the exit code. A silent no-op here would
// ship a white tile onto every page in dark mode, and nothing else would catch
// it — see docs/solutions/build-errors/verification-that-verifies-nothing.md.
const { width, height, channels, hasAlpha } = await sharp(OUT).metadata()
const bytes = statSync(OUT).size
const pixels = info.width * info.height
const keyedPct = ((keyed / pixels) * 100).toFixed(1)

if (!hasAlpha) throw new Error('build-name-seal: output has no alpha channel — the key did nothing')
if (keyed === 0) throw new Error('build-name-seal: nothing was keyed out — CUTOFF is wrong')
if (keyed === pixels) throw new Error('build-name-seal: everything was keyed out — CUTOFF is wrong')

console.log(
  `build-name-seal: ${width}x${height} ${channels}ch alpha=${hasAlpha}  ` +
    `${(bytes / 1024).toFixed(1)}KB  ${keyedPct}% keyed to transparent`
)
