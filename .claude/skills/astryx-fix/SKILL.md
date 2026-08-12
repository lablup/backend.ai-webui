---
name: astryx-fix
description: >
  Standing rules for fixing a visual or behavioural regression on the Astryx
  UI: check the tracked issue's assignee before starting (proceed only when it
  is you or nobody — claim an unassigned one, stop and report when someone else
  holds it), measure before you fix, theme-defaults-first (with the exact
  THEME_NAME_REV bump + `astryx theme build` artifact regeneration + wrapper
  and mirror updates), Astryx-canonical composition over hand-rolled CSS,
  `astryx component <Name>` discovery over guessing, tokens-only enforced by
  `scripts/migration-gates/astryx-token-gate.mjs`, the known traps (stale
  theme artifacts, stale BUI dist, Grid child overflow, Table bleed, Tooltip
  `display:contents`, MediaTheme leaking into native `<dialog>`), and the
  verification bar (verify.sh + vitest + live light/dark probe), and shipping
  the fix through to an open draft PR (branch, scratch cleanup, commit,
  `Resolves #N (FR-N)` body carrying the measured evidence). Use whenever
  someone reports a visual or behavioural regression on the Astryx UI, or any
  fix touches Astryx component usage, theme tokens, or layout.
---

# Astryx — fixing a UI regression

Ant Design is **gone** from this codebase — no `package.json` declares it, no
source file imports it, and the workspace pins exact dependency versions so
nothing reintroduces it transitively. A `from 'antd'` import is not migration
debt; it fails `tsc` immediately, which is what keeps it out. Everything below
assumes `@astryxdesign/core` is the only component system.

## Before anything — the assignee gate

**Run this first, before §0.** Two people measuring, branching and PR-ing the
same regression is the one waste this skill can prevent outright, and it is only
preventable *before* the work, not after.

The gate applies whenever the fix is tied to a tracked issue — a `FR-XXXX` key
in the request, in the branch name, in a linked GitHub issue, or the issue you
were handed.

```bash
FW_JIRA=$(find ~/.claude/plugins -path '*fw*/skills/jira-workflow/scripts/jira.sh' 2>/dev/null | head -1)

$FW_JIRA myself                       # → {accountId, name, email}
$FW_JIRA get FR-XXXX | jq '{key, status, assignee, summary}'
```

`assignee` comes back as a **display name**, and literally `"Unassigned"` when
the field is empty. Compare it against `myself`'s `name` (the account the CLI is
authenticated as *is* "you" — do not infer identity from the git author or the
branch name).

| `assignee` | What to do |
|---|---|
| **You** | Proceed to §0. |
| **`Unassigned`** | Claim it, then proceed: `$FW_JIRA update FR-XXXX --assignee me`. Say in your reply that you assigned it to yourself. |
| **Someone else** | **Stop.** Report, do not fix. |

### When someone else holds it

Do **not** measure, reproduce, branch, edit, or open a PR — stopping after
"just a quick look" still means two people looked. Instead, reply with:

- the holder's name, the issue's current status, and the key as a link
  (`https://lablup.atlassian.net/browse/FR-XXXX` — `get` returns no URL field);
- one line on what you were about to do, so they can judge overlap;
- the choices: hand it back and pick something else / ask the holder / take it
  over / file a separate issue for the part that is genuinely distinct.

**Reassignment is the user's call, not yours.** Never run
`--assignee me` on an issue held by someone else. An explicit "그래도 진행해" /
"take it over" from the user unblocks you — record in your reply that you
proceeded on their instruction, and leave the assignee field alone unless they
also asked you to change it.

### Edge cases

- **The key does not resolve, or the CLI errors.** Resolve toward stopping: say
  the check failed and ask, rather than treating an error as "Unassigned".
- **Status is Done / Closed.** Cheap signal that the fix already landed — check
  before redoing it, whoever the assignee is.
- **No tracked issue at all** (an ad-hoc "이거 좀 고쳐줘"). No gate; proceed. If
  the fix will end up in a PR, find or file the issue first — `astryx-bug-report`
  handles the filing, and then this gate applies to what it created.
- **Several issues in one request.** Gate each one. A blocked issue does not
  block the others; do the ones you hold and report the rest.

