#!/usr/bin/env node
// Turns a folder of raw photographs into web-ready, metadata-free assets.
//
//   1. drop originals into src-photos/incoming/   (gitignored)
//   2. npm run photos
//   3. review public/archive/, then reference the files from src/data/archive.ts
//
// WHY THIS EXISTS. Photographs are about to arrive from three directions — her
// Instagram export, the Arcadia Chinese School group, and physical boxes — and
// every one of those routes carries the same hazard. The two award
// certificates already proved it: both were iPhone HEICs shot at the house,
// both carried lat 34.15418 / lon -118.06572. Publishing a phone photo
// unprocessed publishes wherever it was taken.
//
// WHAT THIS DOES NOT DO. It cannot see a home address printed on a certificate,
// a phone number on a school program, or a face whose owner has not agreed to
// appear. Those need eyes. Redactions belong in scripts/build-award-scans.mjs,
// which takes explicit coordinates and is verified by looking at the output.
//
// So: this handles the hazard a machine can handle, and refuses to imply it
// handled the rest.

import sharp from 'sharp'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { tmpdir } from 'node:os'

const IN_DIR = 'src-photos/incoming'
const OUT_DIR = 'public/archive'
const MAX_WIDTH = 1600

const RASTER = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'])
const HEIC = new Set(['.heic', '.heif'])

if (!existsSync(IN_DIR)) {
  mkdirSync(IN_DIR, { recursive: true })
  console.log(`ingest-photos: created ${IN_DIR}. Drop photographs in and re-run.`)
  process.exit(0)
}

mkdirSync(OUT_DIR, { recursive: true })

// sharp cannot decode some iPhone HEICs — libheif rejects them for exceeding
// its iref reference limit. sips reads them without complaint.
function decodeHeic(src) {
  const out = join(tmpdir(), `ingest-${basename(src, extname(src))}.jpg`)
  execFileSync('sips', ['-s', 'format', 'jpeg', src, '--out', out], { stdio: 'ignore' })
  return out
}

const slug = (name) =>
  basename(name, extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const files = readdirSync(IN_DIR).filter((f) => {
  const ext = extname(f).toLowerCase()
  return RASTER.has(ext) || HEIC.has(ext)
})

if (files.length === 0) {
  console.log(`ingest-photos: nothing in ${IN_DIR}.`)
  process.exit(0)
}

let failures = 0

for (const file of files) {
  const src = join(IN_DIR, file)
  const out = join(OUT_DIR, `${slug(file)}.jpg`)
  let decoded = null

  try {
    const input = HEIC.has(extname(file).toLowerCase())
      ? (decoded = decodeHeic(src))
      : src

    await sharp(input)
      .rotate() // bake in EXIF orientation before the metadata is dropped
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      // No .withMetadata(). Omitting it IS the strip — that call is what would
      // carry EXIF, and therefore GPS, into the output.
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(out)

    // Assert rather than assume. This project has found nine separate tools
    // that reported success for work they had not performed.
    const meta = await sharp(out).metadata()
    const leaked = Boolean(meta.exif || meta.gps || meta.xmp)
    if (leaked) failures++

    console.log(
      `  ${basename(out).padEnd(38)} ${meta.width}x${meta.height}  ` +
        (leaked ? 'METADATA LEAK — DO NOT COMMIT' : 'no exif/gps/xmp')
    )
  } catch (error) {
    failures++
    console.error(`  ${file.padEnd(38)} FAILED — ${error.message}`)
  } finally {
    if (decoded) rmSync(decoded, { force: true })
  }
}

console.log(
  `\ningest-photos: ${files.length - failures}/${files.length} processed into ${OUT_DIR}.\n` +
    `\nBEFORE COMMITTING, LOOK AT EACH ONE. This script strips metadata; it cannot\n` +
    `see a home address on a certificate, a phone number on a program, or a\n` +
    `face whose owner has not agreed to appear. Redact those with\n` +
    `scripts/build-award-scans.mjs, which takes explicit coordinates.\n`
)

if (failures > 0) process.exitCode = 1
