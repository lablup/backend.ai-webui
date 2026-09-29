---
name: adr-writing
description: >-
  Write and revise the ADRs in `docs/adr/` and their index `docs/ARCHITECTURE.md`
  so a first-time reader understands them alone. Covers the file conventions
  (name, title, no status field, how a decision is retired), the section
  skeleton, the writing rules for titles, terms, and sentences, mermaid usage
  and its syntax traps, and the checks a document passes before it lands. Use
  before authoring a new ADR, before revising one, and before landing any
  change under `docs/adr/`. Trigger on "ADR 써줘", "결정 기록 남겨줘", "write
  an ADR", "architecture decision record", or when an implementation needs a
  decision no ADR in force covers. When a change needs an ADR, and what an
  agent owes the ADRs in force, is `.claude/rules/adr.md`.
---

# ADR writing

A decision nobody can read was not recorded. This skill governs the shape of
every file under `docs/adr/` and of `docs/ARCHITECTURE.md`: how the file is
named and retired, how the sections run, when to draw instead of explain, and
what must hold before the document lands. When a change needs an ADR and what
an agent owes the ADRs in force is `.claude/rules/adr.md`, loaded in every
session; this skill does not repeat it.

Every sentence must pass one test: **would someone meeting this codebase for
the first time understand it without asking a question?** If not, the fix
belongs in the writing, not in the reader.

## What an ADR is for

An ADR records an architecture-level decision: what was chosen, which
alternatives were dropped and why, and what shape the code must now take. The
reader is an agent or a person who will build against this decision months
from now, not the author and not today's reviewer.

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

## ADR file conventions

This is the definition of how an ADR file is named, titled, and retired. The
one other copy is `.github/instructions/adr.instructions.md`, which restates
the points Copilot needs because it cannot load a skill; keep the two in step.

- **Filename** — `NNNN-title.md`, for example
  `0001-explicit-project-prop-contract.md`. The next number is the highest
  `NNNN` in `docs/adr/` plus one. Numbers are never reused, so when the
  sequence has a gap the deleted number stays retired; `git log -- docs/adr`
  shows it.
- **Title** — `# NNNN — <English noun phrase>` (T1–T6). A Jira key goes in
  the sources section, never in the title. A supersede pointer goes on its
  own line, never in the title.
- **No status field.** An ADR on `main` is a decision in force — landing it
  there, merged and human-approved, is the record. A draft under review is
  proposed by virtue of sitting in an unmerged PR, and nothing marks it in the
  file. The one marker a file ever carries is reversal.
- **Reversing a decision** — do not edit the existing ADR's reasoning. Either
  keep the file and add a top line `> superseded by NNNN` naming what replaced
  it, or **delete it outright**. Both are allowed, and deleting is usually
  right once the decision and the code it described are both gone, because a
  retired file is then a trap a reader has to disprove. Git history holds
  what it said. Convert inbound references in surviving documents and source
  comments to plain `ADR NNNN` mentions.
- **Partial replacement** — if the new ADR replaces only part of the old,
  keep the old file, say so in the new ADR, and add a scoped pointer line
  rather than the blanket supersede marker.
- **Mention form** — documents and PR bodies write `ADR NNNN`. Source
  comments written before this convention say `ADR-NNNN`; they are corrected
  when the file is next edited, never swept.
- **Language** — the title is English; the body is Korean, with English
  technical terms and identifiers written as they appear in the code. An ADR
  that landed before this convention keeps its body language; a document is
  revised only when its content changes, never translated for its own sake.
  Section headings follow the body language, as
  [references/document-shape.md](references/document-shape.md) fixes.

## Phase 0 — Gather what the document must agree with

Read these before writing, so the draft does not contradict what already
landed.

- The ADRs this decision touches, including the ones it supersedes or
  narrows, and their rows in `docs/ARCHITECTURE.md`.
- The source files the decision names, so identifiers in the text match the
  code — component names, hook names, atom names, ESLint rule ids.
- The Jira issue the work belongs to, so the sources section can cite it.
- Sibling ADRs written in the same increment, so terminology stays shared.

## Phase 1 — Draft against the rule catalogues

Two reference files hold the rules, and both cite by id — "T1 violation",
"fixed S4", "D2 missing".

| file | ids | what it governs |
|---|---|---|
| [references/writing-rules.md](references/writing-rules.md) | T1–T6, L1–L5, S1–S10, D1–D2 | the title, the terms, the sentences and bullets, the Summary a body opens with, and the diagram a flow gets |
| [references/document-shape.md](references/document-shape.md) | D3–D4 | the section skeleton, the heading language, the increment overview, the one-diagram floor, and the mermaid syntax traps |

Write the sections in the order D3 fixes: title, Summary, Context, diagrams,
Decision, alternatives with the reason each was rejected, Consequences,
sources, glossary.

## Phase 2 — Reread as a first-time reader

Work the reread list at the end of
[references/writing-rules.md](references/writing-rules.md), then these three
checks, which only a document can fail:

- A sibling document draws the same components with a different decomposition
  (D2), or the increment has no overview document (D4).
- A section from the D3 skeleton is missing, or a heading is in the wrong
  language for the body.
- A Decision item stacks several decisions that should be `### N.`
  subsections.

## Phase 3 — Adversarial review before landing

Self-review does not catch narration: the author cannot see their own. Before
landing, dispatch one reviewer agent with the document path and this
instruction, and fix everything it returns. Ask for defects, not a verdict:

- **Padding.** Every line a reader building from this would not act on —
  narrated thinking, restatements, deferral rationale, the document describing
  itself — with its line number.
- **Gaps.** What an agent implementing against this would still have to ask:
  a chosen shape with no type, no prop contract, no invariant, no file it
  lives in.

Verify the findings before acting — a reviewer that is wrong about the code
is common. Check the file it cites.

## Phase 4 — Land

- Read the document once on GitHub's rendering of the branch. A broken
  mermaid diagram shows there as a syntax error; no CI check catches it.
- Add or update the ADR's row in `docs/ARCHITECTURE.md` in the same change.
- Verify every cross-reference resolves to a file that exists, and when an
  ADR was retired, grep for its filename so no link points at it.