## 0. Measure before you fix

The most expensive mistake during the migration was fixing the symptom a
report named instead of the mechanism the page actually had.

- "Admin → Configurations booleans should be switches" — legacy was a
  **checkbox** in both versions, the Astryx `CheckboxInput` was rendering
  correctly, and the actual defect was a `BAIFlex direction="column"` wrapper
  that stranded the box on its own line.
- "The Create User buttons are not joined" — `ButtonGroup` *was* in place.
  Astryx joins children through **context**, which only Astryx
  `Button`/`IconButton`/`ToggleButton` read; the primary child was a
  non-Astryx button, invisible to it.

So: reproduce live, measure the specific properties in both light and dark
mode, and compare against a known-good reference (a prior release, a design
spec, `git log`/`git show` on the relevant path) — *before* choosing a
mechanism. A fix aimed at the wrong mechanism can look plausible in a diff and
still be wrong on screen.

## 1. Fix at the lowest level that closes it

Try in this order, and stop at the first that works:

**1. Theme token / `components:` block (T).** One edit, app-wide. Theme-level
pins routinely close several symptoms at once. Procedure in §2.

**2. Astryx component prop (L/C).** The prop usually exists and you have not
found it yet — `TextInput` has `width="100%"`; `Button` has `endContent` for a
trailing glyph, so an inline `<svg>` child that wraps to a second line is
rarely a CSS problem; `Text` has `size` as an explicit override that preserves
the rest of the semantic type.

**3. Astryx composition (L).** Recompose with `Layout` / `LayoutPanel` /
`Grid` / `Toolbar` / `BAIFlex`. Before concluding Astryx *cannot* do
something, run the discovery commands in §3 — a component-level lookup can
correctly report that a component has no given orientation or mode while the
right answer is a **page template**, not dropping the capability.

**4. Component code (C).** Structure, a new prop, conditional logic in BUI or
the app component.

**5. Scoped CSS — last resort, and justified in the diff.** A co-located
`.css` file with `var(--…)` tokens, for rules props genuinely cannot express
(e.g. a bare `<span>` a third-party component renders). Never a runtime style
engine — nothing injects `<style>` at runtime any more.

**Do not reproduce a retired engine's quirk inside the one that replaced it.**
`rc-table` returned the whole record from an empty `dataIndex` path, so
`render: (row) =>` worked under it; teaching `BAITableAstryx` the same trick
would carry the old engine's accidents forward permanently. The contract is
`render(value, record, index)` and call sites use `(_value, row) =>` (see
`.specs/FR-3482-astryx-migration/CONVERSION-IDIOMS.md` §2).

## 2. Theme changes — the exact procedure

A theme edit is cheap to write and easy to ship *stale*. All five steps or
none.

1. **Edit the recipe.**
   - App-side brand theme: `react/src/astryx-theme/backendAiTheme.ts`.
   - Cross-cutting parity constants shared with BUI:
     `packages/backend.ai-ui/src/theme-shim/antdParity.ts`
     (`ANTD_ALIGN_TOKENS`, `ANTD_DARK_ALGORITHM_OUTPUT`,
     `ANTD_BOX_SHADOW_SECONDARY`, …). BUI cannot import from `react/src`, so the
     measured tables live there and are re-exported.

2. **Bump `THEME_NAME_REV`** (declared in `backendAiTheme.ts` — read the
   current value there, never from this page) whenever
   the *static recipe* changes, and add any new keys to the seed-hash array.
   The theme's `name` **is** its identity — it becomes the `data-astryx-theme`
   attribute, and when two `defineTheme()` calls share a name the **first
   registration silently wins**. Without the bump, a stale registration or
   stale built CSS masks your change and you will debug a fix that did land.
   Names are derived: `bai-r{REV}-{family}-{role}-{hash}`.

