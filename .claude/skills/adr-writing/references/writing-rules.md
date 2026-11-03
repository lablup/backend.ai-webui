# Writing rules — reference

Rule ids used by the `adr-writing` skill, grouped by four angles. They bind
every document under `docs/adr/` and the `docs/ARCHITECTURE.md` index. Cite
the id when reporting a finding ("T1 violation") and when reporting a fix
("rewrote the title, T1").

D3–D4, the section skeleton, and the mermaid traps are in
[document-shape.md](document-shape.md). PR and issue titles follow the
`prefix(#N): title` form that `AGENTS.md` fixes, not these rules.

## Angle 1 — Title (T1–T6)

| id  | rule                                                                                        | fix                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| T1  | A title NAMES its subject; it does not explain it                                           | write a noun phrase for what the thing IS; the explanation moves to the Summary                                     |
| T2  | No colon subtitle                                                                           | needing one means the title is not doing its job — rewrite the title                                                |
| T3  | No term a first-time reader would not know                                                  | name the concrete thing instead, even if the body defines the term later                                            |
| T4  | Every title is English                                                                      | the body is English too (ADR 0018); a title in another language is rewritten                                        |
| T5  | One intent per title                                                                        | if the title needs "and", a comma, or a second clause to hold two things, it is covering two decisions — split them |
| T6  | Nothing is appended to a title — no parentheses, brackets, issue key, or trailing qualifier | the qualifier goes in the body; the issue key goes in `## Sources`; a supersede pointer goes on its own line        |

Three forms, one right:

| form                      | example                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| names it (correct)        | `Explicit project prop contract for leaf components`               |
| explains it (wrong)       | `Leaf components take the project as a prop instead of reading it` |
| opens with jargon (wrong) | `Ambient-read elimination: the leaf tier`                          |

Test: read the title alone, without the body. Does it tell you what the
document is about, or does it argue a point you cannot yet follow?

T2 and T6 in practice:

| wrong                                                          | why                                                                 | right                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `ADR-0001: Explicit project prop contract for leaf components` | a colon after the number (T2); the `NNNN — ` prefix is the skeleton | `0001 — Explicit project prop contract for leaf components`                                   |
| `0002 — Relay pagination modes (FR-3430, supersedes 0001 §3)`  | a Jira key and a supersede note appended (T6)                       | `0002 — Relay pagination modes`, with the key in `## Sources` and the pointer on its own line |

## Angle 2 — Language (L1–L5)

Every ADR and `docs/ARCHITECTURE.md` is written in English, title and body
(ADR 0018). These rules keep that English plain enough for a reader whose
first language is not English.

| id  | rule                                                                    | fix                                                                                                                                                     |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | Use the term the code uses, not a synonym or a paraphrase               | write `fragment`, `atom`, `search param`, `leaf component` as the code spells them; do not swap in "piece", "global value", "URL parameter" for variety |
| L2  | The glossary sits at the END under `## Glossary`, linked from first use | `[ambient read](#glossary)`                                                                                                                             |
| L3  | Explain any term a first-time reader would not know, with a reference   | give the meaning and point at the ADR, the source file, or the upstream doc                                                                             |
| L4  | Do not invent a term. Use the name the repository already uses          | grep `react/` and `packages/` for the thing; if it has no name, describe it instead of naming it                                                        |
| L5  | No metaphor or idiom. Write what happens instead                        | not "the hook swallows the mutation" but "the hook does not send the mutation"; not "a hole in the check" but "nothing checks it"                       |

L1 and L5 pull in opposite directions on purpose. L1 keeps the code's word
because a reader can search for it. A metaphor has nothing to search for, and
a reader translating it word by word gets the wrong mechanism, so L5 deletes
the figure and writes the mechanism it stood for.

L4 covers the failure where two real terms get welded into a phrase nobody
uses. `ambient` and `selector` both appear in the code; `ambient selector`
does not. Before writing a compound, grep for it: if the repository never says
it, neither should the document. A reader cannot tell an invented term from
one they simply have not met, so they go looking for a definition that does
not exist.

A glossary row carries a full sentence, not a fragment: "ambient read | A
component reads the current value straight from a global atom or hook instead
of receiving it as a prop."

A term several ADRs share is defined once, in the ADR that introduced it; a
later document links that row instead of restating it.

## Angle 3 — Sentences and structure (S1–S10)

| id  | rule                                                                                     | fix                                                                                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | No rambling — every sentence earns its place                                             | delete the sentence that only restates the previous one                                                                                                                                                     |
| S2  | Never add content that is useless, redundant, contradictory, speculative, or unrequested | delete it; thoroughness is not measured in sections                                                                                                                                                         |
| S3  | A document reads as written once                                                         | never reference or argue with its own earlier draft; revise in place while unmerged — history lives in git and the issue                                                                                    |
| S4  | Write complete sentences                                                                 | no `=` shorthand, no arrow chain `A → B → C`, no verbless fragment list                                                                                                                                     |
| S5  | One bullet or paragraph states one idea                                                  | split the item; put field/enum/option inventories in a table; parentheses go one level deep                                                                                                                 |
| S6  | Detail goes in bullet lists, not paragraph blocks                                        | reserve running prose for the Summary and short lead-ins                                                                                                                                                    |
| S7  | One register throughout: state what is and what was decided                              | delete selling words, hedges, and exclamations; a sentence that promotes a decision has stopped recording it                                                                                                |
| S8  | An explaining bullet opens with a short noun-phrase label                                | write `- **<noun phrase>**: <detail>`: two to four words the reader takes in at a glance, then the detail after the colon. A rule, checklist, or step list is exempt and keeps the instruction as its label |
| S9  | Every sentence names the thing that acts                                                 | write the actor — a component, a hook, a file, a page, a person. An agentless passive ("the value is read") or a dangling "this" hides it; put the actor back instead of trusting the reader to supply it   |
| S10 | An explaining bullet carries both halves — never a bare one-liner, never a paragraph     | a label with no detail leaves the reader with the "why" missing; a detail past three sentences belongs in `### N.` subsections or a table                                                                   |

