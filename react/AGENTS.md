# AGENTS.md

Project-specific guidance for AI coding agents.

<!-- UI-COMMON:START -->
@lablup/ui-common v0.2.0-alpha.4 · Astryx v0.6.2 · 164 components
CLI: run every command as `pnpm exec ui-common <cmd>` (shown below as `ui-common ...`).

SETUP (once, first in your entry stylesheet) — without these, components render unstyled:
  @layer reset, theme, base, astryx-base, astryx-theme, ui-common, components, utilities;
  @import "@lablup/ui-common/reset.css";
  @import "@lablup/ui-common/astryx.css";
  @import "@lablup/ui-common/theme/lablup/theme.css";
  @import "@lablup/ui-common/ui-common.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `ui-common build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `ui-common template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `ui-common component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `ui-common docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else the xstyle prop / StyleX tokens (@lablup/ui-common/theme/tokens.stylex). No raw hex/px.
- Tokens for every value (`ui-common docs tokens`). Brand/accent belongs in the theme (`ui-common theme list` / `theme add <slug>`, or `ui-common theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any className=, style={{…}}, raw <div>/<span> layout, imported .css/@apply, or hardcoded #hex/px with the component or the xstyle prop + a token. If unsure a component/prop exists, run `ui-common component <Name>` / `ui-common search "<thing>"`; don't hand-roll CSS.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   164 components by category
  template --list    page + block recipes
  docs <topic>       browser-support, cli-integrations, color, elevation, getting-started, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling-libraries, styling, theme, tokens, typography, working-with-ai, backend-ai-ui, ui-common
  swizzle <Name>     eject component source for deep customization
  upgrade --from <v> run after bumping @lablup/ui-common: ui-common's codemods, then Astryx's

UI-COMMON (@lablup/ui-common v0.2.0-alpha.4 wraps Astryx v0.6.2):
- Import only from @lablup/ui-common: the root, or the same subpath Astryx uses (@lablup/ui-common/Button, /theme/tokens.stylex, /lab). Never import @astryxdesign/* directly.
- Layers: declare `@layer reset, theme, base, astryx-base, astryx-theme, ui-common, components, utilities;` once, first, in the entry stylesheet. ui-common's styles sit in `ui-common`; yours go in `components` / `utilities`.
- Use Modal (@lablup/ui-common/Modal), not Dialog: ui-common hides Dialog.
- Theme: <Theme theme={lablupTheme}> with lablupTheme from @lablup/ui-common/theme/lablup/built, plus @lablup/ui-common/theme/lablup/theme.css. A product palette is its own defineTheme over lablupTheme.
- Strings: every built-in string is a prop; defaults come from ui-common's catalog. Pass uiCommonMessages from @lablup/ui-common/i18n-catalog to Astryx's InternationalizationProvider. Never a product i18n runtime.
- ui-common's own components: AlertModal, BooleanToken, ConfirmPopover, CountBadge, DeleteConfirmModal, DigitPopIn, DoubleBadge, ErrorState, IconWithTooltip, ImageWithFallback, Modal, NotificationStack, OverlayScrollbar, PageHeader, PageLayout, SelectionLabel, Skeleton composites, SmoothHeight, StatCard, StepNumberInput, UncontrolledInput. `pnpm exec ui-common docs ui-common` explains them.
- After bumping @lablup/ui-common: `pnpm exec ui-common upgrade --from <old version>`, then read ui-common-upgrade-report.md.
<!-- UI-COMMON:END -->
PROJECT LINES (this repo; outside the generated markers so `ui-common agents --write` keeps them, and they win where they disagree with the block):
- SETUP (this repo): `react/src/index.css` declares the layer order and imports only `reset.css` and `astryx.css`. The theme is webui's own Backend.AI theme family (`react/src/astryx-theme/`, a `defineTheme` over `neutralTheme`), not `lablupTheme` and not `theme/lablup/theme.css`. `ui-common.css` is not imported either: it holds only global scrollbar rules, and each ui-common component imports its own CSS.
- CLI (this repo): `pnpm exec ui-common <cmd>` works inside `react/` and `packages/backend.ai-ui/`, where `@lablup/ui-common` is a dependency. From the repository root run `pnpm run ui-common <cmd>` (root `package.json` proxies it into `react/`). `ui-common astryx <cmd>` runs the Astryx CLI without rewriting its output.
- MIGRATION RELAXATION (antd → Astryx): the className=/style={{…}} part of the SELF-CHECK is relaxed for files carried over from the antd era, which are still full of `className` / inline `style` and `theme.useToken()` reads. Do not rewrite those wholesale — convert a file's idioms when you are already changing it for another reason. A style that props/xstyle cannot express goes in a co-located `.css` file the component imports (P17), with `var(--…)` Astryx tokens; never a runtime style engine.
- STATUS SEMANTICS (this repo; overrides "Status = StatusDot/Token; Badge = counts only" above — ADR 0007): Badge = a value the system changes on its own over time (lifecycle/health status, in-progress markers, live tickers, counts). Token = a value that changes only when a user edits it, or a category/classification label (names, types, permissions, tags, versions, on/off settings, recorded outcomes). StatusDot stays for dot-only status. BUI chips are named *Badge / *Token by the primitive they render; "Tag" is only a domain noun. Rule: .claude/rules/badge-vs-token.md.
- BUI INTEGRATION (this repo): `backend.ai-ui` is registered as an Astryx integration, so `ui-common component`, `ui-common search` and `ui-common component --list` cover the `BAI*` wrappers next to ui-common's and core's components, and `ui-common docs backend-ai-ui` explains the layer. The component count in the block's first line is core's own, so the live catalog is larger; run the command to see it. When a `BAI*` component and a ui-common or core component both fit, use the `BAI*` one — it carries the project defaults, and it imports from `backend.ai-ui`. A new `BAI*` component ships a same-stem `{Name}.doc.ts` beside its source; a new product-neutral component goes to ui-common instead (.claude/rules/bui-component-home.md).

## Migration conversion idioms (branch `to-astryx`)

Some antd patterns have no one-to-one Astryx component and are **not** allowed
to be dropped ad hoc — they have a standing composition recipe in
`.specs/FR-3482-astryx-migration/CONVERSION-IDIOMS.md`. Read it before recording a
PILOT-DECISION that gives up a layout capability. Currently:

- **antd vertical tabs** (`tabPosition`/`tabPlacement="left" | "start"`) →
  the Astryx `settings-sidebar` template composition
  (`Layout` + `LayoutPanel` nav column of `List`/`ListItem isSelected` +
  `LayoutContent` pane), **not** a horizontal `TabList`. Run
  `pnpm exec ui-common template settings-sidebar`. The "discover, don't guess"
  workflow above includes `ui-common template --list` / `ui-common search` — a
  component-level lookup alone will wrongly report the capability as missing.
