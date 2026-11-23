# Arcadia Chinese School page — design

Date: 2026-11-23 · Size: small change (short design) · Pattern: the Calligraphy page (#57–#58)

## Intent

The school she founded in 1982 and led for thirty years is the center of her
public record, but today it is one section of the archive. James wants it to
have its own page, made "in the same way" as Calligraphy: her record in words,
then the photographs and clippings, each shareable.

## Decided by James (2026-11-23)

- **All 19 items** in the archive's "The Arcadia Chinese School" section move to
  the new page (12 photos, 7 documents). The archive loses that section
  (141 → 122 items). Any item can be moved back later, as the two exhibition
  photos were.
- **Layout:** each item shown large with its caption and its own share button,
  grouped under 1980s / 1990s / 2000s headings.

## My calls (correct any)

- **Title:** "The Arcadia Chinese School" / 「亞凱迪亞中文學校」 (the archive's
  existing section label). **Menu label:** "School" / 「中文學校」.
- **Menu order:** home, story, timeline, service, talks, **school, calligraphy,
  archive**. The archive stays last as the catch-all.
- **Menu layout with eight buttons:** 3+3+2 on phones (2+2+2+2 with enlarged
  text), 4+4 from 640px. The seven-specific "last button spans its row" rule is
  removed.
- **Words:** no new facts. The intro is the existing, already-sourced school
  facts in reading order: founded 1982 and principal for 30+ years; afternoon,
  summer and extracurricular programs; thousands of students; the district
  relationship; the I-20 approval; the three educator delegations; president of
  the Southern California Council of Chinese Schools; and that the school was
  later handed on and is no longer running. Each renders only while its fact is
  renderable.
- **Old links:** `/archive#<any of the 19>` and the old section and decade
  anchors (`#chinese-school`, `#chinese-school-1980s`…) redirect to the new page.
- **Code:** the Calligraphy page component becomes one shared component
  (items, fact ids, optional decade grouping) used by both pages. The
  "moved to its own page" logic (archive exclusion, recently-added filter,
  redirect) is generalized from calligraphy to a category → page map.

## Non-goals

- No new copy beyond headings and the page description; no changes to captions.
- No change to the archive's other four sections.

## Approaches considered

- **Chosen:** reuse the Calligraphy pattern (category excluded from the
  archive, shared page component, redirect map).
- **Rejected:** a copy of the Calligraphy component for the school. It's
  quicker, but two copies of the share and caption markup would drift apart.
