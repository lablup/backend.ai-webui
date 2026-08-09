---
name: astryx-migration-fix
description: >
  Standing rules for fixing an Astryx-migration regression on `to-astryx`:
  measure before you fix, theme-defaults-first (with the exact
  THEME_NAME_REV bump + `astryx theme build` artifact regeneration + wrapper
  and mirror updates), Astryx-canonical composition over hand-rolled CSS,
  `astryx component <Name>` discovery over guessing, tokens-only (P19 gate),
  the known traps (stale theme artifacts, stale BUI dist, Grid child
  overflow, Table bleed, Tooltip `display:contents`, MediaTheme leaking into
  native `<dialog>`), and the verification bar (verify.sh + vitest +
  antd-zero-gate on a FRESH build + live light/dark probe). Use when
  implementing a row from `QA-FINDINGS.md` or `REGRESSION-CATALOG.md`, or any
  visual/behavioural fix on the migrated UI. File findings with the
  `astryx-qa-finding` skill.
---

# Astryx migration — fixing a finding

Ant Design is **gone** from this branch — no `package.json` declares it, no
source file imports it, `scripts/antd-zero-gate.sh` asserts all three surfaces
(production dependency graph / built bundle / source import graph). A `from
'antd'` import is not migration debt any more; it is a regression that will not
even install. Everything below assumes that world.

## 0. Measure before you fix

The single most expensive mistake in this migration was fixing the symptom the
report named instead of the mechanism the page had.

- "Admin → Configurations booleans should be switches" — legacy was a
  **checkbox** in both versions, the Astryx `CheckboxInput` was rendering
  correctly, and the actual defect was a `BAIFlex direction="column"` wrapper
  that stranded the box on its own line (`SWEEP-FIXES.md` §D).
- "The Create User buttons are not joined" — `ButtonGroup` *was* in place.
  Astryx joins children through **context**, which only Astryx
  `Button`/`IconButton`/`ToggleButton` read; the primary child was an antd-era
  `BAIButton`, invisible to it (`POLISH-2.md` §C).

So: reproduce live, measure the specific properties in both modes, and read
`git show origin/main:<path>` for what legacy actually rendered — *before*
choosing a mechanism. Intake and measurement procedure lives in the
`astryx-qa-finding` skill (§2–§3); do not re-derive it here.

## 1. Fix at the lowest level that closes it

Try in this order, and stop at the first that works:

**1. Theme token / `components:` block (T).** One edit, app-wide. 38% of the
audit's findings were theme-primary and several pins closed three or four
symptoms each. Procedure in §2.

**2. Astryx component prop (L/C).** The prop usually exists and you have not
found it yet. `TextInput` has `width="100%"` (`POLISH-3.md` §5); `Button` has
`endContent` for a trailing glyph, so an inline `<svg>` child that wrapped to a
second line was never a CSS problem (`SWEEP-FIXES.md` §C); `Text` has `size` as
an explicit override that preserves the rest of the semantic type
(`POLISH-3.md` §6).

**3. Astryx composition (L).** Recompose with `Layout` / `LayoutPanel` /
`Grid` / `Toolbar` / `BAIFlex`. Before concluding Astryx *cannot* do something,
run the discovery commands in §3 — a component-level lookup correctly reported
that `TabList` has no vertical orientation, and the right answer was the
`settings-sidebar` **page template**, not dropping the capability
(`CONVERSION-IDIOMS.md` §1).

**4. Component code (C).** Structure, a new prop, conditional logic in BUI or
the app component.

**5. Scoped CSS — last resort, and justified in the diff.** A co-located `.css`
file with `var(--…)` tokens, for rules props genuinely cannot express (e.g. a
bare `<span>` a third-party component renders, `SIDER-FIXES.md` §3). Never a
runtime style engine — nothing injects `<style>` at runtime any more.

**Do not reproduce an antd quirk inside the engine that replaced it.** rc-table
returned the whole record from an empty `dataIndex` path, so `render: (row) =>`
worked under antd; teaching `BAITableAstryx` the same trick would carry the
retired engine's accidents forward permanently. The contract is
`render(value, record, index)` and call sites move to `(_value, row) =>`
(`CONVERSION-IDIOMS.md` §2).

## 2. Theme changes — the exact procedure

A theme edit is cheap to write and easy to ship *stale*. All five steps or none.

1. **Edit the recipe.**
   - App-side brand theme: `react/src/astryx-theme/backendAiTheme.ts`.
   - antd-parity constants shared with BUI:
     `packages/backend.ai-ui/src/theme-shim/antdParity.ts`
     (`ANTD_ALIGN_TOKENS`, `ANTD_DARK_ALGORITHM_OUTPUT`,
     `ANTD_BOX_SHADOW_SECONDARY`, …). BUI cannot import from `react/src`, so the
     measured tables live there and are re-exported.

