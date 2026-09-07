# Writing rules — reference

Rule ids used by the `adr-writing` skill, grouped by four angles. They bind
every document under `docs/adr/` and the `docs/ARCHITECTURE.md` index. Cite
the id when reporting a finding ("T1 violation") and when reporting a fix
("rewrote the title, T1").

D3–D4, the section skeleton, and the mermaid traps are in
[document-shape.md](document-shape.md). PR and issue titles follow the
`prefix(FR-NNNN): title` form that `AGENTS.md` fixes, not these rules.

## Angle 1 — Title (T1–T6)

| id | rule | fix |
|----|------|-----|
| T1 | A title NAMES its subject; it does not explain it | write a noun phrase for what the thing IS; the explanation moves to the Summary |
| T2 | No colon subtitle | needing one means the title is not doing its job — rewrite the title |
| T3 | No term a first-time reader would not know | name the concrete thing instead, even if the body defines the term later |
| T4 | Every title is English | a document keeps its Korean body and takes an English title |
| T5 | One intent per title | if the title needs "and", a comma, or a second clause to hold two things, it is covering two decisions — split them |
| T6 | Nothing is appended to a title — no parentheses, brackets, Jira key, or trailing qualifier | the qualifier goes in the body; the Jira key goes in `## 출처`; a supersede pointer goes on its own line |

Three forms, one right:

| form | example |
|---|---|
| names it (correct) | `Explicit project prop contract for leaf components` |
| explains it (wrong) | `Leaf components take the project as a prop instead of reading it` |
| opens with jargon (wrong) | `Ambient-read elimination: the leaf tier` |

Test: read the title alone, without the body. Does it tell you what the
document is about, or does it argue a point you cannot yet follow?

T2 and T6 in practice:

| wrong | why | right |
|---|---|---|
| `ADR-0001: Explicit project prop contract for leaf components` | a colon after the number (T2); the `NNNN — ` prefix is the skeleton | `0001 — Explicit project prop contract for leaf components` |
| `0002 — Relay pagination modes (FR-3430, supersedes 0001 §3)` | a Jira key and a supersede note appended (T6) | `0002 — Relay pagination modes`, with the key in `## 출처` and the pointer on its own line |

## Angle 2 — Language (L1–L5)

| id | rule | fix |
|----|------|-----|
| L1 | Do not coin awkward Korean calques for English technical terms | write the English word inside the Korean sentence: fragment, atom, search param, leaf component |
| L2 | The glossary sits at the END under `## 용어`, linked from first use | `[ambient read](#용어)`; GitHub keeps Hangul heading slugs, so the anchor resolves |
| L3 | Explain any term a first-time reader would not know, with a reference | give the meaning and point at the ADR, the source file, or the upstream doc |
| L4 | Do not invent a term. Use the name the repository already uses | grep `react/` and `packages/` for the thing; if it has no name, describe it instead of naming it |
| L5 | Do not carry an English metaphor into Korean. Write what happens instead | not `삼킨다` but `mutation을 보내지 않는다`; not `구멍` but `막는 것이 없다` |

Banned example for L1: writing `조각` for "fragment". Write `fragment`, or
better, name the concrete thing — `useFragment`, the `queryRef` prop.

L5 is not L1 with a different word, and its fix is the opposite one. L1 says
to keep the English term because the code is written with that word, so a
reader can go and find it. A metaphor has nothing to find: `swallow` sitting
in a Korean sentence is still a figure, so keeping the English helps no one.
Delete the figure and write the mechanism it stood for.

L4 covers the failure where two real terms get welded into a phrase nobody
uses. `ambient`와 `selector`는 둘 다 코드에 있지만 `ambient selector`는 없다.
Before writing a compound, grep for it: if the repository never says it,
neither should the document. A reader cannot tell an invented term from one
they simply have not met, so they go looking for a definition that does not
exist.

A glossary row carries a full sentence, not a fragment: "ambient read |
component가 prop이 아니라 전역 atom이나 hook에서 현재 값을 직접 읽는 것이다".

A term several ADRs share is defined once, in the ADR that introduced it; a
later document links that row instead of restating it.

## Angle 3 — Sentences and structure (S1–S10)

| id | rule | fix |
|----|------|-----|
| S1 | No rambling — every sentence earns its place | delete the sentence that only restates the previous one |
| S2 | Never add content that is useless, redundant, contradictory, speculative, or unrequested | delete it; thoroughness is not measured in sections |
| S3 | A document reads as written once | never reference or argue with its own earlier draft; revise in place while unmerged — history lives in git and the Jira issue |
| S4 | Write complete sentences | no `=` shorthand, no arrow chain `A → B → C`, no verbless fragment list |
| S5 | One bullet or paragraph states one idea | split the item; put field/enum/option inventories in a table; parentheses go one level deep |
| S6 | Detail goes in bullet lists, not paragraph blocks | reserve running prose for the Summary and short lead-ins |
| S7 | One register throughout: state what is and what was decided | delete selling words, hedges, and exclamations; a sentence that promotes a decision has stopped recording it |
| S8 | An explaining bullet opens with a short English label | write `- **<English noun phrase>**: <detail>`: two to four English words the reader takes in at a glance, then the detail after the colon in Korean. A rule, checklist, or step list is exempt and keeps the instruction as its label |
| S9 | Every sentence names the thing that acts | write the actor — a component, a hook, a file, a page, a person. Korean drops subjects freely, so the fix is to put one back, not to trust that the reader will supply it |
| S10 | An explaining bullet carries both halves — never a bare one-liner, never a paragraph | a label with no detail leaves the reader with the "why" missing; a detail past three sentences belongs in `### N.` subsections or a table |

