# Issue description templates

All three templates are Markdown — `$FW_JIRA create --desc` converts them to ADF.
Keep the headings; drop a bullet only when it is genuinely not applicable.
Unknown values are written as `Unknown`, never omitted silently, so triage can
see what still needs chasing.

| Category | Template | Issue type | Label |
|---|---|---|---|
| Visual | [Visual report](#visual-report-astryx-visual) | Bug | `astryx-visual` |
| Behavioral | [Behavioral report](#behavioral-report-astryx-behavior) | Bug | `astryx-behavior` |
| Discussion | [Discussion](#discussion-astryx-discussion) | Task | `astryx-discussion` |

---

## Visual report (`astryx-visual`)

```markdown
## Where

- **Page**: `/admin/users` (menu: Admin → Users)
- **Region**: the credentials table header
- **Component** (if identified): `BAITable` (`packages/backend.ai-ui/src/components/Table/`)

## Observed

Column labels wrap onto a second line and the header row grows to 64px, so the
header no longer aligns with the toolbar above it.

## Expected

Single-line header at the same height as every other admin table (40px), labels
truncated with an ellipsis when they do not fit.

## Environment

- **Mode**: light / dark / both
- **Viewport**: ~1280px
- **Browser/OS**: Chrome 141 / macOS
- **Build**: `main` @ 2026-08-11 (or release v26.4.8-rc.3)

## Reproduction

1. Log in as an admin.
2. Open Admin → Users.
3. Narrow the window to 1280px.

## Evidence

- Screenshot: `~/Desktop/users-header.png` (to be attached in Jira)

## Notes

Optional. At most three lines of observation — e.g. "the same header looks
correct on Admin → Resource Policy". No root-cause analysis.
```

---

## Behavioral report (`astryx-behavior`)

```markdown
## Component

- **Name**: `BAISelect` (`packages/backend.ai-ui/src/components/BAISelect.tsx`)
- **Astryx primitive**: `Select`
- **Scope**: this page only / every usage / Unknown

## Where it is reachable

- `/session/start` (menu: Sessions → Start) — the "Environment" selector
- Also used in: 12 files (e.g. `SessionLauncherPage.tsx`, `ImageEnvironmentSelectFormItems.tsx`, `AgentSelect.tsx`)

## Steps to reproduce

1. Open Sessions → Start.
2. Click the Environment selector.
3. Click any option.

## Observed

The option is selected, but the dropdown stays open and swallows the next click.

## Expected

The dropdown closes on selection, and focus returns to the trigger — as it did
before the migration and as the Image selector on the same page still does.

## Environment

- **Mode**: light / dark / both
- **Viewport**: ~1440px
- **Browser/OS**: Chrome 141 / macOS
- **Build**: `main` @ 2026-08-11

## Impact

Blocks the task / workaround exists (click outside first) / cosmetic.

## Evidence

- Screen recording: none

## Notes

Optional, hedged, ≤3 lines. No fix proposal.
```

---

## Discussion (`astryx-discussion`)

Filed as a **Task**, not a Bug. The issue exists to get an answer; it is done
when the team has decided, not when code changed.

```markdown
## Question

Should boolean settings on Admin → Configurations be switches, or is the
checkbox the intended control?

## Where

- **Page**: `/admin/configurations` (menu: Admin → Configurations)
- **Component** (if identified): `CheckboxInput` via `BAIConfigItem` (`react/src/components/…`)
- **Recurs in**: Admin → Resource Policy uses a switch for the same kind of
  on/off setting — 2 screens differ. (Or `this screen only` / `Unknown`.)

## Current behaviour

Each boolean row renders a checkbox with the label to its right. Toggling it
saves immediately, with no confirm step.

## Why this is being raised

The two admin screens disagree, so an admin toggling settings across both sees
two different affordances for the same kind of change.

## Proposal

Optional — present only when the reporter had one. State it as one option, not
as a decision:

> Use a switch for every immediate-effect boolean, and keep checkboxes for
> booleans that are only applied on Save.

## Options considered

Optional. When the reporter (or the intake round) surfaced more than one way
out, list them plainly — no recommendation, no scoring.

1. Switch everywhere.
2. Checkbox everywhere.
3. Split by whether the change applies immediately.

## Impact if it stays as-is

Cosmetic inconsistency / confusing but workable / actively causes mistakes.

## Environment

- **Mode**: light / dark / both
- **Build**: `main` @ 2026-08-11 (or release v26.4.8-rc.3)

Only when the observation is mode- or version-specific; a design question
usually is not, and `Unknown` is fine here.

## Evidence

- Screenshot: `~/Desktop/config-booleans.png` (to be attached in Jira)
- Legacy comparison: none

## Notes

Optional, ≤3 lines. Prior art, a linked decision, an "asked in the 8/11 sync"
pointer. Not an answer to the question.
```

---

## Field notes

- **Where / Reachable** is the section that decides whether the issue is
  actionable in six weeks. Spend the effort there, not on prose.
- **Expected** must be concrete enough to test against. "Should look right" is
  not an expectation; "same height as the other admin tables" is.
- **Scope** comes from the reporter, **Also used in** comes from a `grep`. They
  are different claims: the importer list is usage breadth, and never on its own
  evidence that the defect reproduces at every usage. When the reporter saw it in
  one place only, `Scope` is `this page only` even if the component has 12
  importers.
- **Impact** is inferred, not asked. Three values only: blocks the task /
  workaround exists / cosmetic.
- **Question** (discussion) is the one field that may never be `Unknown` — an
  issue that does not ask anything cannot be closed by answering it. If the
  intake round did not produce one, you are probably holding a Bug report or a
  vent, not a discussion; re-check Step 1 before filing.
- **Why this is being raised** is what turns a preference into a decidable
  question. "Two admin screens disagree" is decidable; "I don't like it" is not.
- **Proposal / Options considered** stay descriptive. Recording that the
  reporter would prefer a switch is capture; arguing that a switch is correct is
  the decision, and this skill does not make it.
- A discussion carries **no Expected section**. If you find yourself writing
  one, the expectation is settled and the issue is a Bug.
- **Missing** — when a required field survived the one intake round unanswered,
  add a line at the top: `**Missing:** expected behaviour — ask <reporter>.` and
  put `needs-info` in the labels.
- Anything that reads like "the cause is …" belongs in **Notes**, hedged, or
  nowhere. This epic collects symptoms; mechanisms are derived at fix time.
