# minmeychang — Narrative Page & Timeline Implementation Plan

> ## ✅ Executed 2026-08-05 — all four tasks complete
>
> Kept as a record. **Do not re-run it**; the code it describes exists and has
> since moved on.
>
> | Task | Outcome |
> |---|---|
> | 1 — Vitest + locale coverage | Done. The suite is now **89 tests across 11 files** |
> | 2 — Fact provenance tests | Done, and the guard it added turned out to be **vacuous** — it filtered an array that could not contain the thing it tested for. Fixed; see [`verification-that-verifies-nothing`](../../solutions/build-errors/verification-that-verifies-nothing.md) |
> | 3 — Story content collection + narrative page | Done, then **restructured** — the single narrative page became six pages per locale |
> | 4 — Timeline | Done. Eight entries, every one sourced |
>
> **Deferred items have since been resolved:**
>
> - *"The photo and document archive… no assets have been supplied"* — two
>   Arcadia Beautiful Award certificates are published; seven frames remain
>   empty. `scripts/ingest-photos.mjs` and `scripts/build-award-scans.mjs`
>   handle metadata stripping and redaction.
> - *"Chinese webfont subsetting… a pure optimisation"* — shipped. Noto Serif TC
>   subset from 7.6MB to ~200KB, with `tests/fonts/coverage.test.ts` failing the
>   build if a glyph is missing.
>
> One correction to the plan as written: **Task 3's `max-w-[44ch]` for Chinese
> was wrong.** The `ch` unit is the advance width of "0" in the current font —
> about half an em in a Latin serif — so it yielded ~22 Han characters, not 44,
> and the Chinese timeline wrapped at about nine characters per line. The
> measure is now `36em`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the holding page with a long-form narrative page in both locales, backed by a test suite that makes unverified facts and locale drift impossible to ship.

**Architecture:** Astro content collections hold the long-form prose, authored separately per locale rather than translated inline. Structured claims stay in `src/data/facts.ts` behind the existing provenance gate; a new `src/data/timeline.ts` holds dated events. Vitest guards two invariants that have historically broken on the sibling project `shengchangmd`: locale key drift, and unverified claims reaching the page.

**Tech Stack:** Astro 7.1.6, Tailwind v4 (`@tailwindcss/vite`), TypeScript strict, Vitest, GitHub Pages via Actions.

## Global Constraints

- **Never invent a fact.** Only `confirmed` or `family` facts render. `unverified` never reaches a page.
- **Her Chinese name is 張馬敏妹.** Confirmed by James Chang (son), 2026-08-05. Do not alter it.
- **Never hardcode `#000`, `#fff`, `black`, or `white` on a branded surface.** Set the surface's `color` to `var(--brand-contrast)` and let descendants inherit. Headings stay `color: inherit`.
- **Never interpolate an English string into a `zh-hant` page.** Route all copy through `getTranslation()` or a locale-specific field.
- **`src/data/facts.pending.ts` is gitignored.** Never `git add -f` it. The repo is public.
- **`src-photos/` and `src-documents/` are gitignored.** Never commit originals.
- **Every element containing Chinese text inside an English page needs `lang="zh-Hant"`**, and vice versa `lang="en"`. It drives both screen-reader pronunciation and typeface selection.
- **Node 22.** `npm run dev` is pinned to port **3170** — never change it.
- **Crawlers stay blocked.** Do not set `ALLOW_INDEXING=true` under any circumstances in this plan.
- **Commit after every task.** Never use `git push --force`.

---

## File Structure

| File | Responsibility |
|---|---|
| `vitest.config.ts` | Create. Test runner config via Astro's `getViteConfig`. |
| `tests/i18n/locale-coverage.test.ts` | Create. Guards locale key parity and untranslated strings. |
| `tests/data/facts.test.ts` | Create. Guards the provenance invariant. |
| `tests/data/timeline.test.ts` | Create. Guards timeline ordering and locale parity. |
| `src/content.config.ts` | Create. Declares the `story` collection. |
| `src/content/story/en.md` | Create. English narrative prose. |
| `src/content/story/zh-hant.md` | Create. Traditional Chinese narrative prose. |
| `src/data/timeline.ts` | Create. Dated events, bilingual, with imprecise-date support. |
| `src/components/Timeline.astro` | Create. Renders timeline events for one locale. |
| `src/components/FactList.astro` | Create. Renders renderable facts for one locale. |
| `src/pages/index.astro` | Modify. Holding page → narrative page. |
| `src/pages/zh-hant/index.astro` | Modify. Same, Chinese. |
| `src/i18n/ui.ts` | Modify. Add section-heading keys. |
| `package.json` | Modify. Add `test` script and Vitest dev dependency. |
| `.github/workflows/deploy.yml` | Modify. Run `npm test` before build. |

