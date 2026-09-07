---
name: adr-writing
description: >-
  Write and revise the documents under `docs/` — the ADRs in `docs/adr/` and
  the `docs/ARCHITECTURE.md` index — so a first-time reader understands them
  alone. Covers when a change needs an ADR, the file conventions (name, title,
  no status field, how a decision is retired), the section skeleton, the
  writing rules for titles, terms, and sentences, mermaid usage and its syntax
  traps, and the checks a document passes before it lands. Use before
  authoring a new ADR, before revising one, and before landing any change
  under `docs/adr/`. Trigger on "ADR 써줘", "결정 기록 남겨줘", "write an
  ADR", "architecture decision record", or when an implementation needs a
  decision no ADR in force covers.
---

# ADR writing

A decision nobody can read was not recorded. This skill governs every document
under `docs/adr/` and the index that lists them: when a change needs one, how
the file is named and retired, how the sections run, when to draw instead of
explain, and what must hold before the document lands.

Every sentence must pass one test: **would someone meeting this codebase for
the first time understand it without asking a question?** If not, the fix
belongs in the writing, not in the reader.

## What an ADR is for

An ADR records an **architecture-level decision**: what was chosen, which
alternatives were dropped and why, and what shape the code must now take. It
is not a design document for every feature and not a changelog. The reader is
an agent or a person who will build against this decision months from now,
not the author and not today's reviewer.

- **Enough context, and no more.** A line survives only if that reader would
  act differently for having read it.
- **Never narrate your thinking.** Deliberation, reversals, what an earlier
  draft said, what you worried about — none of it belongs. State the fact, the
  option, or the decision.
- **The document never talks about itself.** No "covered in the last section",
  no "this document does not decide X". Say the thing or delete it.
- **Link outward instead of retelling.** When the context lives in another
  ADR, a source file, a Jira issue, or an upstream document, cite it and
  reproduce only the sentence the reader must act on.
- **Name the scope boundary once.** What is out of scope gets one line — never
  the reasoning for deferring it, never a sketch of the deferred design.

After reading, does the reader know what was chosen, what was rejected, and
what shape the code must take? If any of the three is missing it is a memo,
not a decision record.

## When a change needs an ADR

Write one when the change makes a decision that other code will have to
follow. In this repository that is typically one of:

- **A dependency crosses the boundary**: a runtime dependency is added,
  removed, or replaced (a component system, a state library, a data layer, a
  build tool).
- **State ownership changes**: where a kind of state lives — Jotai atom,
  Relay store, URL search param, component prop — or which layer may read it
  (ADR 0001 is this kind).
- **A contract between layers changes**: `react/` and
  `packages/backend.ai-ui/`, host and Electron, the app and the manager's
  GraphQL or REST surface.
- **Routing or page structure changes** in a way every page must follow.
- **A guardrail is introduced**: an ESLint restriction, a required prop
  pattern, a naming rule that CI or review will enforce from now on.

Do not write one for a bug fix, a single component, a copy change, or work
that follows an ADR already in force. When unsure, ask: will a reviewer six
months from now need to know *why* the code looks this way? If yes, write it.

## The obligations that come with ADRs

- **Read before implementing.** Before changing an area an ADR covers, read
  that ADR and the row for it in `docs/ARCHITECTURE.md`. Never implement
  against an ADR in force.
- **Write and proceed.** When a decision becomes necessary mid-implementation,
  write the ADR in the same branch and keep going. The PR is where a human
  reviews it; do not wait for approval before writing code.
- **Flag a reversal early.** A decision that reverses an ADR in force is a
  bigger call: tell the human before landing it, in the PR description or the
  Jira issue. Once approved it lands as an ordinary ADR.
- **Land the ADR with the code.** The ADR, the `docs/ARCHITECTURE.md` row, and
  the implementation go in one PR, so a reader can see the decision and the
  code that follows it together.
- **Name it where the code follows it.** A PR body that lands or follows an
  ADR says `ADR NNNN` in its Summary. A source comment that exists only because
  of an ADR points at the file (`docs/adr/NNNN-<slug>.md`), as the ESLint
  message for ADR 0001 does.

## ADR file conventions

This is the single definition of how an ADR file is named, titled, and
retired. `.claude/rules/adr.md` and `AGENTS.md` point here rather than
restating it.

- **Filename** — `NNNN-title.md`, for example
  `0001-explicit-project-prop-contract.md`. Numbers increase sequentially and
  are never reused. Take the next number from `docs/ARCHITECTURE.md`.
- **Title** — `# NNNN — <English noun phrase>`. It names the subject and
  carries no colon subtitle and no parenthesis. A Jira key goes in `## 출처`,
  never in the title. A supersede pointer goes on its own line, never in the
  title.
- **No status field.** An ADR on `main` is a decision in force — landing it
  there, merged and human-approved, is the record. A draft under review is
  proposed by virtue of sitting in an unmerged PR, and nothing marks it in the
  file. The one marker a file ever carries is reversal.