3. **Colours may be `[light, dark]` tuples. Nothing else may.** `defineTheme()`
   serialises a tuple as `light-dark(a, b)`, and CSS `light-dark()` accepts
   **colours only** — `resolveTokenValue()` wraps any array with no type-level
   guard. A tuple on a non-colour token emits invalid CSS and the property
   **silently falls back**. So `--text-*-leading`, `--text-heading-*-size`,
   `--font-size-*`, `--spacing-*`, `--radius-*`, `--size-element-*`,
   `--border-width`, `--duration-*`, `--font-family-*`, `--font-weight-*`,
   `--ease-*` and the `--shadow-*` recipes are **plain strings**. Second trap:
   tokens the shim reads with `kind: 'raw'` are un-`light-dark()`-ed in JS by
   `resolveLightDark()`, so a tuple-serialised *length* survives the JS path
   and breaks **only in CSS** — invisible to `themeShim.test.ts`, visible only
   in the rendered page.

4. **Regenerate the built artifacts** — the prebuilt default theme is
   committed:

   ```bash
   cd react && pnpm exec astryx theme build \
     src/astryx-theme/built/backendai-default.ts \
     -o src/astryx-theme/built/backendai-default-built.css
   ```

   Then update the re-export in `react/src/astryx-theme/built/index.ts` to the
   newly generated `bai-r*-*` module and **delete the old
   `bai-r*-*.{js,d.ts,variants.d.ts}`**. Leaving them behind is the
   stale-artifact trap: the old CSS silently wins. `backendAiTheme.test.ts`
   fails when the wrapper and the current recipe drift apart, and
   `scripts/verify.sh` runs the CLI's `--check`.

5. **Update the KEEP-IN-SYNC mirrors** when a background/surface colour moved:
   the literal `light-dark()` fallbacks in the critical `<style>` of
   `index.html` and the `.splash` rule in `resources/webui.css` cover the
   pre-theme window before any CSS loads. If they disagree with the theme, the
   boot curtain flashes the old colour.

Also: **`--color-*` is never overridden in `:root`.** Brand/accent goes through
the theme (`astryx theme`), which is what makes a runtime `resources/theme.json`
rebrand work at all.

## 3. Discover, don't guess

```bash
pnpm exec astryx component <Name>     # props + examples — read before using
pnpm exec astryx search "<thing>"     # components / hooks / docs / templates / blocks
pnpm exec astryx template --list      # page + block recipes  ← finds shells components can't
pnpm exec astryx docs <topic>         # layout, tokens, color, spacing, typography, theme, motion
```

`astryx template --list` is the one people skip. Astryx's answer to a shape is
sometimes a *page template*, not a component prop.

## 4. Tokens only

Every value comes from a token: `var(--color-*)`, `var(--spacing-*)`,
`var(--radius-*)`, `var(--size-*)`. No raw hex, no raw px.

The gate that enforces it is `scripts/migration-gates/astryx-token-gate.mjs`,
and it exists because an **undeclared** `var(--name)` fails *silently*: with a
fallback (`var(--radius-md, 6px)`) the literal wins forever and the token never
participates in theming; without one the whole declaration is invalid at
computed-value time. Neither case produces a compiler, lint or runtime error.
The declared set is not guessable — Astryx's text ramp is
primary/secondary/disabled/accent plus named hues, so there is **no**
`--color-text-tertiary` and **no** `--color-text-error` (the semantic error
token is the solid `--color-error`). Run the gate rather than assuming a name:

```bash
node scripts/migration-gates/astryx-token-gate.mjs --strict
```

For a hardcoded value with no obvious Astryx token, prefer the theme-shim's
measured token (`theme.useToken()` → `selfTokens`, which carry `[light, dark]`
pairs) over a hardcode — e.g. a raw `#BFBFBF` is very likely already a named
parity token (`token.colorTextQuaternary` and similar), not a value to
re-invent.

## 5. Known traps

