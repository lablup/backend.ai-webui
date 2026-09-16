# Document shape — reference

Rule ids D3–D4, the ADR section skeleton, the heading language, the
one-diagram floor, and the mermaid syntax traps, used by the `adr-writing`
skill. The rules for titles, terms, sentences, and D1–D2 are in
[writing-rules.md](writing-rules.md).

## Shape (D3–D4)

| id | rule | fix |
|----|------|-----|
| D3 | Follow the ADR section skeleton | see below |
| D4 | The first document of a multi-document increment carries the overview | give a one-line definition of each component and one diagram of how they relate; siblings link to it instead of redrawing it |

## Mermaid in a document

D2 says draw what moves. An ADR also carries a floor: it describes a system,
so it carries at least one diagram.

Label every edge with what actually crosses it, such as `project prop`,
`useFragment(queryRef)`, or `mutation variables`. Mark which boxes read
ambient state or hold a side effect, because a boundary a reader has to infer
is a boundary they will get wrong.

Diagrams across sibling documents must use the same component decomposition.
A reader moving between two ADRs should recognise the same boxes.

## D3 — ADR section skeleton

- `# NNNN — <English noun-phrase title>` (T1–T6; the `NNNN — ` prefix is the
  skeleton, not an appended qualifier)
- `## Summary` — complete-sentence bullets. If unfamiliar terms appear, open
  with `> 낯선 용어는 문서 맨 아래 [용어](#용어)에 모아 두었다.`
- `## Context` — what exists today and why a decision is needed. When the
  decision introduces a component, say in one sentence what that component is
  before saying why it is needed, and say what it is not whenever the name
  invites the wrong reading.
- `## 설계도` — mermaid. Give each diagram its own heading when there are
  several.
- `## Decision` — `### N. <heading>` per decision, one idea each. Inventories
  as tables. Name the file, type, prop, or rule the decision lands in.
- `## 대안과 기각 사유` — one bullet per alternative: what it is, its
  advantage, that it is rejected, and why.
- `## Consequences` — gains and limits, as complete-sentence bullets.
- `## 출처` — the Jira issues and the sources the decision rests on, the date
  the decision was made, then a `관련:` line linking the neighbouring ADRs.
- `## 용어` — the glossary table, when the document introduced a term a
  first-time reader would not know.

Section headings follow the body language. The four headings that differ:

| Korean body | English body |
|---|---|
| `## 설계도` | `## Diagram` |
| `## 대안과 기각 사유` | `## Rejected alternatives` |
| `## 출처` | `## Sources` |
| `## 용어` | `## Glossary` |

## Mermaid syntax traps

| trap | why it breaks | write instead |
|---|---|---|
| `A -. .-> B` | a dotted link whose label is only whitespace does not parse | `A -.-> B` |
| `{}` or `\|` inside a flowchart node label | the characters carry shape meaning | rewrite the label, or use a sequence diagram where message text is plain |
| a floating `NOTE[...]` node to caption a group | reads as a component that does not exist | use a `subgraph` whose title is the caption |

The first two rows show as a syntax error on GitHub's rendered page. The
third breaks nowhere: a floating caption node is valid mermaid, and only a
reader can see that it names a component which does not exist.
