# Issue description templates

Both templates are Markdown — `$FW_JIRA create --desc` converts them to ADF.
Keep the headings; drop a bullet only when it is genuinely not applicable.
Unknown values are written as `Unknown`, never omitted silently, so triage can
see what still needs chasing.

---

## Visual report (`astryx-visual`)

```markdown
## Where

- **Page**: `/admin/users` (menu: Admin → Users)
- **Region**: the credentials table header
- **Component** (if identified): `BAITableAstryx` (`packages/backend.ai-ui/src/components/Table/`)

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
- **Missing** — when a required field survived the one intake round unanswered,
  add a line at the top: `**Missing:** expected behaviour — ask <reporter>.` and
  put `needs-info` in the labels.
- Anything that reads like "the cause is …" belongs in **Notes**, hedged, or
  nowhere. This epic collects symptoms; mechanisms are derived at fix time.
