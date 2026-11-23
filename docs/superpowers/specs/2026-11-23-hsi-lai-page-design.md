# Hsi Lai Temple & Buddha's Light page — design

Date: 2026-11-23 · Size: small change · Pattern: the School page (#60), via `categoryPages`

## Decided by James (2026-11-23)

- The "Arcadia chapter of the Temple Supporters" is Buddha's Light International
  Association's Arcadia chapter, already on the site with two published sources
  (`blia` fact). No new claim about the chapter.
- Title "Hsi Lai Temple & Buddha's Light" / 「西來寺與國際佛光會」; menu "Hsi Lai" / 「西來寺」.
- All 10 photos in the archive's Buddha's Light category move (archive 122 → 112).
- New fact, family tier, approved wording: "A member of Hsi Lai Temple in Hacienda
  Heights, where she volunteers." / 「她是位於哈仙達崗的西來寺信眾，並在寺中擔任志工。」

## My calls

- Route `temple`, path `/hsi-lai`. Menu: … talks, school, hsi lai, calligraphy, archive.
- Intro facts, as a list: `hsi-lai-member` (new), `blia`, `calligraphy` (mentions Hsi Lai).
- Photos grouped by decade (anchors `buddhist-<decade>s`, matching the archive's, so
  old links redirect through the existing map with no new code).
- Nine menu buttons: 3+3+3 on phones; 5+4 from 40rem (the floor becomes a fifth
  of the row), falling back at enlarged text.

## Build steps (in place of a separate plan: one category line plus the School pattern)

1. Data: `categoryPages.buddhist = 'temple'`; new fact. Tests first (10 items, archive
   112 in three sections, fact wording exact, recently-added excludes them).
2. Route, keys, page pair, nav CSS; measure the menu (no clipping).
3. Browser checks: redirects for an item, `#buddhist`, a decade anchor; page width at
   all widths/sizes; share check. README, STATUS. PR, review, merge, verify live.