S4 in practice. Shorten by cutting content, never by compressing grammar —
the reader must never reconstruct a missing verb.

| wrong                                                                               | right                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `project prop = required. ambient read page-only, leaf forbidden. null → per-tier.` | `A converted leaf component takes the required prop \`project\`. Only the page reads the ambient value and passes it down; a leaf never calls \`useCurrentProjectValue\`. When \`null\` arrives, each tier does what its row in the table says.` |

Tables, glossaries, command or field lists, and the S8 label are exempt from
S4: there the phrase form IS the content.

S5 in practice. A Decision item that stacks four things becomes four `### N.`
subsections, and the field inventory inside it becomes a table.

S7 in practice. The register is plain declarative sentences about what
exists, what changed, and what was decided.

| wrong                                                      | right                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `This design provides a much cleaner and safer structure!` | `This design moves project selection to one place, the page.`                                |
| `In most cases this will probably not cause any problems.` | `A component mounted outside a page is judged by its route. No other path has been checked.` |

S8 in practice. A reader scans a list by its first words. A list of labels is
a table of contents; a list of sentences is a wall.

| wrong                                                                                                                     | why                                               | right                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `- Because the prop is required, TypeScript forces a decision at every call site, and leaving it out is a compile error.` | the detail comes first, so the point arrives last | `- **Required prop**: TypeScript forces a project decision at every call site because the prop is required. Leaving it out is a compile error, not a silent bug.` |
| `- **The prop stays required.** Every call site …`                                                                        | the opening is a sentence, not a label            | `- **Required prop**: Every call site …`                                                                                                                          |
| `- **Axis of the decision**: split into three tiers.`                                                                     | the label names no subject the reader can grasp   | `- **Null handling tiers**: A component that receives \`null\` behaves as one of three tiers: modal, button, or alert.`                                           |

Name the subject the item settles — its owner, its order, its limit, its
entry point, its cost. An action wearing a noun's clothes fails the rule too:
write `- **Prop owner**:`, never `- **Where the prop is decided**:`.

S8 and S10 bind the lists that **explain** — decisions, consequences,
rejected alternatives. An inventory whose items are the content (option
lists, field tables, glossary rows, file paths, citations) stays bare, and
neither rule binds it.

S9 in practice. A sentence with no actor reads as a proverb, and a proverb
cannot be checked against the code. Ask of every sentence: **who does this,
and to what?** If the answer is not in the sentence, put it there.

| wrong                                                      | why                              | right                                                      |
| ---------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------- |
| `Reading the same value in two places makes them diverge.` | nobody reads, nothing diverges   | `The page and the leaf component each read the same atom.` |
| `It is not checked whether the two values match.`          | the missing checker is the point | `Nothing checks that the two values match.`                |
| `It is already in the header.`                             | what is already there            | `\`WebUIHeader\` already renders \`ProjectSelect\`.`       |

The same defect hides in nominalisations. "The decision belongs to the page"
names the judge; "the page should know it" does not say what knowing means.
Prefer the verb with an actor over the noun without one.

## Angle 4 — Body shape (D1–D2)

| id  | rule                                      | fix                                                                                                                                                           |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Every body opens with a Summary           | state the problem, the decision, and the scope before any detail, under `## Summary`                                                                          |
| D2  | Draw what moves rather than explaining it | a data flow, a render sequence, a component layout, a state machine, or a before/after goes in a mermaid diagram, with every edge labelled by what crosses it |

D2 test: if a paragraph describes something that moves or connects, draw it
instead. Never explain a flow in prose alone.

## Reread as a first-time reader

Read the draft start to finish as someone who has never seen this codebase.
Each item is a defect to fix before landing.

- The title only makes sense to someone who already read the body (T1).
- The title carries a colon, a parenthesis, an issue key, or two intents (T2,
  T5, T6).
- A heading or sentence is not in English (T4, ADR 0018).
- A term appears with no definition and no glossary entry (L3).
- A term reads like the repository's vocabulary but appears nowhere in it
  (L4).
- A figure of speech stands where the mechanism should be (L5).
- A sentence must be read twice to find its verb or its subject (S4).
- A bullet carries a decision, its fields, its rationale, and its exception
  at once (S5).
- A sentence promotes the work instead of recording it (S7).
- An explaining bullet opens with a sentence or with detail instead of a
  short noun-phrase label (S8).
- A sentence states a rule of thumb with nobody performing it (S9).
- A bullet is a bare label with no detail, or a paragraph under a dash (S10).
- The body opens with background instead of a Summary (D1).
- A paragraph describes something that moves or connects, and no diagram
  shows it (D2).
