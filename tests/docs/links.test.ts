import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, extname, resolve } from 'node:path'

// README and the solution docs cross-reference each other by relative path,
// typed by hand. A typo is invisible — markdown does not validate links, the
// build does not read them, and this repo is public, so the first person to
// find a dead link is a stranger.
//
// Real instance: three such links were added in one session — two into README
// and two `related:` paths into a new solution doc.

const ROOTS = ['README.md', 'docs']

function markdownFiles(): string[] {
  const out: string[] = []
  const walk = (p: string) => {
    if (!existsSync(p)) return
    if (statSync(p).isDirectory()) {
      for (const entry of readdirSync(p)) walk(join(p, entry))
    } else if (extname(p) === '.md') {
      out.push(p)
    }
  }
  for (const root of ROOTS) walk(root)
  return out
}

/** `[text](path)` where path is neither absolute-http nor a bare anchor. */
const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g
/** A `related:` list entry that is a repo path rather than a URL. */
const RELATED = /^\s*-\s+(?!https?:|mailto:)([^\s]+\.md)\s*$/gm

type Link = { file: string; target: string }

function relativeLinks(): Link[] {
  const out: Link[] = []
  for (const file of markdownFiles()) {
    const body = readFileSync(file, 'utf8')

    for (const m of body.matchAll(LINK)) {
      const target = m[1]
      if (/^(https?:|mailto:|#)/.test(target)) continue
      out.push({ file, target: target.split('#')[0] })
    }
    for (const m of body.matchAll(RELATED)) {
      out.push({ file, target: m[1] })
    }
  }
  return out
}

const links = relativeLinks()

describe('documentation links', () => {
  // Without this the suite below passes on an empty list — the same vacuous
  // shape that let a provenance test run 18/18 while unable to fail.
  it('found relative links to check', () => {
    expect(links.length, 'no relative links collected — the scanner is broken').toBeGreaterThan(4)
    expect(
      markdownFiles().length,
      'no markdown files found — ROOTS is wrong'
    ).toBeGreaterThan(2)
  })

  // KNOWN LIMITATION, found while negative-testing this file: macOS is
  // case-insensitive, so `existsSync` happily resolves
  // verification-that-verifies-NOTHING.md. GitHub Pages serves from a
  // case-SENSITIVE filesystem, so a case-mismatched link passes here and 404s
  // in production. Closing it means comparing against readdirSync output
  // rather than asking existsSync. Not done yet — recorded so the next person
  // does not mistake this test for complete.
  it('every relative link resolves to a file that exists', () => {
    const broken = links
      .filter(({ file, target }) => {
        // README paths are repo-relative; paths inside a doc resolve against
        // that doc's directory. Accept either, since both are written by hand.
        const fromRepoRoot = resolve(target)
        const fromDocDir = resolve(dirname(file), target)
        return !existsSync(fromRepoRoot) && !existsSync(fromDocDir)
      })
      .map(({ file, target }) => `${file} → ${target}`)

    expect(broken, broken.join('\n  ')).toEqual([])
  })
})
