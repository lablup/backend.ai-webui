---
applyTo: "docs/adr/**/*.md,docs/ARCHITECTURE.md"
---

# ADR Guidelines for Backend.AI WebUI

These instructions apply to the architecture decision records under `docs/adr/`
and their index `docs/ARCHITECTURE.md`. Load the `adr-writing` skill
(`.claude/skills/adr-writing/`) before writing or revising either; it holds the
full rules. The points below are the ones most often missed.

## File and title

- Filename `NNNN-title.md`; the next number is the highest in `docs/adr/` plus
  one, and a number is never reused.
- Title `# NNNN — <English noun phrase>`. No colon subtitle, no parenthesis, no
  issue key in the title.
- No status field. A retired ADR gets a `> superseded by NNNN` top line or is
  deleted; inbound links become plain `ADR NNNN` mentions.

## Body

- Open with `## Summary`, then follow the section skeleton in
  `.claude/skills/adr-writing/references/document-shape.md`.
- Title, headings, and body in English, identifiers as they appear in the code
  (ADR 0018). Explaining bullets open with a short noun-phrase label
  (`- **Required prop**: ...`).
- At least one mermaid diagram, every edge labelled. Check the rendered branch
  on GitHub before landing; no CI catches a mermaid syntax error.
- Issues (`#N`, or a legacy `FR-NNNN`) and the decision date go in
  `## Sources`.

## Single home

- Design decisions are recorded only here. A PR that adds a `.specs/`
  directory or another design document outside `docs/adr/` is a finding;
  plans and task lists belong in the issue and the PR (ADR 0018).

## Index

- One ADR gets one row in `docs/ARCHITECTURE.md`, added in the same PR.
