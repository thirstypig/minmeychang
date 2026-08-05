#!/usr/bin/env node
// One-off: removes UI strings no longer referenced by any component.
//
// Dead strings are not harmless here. `holdingNotice` still read
// "建置中" — "under construction" — which stopped being true several
// commits ago, and `themeSystem` (跟隨系統) survived the three-state theme
// toggle it belonged to. Either could be reintroduced by someone reaching for
// a plausible-looking key.

import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'src/i18n/ui.ts'
const DEAD = [
  'holdingNotice',
  'switchLanguage',
  'backToStory',
  'themeLabel',
  'themeLight',
  'themeDark',
  'themeSystem',
  'textSizeLabel',
  'textReset',
  'nextLabel',
  'previousLabel',
  'allTalks',
]

const lines = readFileSync(FILE, 'utf8').split('\n')
const out = []
let skipping = false
let removed = 0

for (const line of lines) {
  if (skipping) {
    // A wrapped value continues until the line ending the property.
    if (/,\s*$/.test(line)) skipping = false
    continue
  }
  const match = line.match(/^\s{4}([a-zA-Z]+):/)
  if (match && DEAD.includes(match[1])) {
    removed++
    if (!/,\s*$/.test(line)) skipping = true
    continue
  }
  out.push(line)
}

writeFileSync(FILE, out.join('\n'))
console.log(`tidy-ui: removed ${removed} dead property lines (${DEAD.length} keys x 2 locales expected)`)
