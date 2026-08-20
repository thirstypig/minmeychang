// Family members with sites of their own.
//
// These are links to people, which makes them different from every other link
// on this site. Two rules follow:
//
// 1. NAMES ONLY, NEVER AGES. Ages go stale immediately and a living private
//    person's age adds nothing a tribute page needs. The same rule already
//    governs her sons in facts.ts.
//
// 2. ONLY LINK A SITE THAT ALREADY PUBLISHES THE PERSON'S NAME. Each domain
//    below is the person's own name and each site titles itself with it, so
//    linking exposes nothing that was not already public. It does publish the
//    family connection — which is the family's decision to make, and was made
//    on 2026-08-05.
//
// 3. A SON WITHOUT A SITE IS STILL LISTED. `url` is optional as of 2026-08-20,
//    when the sons were added at the family's direction. James has a site;
//    Peter and Richard do not, and their names render as plain text rather
//    than being omitted or pointed at a guessed domain. Listing two brothers
//    and silently dropping the third would be worse than listing none.
//    Do not invent URLs for them.

export type Relation = 'spouse' | 'child' | 'grandchild'

export type FamilyMember = {
  id: string
  name: string
  /** Only where it is confirmed. Never transliterate a name to fill this in. */
  nameZhHant?: string
  relation: Relation
  /** Absent where the person has no site of their own. Never guessed. */
  url?: string
  /** Verified reachable on this date. Absent when there is no url. */
  verified?: string
}

export const family: FamilyMember[] = [
  {
    id: 'sheng-chang',
    name: 'Sheng Chang, M.D.',
    nameZhHant: '張勝雄醫師',
    relation: 'spouse',
    url: 'https://shengchangmd.com',
    verified: '2026-08-05',
  },
  // Birth order: James, Peter, Richard — as given in facts.ts and the family's
  // own biography. Kept in that order deliberately; it is not alphabetical and
  // must not be re-sorted.
  {
    id: 'james-chang',
    name: 'James Chang',
    relation: 'child',
    url: 'https://jameschang.co/now/',
    verified: '2026-08-20',
  },
  {
    id: 'peter-chang',
    name: 'Peter Chang',
    relation: 'child',
  },
  {
    id: 'richard-chang',
    name: 'Richard Chang',
    relation: 'child',
  },
  {
    id: 'tobin-chang',
    name: 'Tobin Chang',
    relation: 'grandchild',
    url: 'https://tobinchang.com',
    verified: '2026-08-05',
  },
  {
    id: 'jarren-chang',
    name: 'Jarren Chang',
    relation: 'grandchild',
    url: 'https://jarrenchang.com',
    verified: '2026-08-05',
  },
  {
    id: 'rhys-chang',
    name: 'Rhys Chang',
    relation: 'grandchild',
    url: 'https://rhyschang.com',
    verified: '2026-08-05',
  },
]

export const spouse = family.find((m) => m.relation === 'spouse')
export const children = family.filter((m) => m.relation === 'child')
export const grandchildren = family.filter((m) => m.relation === 'grandchild')

/** Everyone with a site, for the link check in tests/data/family.test.ts. */
export const linkedFamily = family.filter(
  (m): m is FamilyMember & { url: string; verified: string } => Boolean(m.url)
)
