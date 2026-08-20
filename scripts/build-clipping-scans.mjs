#!/usr/bin/env node
// Prepares the two Chinese-school newspaper special sections for publication.
//
// WHY THIS SCRIPT EXISTS. Both pages are about the school, but one of them —
// the 國際日報 special section of 6 July 2007 — is built out of student work,
// and it prints each child's FULL NAME AND AGE beside their photograph. Seven
// children, aged seven to thirteen at the time. They are not family, nobody
// asked them, and this site is publicly indexed.
//
// The family's direction, 2026-08-20: publish the clippings, without the names
// and ages. So the names and ages come out and everything else stays.
//
// WHAT IS REDACTED, AND WHAT IS NOT.
//   Redacted: every personal name and every age, in all four places they
//   appear — set bylines, the vertical column bylines, the artwork caption,
//   and the two signatures the children wrote onto their own drawings by hand.
//   The handwritten ones are the easy ones to miss: they are not in the type,
//   they are inside the picture.
//
//   NOT redacted: faces. The children appear in headshots and group shots and
//   those are left as printed. That is a deliberate, narrower reading of the
//   instruction — say the word and the same mechanism will cover them.
//
// OPAQUE BARS, NOT BLUR. A Gaussian blur over large legible text is often
// recoverable, and a solid bar is honest that something was removed. Same
// reasoning as scripts/build-award-scans.mjs.
//
// VERIFY BY LOOKING. These coordinates were read off the rendered image by
// eye. The script asserts what it can — that every box lands inside the frame,
// that pixels actually changed, that no metadata survives — but it CANNOT tell
// you a bar missed a name by four pixels. Open the output before committing.
//
// Run: npm run clippings

import sharp from 'sharp'
import { mkdirSync, existsSync, statSync } from 'node:fs'

const SRC_DIR = 'src-photos/2026-08-20-drop'
const OUT_DIR = 'public/archive'

// Boxes are in the SOURCE image's own pixel space, which for these two is the
// resolution the family supplied. Stated per job so nothing has to be scaled
// in your head.
const jobs = [
  {
    src: `${SRC_DIR}/21 2.JPG`,
    out: `${OUT_DIR}/school-special-section-2007.jpg`,
    label: '國際日報 special section, 6 July 2007',
    source: { w: 1280, h: 1437 },
    redactions: [
      { x: 212, y: 302, w: 134, h: 28, what: 'byline name + age, 星星和月亮' },
      { x: 478, y: 478, w: 134, h: 64, what: 'handwritten name + age on the drawing' },
      { x: 686, y: 534, w: 34, h: 120, what: 'vertical byline name + age, 快樂的春假' },
      { x: 258, y: 895, w: 76, h: 30, what: 'name in the artwork caption' },
      { x: 864, y: 794, w: 202, h: 32, what: 'byline name + age, 快樂的三天' },
      { x: 148, y: 994, w: 172, h: 46, what: 'byline name + age, 快樂的星期六 (two lines)' },
      { x: 260, y: 1310, w: 166, h: 32, what: 'byline name + age, 過年' },
      { x: 660, y: 1274, w: 40, h: 84, what: 'vertical caption name' },
      // TWO handwritten names stacked here, not one: 孫俊彥 above, "Justin Sun"
      // below. The first pass covered only the lower and left the Chinese name
      // in plain sight. One box over both.
      { x: 1136, y: 1052, w: 112, h: 84, what: 'handwritten names on the drawing (both)' },
    ],
  },
  {
    src: `${SRC_DIR}/19 2.JPG`,
    out: `${OUT_DIR}/school-special-section-recital.jpg`,
    label: '國際日報 special section, school recital',
    source: { w: 960, h: 1268 },
    // Nothing to redact: this page carries no personal name and no age. It is
    // photographs of a recital and unattributed body text. Checked band by
    // band at source resolution before concluding that, rather than assuming
    // it because the first glance found nothing.
    redactions: [],
  },
]

mkdirSync(OUT_DIR, { recursive: true })

let failures = 0

for (const job of jobs) {
  if (!existsSync(job.src)) {
    console.error(`  MISSING SOURCE ${job.src}`)
    failures++
    continue
  }

  const meta = await sharp(job.src).metadata()
  if (meta.width !== job.source.w || meta.height !== job.source.h) {
    console.error(
      `  ${job.label}: source is ${meta.width}x${meta.height}, boxes were measured against ` +
        `${job.source.w}x${job.source.h}. Re-measure before trusting this.`
    )
    failures++
    continue
  }

  for (const r of job.redactions) {
    if (r.x < 0 || r.y < 0 || r.x + r.w > meta.width || r.y + r.h > meta.height) {
      console.error(`  ${job.label}: box "${r.what}" falls outside the image`)
      failures++
    }
  }

  const bars = job.redactions.map((r) => ({
    input: {
      create: { width: r.w, height: r.h, channels: 4, background: '#111111' },
    },
    left: r.x,
    top: r.y,
  }))

  await sharp(job.src)
    .rotate()
    .composite(bars)
    // No .withMetadata(). Omitting it IS the strip.
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(job.out)

  // Assert rather than assume — see
  // docs/solutions/build-errors/verification-that-verifies-nothing.md.
  const outMeta = await sharp(job.out).metadata()
  const leaked = Boolean(outMeta.exif || outMeta.gps || outMeta.xmp)
  if (leaked) failures++

  // Prove the bars actually landed: sample the centre of each box and require
  // it to be the bar colour. A composite that silently no-ops would otherwise
  // ship the names.
  let painted = 0
  const raw = await sharp(job.out).raw().toBuffer({ resolveWithObject: true })
  for (const r of job.redactions) {
    const cx = Math.round(r.x + r.w / 2)
    const cy = Math.round(r.y + r.h / 2)
    const i = (cy * raw.info.width + cx) * raw.info.channels
    const dark = raw.data[i] < 40 && raw.data[i + 1] < 40 && raw.data[i + 2] < 40
    if (dark) painted++
    else console.error(`  ${job.label}: box "${r.what}" did NOT paint`)
  }
  if (painted !== job.redactions.length) failures++

  console.log(
    `  ${job.out.padEnd(52)} ${outMeta.width}x${outMeta.height}  ` +
      `${(statSync(job.out).size / 1024).toFixed(0)}KB  ` +
      `${painted}/${job.redactions.length} bars painted  ` +
      (leaked ? 'METADATA LEAK — DO NOT COMMIT' : 'no exif/gps/xmp')
  )
}

console.log(
  `\nbuild-clipping-scans: ${failures === 0 ? 'OK' : `${failures} FAILURE(S)`}.\n` +
    `\nNOW LOOK AT THE OUTPUT. These bars were positioned by eye. The script can\n` +
    `prove a bar is dark; it cannot prove it covers the right thing. Open\n` +
    `${OUT_DIR}/school-special-section-2007.jpg and read it before committing.\n`
)

if (failures > 0) process.exit(1)
