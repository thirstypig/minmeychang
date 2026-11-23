import { archive, categoryPages, type ArchiveItem } from './archive'
import { routePath } from '../i18n/routes'
import type { Locale } from '../i18n/ui'

// Share links for single photos. A link like /school#<id> previews as the
// generic site card, because messaging apps drop the #fragment when they fetch
// a preview. /photo/<id> is a real page carrying that photo's own preview
// tags; it forwards the visitor straight on to photoHomePath() + '#<id>'.
// Pages: src/pages/photo/[id].astro and its zh-hant twin.

/** Every item that can be shared: those with a published image. */
export const sharedItems: ArchiveItem[] = archive.filter((i) => i.asset)

/** '/photo/' or '/zh-hant/photo/': the archive viewer appends '<id>/' itself. */
export function photoShareBase(locale: Locale): string {
  return `${locale === 'en' ? '' : '/zh-hant'}/photo/`
}

/** Trailing slash included: GitHub Pages would otherwise redirect once. */
export function photoSharePath(locale: Locale, id: string): string {
  return `${photoShareBase(locale)}${id}/`
}

/** The page the item lives on: its category's own page, else the archive.
 *  An item also shown on a second page (alsoShownOn) still goes home. */
export function photoHomePath(locale: Locale, item: ArchiveItem): string {
  return routePath(locale, categoryPages[item.category] ?? 'archive')
}