2. **Bump `THEME_NAME_REV`** (`backendAiTheme.ts`, currently **8**) whenever the
   *static recipe* changes, and add any new keys to the seed-hash array. The
   theme's `name` **is** its identity — it becomes the `data-astryx-theme`
   attribute, and when two `defineTheme()` calls share a name the **first
   registration silently wins**. Without the bump, a stale registration or stale
   built CSS masks your change and you will debug a fix that did land. Names are
   derived: `bai-r{REV}-{family}-{role}-{hash}`.

3. **Colours may be `[light, dark]` tuples. Nothing else may.** `defineTheme()`
   serialises a tuple as `light-dark(a, b)`, and CSS `light-dark()` accepts
   **colours only** — `resolveTokenValue()` wraps any array with no type-level
   guard. A tuple on a non-colour token emits invalid CSS and the property
   **silently falls back**; that is how the `--shadow-med` bug once shipped. So
   `--text-*-leading`, `--text-heading-*-size`, `--font-size-*`, `--spacing-*`,
   `--radius-*`, `--size-element-*`, `--border-width`, `--duration-*`,
   `--font-family-*`, `--font-weight-*`, `--ease-*` and the `--shadow-*` recipes
   are **plain strings**. (This costs nothing: antd's `darkAlgorithm` transforms
   colours, not the size/radius/duration ladders.) Second trap: tokens the shim
   reads with `kind: 'raw'` are un-`light-dark()`-ed in JS by `resolveLightDark()`,
   so a tuple-serialised *length* survives the JS path and breaks **only in
   CSS** — invisible to `themeShim.test.ts`, visible only in the rendered page.

4. **Regenerate the built artifacts** — the prebuilt default theme is committed:

   ```bash
   cd react && pnpm exec astryx theme build \
     src/astryx-theme/built/backendai-default.ts \
     -o src/astryx-theme/built/backendai-default-built.css
   ```

   Then update the re-export in `react/src/astryx-theme/built/index.ts` to the
   newly generated `bai-r*-*` module and **delete the old
   `bai-r*-*.{js,d.ts,variants.d.ts}`**. Leaving them behind is the
   stale-artifact trap: the old CSS silently wins.
   `backendAiTheme.test.ts` fails when the wrapper and the current recipe drift
   apart, and `scripts/verify.sh` runs the CLI's `--check`.

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

## 4. Tokens only (P19)

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

For a legacy antd value with no Astryx counterpart, prefer the theme-shim's
measured token (`theme.useToken()` → `selfTokens`, which carry `[light, dark]`
pairs) over a hardcode — e.g. `#BFBFBF` **is** antd's `colorTextQuaternary`, so
the fix was `token.colorTextQuaternary`, not the hex (`SWEEP-FIXES.md` §E).

## 5. Known traps

