---
applyTo: "docs/adr/**/*.md,docs/ARCHITECTURE.md"
---

# ADR Guidelines for Backend.AI WebUI

These instructions apply to the architecture decision records under `docs/adr/`
and their index `docs/ARCHITECTURE.md`. Load the `adr-writing` skill
(`.claude/skills/adr-writing/`) before writing or revising either; it holds the
full rules. The points below are the ones most often missed.

## File and title

- Filename `NNNN-title.md`; take the next number from `docs/ARCHITECTURE.md`
  and never reuse one.
- Title `# NNNN — <English noun phrase>`. No colon subtitle, no parenthesis, no
  Jira key in the title.
- No status field. A retired ADR gets a `> superseded by NNNN` top line or is
  deleted; inbound links become plain `ADR NNNN` mentions.

## Body

- Open with `## Summary`, then follow the section skeleton in
  `.claude/skills/adr-writing/references/document-shape.md`.
- Body in Korean, English technical terms and identifiers as they appear in the
  code. Explaining bullets open with a short English label
  (`- **Required prop**: ...`).
- At least one mermaid diagram, every edge labelled. Check the rendered branch
  on GitHub before landing; no CI catches a mermaid syntax error.
- Jira issues go in `## 출처`.

## Index

- One ADR gets one row in `docs/ARCHITECTURE.md`, added in the same PR.
