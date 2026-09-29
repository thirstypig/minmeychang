#!/usr/bin/env node
// Builds the small grid images for the archive page from the published ones.
//
//   public/archive/<name>.jpg  →  public/archive/thumbs/<name>.jpg   (480px wide)
//
// WHY. The archive grid shows each photograph at roughly 190 CSS pixels, but
// until 2026-09-29 it downloaded the 1600px original for every cell — about
// 28 MB for one page on a phone. The originals are still what the lightbox
// shows; the grid uses these.
//
// Runs automatically at the end of `npm run photos`, and by hand with
// `npm run thumbs`. It rebuilds a thumbnail whenever the source is newer, so
// replacing a photo in place is picked up. tests/data/archive-thumbs.test.ts
// fails if any published photo lacks a thumbnail or has one of the wrong shape
// — which is what a stale thumbnail for a re-cropped photo looks like.

import sharp from 'sharp'
import { mkdirSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SRC_DIR = 'public/archive'
const OUT_DIR = 'public/archive/thumbs'
export const THUMB_WIDTH = 480

mkdirSync(OUT_DIR, { recursive: true })

const sources = readdirSync(SRC_DIR).filter((f) => f.endsWith('.jpg'))
let built = 0
let failures = 0

for (const file of sources) {
  const src = join(SRC_DIR, file)
  const out = join(OUT_DIR, file)
  if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) continue

  try {
    await sharp(src)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      // No .withMetadata(), as in ingest-photos.mjs: omitting it strips EXIF.
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(out)

    const meta = await sharp(out).metadata()
    if (meta.exif || meta.gps || meta.xmp) {
      failures++
      console.error(`  ${file.padEnd(44)} METADATA LEAK — DO NOT COMMIT`)
      continue
    }
    built++
  } catch (error) {
    failures++
    console.error(`  ${file.padEnd(44)} FAILED — ${error.message}`)
  }
}

console.log(`build-thumbs: ${built} built, ${sources.length - built - failures} already current, ${failures} failed.`)
if (failures > 0) process.exitCode = 1