---

## Task 1: Test foundation and locale coverage

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/i18n/locale-coverage.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `src/i18n/ui.ts` — exports `ui`, `locales`, `getTranslation(locale, key)`, `alternatePath(locale, path)`, `reviewed`, `defaultLocale`, `localeNames`, `htmlLang`; types `Locale`, `UiKey`.
- Produces: `npm test` runs the suite. Later tasks add files under `tests/`.

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { getViteConfig } from 'astro/config'

// getViteConfig gives tests the same resolution and plugin setup the site
// build uses, so `import.meta.glob` in src/data/facts.ts behaves identically
// under test and at build time.
export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
```

- [ ] **Step 3: Add the test script**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write the failing tests**

Create `tests/i18n/locale-coverage.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  ui,
  locales,
  getTranslation,
  alternatePath,
  reviewed,
  htmlLang,
  localeNames,
  type Locale,
  type UiKey,
} from '../../src/i18n/ui'

const enKeys = Object.keys(ui.en) as UiKey[]

describe('locale coverage', () => {
  // A key present in `en` but missing from a Chinese locale makes
  // getTranslation return the key itself, so a visitor sees the literal
  // text `siteTagline`. This has shipped on the sibling project.
  it('every English key exists in every other locale', () => {
    for (const locale of locales) {
      for (const key of enKeys) {
        expect(
          ui[locale][key],
          `ui['${locale}']['${key}'] is missing`
        ).toBeTruthy()
      }
    }
  })

  it('no locale has keys English lacks', () => {
    for (const locale of locales) {
      for (const key of Object.keys(ui[locale])) {
        expect(enKeys, `ui['${locale}'] has orphan key '${key}'`).toContain(key)
      }
    }
  })

  // A Chinese value byte-identical to its English counterpart means an
  // untranslated string shipped to a Chinese page.
  it('no Chinese value is byte-identical to its English counterpart', () => {
    for (const locale of locales) {
      if (locale === 'en') continue
      for (const key of enKeys) {
        expect(
          ui[locale][key],
          `ui['${locale}']['${key}'] is untranslated`
        ).not.toBe(ui.en[key])
      }
    }
  })

  it('getTranslation returns a non-empty string for every key and locale', () => {
    for (const locale of locales) {
      for (const key of enKeys) {
        const value = getTranslation(locale, key)
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      }
    }
  })

  it('getTranslation falls back to English rather than returning undefined', () => {
    const missing = 'doesNotExist' as UiKey
    const value = getTranslation('zh-hant', missing)
    expect(value).toBeDefined()
    expect(typeof value).toBe('string')
  })

  it('every locale has a display name and an html lang code', () => {
    for (const locale of locales) {
      expect(localeNames[locale]).toBeTruthy()
      expect(htmlLang[locale]).toBeTruthy()
    }
  })

  // Unreviewed locales must stay noindex regardless of ALLOW_INDEXING.
  it('reviewed has an explicit boolean for every locale', () => {
    for (const locale of locales) {
      expect(typeof reviewed[locale]).toBe('boolean')
    }
  })
})

describe('alternatePath', () => {
  it('maps the English root to the Chinese root', () => {
    expect(alternatePath('en', '/')).toBe('/zh-hant')
  })

  it('maps the Chinese root back to the English root', () => {
    expect(alternatePath('zh-hant', '/zh-hant')).toBe('/')
  })

  it('round-trips a nested path', () => {
    const en = '/archive'
    const zh = alternatePath('en', en)
    expect(zh).toBe('/zh-hant/archive')
    expect(alternatePath('zh-hant', zh)).toBe(en)
  })
})
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`

Expected: all tests PASS. `ui.ts` already satisfies these invariants — this suite locks in behavior that currently works, so a later edit cannot silently break it.

If any test FAILS, fix `src/i18n/ui.ts`, not the test.

- [ ] **Step 6: Wire tests into CI**

In `.github/workflows/deploy.yml`, immediately after the `Typecheck` step, add:

```yaml
      - name: Test
        run: npm test
