---
status: pending
priority: p2
issue_id: 009
tags: [code-review, i18n, verification]
dependencies: []
---

# The 简体 table misses 32 characters already used in the site's Chinese copy

## Problem Statement

`tests/data/chinese-copy.test.ts:121-132` curates 60 simplified→traditional
pairs by hand. The stated regression is that mainland sources get read during
research — three of the sites consulted for the hospital facts were 简体. The
table only catches a paste if the specific character happens to be listed.

## Findings

Reported by review agent: every character in the 115 collected `zh-hant`
strings was cross-checked against the table. Traditional characters **in use
on the site today** whose simplified counterpart is absent from the table:

    該该 後后 過过 來来 個个 對对 發发 現现 經经 業业 應应
    問问 題题 進进 處处 農农 總总 聯联 獲获 擔担 歷历 親亲
    從从 選选 參参 積积 課课 導导 榮荣 譽誉 獎奖 幾几

Boundary confirmed by mutation: appending `学` fails; appending `该` → 5/5 pass.

`獲 擔 榮 譽 獎 課 導` are the awards-and-service vocabulary of this site — the
highest-probability paste targets. `該` also appears in the anaphor list at
:173 and inside the new `methodist-hospital-board` zhHant string.

## Proposed Solutions

**A. Invert the check — embed the simplified-only codepoint set** (~2,500
chars, from OpenCC `STCharacters` or Unihan `kSimplifiedVariant`) as a
constant, rather than curating pairs by hand. Turns "the ones we thought of"
into the rule. Effort: Medium. Risk: low, but the set must exclude characters
valid in Traditional (the existing comment's care about `台` and `里` still
applies, and `敏` is the cautionary tale already recorded at :124-126).

**B. Extend the hand table with the 32 above.** Cheap, keeps the readable
mapping and its teaching comments, still leaves the next gap unguarded.
Effort: Small.

## Recommended Action

_(blank — for triage)_

## Acceptance Criteria

- [ ] Appending `该` to a rendered `zhHant` string fails.
- [ ] Her name 張馬敏妹 still passes (the `敏` regression must not return).
- [ ] `台` and `里` still pass.

## Work Log

- 2026-08-20 — Found by review agent during `/ce:review` of PR #18.
