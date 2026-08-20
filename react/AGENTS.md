# AGENTS.md

Project-specific guidance for AI coding agents.

<!-- ASTRYX:START -->
Astryx v0.4.4 · 158 components
CLI: run every command as `pnpm exec astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else the xstyle prop / StyleX tokens (@astryxdesign/core/theme/tokens.stylex). No raw hex/px.
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any className=, style={{…}}, raw <div>/<span> layout, imported .css/@apply, or hardcoded #hex/px with the component or the xstyle prop + a token. If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.
- MIGRATION RELAXATION (antd → Astryx): the className=/style={{…}} part of the SELF-CHECK is relaxed for files carried over from the antd era, which are still full of `className` / inline `style` and `theme.useToken()` reads. Do not rewrite those wholesale — convert a file's idioms when you are already changing it for another reason. A style that props/xstyle cannot express goes in a co-located `.css` file the component imports (P17), with `var(--…)` Astryx tokens; never a runtime style engine.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   158 components by category
  template --list    page + block recipes
  docs <topic>       color, elevation, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling, theme, tokens, typography
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->

## Migration conversion idioms (branch `to-astryx`)

Some antd patterns have no one-to-one Astryx component and are **not** allowed
to be dropped ad hoc — they have a standing composition recipe in
`.specs/FR-3482-astryx-migration/CONVERSION-IDIOMS.md`. Read it before recording a
PILOT-DECISION that gives up a layout capability. Currently:

- **antd vertical tabs** (`tabPosition`/`tabPlacement="left" | "start"`) →
  the Astryx `settings-sidebar` template composition
  (`Layout` + `LayoutPanel` nav column of `List`/`ListItem isSelected` +
  `LayoutContent` pane), **not** a horizontal `TabList`. Run
  `pnpm exec astryx template settings-sidebar`. The "discover, don't guess"
  workflow above includes `astryx template --list` / `astryx search` — a
  component-level lookup alone will wrongly report the capability as missing.