```

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts tests/i18n/locale-coverage.test.ts package.json package-lock.json .github/workflows/deploy.yml
git commit -m "Add Vitest and locale coverage tests

Guards two defects that have shipped on shengchangmd and that typecheck
and build cleanly: a locale key missing so getTranslation returns the key
name to the visitor, and a Chinese value left byte-identical to English.

CI now runs tests before the build, so a locale regression blocks the
deploy rather than shipping."
```

---

## Task 2: Fact provenance tests

**Files:**
- Create: `tests/data/facts.test.ts`

**Interfaces:**
- Consumes: `src/data/facts.ts` — exports `confirmedFacts: Fact[]`, `pendingFacts: Fact[]`, `renderableFacts: Fact[]`, `hasPendingFacts: boolean`; type `Fact = { id, en, zhHant, status, source?, note? }`; type `FactStatus = 'confirmed' | 'family' | 'unverified'`.
- Produces: nothing new; guards existing exports.

- [ ] **Step 1: Write the failing test**

Create `tests/data/facts.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  confirmedFacts,
  pendingFacts,
  renderableFacts,
  type Fact,
} from '../../src/data/facts'

describe('fact provenance', () => {
  // The core invariant: the failure mode is an incomplete page, never a
  // wrong one.
  it('no unverified fact is renderable', () => {
    for (const fact of renderableFacts) {
      expect(
        fact.status,
        `fact '${fact.id}' is unverified but renderable`
      ).not.toBe('unverified')
    }
  })

  it('every renderable fact cites a source', () => {
    for (const fact of renderableFacts) {
      expect(
        fact.source,
        `fact '${fact.id}' renders without a source`
      ).toBeTruthy()
    }
  })

  it('every renderable fact has copy in both locales', () => {
    for (const fact of renderableFacts) {
      expect(fact.en.length, `fact '${fact.id}' has no English`).toBeGreaterThan(0)
      expect(
        fact.zhHant.length,
        `fact '${fact.id}' has no Chinese`
      ).toBeGreaterThan(0)
    }
  })

  // A Chinese value identical to English means the fact was never translated.
  it('no renderable fact has identical English and Chinese copy', () => {
    for (const fact of renderableFacts) {
      expect(
        fact.zhHant,
        `fact '${fact.id}' is untranslated`
      ).not.toBe(fact.en)
    }
  })

  it('fact ids are unique across confirmed and pending', () => {
    const all: Fact[] = [...confirmedFacts, ...pendingFacts]
    const ids = all.map((f) => f.id)
    expect(new Set(ids).size, `duplicate fact id in ${ids.join(', ')}`).toBe(
      ids.length
    )
  })

  it('every pending fact is unverified', () => {
    for (const fact of pendingFacts) {
      expect(
        fact.status,
        `pending fact '${fact.id}' is not marked unverified`
      ).toBe('unverified')
    }
  })

  // facts.pending.ts is gitignored, so CI legitimately has zero pending
  // facts while a local checkout has many. Neither may break the build.
  it('builds whether or not the gitignored pending file is present', () => {
    expect(Array.isArray(pendingFacts)).toBe(true)
  })

  it('her Chinese name is exactly 張馬敏妹', () => {
    const name = confirmedFacts.find((f) => f.id === 'chinese-name')
    expect(name, 'the chinese-name fact is missing').toBeTruthy()
    expect(name!.zhHant).toBe('張馬敏妹')
  })
})
```

- [ ] **Step 2: Run the test to verify it passes**

Run: `npm test tests/data/facts.test.ts`

Expected: PASS. If the "unique ids" test fails, there is a real duplicate — fix `facts.ts` or `facts.pending.ts`, not the test.

- [ ] **Step 3: Verify the suite passes with the pending file absent**

This simulates CI, where `facts.pending.ts` is gitignored and therefore missing.

```bash
mv src/data/facts.pending.ts /tmp/facts.pending.ts
npm test
mv /tmp/facts.pending.ts src/data/facts.pending.ts
```

Expected: all tests PASS in both states. If they fail with the file absent, the `import.meta.glob` loader in `facts.ts` is broken — fix it there.

- [ ] **Step 4: Commit**