| Trap | What happens | Do |
|---|---|---|
| **Stale built theme artifact** | The recipe changed but the committed `bai-r*` CSS did not, or an old artifact is still present — the first registration for a `data-astryx-theme` name wins, so your change silently does nothing. | §2 steps 2 + 4, in full. |
| **Stale BUI `dist`** | `verify.sh`'s `astryx theme build --check` depends on the built `backend.ai-ui`, so it can fail for a reason unrelated to your edit. | `pnpm --filter backend.ai-ui build` after **any** `packages/backend.ai-ui/src` change, then re-run verify. |
| **`Grid` child overflow** | CSS grid items default to `min-width: auto`, so a `width: 100%` Astryx field pushes its track past the container and the right-hand column gets clipped at the modal edge. | `width="100%"` on the `Grid` **plus** `style={{ minWidth: 0 }}` on every direct grid child. Every `Row`/`Col` → `Grid` conversion needs it (`issues/p3-w2a.md` W2A-17). |
| **Astryx Table bleed** | The table paints outside its own layout box — the pagination row is laid out as if the table ended ~24px earlier and overlaps the last row (measured on 14 of 15 table routes, both modes). | Do not "fix" it with a margin at one call site. It is a single root cause in `BAITableAstryx` (catalog `T-1`/`T-2`/`T-3`); check whether it is already owned before touching it. |
| **`Tooltip` / `MediaTheme` `display: contents`** | Both render zero-layout wrappers — good (no layout cost), but they are still **DOM ancestors**, so token context inherits through them. `useTooltip` inverts its surface by hardcoding colours *without* flipping the token context, so nested content (e.g. `Kbd`) resolves against the page surface and comes out invisible. | Wrap tooltip content in `<MediaTheme mode={opposite of app mode}>` — the surface is inverted, so the media mode is too (`SIDER-FIXES.md` §2). |
| **`MediaTheme` leaking into a native `<dialog>`** | Astryx `Dialog` is a **native, non-portalled `<dialog>`** promoted with `showModal()`; the top layer does not change DOM ancestry. A `MediaTheme` ancestor therefore keeps forcing its surface tokens inside every modal mounted under it — which is how the header's dark band turned `rgb(20,20,20)` text onto a `rgb(20,20,20)` surface in **light** mode only. | Scope the `MediaTheme` to the content actually on the band; mount modals outside it. Do not wrap modals in a counter-`MediaTheme` (it declares *surface luminance*, not app mode) and do not portal the dialog (non-portalled is deliberate) — `issues/p3-w3b.md`. |
| **`ButtonGroup` with a non-Astryx child** | Joining is context-based and only Astryx `Button`/`IconButton`/`ToggleButton` read it; any other child keeps its own pill and leaves a notch. | Make every group child an Astryx button (`POLISH-2.md` §C). |
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
node scripts/migration-gates/ant-selector-gate.mjs
```

`verify.sh` covers Relay drift, Lint, Format, TypeScript, Vite warmup paths,
the StyleX `cssInjectionTarget` sentinel, `astryx theme build --check`, and
Terminology.

**`antd-zero-gate.sh` needs a FRESH production build.** Its part (b) scans
`build/web/`, and a *stale or half-populated* `build/web` is the worst failure
mode a compliance gate has: a green light that means "nothing was scanned".
The script guards this with a minimum-asset-count assertion — respect it, do
not work around it.

```bash
cp config.toml.sample config.toml      # the build aborts without a root config.toml
pnpm run build
bash scripts/antd-zero-gate.sh         # must print "=== antd-zero-gate: PASS ==="
```

One documented false positive exists and is not fixable from our side:
`build/web/assets/main-*.js` bundles the Chat token counter's `cl100k_base` /
`o200k` BPE vocabularies, and `" anticon"` is one of their ~200k merge tokens.
If that chunk is the *only* hit, the build is clean. **Never add allowlist
entries to make a gate pass** — the gate's value is that it cannot be
negotiated with.

**Live probe, both modes.** Static green is not evidence that the pixel moved.

- Re-measure the exact property you changed, light **and** dark, dark entered
  through the header button with `document.documentElement.dataset.theme`
  asserted `'dark'`.
- Zero `pageerror` in both passes.
- `{before,after}` screenshots under
  `.scratch/astryx-migration/shots/<topic>/`.
- If the fix touched an interaction, **exercise it** — click through the
  stepper, open the menu, round-trip the binding. Do it non-destructively:
  client-side-only toggles, never a mutation on the shared cluster.
- Record residue honestly. A `size="lg"` button that reaches 36px against
  legacy's 40px is written down as 36-vs-40 with the reason the last 4px is not
  worth repainting eight other call sites (`POLISH-3.md` §6) — not rounded up
  to "matches legacy".

## 7. Landing the change

- **Update the ledger row** in `.scratch/astryx-migration/QA-FINDINGS.md`:
  `Status / fix` → `FIXED <sha>` with the mechanism. If the finding came from
  `REGRESSION-CATALOG.md`, add a `Q-` row that cites the catalog ID rather than
  editing the frozen audit.
- **Write the reasoning down** where the next person will hit it: a new ratified
  recipe goes in `CONVERSION-IDIOMS.md` (status + applied-in + evidence); a
  deliberate capability drop stays a `// PILOT-DECISION:` comment at the call
  site explaining *why*, and a superseded one is marked superseded in its
  `issues/*.md`, not deleted.
- **Commit convention: NEVER add a `Co-Authored-By:` trailer.** Plain message
  only. Titles follow the repo format, e.g.
  `fix(astryx): restore the sider active-item brand state`.
- Commit or push only when asked.

## Related

- `astryx-qa-finding` — intake, measurement, classification and de-duplication.
- `dev-server`, `webui-connection-info` — running the app and logging in.
- `.scratch/astryx-migration/REGRESSION-CATALOG.md` §1.3 (highest-yield token
  pins), §5 (theme implementation gotchas), §4 (what is already parity).
- `.scratch/astryx-migration/CONVERSION-IDIOMS.md`, `RESPONSIVE-POLICY.md` —
  ratified conversion recipes (R1–R5 for `Row`/`Col`, `useBAIBreakpoint` for JS
  branches, `BAI_BREAKPOINTS` for px constants).
- `.scratch/astryx-migration/MERGE-CHECKLIST.md` — what must be green before
  `to-astryx` merges.
- The `ASTRYX` block in `CLAUDE.md` — the discover-don't-guess workflow and the
  MIGRATION RELAXATION for antd-era files.
