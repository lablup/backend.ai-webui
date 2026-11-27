# Korean companion — reference

Every ADR is a pair (ADR 0018): `NNNN-title.md` in English is the authority,
and `NNNN-title.ko.md` is its Korean translation. `docs/ARCHITECTURE.md` and
`docs/ARCHITECTURE.ko.md` are a pair the same way. This file holds the rules
for the Korean file; the English file follows
[writing-rules.md](writing-rules.md) and [document-shape.md](document-shape.md).

## Shape (K1–K4)

`scripts/check-adr-pairs.mjs` checks K1–K3 and fails `scripts/verify.sh`.

| id | rule | fix |
|----|------|-----|
| K1 | Line 1 is the English H1 title, unchanged | copy `# NNNN — <English noun phrase>` from the English file; the title stays searchable in one language |
| K2 | The same `###` subsections, in the same order | translate each `### N.` heading, keep the number and the identifiers in backticks |
| K3 | The same mermaid diagrams | keep node ids and syntax; translate the label text |
| K4 | Translation only | no decision, fact, number, identifier, path, or list item that the English file lacks; when the English file changes, the `.ko.md` changes in the same PR |

A Korean-only change (a translation fix) needs no English change. An English
change always needs a Korean one.

## Section headings

| English file | Korean file |
|---|---|
| `## Summary` | `## Summary` |
| `## Context` | `## Context` |
| `## Diagram` | `## 설계도` |
| `## Decision` | `## Decision` |
| `## Rejected alternatives` | `## 대안과 기각 사유` |
| `## Consequences` | `## Consequences` |
| `## Sources` (`Related:`) | `## 출처` (`관련:`) |
| `## Glossary` | `## 용어` |

- The Summary note is `> 낯선 용어는 문서 맨 아래 [용어](#용어)에 모아 두었다.`
  GitHub keeps Hangul heading slugs, so `#용어` resolves.
- A link to another ADR points at its `.ko.md`, with that file's Korean
  anchor (`0010-component-level-manager-version-gates.ko.md#용어`).

## Language (L1–L5 in Korean)

| id | rule | fix |
|----|------|-----|
| L1 | Do not coin awkward Korean calques for English technical terms | write the English word inside the Korean sentence: fragment, atom, search param, leaf component; never `조각` for "fragment" |
| L5 | Do not carry an English metaphor into Korean. Write what happens instead | not `삼킨다` but `mutation을 보내지 않는다`; not `구멍` but `막는 것이 없다` |

L1 keeps the English term because the code is written with that word, so a
reader can go and find it. A metaphor has nothing to find: `swallow` sitting
in a Korean sentence is still a figure. Delete it and write the mechanism.

## Sentences

- **Labels stay English (S8)**: an explaining bullet opens with the English
  label of the English file, then the Korean detail:
  `- **Required prop**: prop이 필수라서 TypeScript가 모든 call site에 project 결정을 강제한다.`
  A Korean coinage as a label (`- **결정의 축**:`) is the most common way an
  invented term enters a document.
- **Name the actor (S9)**: Korean drops subjects freely, so put one back.

  | wrong | right |
  |---|---|
  | `같은 값을 두 곳에서 읽으면 어긋난다.` | `page와 leaf component가 같은 atom을 각자 읽고 있다.` |
  | `두 값이 같은지 검사하는 것이 없다.` | `두 값이 같은지 아무도 검사하지 않는다.` |
  | `헤더에는 이미 있다.` | `` `WebUIHeader`에는 `ProjectSelect`가 이미 있다. `` |

- **One register (S7)**: plain declarative `~다` sentences.

  | wrong | right |
  |---|---|
  | `이 설계는 훨씬 깔끔하고 안전한 구조를 제공합니다!` | `이 설계는 project 선택을 page 한 곳으로 모은다.` |
  | `아마도 대부분의 경우에는 문제가 없을 것으로 보입니다.` | `page 밖에서 mount되는 component는 route로 판정한다. 그 밖의 경로는 아직 검증하지 않았다.` |

- **Complete sentences (S4)**: no `=` shorthand or arrow chains; the reader
  never reconstructs a missing verb.
- A glossary row is a full Korean sentence: "ambient read | component가 prop이
  아니라 전역 atom이나 hook에서 현재 값을 직접 읽는 것이다".

## Reread

Read the two files side by side before landing. The gate checks shape, not
meaning: a Korean sentence that adds, drops, or softens a fact is a defect the
reviewer catches, not the script.