```bash
git add tests/data/facts.test.ts
git commit -m "Add fact provenance tests

Turns the prose rule into a build-enforced invariant: nothing unverified
can render, every rendered fact cites a source, and no fact ships
untranslated. Verified to pass both with and without the gitignored
facts.pending.ts, which is absent in CI."
```

---

## Task 3: Story content collection and narrative page

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/story/en.md`
- Create: `src/content/story/zh-hant.md`
- Create: `src/components/FactList.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/zh-hant/index.astro`
- Modify: `src/i18n/ui.ts`

**Interfaces:**
- Consumes: `getTranslation`, `ui` from `src/i18n/ui.ts`; `confirmedFacts`, `renderableFacts` from `src/data/facts.ts`; `Base.astro` with props `{ locale, title?, description? }`.
- Produces: collection `story` with entry ids `en` and `zh-hant`, each with frontmatter `{ title: string, locale: 'en' | 'zh-hant' }`. `FactList.astro` takes props `{ locale: Locale }`.

- [ ] **Step 1: Add the new UI keys**

In `src/i18n/ui.ts`, add these keys inside **both** the `en` and `zh-hant` objects:

```ts
    // en
    storyHeading: 'Her story',
    factsHeading: 'Service and recognition',
    sourceLabel: 'Source',
```

```ts
    // zh-hant
    storyHeading: '她的故事',
    factsHeading: '服務與榮譽',
    sourceLabel: '資料來源',
```

- [ ] **Step 2: Run the locale tests to confirm parity holds**

Run: `npm test tests/i18n/locale-coverage.test.ts`

Expected: PASS. If it fails with "is missing", a key was added to only one locale — add it to the other.

- [ ] **Step 3: Create the content collection config**

Create `src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// Long-form prose is authored separately per locale rather than translated
// field-by-field: a life story does not survive being chopped into keys, and
// the Chinese version should read as though written in Chinese.
const story = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/story' }),
  schema: z.object({
    title: z.string(),
    locale: z.enum(['en', 'zh-hant']),
  }),
})

export const collections = { story }
```

- [ ] **Step 4: Write the English narrative**

Create `src/content/story/en.md`. Only confirmed and family facts appear.

```markdown
---
title: Her story
locale: en
---

Min Mey Chang came to the United States in the late 1960s with her husband,
Dr. Sheng Chang.

She founded a Chinese school in Arcadia and served as its principal for more
than thirty years, teaching several thousand students over that time. The
school was later transferred to new leadership and is no longer running.

In May 2001, the Speaker of the California State Assembly appointed her a
public member of the California Acupuncture Board, where she served a term
expiring in July 2004.
```

**Do not add** founding years, organization names, awards, or family details.
Those facts are `unverified` and awaiting her confirmation.

- [ ] **Step 5: Write the Traditional Chinese narrative**

Create `src/content/story/zh-hant.md`:

```markdown
---
title: 她的故事
locale: zh-hant
---

張馬敏妹女士於1960年代後期與夫婿張勝雄醫師一同來到美國。

她在亞凱迪亞創辦中文學校，擔任校長逾三十年，先後教導數千名學生。學校後來移交他人經營，現已停辦。

2001年5月，加州眾議會議長任命她為加州針灸委員會公眾委員，任期至2004年7月。
```

- [ ] **Step 6: Create the FactList component**

Create `src/components/FactList.astro`:

```astro
---
import { renderableFacts } from '../data/facts'
import { type Locale } from '../i18n/ui'

interface Props {
  locale: Locale
}

const { locale } = Astro.props

// Her name is rendered in the page heading, not as a list item.
const facts = renderableFacts.filter((f) => f.id !== 'chinese-name')
---

<ul class="mt-8 space-y-6 list-none p-0">
  {
    facts.map((fact) => (
      <li class="border-l-2 pl-5" style="border-color: var(--brand)">
        <p style="color: var(--text-strong)">
          {locale === 'en' ? fact.en : fact.zhHant}
        </p>
      </li>
    ))
  }
</ul>
```

- [ ] **Step 7: Rewrite the English page**

Replace the body of `src/pages/index.astro` (keep the existing `chineseName` logic and `<h1>` block exactly as they are):

```astro
---
import Base from '../layouts/Base.astro'
import FactList from '../components/FactList.astro'
import { getTranslation } from '../i18n/ui'
import { confirmedFacts } from '../data/facts'
import { getEntry, render } from 'astro:content'

