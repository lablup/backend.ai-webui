# Document shape — reference

Rule ids D3–D4 and the ADR section skeleton, used by the `adr-writing` skill.
Both bind documents under `docs/adr/` only.

The rules that bind the whole document — titles (T1–T6), language (L1–L5),
sentences (S1–S10), and body shape (D1–D2 — the Summary a body opens with,
and the diagram a flow gets) — live in [writing-rules.md](writing-rules.md).
Read those first; this file adds what only a document has.

The lifecycle is not a writing rule. It lives in the `adr-writing` skill's
**ADR file conventions** section: a retired ADR either keeps its file and
gains a `> superseded by NNNN` top line, or is deleted outright. Deleting is
allowed, and numbers are never reused, so a gap in the sequence is expected.

## Shape (D3–D4)

| id | rule | fix |
|----|------|-----|
| D3 | Follow the ADR section skeleton | see below |
| D4 | The first document of a multi-document increment carries the overview | give a one-line definition of each component and one diagram of how they relate; siblings link to it instead of redrawing it |

## Mermaid in a document

D2 says draw what moves. A document under `docs/adr/` also carries a floor:
an ADR describes a system, so it carries at least one diagram. The floor is a
document rule and reaches no other surface — a PR body draws when it has
something that moves and otherwise draws nothing.

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
- `## 출처` — the Jira issues and the sources the decision rests on, then a
  `관련:` line linking the neighbouring ADRs.
- `## 용어` — the glossary table, when the document introduced a term a
  first-time reader would not know.

## Mermaid syntax traps

| trap | why it breaks | write instead |
|---|---|---|
| `A -. .-> B` | a dotted link whose label is only whitespace does not parse | `A -.-> B` |
| `{}` or `\|` inside a flowchart node label | the characters carry shape meaning | rewrite the label, or use a sequence diagram where message text is plain |
| a floating `NOTE[...]` node to caption a group | reads as a component that does not exist | use a `subgraph` whose title is the caption |

GitHub renders every diagram when the document is read, so the first two rows
show a syntax error on the page — read the branch's rendered view before
landing, because no CI check catches them. The third breaks nowhere: a
floating caption node is valid mermaid, and only a reader can see that it
names a component which does not exist.
