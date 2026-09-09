---
description: Comment only what the code cannot say; budget the long ones and redirect the justifications
paths:
  - "react/**/*.{tsx,ts}"
  - "packages/backend.ai-ui/**/*.{tsx,ts}"
---

# Comment Density Rule

**One test, one budget, one redirect.**

## The test

A comment earns its place only if a competent reader could **not** derive it
from the code, the types, and the surrounding names. If they could, delete it.

## Why

This project's instructions were, until this rule, asymmetric: several
sources *demanded* comments (`component-props-extension.md` — "the reason is
written down in the file header"; `react.instructions.md` — "each BAI wrapper's
file header documents its deliberate quirks"; `use-bai-card.md`) and **none**
limited them. An obligation to justify, with no budget, gets satisfied
maximally.

Measured on `react/src` + `packages/backend.ai-ui/src` (tests excluded) when
this rule was written:

Every share below is **comment ÷ (comment + code)**, counting non-blank lines.

```
comment 24,719 / (24,719 + code 159,747 = 184,466 total)   = 13.4%
mean comment block                                         = 4.2 lines
antd/migration-flavoured blocks: 20% of blocks             = 41% of comment lines
  ...at a mean of                                            8.7 lines each
worst files: backendAiTheme.ts 791/(791+365)               = 68%
             antdParity.ts     183/(183+40)                = 82%
```

So the problem was never "a few too many comments" — it was one *genre* of
comment, the migration-justification essay, carrying 41% of the mass.

The cost is not disk space. Long blocks push the code they describe off the
screen, they rot silently (nothing type-checks prose), and they train the next
writer — human or agent — to match the register.

## Budget

- **Default: ≤ 2 lines.** Most comments that survive the test fit.
- **More than 8 lines** only when the block is one of these three, and says
  which:
  1. an **external constraint** — a spec, a browser behaviour, a backend
     contract — with a link or a citable name;
  2. a **measured value** with its unit and where the measurement came from;
  3. a **trap that already cost someone real debugging time**.
- **Longer than that belongs elsewhere** (see Redirect) with a one-line pointer
  left in the source.

The budget is per comment block, not per file, and it is a default to argue
against, not a lint threshold — but if you are writing the 20th line you should
be able to name which of the three reasons applies.

## Delete on sight

- **Restates the next line.** `// increment the counter` above `counter++`.
- **Narrates change history.** "This used to be X, then we tried Y, which
  failed because…" — `git blame`, the commit body, and the PR own that. A
  reader who needs it can get it; a reader who doesn't shouldn't pay for it.
- **Migration travelogue.** How a component looked under antd is history now
  (antd is not a dependency; an `antd` import does not compile). Keep only the
  part that still constrains today's code — usually one sentence, often the
  frozen prop vocabulary, not the journey.
- **JSDoc that repeats the signature.** `@param userId The user id` on
  `(userId: string)`.
- **Commented-out code.** Delete it; git has it.
- **Section banners** (`// ===== Helpers =====`) in a file small enough to read.

## Keep

- **Why-not** — why the obvious approach fails here. The single highest-value
  comment in the codebase.
- **A measured constant**, with unit and source.
- **An external constraint**, with a link.
- **A trap warning** at the exact line that would re-trigger it.
- **A pointer** to where the long form lives.

## Redirect — where the justification goes instead

The obligation to write the reasoning down is not cancelled; its destination
moves, so it scales with the change instead of accreting in the file.

| Reasoning | Home |
|---|---|
| The mechanism — what actually caused the bug | commit message body |
| Evidence — measurements, before/after, verification counts | PR description |
| A recipe worth reusing across fixes | `.specs/FR-3482-astryx-migration/CONVERSION-IDIOMS.md` |
| A convention future code must follow | a rule in `.claude/rules/` |
| The source file | a one-line pointer to one of the above |

## Pattern

### ❌ Wrong — the essay in the source file

```ts
/**
 * MENU_PANEL_IS_A_PAGE_SURFACE — a `DropdownMenu` panel resolves its neutral
 * interaction overlays against the PAGE, never against whatever it happens to
 * be nested under (FR-3493).
 *
 * ## The defect
 *
 * "Hovering a menu item in the header user dropdown paints a background of the
 * opposite tone…" [40 more lines: the reproduction, the three composing facts,
 * the measured before/after tables, the residue]
 */
```

### ✅ Correct — the load-bearing sentence, plus a pointer

```ts
// A menu is a floating PAGE surface, so it must not inherit the header band's
// app-mode-inverted overlay wash (the panel is a DOM child of the band).
// Mechanism + measurements: FR-3493.
```

The deleted 40 lines are not lost — they are the commit body and the PR
description of the change that introduced them, which is where a reader
looking for *that* question goes.

### ✅ Correct — a measured constant keeps its source

```ts
// antd 6.5.0 `colorBgTextHover` over resources/theme.json seeds.
'--color-overlay-hover': ['rgba(0,0,0,0.06)', '#262626'],
```

## Editing an existing file

**Touch it, trim it.** When you edit a file for another reason, bring its
comment blocks to this budget. There is no dedicated cleanup sweep, and the
~41% migration mass is not to be bulk-deleted: some of it encodes exactly why a
thing must not be "fixed" back.

When a long block is load-bearing but you cannot tell which sentence carries
it, **shorten, don't delete** — keep the constraint, drop the narrative, add
the pointer.

## Verification

- Every comment you added or edited passes the test at the top.
- No block over 8 lines without one of the three reasons named in it.
- Blocks you shortened kept their constraint and lost only narrative.
- `bash scripts/verify.sh` passes.

## Related

- `component-props-extension.md` — the wrapper escape hatch: its justification
  is a short note plus a pointer, not a restated design history.
- `use-bai-card.md` — same; `BAICard`'s accepted-and-ignored props are recorded
  as a list, not an essay.
- `.github/instructions/react.instructions.md` — the project's React deltas.