const locale = 'en' as const
const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key)

const chineseName = confirmedFacts.find((f) => f.id === 'chinese-name')?.zhHant

const entry = await getEntry('story', 'en')
if (!entry) throw new Error('Missing story content: src/content/story/en.md')
const { Content } = await render(entry)
---

<Base locale={locale}>
  <div class="mx-auto max-w-[68ch] px-6 py-16 sm:py-28">
    <h1 class="text-4xl sm:text-6xl tracking-tight" style="color: var(--brand)">
      {t('siteName')}
      {
        chineseName && (
          <span
            lang="zh-Hant"
            class="mt-3 block text-2xl sm:text-3xl font-normal tracking-normal"
            style="color: var(--text-soft)"
          >
            {chineseName}
          </span>
        )
      }
    </h1>

    <p class="mt-8 text-xl sm:text-2xl leading-relaxed" style="color: var(--text-strong)">
      {t('siteTagline')}
    </p>

    <h2 class="mt-16 text-2xl" style="color: var(--brand)">{t('storyHeading')}</h2>
    <div class="mt-6 space-y-5 text-lg leading-relaxed" style="color: var(--text-strong)">
      <Content />
    </div>

    <h2 class="mt-16 text-2xl" style="color: var(--brand)">{t('factsHeading')}</h2>
    <FactList locale={locale} />

    <p class="mt-16 text-base" style="color: var(--text-soft)">
      {t('holdingNotice')}
    </p>
  </div>
</Base>
```

- [ ] **Step 8: Rewrite the Chinese page**

Replace the body of `src/pages/zh-hant/index.astro`. Note the wider measure —
full-width Han characters read comfortably at ~40 characters, not ~68:

```astro
---
import Base from '../../layouts/Base.astro'
import FactList from '../../components/FactList.astro'
import { getTranslation, ui } from '../../i18n/ui'
import { getEntry, render } from 'astro:content'

const locale = 'zh-hant' as const
const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key)

const englishName = ui.en.siteName

const entry = await getEntry('story', 'zh-hant')
if (!entry) throw new Error('Missing story content: src/content/story/zh-hant.md')
const { Content } = await render(entry)
---

<Base locale={locale}>
  <div class="mx-auto max-w-[40ch] px-6 py-16 sm:py-28">
    <h1 class="text-4xl sm:text-6xl tracking-tight" style="color: var(--brand)">
      {t('siteName')}
      <span
        lang="en"
        class="mt-3 block text-2xl sm:text-3xl font-normal tracking-normal"
        style="color: var(--text-soft)"
      >
        {englishName}
      </span>
    </h1>

    <p class="mt-8 text-xl sm:text-2xl leading-relaxed" style="color: var(--text-strong)">
      {t('siteTagline')}
    </p>

    <h2 class="mt-16 text-2xl" style="color: var(--brand)">{t('storyHeading')}</h2>
    <div class="mt-6 space-y-5 text-lg" style="color: var(--text-strong)">
      <Content />
    </div>

    <h2 class="mt-16 text-2xl" style="color: var(--brand)">{t('factsHeading')}</h2>
    <FactList locale={locale} />

    <p class="mt-16 text-base" style="color: var(--text-soft)">
      {t('holdingNotice')}
    </p>
  </div>
</Base>
```

- [ ] **Step 9: Build and verify the output directly**

```bash
npm run build
```

Then verify the built HTML rather than trusting the build's exit code:

```bash
grep -c 'Acupuncture' dist/index.html
grep -c '針灸' dist/zh-hant/index.html
grep -c 'noindex' dist/index.html dist/zh-hant/index.html
grep -o 'Min Mey Chang' dist/zh-hant/index.html | wc -l
```

Expected: `1`, `1`, `1` and `1`, and exactly `1` (the name pairing only — any
more means English prose leaked onto the Chinese page).

- [ ] **Step 10: Confirm no unverified content reached the pages**

```bash
grep -ci 'golden apple\|shih chien\|buddha\|calligraphy\|grandchild' dist/index.html
```

Expected: `0`. Any hit means an unverified fact was published — remove it.

- [ ] **Step 11: Run the full suite**

Run: `npm test`

Expected: all PASS.

- [ ] **Step 12: Commit**

```bash
git add src/content.config.ts src/content/story src/components/FactList.astro src/pages/index.astro src/pages/zh-hant/index.astro src/i18n/ui.ts
git commit -m "Replace holding page with narrative page in both locales

