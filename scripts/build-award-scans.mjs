#!/usr/bin/env node
// Prepares the two Arcadia Beautiful Award certificates for publication.
//
// THREE THINGS MUST HAPPEN, AND ALL THREE ARE NON-NEGOTIABLE:
//
// 1. GPS. The originals are iPhone HEICs shot at the house and carry
//    kMDItemLatitude 34.15418 / kMDItemLongitude -118.06572. Publishing them
//    unprocessed would publish the family's home coordinates. sharp re-encodes
//    without metadata by default — but this script does NOT trust that. It
//    asserts on the output.
//
// 2. ADDRESSES. Each certificate prints a former home address in calligraphy:
//    "418 W. Winnie Way" (1982) and "1140 Singingwood Drive" (1984). These are
//    redacted with an opaque bar. Blur is not used: a Gaussian blur over large
//    legible text is frequently recoverable, and a solid bar is honest about
//    the fact that something was removed.
//
// 3. VERIFY BY LOOKING. Redaction coordinates are estimated from the rendered
//    image, so the output must be inspected before committing. Run
//    `npm run awards` and open the files in public/archive/ before pushing.
//
// Originals stay in gitignored src-photos/. Only the redacted, EXIF-stripped
// derivatives are committed.

import sharp from 'sharp'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// sharp cannot decode these particular HEICs — libheif rejects them with
// "Number of references in iref box (48) exceeds the security limits of 16".
// macOS `sips` reads them without complaint, so it does the decode and sharp
// does everything that matters: resize, redact, and drop metadata.
function decodeHeic(src) {
  const out = join(tmpdir(), `mmc-${Date.now()}-${Math.abs(hash(src))}.jpg`)
  execFileSync('sips', ['-s', 'format', 'jpeg', src, '--out', out], {
    stdio: 'ignore',
  })
  return out
}

function hash(s) {
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0
  return h
}

const SRC_DIR = 'src-photos'
const OUT_DIR = 'public/archive'
const WIDTH = 1600

// Boxes are expressed in the coordinate space of a WIDTH-wide render, then
// scaled to the source. Easier to eyeball and adjust than raw pixel offsets.
const jobs = [
  {
    src: `${SRC_DIR}/arcadia-beautiful-1982.HEIC`,
    out: `${OUT_DIR}/arcadia-beautiful-1982.jpg`,
    label: '1982 Anita Baldwin Award',
    redactions: [{ x: 390, y: 605, w: 640, h: 68 }], // 418 W. Winnie Way
  },
  {
    src: `${SRC_DIR}/arcadia-beautiful-1984.HEIC`,
    out: `${OUT_DIR}/arcadia-beautiful-1984.jpg`,
    label: "1984 Mayor's Award",
    redactions: [{ x: 610, y: 598, w: 440, h: 62 }], // 1140 Singingwood Drive
  },
]

mkdirSync(OUT_DIR, { recursive: true })

for (const job of jobs) {
  if (!existsSync(job.src)) {
    console.error(`  ${job.label.padEnd(28)} MISSING ${job.src}`)
    process.exitCode = 1
    continue
  }

  const decoded = decodeHeic(job.src)
  const base = sharp(decoded).rotate().resize({ width: WIDTH })
  const { width, height } = await base.clone().toBuffer({ resolveWithObject: true }).then(
    (r) => r.info
  )

  const bars = job.redactions
    .map(
      (r) =>
        `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="4" fill="#1a1614"/>`
    )
    .join('')
  const overlay = Buffer.from(
    `<svg width="${width}" height="${height}">${bars}</svg>`
  )

  await base
    .composite([{ input: overlay, top: 0, left: 0 }])
    // No .withMetadata() — that is what would carry EXIF, and therefore GPS,
    // into the output. Omitting it is the strip.
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(job.out)

  // Assert, do not assume. A silent metadata passthrough is precisely the kind
  // of failure this project keeps finding.
  rmSync(decoded, { force: true })

  const meta = await sharp(job.out).metadata()
  const leaked = Boolean(meta.exif || meta.gps || meta.xmp || meta.icc)
  console.log(
    `  ${job.label.padEnd(28)} ${width}x${height}  ${job.redactions.length} redaction(s)  ` +
      (leaked ? 'METADATA LEAK — FAILING' : 'no exif/gps/xmp')
  )
  if (leaked) process.exitCode = 1
}
