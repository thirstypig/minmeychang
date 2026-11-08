import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, extname, resolve, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// README and the solution docs cross-reference each other by relative path,
// typed by hand. A typo is invisible — markdown does not validate links, the
// build does not read them, and this repo is public, so the first person to
// find a dead link is a stranger.
//
// Real instance: three such links were added in one session — two into README
// and two `related:` paths into a new solution doc.

const ROOTS = ['README.md', 'docs']

/** Repo root from this file's own location, not process.cwd(), so the result
 *  does not depend on where vitest was started. */
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

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

/**
 * `link`: a clickable `[text](path)`. GitHub resolves it against the
 *   containing file's directory, and ONLY that — so that is the only
 *   resolution accepted here. A repo-root-style path written in a nested doc
 *   (copied out of README) 404s for every reader (todo 002).
 * `related`: a frontmatter path read by a person, not resolved by GitHub.
 *   Both forms are in use (repo-root and `../` doc-relative), and both are
 *   unambiguous to a reader, so either is accepted — but still case-exact.
 */
type Link = { file: string; target: string; kind: 'link' | 'related' }

function relativeLinks(): Link[] {
  const out: Link[] = []
  for (const file of markdownFiles()) {
    const body = readFileSync(file, 'utf8')

    for (const m of body.matchAll(LINK)) {
      const target = m[1]
      if (/^(https?:|mailto:|#)/.test(target)) continue
      out.push({ file, target: target.split('#')[0], kind: 'link' })
    }
    for (const m of body.matchAll(RELATED)) {
      out.push({ file, target: m[1], kind: 'related' })
    }
  }
  return out
}

/**
 * Exists with exactly this spelling, letter case included. macOS is
 * case-insensitive, so `existsSync` alone resolves
 * verification-that-verifies-NOTHING.md, while GitHub serves from a
 * case-sensitive filesystem and 404s it (todo 013, item 1). Each path segment
 * is compared against the real directory listing instead.
 */
function existsExactly(abs: string): boolean {
  const rel = relative(REPO, abs)
  if (rel.startsWith('..')) return false
  let dir = REPO
  for (const segment of rel.split(sep).filter(Boolean)) {
    if (!existsSync(dir) || !statSync(dir).isDirectory()) return false
    if (!readdirSync(dir).includes(segment)) return false
    dir = join(dir, segment)
  }
  return true
}

function resolves(link: Link): boolean {
  const fromDocDir = resolve(REPO, dirname(link.file), link.target)
  if (link.kind === 'link') return existsExactly(fromDocDir)
  return existsExactly(fromDocDir) || existsExactly(resolve(REPO, link.target))
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

  it('every relative link resolves, as GitHub resolves it, to a file that exists', () => {
    const broken = links
      .filter((link) => !resolves(link))
      .map(({ file, target, kind }) => `${file} → ${target} (${kind})`)

    expect(broken, broken.join('\n  ')).toEqual([])
  })

  // Controls for the two rules above. Each feeds existsExactly / resolves a
  // path that MUST fail and one that MUST pass, so the rules cannot go vacuous.
  it('rejects a repo-root path inside a nested doc, and a case-only mismatch', () => {
    const real = 'docs/solutions/build-errors/verification-that-verifies-nothing.md'
    expect(existsExactly(resolve(REPO, real)), 'control: the real file').toBe(true)
    expect(
      existsExactly(resolve(REPO, real.replace('nothing.md', 'NOTHING.md'))),
      'case-only mismatch must not resolve'
    ).toBe(false)
    const nested = { file: 'docs/superpowers/specs/x.md', target: real, kind: 'link' as const }
    expect(resolves(nested), 'repo-root path in a nested doc must not resolve').toBe(false)
    expect(resolves({ ...nested, kind: 'related' }), 'related: may be repo-root').toBe(true)
    expect(
      resolves({ ...nested, kind: 'related', target: real.replace('nothing.md', 'NOTHING.md') }),
      'related: is case-exact too'
    ).toBe(false)
  })
})