| Trap | What happens | Do |
|---|---|---|
| **Stale built theme artifact** | The recipe changed but the committed `bai-r*` CSS did not, or an old artifact is still present — the first registration for a `data-astryx-theme` name wins, so your change silently does nothing. | §2 steps 2 + 4, in full. |
| **Stale BUI `dist`** | `verify.sh`'s `astryx theme build --check` depends on the built `backend.ai-ui`, so it can fail for a reason unrelated to your edit. | `pnpm --filter backend.ai-ui build` after **any** `packages/backend.ai-ui/src` change, then re-run verify. |
| **`Grid` child overflow** | CSS grid items default to `min-width: auto`, so a `width: 100%` Astryx field pushes its track past the container and the right-hand column gets clipped at the modal edge. | `width="100%"` on the `Grid` **plus** `style={{ minWidth: 0 }}` on every direct grid child. Every grid-of-fields conversion needs it. |
| **Astryx Table bleed** | The table can paint outside its own layout box — the pagination row lays out as if the table ended slightly earlier and overlaps the last row. | Do not "fix" it with a margin at one call site. If it recurs, the root cause is in `BAITableAstryx` itself — check whether it is already fixed upstream before patching around it locally. |
| **`Tooltip` / `MediaTheme` `display: contents`** | Both render zero-layout wrappers — good (no layout cost), but they are still **DOM ancestors**, so token context inherits through them. `useTooltip` inverts its surface by hardcoding colours *without* flipping the token context, so nested content (e.g. `Kbd`) resolves against the page surface and comes out invisible. | Wrap tooltip content in `<MediaTheme mode={opposite of app mode}>` — the surface is inverted, so the media mode is too. |
| **`MediaTheme` leaking into a native `<dialog>`** | Astryx `Dialog` is a **native, non-portalled `<dialog>`** promoted with `showModal()`; the top layer does not change DOM ancestry. A `MediaTheme` ancestor therefore keeps forcing its surface tokens inside every modal mounted under it — e.g. a dark header band forcing dark text onto a light modal surface, or vice versa. | Scope the `MediaTheme` to the content actually on the band; mount modals outside it. Do not wrap modals in a counter-`MediaTheme` (it declares *surface luminance*, not app mode) and do not portal the dialog (non-portalled is deliberate). |
| **`ButtonGroup` with a non-Astryx child** | Joining is context-based and only Astryx `Button`/`IconButton`/`ToggleButton` read it; any other child keeps its own pill and leaves a notch. | Make every group child an Astryx button. |
| **`data-testid` swallowed by a spread** | `DropdownMenu` applies its own `testId` **after** `{...button}`, so a `'data-testid'` passed *inside* `button` is overwritten with `undefined` and the attribute disappears from the DOM. | Use the component's own `testId` prop. Re-check e2e selectors after any trigger refactor. |
| **Probing a stale bundle** | Measuring the dev server before it picked up an edit, or the previous production build. | Confirm the change is in the served output before recording an "after" number. |

## 6. Verification bar

Nothing is done until all of these pass. Report them with the actual counts.

```bash
bash scripts/verify.sh                 # must end with "=== ALL PASS ==="
pnpm --filter backend.ai-ui build      # after ANY packages/backend.ai-ui/src change
pnpm --prefix ./react exec vitest run
pnpm --filter backend.ai-ui exec vitest run
node scripts/migration-gates/astryx-token-gate.mjs --strict
```

`verify.sh` covers Relay drift, Lint, Format, TypeScript, Vite warmup paths,
the StyleX `cssInjectionTarget` sentinel, `astryx theme build --check`, and
Terminology.

**Live probe, both modes.** Static green is not evidence that the pixel moved.

- Re-measure the exact property you changed, light **and** dark, dark entered
  through the header button with `document.documentElement.dataset.theme`
  asserted `'dark'`.
- Zero `pageerror` in both passes.
- Capture before/after screenshots for the PR description.
- If the fix touched an interaction, **exercise it** — click through the
  stepper, open the menu, round-trip the binding. Do it non-destructively:
  client-side-only toggles, never a mutation on the shared cluster.
- Record residue honestly. A `size="lg"` button that lands a few pixels off a
  legacy reference is written down as the measured delta and the reason it is
  not worth repainting other call sites — not rounded up to "matches
  reference".

## 7. Writing the fix down

- **Ratified conversion recipes** go in
  `.specs/FR-3482-astryx-migration/CONVERSION-IDIOMS.md` (status + applied-in +
  evidence) — that's the durable home for patterns worth reusing across
  multiple fixes.
- **A deliberate capability drop** stays a `// PILOT-DECISION:` comment at the
  call site explaining *why*, so the next reader does not "fix" it back — in
  one or two lines, not an essay.
