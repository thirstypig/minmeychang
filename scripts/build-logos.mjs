#!/usr/bin/env node
// Normalises the institutional marks to a uniform height so they sit on one
// optical baseline in the Institutions list.
//
// Sources live in gitignored src-logos/ (downloaded from each organisation's
// own site); the normalised output in public/logos/ is committed.
//
// USE CONTEXT: this is a non-commercial family tribute page recording roles
// Min Mey Chang genuinely held. Marks are shown unmodified, at small and
// uniform size, beside a statement that the site is not affiliated with or
// endorsed by any of these organisations. Do not alter the artwork — an
// altered mark is a derivative work and, for the public seals, worse than the
// original in every respect.

import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const OUT_DIR = 'public/logos'

const jobs = [
  ['src-logos/aca.png', 'aca.png'],
  ['src-logos/hsilai.png', 'hsilai.png'],
  ['src-logos/shihchien.png', 'shih-chien.png'],
  ['src-logos/arcadia-city.png', 'arcadia-city.png'],
  ['src-logos/ca-board.webp', 'acupuncture-board.png'],
]

mkdirSync(OUT_DIR, { recursive: true })

for (const [src, name] of jobs) {
  const out = `${OUT_DIR}/${name}`
  try {
    const before = await sharp(src).metadata()
    // 80px tall: displayed at h-10 (40px), so it stays crisp on 2x screens.
    await sharp(src)
      .resize({ height: 80, fit: 'inside', withoutEnlargement: false })
      .png({ compressionLevel: 9 })
      .toFile(out)
    const after = await sharp(out).metadata()
    console.log(
      `  ${name.padEnd(24)} ${before.width}x${before.height} -> ${after.width}x${after.height}`
    )
  } catch (error) {
    console.error(`  ${name.padEnd(24)} SKIPPED — ${error.message}`)
  }
}
