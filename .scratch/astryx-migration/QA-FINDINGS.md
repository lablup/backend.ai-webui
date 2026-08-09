# Astryx migration — running QA findings

Live ledger for QA on `to-astryx`, in the finding format of
`REGRESSION-CATALOG.md` §0 (fix-mechanism class **T** theme / **L** layout
composition / **C** component work / **F** in flight elsewhere; severity
High / Med / Low).

The catalog is a **frozen** audit — it pins the branch SHA, the baseline, the
viewport, and carries a reproduction procedure (§6) that regenerates its own
numbers. Appending to it would destroy that. This file is the open one: rows
are appended, then marked `FIXED <sha>` or `PROMOTED FR-####` in place — never
deleted, so a re-opened defect is visible as a second row citing the first.

- Intake, measurement and de-duplication: `.claude/skills/astryx-qa-finding/SKILL.md`
- Implementation and verification: `.claude/skills/astryx-migration-fix/SKILL.md`

IDs are `Q-<n>`, sequential, never reused. They do not collide with the
catalog's prefixes (`G-` global tokens, `S-` app shell, `T-` table pages,
`O-` overlays, `F-` forms & controls, `R-` per-route). A row that tracks a
catalog finding cites it: `Q-7 (tracks G-3)`.

Baseline for every measurement unless the row says otherwise: viewport
**1600×1000**, both modes, dark entered through the header `Dark mode` button
with `document.documentElement.dataset.theme` asserted `dark`. Legacy values
are derived from `git show origin/main:<path>`, the measured parity tables in
`packages/backend.ai-ui/src/theme-shim/`, or antd 6.5.0's own formulas — the
legacy build cannot be run on this branch.

| # | What / where | Legacy expected | Measured current | Class | Sev | Status / fix |
|---|---|---|---|---|---|---|
| | _(no open findings yet — append below)_ | | | | | |
