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
// Her three sons are named in the story but have no sites here; do not invent
// URLs for them.

export type Relation = 'spouse' | 'grandchild'

export type FamilyMember = {
  id: string
  name: string
  /** Only where it is confirmed. Never transliterate a name to fill this in. */
  nameZhHant?: string
  relation: Relation
  url: string
  /** Verified reachable on this date. */
  verified: string
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
export const grandchildren = family.filter((m) => m.relation === 'grandchild')