S4 in practice. Shorten by cutting content, never by compressing grammar —
the reader must never reconstruct a missing verb.

| wrong | right |
|---|---|
| `project prop = 필수. page만 ambient read, leaf는 금지. null → tier별 처리.` | `converted leaf component는 필수 prop \`project\`를 받는다. ambient 값은 page만 읽어 prop으로 넘기고, leaf는 \`useCurrentProjectValue\`를 부르지 않는다. \`null\`이 오면 tier마다 정한 동작을 한다.` |

Tables, glossaries, command or field lists, and the S8 label are exempt from
S4: there the phrase form IS the content.

S5 in practice. A Decision item that stacks four things becomes four `### N.`
subsections, and the field inventory inside it becomes a table.

S7 in practice. The register is plain declarative sentences about what
exists, what changed, and what was decided.

| wrong | right |
|---|---|
| `이 설계는 훨씬 깔끔하고 안전한 구조를 제공합니다!` | `이 설계는 project 선택을 page 한 곳으로 모은다.` |
| `아마도 대부분의 경우에는 문제가 없을 것으로 보입니다.` | `page 밖에서 mount되는 component는 route로 판정한다. 그 밖의 경로는 아직 검증하지 않았다.` |

S8 in practice. A reader scans a list by its first words. A list of labels is
a table of contents; a list of sentences is a wall.

| wrong | why | right |
|---|---|---|
| `- prop이 필수라서 TypeScript가 모든 call site에 결정을 강제하고, 빠뜨리면 컴파일 오류가 난다.` | the detail comes first, so the point arrives last | `- **Required prop**: prop이 필수라서 TypeScript가 모든 call site에 project 결정을 강제한다. 빠뜨리면 silent bug가 아니라 컴파일 오류가 난다.` |
| `- **prop은 필수로 둔다.** 모든 call site가 …` | the opening is a sentence, not a label | `- **Required prop**: 모든 call site가 …` |
| `- **결정의 축**: 세 tier로 나눈다.` | the label is a Korean coinage, so nothing is grasped at a glance | `- **Null handling tiers**: \`null\`을 받은 component는 modal, button, alert 세 tier 중 하나로 동작한다.` |

The label is English even in a Korean body; inventing it in Korean is the
most common way a coined term enters a document.

Name the subject the item settles — its owner, its order, its limit, its
entry point, its cost. An action wearing a noun's clothes fails the rule too:
write `- **Prop owner**:`, never `- **Where the prop is decided**:`.

S8 and S10 bind the lists that **explain** — decisions, consequences,
rejected alternatives. An inventory whose items are the content (option
lists, field tables, glossary rows, file paths, citations) stays bare, and
neither rule binds it.

S9 in practice. A subjectless Korean sentence reads as a proverb, and a
proverb cannot be checked against the code. Ask of every sentence: **who does
this, and to what?** If the answer is not in the sentence, put it there.

| wrong | why | right |
|---|---|---|
| `같은 값을 두 곳에서 읽으면 어긋난다.` | nobody reads, nothing diverges | `page와 leaf component가 같은 atom을 각자 읽고 있다.` |
| `두 값이 같은지 검사하는 것이 없다.` | the missing checker is the point | `두 값이 같은지 아무도 검사하지 않는다.` |
| `헤더에는 이미 있다.` | what is already there | `\`WebUIHeader\`에는 \`ProjectSelect\`가 이미 있다.` |

The same defect hides in nominalisations. `그 판단은 page가 내리는 것이 맞다`
names the judge; `그것은 page가 아는 것이 맞다` does not say what knowing
means. Prefer the verb with an actor over the noun without one.

## Angle 4 — Body shape (D1–D2)

| id | rule | fix |
|----|------|-----|
| D1 | Every body opens with a Summary | state the problem, the decision, and the scope before any detail, under `## Summary` |
| D2 | Draw what moves rather than explaining it | a data flow, a render sequence, a component layout, a state machine, or a before/after goes in a mermaid diagram, with every edge labelled by what crosses it |

D2 test: if a paragraph describes something that moves or connects, draw it
instead. Never explain a flow in prose alone.

## Reread as a first-time reader

Read the draft start to finish as someone who has never seen this codebase.
Each item is a defect to fix before landing.

- The title only makes sense to someone who already read the body (T1).
- The title carries a colon, a parenthesis, a Jira key, or two intents (T2,
  T5, T6).
- A term appears with no definition and no glossary entry (L3).
- A term reads like the repository's vocabulary but appears nowhere in it
  (L4).
- A figure of speech stands where the mechanism should be (L5).
- A sentence must be read twice to find its verb or its subject (S4).
- A bullet carries a decision, its fields, its rationale, and its exception
  at once (S5).
- A sentence promotes the work instead of recording it (S7).
- An explaining bullet opens with a sentence, with detail, or with a Korean
  coinage, instead of a short English label (S8).
- A sentence states a rule of thumb with nobody performing it (S9).
- A bullet is a bare label with no detail, or a paragraph under a dash (S10).
- The body opens with background instead of a Summary (D1).
- A paragraph describes something that moves or connects, and no diagram
  shows it (D2).
