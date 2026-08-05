#!/usr/bin/env node
// Fails the build if Tailwind produced no real output.
//
// This guard exists because of a real incident on the sibling project
// shengchangmd: an entire session reported "Lighthouse 100/100/100/100" and
// "production ready" for a site rendering with ZERO compiled CSS, because
// Tailwind had never been wired into Astro. A missing plugin does not error —
// utility classes simply do nothing, and the build stays green.
//
// Checking that a .css file merely EXISTS is not enough: Astro emits a stylesheet
// for the bare @import even when Tailwind never ran. So assert on real compiled
// output — the reset that Tailwind Preflight always emits, plus evidence that at
// least some utilities were generated.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'

function findCss(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...findCss(path))
    else if (entry.endsWith('.css')) out.push(path)
  }
  return out
}

let files
try {
  files = findCss(DIST)
} catch {
  console.error(`verify-css: ${DIST}/ not found — did the build run?`)
  process.exit(1)
}

if (files.length === 0) {
  console.error('verify-css: no .css emitted. Tailwind is not wired into Astro.')
  process.exit(1)
}

const css = files.map((f) => readFileSync(f, 'utf8')).join('\n')

// Preflight always emits a universal border-box reset.
const hasPreflight = /box-sizing:\s*border-box/.test(css)
// Evidence that utilities were actually generated, not just an empty import.
const hasUtilities = /(^|\})\.[a-z-]/m.test(css)

if (!hasPreflight || !hasUtilities) {
  console.error(
    `verify-css: CSS emitted (${files.length} file(s), ${css.length} bytes) but it ` +
      `does not look like Tailwind output.\n` +
      `  preflight reset: ${hasPreflight ? 'found' : 'MISSING'}\n` +
      `  generated utilities: ${hasUtilities ? 'found' : 'MISSING'}\n` +
      `Tailwind is probably not compiling. Check @tailwindcss/vite in astro.config.mjs.`
  )
  process.exit(1)
}

console.log(
  `verify-css: OK — ${files.length} stylesheet(s), ${css.length} bytes, Tailwind output confirmed.`
)