- **A superseded idiom** is marked superseded where it's documented, not
  deleted, so history stays legible.
- **Keep it out of the source file.** The mechanism goes in the commit body,
  the measurements in the PR description (§8), a reusable recipe in
  `CONVERSION-IDIOMS.md`. The comment at the fix site carries the one sentence
  that stops someone reverting it, plus the FR number. See
  `.claude/rules/comment-density.md` — this skill used to be one of the main
  producers of 40-line justification blocks.

## 8. Ship it — branch, commit, PR

A finished Astryx fix ends at an **open draft PR**, not at a dirty working
tree. Do this without being asked again; the request to fix the regression is
the request to ship it. Two things still need an explicit ask: marking the PR
**ready for review**, and **merging** it.

1. **Branch.** `FR-XXXX` — the dev URL derives from it
   (`https://fr-XXXX.localhost:1355`). Base it on **what the fix actually
   depends on**, which decides the shape of step 5 too:
   - depends only on `main` → branch off `main`, single PR;
   - depends on work still in review on another branch → branch off **that**
     branch and stack (`AGENTS.md`: "Follow the GitHub Stacked PRs strategy"),
     so the PR's base is the branch below, not `main`.

   Basing a dependent fix on `main` puts unrelated commits in its diff and
   makes it unmergeable until the branch below lands. If the fix was made on
   `main`, branch first and carry the changes over.

2. **Delete the scratch.** Probe scripts, harness pages, screenshots dumped in
   the repo root — none of it belongs in the diff. `git status` should show
   only the fix and its regenerated artifacts before you commit.

3. **Commit.** `fix(FR-XXXX): <what changed>` (`style:` when it is purely
   visual with no behaviour change). Body: the mechanism in two or three
   sentences — the *cause*, not the symptom.

4. **Find the GitHub issue.** The Jira issue is cloned to GitHub by a webhook:

   ```bash
   gh issue list --search "FR-XXXX" --state all --json number,title,url
   ```

   Match on the title, not the search rank — sibling reports in the same
   symptom family come back from the same query. If the webhook has not fired
   yet, say so and open the PR without the `Resolves` line rather than
   inventing a number.

5. **Open the PR.** Single fix → `git push -u origin FR-XXXX` +
   `gh pr create --draft`. Stacked on another branch → `gh stack submit --auto`
   (see the `gh-stack` and `fw:stacked-pr-workflow` skills). Title
   `fix(FR-XXXX): title`; body starts `Resolves #NNNN (FR-XXXX)` — **the space
   before `(` is required** or the project-status-sync workflow misses the link.

6. **The body carries the evidence this skill made you collect**, because that
   is what a reviewer cannot reproduce from the diff:
   - the **mechanism**, named — which token/prop/DOM relationship actually did
     it, and how you know (§0);
   - the **measured before/after table**, light *and* dark, in the real app;
   - the **verification bar** results with real counts (§6), including any
     gate that was already failing on `main` — say that it is pre-existing and
     how you checked;
   - **residue** — what this fix deliberately does not close, and any sibling
     report it does or does not subsume. A reader must not have to guess
     whether a neighbouring bug was covered.
   - before/after **screenshots** when the change is visual. Capture them
     during the live probe; a scratchpad can be cleared between sessions, so
     attach them to the PR rather than leaving them on disk.

## Related

- `astryx-bug-report` — the capture-only counterpart, and where an untracked
  regression gets its issue before this skill's assignee gate can apply. Its
  `astryx-discussion` Tasks are not fix-ready until the team has answered them.
- `fw:jira-workflow` — full `$FW_JIRA` command reference (`myself`, `get`,
  `update --assignee me`).
- `dev-server`, `webui-connection-info` — running the app and logging in.
- `.specs/FR-3482-astryx-migration/CONVERSION-IDIOMS.md`,
  `.specs/FR-3482-astryx-migration/RESPONSIVE-POLICY.md` — ratified conversion
  recipes (`useBAIBreakpoint` for JS branches, `BAI_BREAKPOINTS` for px
  constants, and the rest of the field-tested idioms).
- The `ASTRYX` block in the repo root `CLAUDE.md` — the discover-don't-guess
  workflow and any active migration-relaxation notes.