Long-form prose lives in Astro content collections, authored separately per
locale rather than translated field-by-field. Only confirmed and family facts
appear; the eight unverified claims are absent by construction.

The Chinese page uses a ~40ch measure against the English page's ~68ch,
because full-width Han characters read comfortably at roughly half the
character count."
```

---

## Task 4: Timeline

**Files:**
- Create: `src/data/timeline.ts`
- Create: `src/components/Timeline.astro`
- Create: `tests/data/timeline.test.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/zh-hant/index.astro`
- Modify: `src/i18n/ui.ts`

**Interfaces:**
- Consumes: `renderableFacts` from `src/data/facts.ts`; `getTranslation`, `type Locale` from `src/i18n/ui.ts`.
- Produces: `src/data/timeline.ts` exports `type TimelineEvent = { id: string; year: number; yearDisplay?: { en: string; zhHant: string }; en: string; zhHant: string; factId?: string }` and `timeline: TimelineEvent[]` (sorted ascending by `year`). `Timeline.astro` takes props `{ locale: Locale }`.

- [ ] **Step 1: Create the timeline data**

Create `src/data/timeline.ts`:

```ts
// Dated events, ordered oldest first.
//
// `year` is always a number so sorting works. When the real date is imprecise,
// `yearDisplay` overrides what the visitor sees — her arrival is known only as
// "the late 1960s", and rendering a false precision like "1967" would be
// exactly the kind of invented fact this project forbids.
//
// Every entry must correspond to a confirmed or family fact. Adding an event
// here for an unverified claim bypasses the provenance gate — the test in
// tests/data/timeline.test.ts fails if you do.

export type TimelineEvent = {
  id: string
  year: number
  yearDisplay?: { en: string; zhHant: string }
  en: string
  zhHant: string
  /** id of the backing fact in facts.ts */
  factId?: string
}

export const timeline: TimelineEvent[] = [
  {
    id: 'arrival',
    year: 1968,
    yearDisplay: { en: 'Late 1960s', zhHant: '1960年代後期' },
    en: 'Came to the United States with her husband, Dr. Sheng Chang.',
    zhHant: '與夫婿張勝雄醫師一同來到美國。',
    factId: 'immigration-arrival',
  },
  {
    id: 'acupuncture-board',
    year: 2001,
    en: 'Appointed a public member of the California Acupuncture Board by the Speaker of the State Assembly.',
    zhHant: '經加州眾議會議長任命為加州針灸委員會公眾委員。',
    factId: 'acupuncture-board',
  },
]
```

- [ ] **Step 2: Write the failing test**

Create `tests/data/timeline.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { timeline } from '../../src/data/timeline'
import { renderableFacts } from '../../src/data/facts'