- **Reversing a decision** — do not edit the existing ADR's reasoning. Either
  keep the file and add a top line `> superseded by NNNN` naming what replaced
  it, or **delete it outright**. Both are allowed, and deleting is usually
  right once the decision and the code it described are both gone, because a
  retired file is then a trap a reader has to disprove. Git history holds
  what it said.
- **Leave no dangling link** — either way, convert inbound references in
  surviving documents and source comments to plain `ADR NNNN` mentions. No
  check enforces this; grep for the retired filename before landing. A gap in
  the sequence is the expected result, not an error.
- **Partial replacement** — if the new ADR replaces only part of the old,
  keep the old file, say so in the new ADR, and add a scoped pointer line
  rather than the blanket supersede marker.
- **Language** — the title is English; the body is Korean, with English
  technical terms and identifiers written as they appear in the code. ADR
  0001 predates this convention and keeps its English body; a document is not
  translated for its own sake, only revised when its content changes.

## Phase 0 — Gather what the document must agree with

Read these before writing, so the draft does not contradict what already
landed.

- The ADRs this decision touches, including the ones it supersedes or
  narrows, and their rows in `docs/ARCHITECTURE.md`.
- The source files the decision names, so identifiers in the text match the
  code — component names, hook names, atom names, ESLint rule ids.
- The Jira issue the work belongs to, so `## 출처` can cite it.
- Sibling ADRs written in the same increment, so terminology stays shared.

## Phase 1 — Draft against the rule catalogues

Two catalogues apply, and both cite by id — "T1 violation", "fixed S4",
"D2 missing".

| angle | ids | where | what it governs |
|---|---|---|---|
| Title | T1–T6 | [references/writing-rules.md](references/writing-rules.md) | an English noun phrase that names the subject and stands alone |
| Language | L1–L5 | [references/writing-rules.md](references/writing-rules.md) | English terms as-is, glossary, unfamiliar words, no invented terms |
| Sentences | S1–S10 | [references/writing-rules.md](references/writing-rules.md) | complete sentences, one idea per bullet, tables, one register |
| Body shape | D1–D2 | [references/writing-rules.md](references/writing-rules.md) | the Summary a body opens with, and the diagram a flow gets |
| Document shape | D3–D4 | [references/document-shape.md](references/document-shape.md) | the section skeleton, the increment overview, and the one-diagram floor |

Write the sections in the order D3 fixes: title, Summary, Context, diagrams,
Decision, alternatives with the reason each was rejected, Consequences,
sources, glossary.

## Phase 2 — Reread as a first-time reader

Read the draft start to finish as someone who has never seen this codebase.
Work the reread list in [references/writing-rules.md](references/writing-rules.md)
first — it covers the title, terms, sentences, and register. These are the
defects only a document can have.

- The document carries no diagram at all, or a paragraph describes something
  that moves or connects and no diagram shows it (D2).
- A sibling document draws the same components with a different decomposition
  (D2), or the increment has no overview document (D4).
- A section from the D3 skeleton is missing, or a Decision item stacks several
  decisions that should be `### N.` subsections.

## Phase 3 — Adversarial review against the principle

Self-review does not catch this class of defect: the author cannot see their
own narration. Dispatch reviewers with the document path and this instruction,
and fix everything they return before landing.

Ask for the defects, not a verdict. Three lenses, run in parallel:

- **Padding.** Every line that a reader building from this would not act on —
  narrated thinking, restatements, deferral rationale, the document describing
  itself. Report each with its line number.
- **Gaps.** What an agent implementing against this would still have to ask:
  a chosen shape with no type, no prop contract, no invariant, no file it
  lives in.
- **Leakage.** Narration of how the choice was reached, or a rejected
  alternative argued with instead of stated and dismissed.

Verify the returned findings before acting — a reviewer that is wrong about
the code is common. Check the file it cites.

## Phase 4 — Land

- Read the document once on GitHub's rendering of the branch — the reading
  path for every document under `docs/`. A broken mermaid diagram shows there
  as a syntax error; no CI check catches it.
- Add or update the row in `docs/ARCHITECTURE.md` in the same change. One ADR
  gets one row.
- Verify every cross-reference resolves to a file that exists.
- Name the ADR in the PR body's Summary as `ADR NNNN`.

## Red flags

Stop and rewrite if you are: adding a colon subtitle because the title feels
thin; appending a Jira key or a parenthesis to the title; explaining a flow in
prose because drawing it feels like work; drawing the same component with a
different name than the sibling document uses; translating an English
technical term into a Korean coinage; arguing with an earlier draft of the
same document; or adding a section nobody asked for because it seems thorough.

## References

- [references/writing-rules.md](references/writing-rules.md) — the rule
  catalogue: titles T1–T6, language L1–L5, sentences S1–S10, and body shape
  D1–D2, with the reread list. Cite the ids when reviewing ("T6 violation")
  and when reporting a fix ("rewrote the title, T1").
- [references/document-shape.md](references/document-shape.md) — what only a
  document has: D3 and D4, the ADR section skeleton, the one-diagram floor,
  and the mermaid syntax traps.
- `docs/ARCHITECTURE.md` — the index of ADRs in force and the next free
  number.
