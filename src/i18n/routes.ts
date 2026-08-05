import { type Locale, type UiKey } from './ui'

// Single source of truth for the site's pages: drives the persistent
// navigation, the previous/next links, and tests/i18n/route-coverage.test.ts.
//
// Structure follows senior-UX guidance (NN/g): several short pages with plain,
// persistent navigation beat one long scroll for readers in their seventies
// and eighties, who are this site's actual audience. Deliberately FLAT — no
// sublevels, one function per link, home reachable from everywhere.
//
// The cost is 12 bilingual routes instead of 4, which is exactly the surface
// where English silently leaks onto a Chinese page. Hence the route test.

export type RouteId =
  | 'home'
  | 'story'
  | 'timeline'
  | 'service'
  | 'talks'
  | 'archive'

export type Route = {
  id: RouteId
  /** Path segment after the locale prefix. Empty string is the home page. */
  segment: string
  /** Key in ui.ts supplying this page's label, in both locales. */
  labelKey: UiKey
  /** Home is the hub; it is not part of the previous/next reading order. */
  inReadingOrder: boolean
}

export const routes: Route[] = [
  { id: 'home', segment: '', labelKey: 'navHome', inReadingOrder: false },
  { id: 'story', segment: '/story', labelKey: 'storyHeading', inReadingOrder: true },
  {
    id: 'timeline',
    segment: '/timeline',
    labelKey: 'timelineHeading',
    inReadingOrder: true,
  },
  {
    id: 'service',
    segment: '/service',
    labelKey: 'factsHeading',
    inReadingOrder: true,
  },
  { id: 'talks', segment: '/talks', labelKey: 'talksHeading', inReadingOrder: true },
  {
    id: 'archive',
    segment: '/archive',
    labelKey: 'archiveTitle',
    inReadingOrder: true,
  },
]

export const readingOrder = routes.filter((r) => r.inReadingOrder)

/** Absolute path for a route in a given locale. */
export function routePath(locale: Locale, id: RouteId): string {
  const route = routes.find((r) => r.id === id)
  if (!route) throw new Error(`Unknown route id: ${id}`)
  const prefix = locale === 'en' ? '' : '/zh-hant'
  return `${prefix}${route.segment}` || '/'
}

/** The page before and after this one in the reading order. */
export function neighbours(id: RouteId): {
  previous: Route | null
  next: Route | null
} {
  const index = readingOrder.findIndex((r) => r.id === id)
  if (index === -1) return { previous: null, next: null }
  return {
    previous: index > 0 ? readingOrder[index - 1]! : null,
    next: index < readingOrder.length - 1 ? readingOrder[index + 1]! : null,
  }
}