describe('timeline', () => {
  it('is sorted oldest first', () => {
    const years = timeline.map((e) => e.year)
    expect(years).toEqual([...years].sort((a, b) => a - b))
  })

  it('has unique ids', () => {
    const ids = timeline.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has copy in both locales for every event', () => {
    for (const event of timeline) {
      expect(event.en.length, `event '${event.id}' has no English`).toBeGreaterThan(0)
      expect(event.zhHant.length, `event '${event.id}' has no Chinese`).toBeGreaterThan(0)
      expect(event.zhHant, `event '${event.id}' is untranslated`).not.toBe(event.en)
    }
  })

  // The timeline must not become a side door around the provenance gate.
  it('every event backed by a fact references a renderable one', () => {
    const renderableIds = new Set(renderableFacts.map((f) => f.id))
    for (const event of timeline) {
      if (!event.factId) continue
      expect(
        renderableIds.has(event.factId),
        `event '${event.id}' cites fact '${event.factId}', which is not renderable`
      ).toBe(true)
    }
  })

  it('provides both locales whenever a display year overrides the real one', () => {
    for (const event of timeline) {
      if (!event.yearDisplay) continue
      expect(event.yearDisplay.en.length).toBeGreaterThan(0)
      expect(event.yearDisplay.zhHant.length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 3: Run the test**

Run: `npm test tests/data/timeline.test.ts`

Expected: PASS. If "cites fact … which is not renderable" fails, the referenced
fact is still `unverified` — remove the timeline event rather than promoting
the fact.

- [ ] **Step 4: Add the timeline heading keys**

In `src/i18n/ui.ts`, add to **both** locale objects:

```ts
    // en
    timelineHeading: 'Timeline',
```

```ts
    // zh-hant
    timelineHeading: '年表',
```

- [ ] **Step 5: Create the Timeline component**

Create `src/components/Timeline.astro`:

```astro
---
import { timeline } from '../data/timeline'
import { type Locale } from '../i18n/ui'

interface Props {
  locale: Locale
}

const { locale } = Astro.props
---

<ol class="mt-8 space-y-8 list-none p-0">
  {
    timeline.map((event) => {
      const year = event.yearDisplay
        ? locale === 'en'
          ? event.yearDisplay.en
          : event.yearDisplay.zhHant
        : String(event.year)
      return (
        <li class="grid grid-cols-[auto_1fr] gap-x-5">
          <span
            class="tabular-nums text-sm pt-1 whitespace-nowrap"
            style="color: var(--brand)"
          >
            {year}
          </span>
          <span style="color: var(--text-strong)">
            {locale === 'en' ? event.en : event.zhHant}
          </span>
        </li>
      )
    })
  }
</ol>
```

- [ ] **Step 6: Add the timeline to both pages**

In `src/pages/index.astro` and `src/pages/zh-hant/index.astro`, import the
component (adjusting the relative path — `../components/Timeline.astro` for the
English page, `../../components/Timeline.astro` for the Chinese one):

```astro
import Timeline from '../components/Timeline.astro'
```

Then insert this block immediately **before** the `factsHeading` `<h2>` on each page:

```astro
    <h2 class="mt-16 text-2xl" style="color: var(--brand)">{t('timelineHeading')}</h2>
    <Timeline locale={locale} />
```

- [ ] **Step 7: Build and verify the output**

```bash
npm run build
grep -o 'Late 1960s' dist/index.html
grep -o '1960年代後期' dist/zh-hant/index.html
grep -c '1968' dist/index.html
```

Expected: `Late 1960s`, `1960年代後期`, and **`0`** for the third — the real
sort key must never reach the page, because 1968 is a placeholder for
"late 1960s" and would assert a precision nobody has confirmed.

- [ ] **Step 8: Run the full suite**

Run: `npm test && npm run build`

Expected: all tests PASS, build completes, `verify-css` reports OK.

- [ ] **Step 9: Commit**

```bash
git add src/data/timeline.ts src/components/Timeline.astro tests/data/timeline.test.ts src/pages/index.astro src/pages/zh-hant/index.astro src/i18n/ui.ts
git commit -m "Add timeline to both locales

Events sort on a numeric year but render yearDisplay when the real date is
imprecise, so her arrival shows as 'Late 1960s' rather than asserting a
false 1968. A test verifies the sort key never reaches the page.

A further test prevents the timeline becoming a side door around the
provenance gate: any event citing a fact fails the suite unless that fact
is renderable."
```

---

## Deploy verification (after the final task)

The deploy is not confirmed by a green workflow. Verify the live site, and do
it against a GitHub IP — a stale local resolver will happily serve Squarespace's
parking page with a valid certificate and a `200`.

```bash
SHA=$(git rev-parse HEAD)
RUN=$(gh run list --repo thirstypig/minmeychang --limit 10 --json databaseId,headSha \
  --jq ".[] | select(.headSha==\"$SHA\") | .databaseId" | head -1)
gh run watch "$RUN" --repo thirstypig/minmeychang --exit-status

curl -sSL --resolve minmeychang.com:443:185.199.108.153 https://minmeychang.com/ \
  | grep -o 'Acupuncture'
curl -sSL --resolve minmeychang.com:443:185.199.108.153 https://minmeychang.com/zh-hant/ \
  | grep -o '針灸'
```

Select the run by `headSha`, never by `--limit 1`. Immediately after a push the
newest run may not exist yet, and `gh run watch` will return success for the
*previous* run.

---

## Deferred — not in this plan

**The photo and document archive.** No photographs or scans have been supplied,
so there is nothing to build against. Needs its own plan once material arrives,
covering the EXIF assertion and the signature/address redaction gate from the
spec.

**Chinese webfont subsetting.** Noto Serif TC at ~10MB subset down to the glyphs
actually used. A pure optimization — the system font stack renders correctly
today.

**The eight unverified facts.** Blocked on her interview, not on engineering.
